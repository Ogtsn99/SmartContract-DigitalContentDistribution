// @ts-ignore
import { ethers, upgrades } from "hardhat";
import { BigNumber, ContractReceipt, Signer } from "ethers";
import { assert, expect } from "chai";
import { ContractFactory } from "@ethersproject/contracts";

async function assertPromiseThrow(p: Promise<void>) {
	let error;
	return p.catch((err) => {
		error = err;
	}).finally(()=> {
		expect(error).to.be.an(`Error`);
	})
}

async function changeBalance(signer: Signer, balance: BigNumber, val) {
	assert.equal(balance.add(val), await signer.getBalance());
}

function assertBN(bn1: BigNumber, bn2: BigNumber) {
	assert.equal(bn1.toString(), bn2.toString());
}

describe("Market", function () {
	let deployer:Signer, author:Signer, seller: Signer, buyer: Signer, buyer2: Signer
		, royaltyReceiver: Signer, other: Signer;
	let authorAddress, sellerAddress, buyerAddress, buyer2Address, royaltyReceiverAddress, otherAddress;
	//let authorBalance, sellerBalance, buyerBalance, buyer2Balance, royaltyReceiverBalance, otherBalance;
	let owt;
	let market;
	
	before(async function () {
		[deployer, author, seller, buyer, buyer2, royaltyReceiver, other] = await ethers.getSigners();
		authorAddress = await author.getAddress();
		sellerAddress = await seller.getAddress();
		buyerAddress = await buyer.getAddress();
		buyer2Address = await buyer2.getAddress();
		royaltyReceiverAddress = await royaltyReceiver.getAddress();
		otherAddress = await other.getAddress();
		/*
		authorBalance = await author.getBalance();
		sellerBalance = await seller.getBalance();
		buyerBalance = await buyer.getBalance();
		buyer2Balance = await buyer2.getBalance();
		royaltyReceiverBalance = await royaltyReceiver.getBalance();
		otherBalance = await other.getBalance();*/
		
		const OwnershipNFT: ContractFactory = await ethers.getContractFactory("OwnershipNFT", deployer);
		owt = await OwnershipNFT.deploy("OwnershipToken", "OWT");
	
		const OwnershipMarket = await ethers.getContractFactory("OwnershipMarket", deployer);
		market = await upgrades.deployProxy(OwnershipMarket, [owt.address.toString()]);
	});
	
	it("can set Price", async()=> {
		// price: 500, royalty: 5%
		await owt.connect(author)['register(uint256,uint256)'](500, 500);
		await owt.connect(seller).mint(0, sellerAddress, {value: 500});
		
		await market.connect(seller).setPrice(0, 1000);
		assert.equal("1000", (await market.getPrice(0)).toString());
	});
	
	it("non-owners fail to set price", async() => {
		await assertPromiseThrow(owt.connect(other).setPrice(0, 1200));
		assert.equal("1000", (await market.getPrice(0)).toString());
	});
	
	it("buy NFT, royalty will be paid", async()=> {
		await owt.connect(seller).approve(market.address, 0);
		
		let authorBalance: BigNumber = await author.getBalance();
		let buyerBalance: BigNumber = await buyer.getBalance();
		let sellerBalance: BigNumber = await seller.getBalance();
		
		// buy NFT from seller
		await market.connect(buyer).buyNFT(0, {value: 1000});
		buyerBalance = buyerBalance.add(-1000);
		sellerBalance = sellerBalance.add(950);
		authorBalance = authorBalance.add(50);
		assertBN(buyerBalance, await buyer.getBalance());
		assertBN(authorBalance, await author.getBalance());
		assertBN(sellerBalance, await seller.getBalance());
		
		assert.equal(buyerAddress, await owt.ownerOf(0));
		assert.isTrue(await owt.hasOwnership(buyerAddress, 0));
		assert.isTrue(await owt.hasOwnership(authorAddress, 0));
		assert.isFalse(await owt.hasOwnership(sellerAddress, 0));
	});
	
	it('change royalty rate and also receiver', async ()=> {
		let authorBalance: BigNumber = await author.getBalance();
		let buyerBalance: BigNumber = await buyer.getBalance();
		let buyer2Balance: BigNumber = await buyer2.getBalance();
		let receiverBalance: BigNumber = await royaltyReceiver.getBalance();
		
		await market.connect(buyer).setPrice(0, 1000);
		await owt.connect(buyer).approve(market.address, 0);
		
		// change royalty rate to 10% and also receiver
		await owt.connect(author).setRoyalty(0, 1000, royaltyReceiverAddress);
		await market.connect(buyer2).buyNFT(0, {value: 1000});
		
		buyerBalance = buyerBalance.add(900);
		receiverBalance = receiverBalance.add(100);
		buyer2Balance = buyer2Balance.add(-1000);
		
		assertBN(authorBalance, await author.getBalance());
		assertBN(buyerBalance, await buyer.getBalance());
		assertBN(buyer2Balance, await buyer2.getBalance());
		assertBN(receiverBalance, await royaltyReceiver.getBalance());
	})
	
});
