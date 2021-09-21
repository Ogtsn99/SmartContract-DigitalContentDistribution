
// @ts-ignore
import { ethers, upgrades } from "hardhat";
import { ContractReceipt, Signer } from "ethers";
import { assert, expect } from "chai";
import { ContractFactory } from "@ethersproject/contracts";
import { AccessRightNFT } from "../frontend/src/hardhat/typechain";

describe("ART", function () {
	let deployer:Signer, author:Signer, royaltyReceiver: Signer, buyer: Signer;
	let authorAddress, royaltyReceiverAddress, buyerAddress;
	let art;
	let market;
	
	before(async function () {
		[deployer, author, royaltyReceiver, buyer] = await ethers.getSigners();
		authorAddress = await author.getAddress();
		royaltyReceiverAddress = await royaltyReceiver.getAddress();
		buyerAddress = await buyer.getAddress();
		
		const AccessRightNFT: ContractFactory = await ethers.getContractFactory("AccessRightNFT", deployer);
		art = await AccessRightNFT.deploy("AccessRightToken", "ART");
	
		const AccessRightMarket = await ethers.getContractFactory("AccessRightMarket", deployer);
		market = await upgrades.deployProxy(AccessRightMarket, [art.address.toString()])
	});
	
	it("can set Price", async()=> {
		await art.connect(author).registerContent();
		
		// 5% of royalties to royaltyReceiver
		await art.connect(author).mint(0, authorAddress, royaltyReceiverAddress, 500);
		await market.connect(author).setPrice(0, 100);
		assert.equal("100", (await market.getPrice(0)).toString());
	});
	
	it("non-owners fail to set price", async() => {
		let error;
		try {
			await art.connect(buyer).setPrice(0, 120);
		} catch (err) {
			error = err;
		}
		
		expect(error).to.be.an(`Error`);
		assert.equal("100", (await market.getPrice(0)).toString());
	});
	
	it("buy NFT", async()=> {
		await art.connect(author).approve(market.address, 0);
		await market.connect(buyer).buyNFT(0, {value: 100});
		
		assert.equal(buyerAddress, await art.ownerOf(0));
		assert.isTrue(await art.isAccessible(buyerAddress, 0));
		assert.isTrue(await art.isAccessible(authorAddress, 0));
		
		assert.equal("9999999999999999999900", (await buyer.getBalance()).toString());
		assert.equal("10000000000000000000095", (await author.getBalance()).toString());
		assert.equal("10000000000000000000005", (await royaltyReceiver.getBalance()).toString());
	});

});
