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

function assertBN(bn1: BigNumber, bn2: BigNumber) {
	assert.equal(bn1.toString(), bn2.toString());
}

describe("FileSharingContract", function () {
	let deployer: Signer, author:Signer, node: Signer, client: Signer, server:Signer, other:Signer;
	let deployerAddress, authorAddress, nodeAddress, clientAddress, serverAddress, otherAddress;
	//let authorBalance, sellerBalance, buyerBalance, buyer2Balance, royaltyReceiverBalance, otherBalance;
	let fst, art, fsc;
	
	before(async function () {
		[deployer, author, node, client, server, other] = await ethers.getSigners();
		deployerAddress = await deployer.getAddress();
		authorAddress = await author.getAddress();
		nodeAddress = await node.getAddress();
		clientAddress = await client.getAddress();
		serverAddress = await server.getAddress();
		otherAddress = await other.getAddress();
		
		const FileSharingToken: ContractFactory = await ethers.getContractFactory("FileSharingToken", deployer);
		fst = await FileSharingToken.deploy("FileSharingToken", "FST", "10000000000000000000000", true);
		
		const Ownership = await ethers.getContractFactory("OwnershipNFT", deployer);
		art = await Ownership.deploy("AccessRightToken", "OWT");
		
		const FileSharingContract = await ethers.getContractFactory("FileSharingContract", server);
		fsc = await FileSharingContract.deploy(art.address.toString(), fst.address.toString(), serverAddress, 10);
		
		await fst.connect(deployer).transfer(clientAddress, 1000);
		
		// price: 500 wei, royalty: 5%
		await art.connect(author)['register(uint256,uint256)'](500, 500);
		await fst.connect(deployer).transfer(clientAddress, 10000);
	});
	
	it("can set download fee", async()=> {
		// only author can set download fee
		await assertPromiseThrow(fsc.connect(other).setDownloadFee(0, 100));
		await fsc.connect(author).setDownloadFee(0, 100);
		assert.equal(await fsc.downloadFeeOf(0), 100);
	});
	
	it("can pay download fee", async() => {
		// it fails when client doesnt have NFT
		await assertPromiseThrow(fsc.connect(client).payDownloadFee(0));
		await art.connect(client).mint(0, clientAddress, {value: 500});
		assert.isTrue(await art.hasOwnership(clientAddress, 0));
		await fsc.connect(author).setDownloadFee(0, 0);
		// it fails when download fee is 0
		await assertPromiseThrow(fsc.connect(client).payDownloadFee(0));
		assert.equal(await fsc.paymentOf(clientAddress, 0), 0);
		
		await fsc.connect(author).setDownloadFee(0, 100);
		await fst.connect(client).approve(fsc.address, 250);
		await fsc.connect(client).payDownloadFee(0);
		assert.equal(await fsc.paymentOf(clientAddress, 0), 250);
		assert.equal(await fsc.countOf(clientAddress, 0), 10);
	})
	
	it("can set arranged node", async() => {
		// Both the node and the customer need to have ownership.
		await assertPromiseThrow(fsc.connect(server).setArrangedNode(clientAddress, 0, nodeAddress));
		art.connect(node).mint(0, nodeAddress, {value: 500});
		art.connect(other).mint(0, otherAddress, {value: 500});
		// it fails when count is 0
		await assertPromiseThrow(fsc.connect(server).setArrangedNode(otherAddress, 0, nodeAddress));
		
		await fsc.connect(server).setArrangedNode(clientAddress, 0, nodeAddress);
		assert.equal(await fsc.countOf(clientAddress, 0), 9);
		assert.equal(await fsc.arrangedNodeOf(clientAddress, 0), nodeAddress);
		for (let i=0; i<9; i++) {
			await fsc.connect(server).setArrangedNode(clientAddress, 0, nodeAddress);
		}
		assert.equal(await fsc.countOf(clientAddress, 0), 0);
		await fst.connect(client).approve(fsc.address, 250);
		await fsc.connect(client).payDownloadFee(0);
		assert.equal(await fsc.arrangedNodeOf(clientAddress, 0), "0x0000000000000000000000000000000000000000");
		assert.equal(await fsc.paymentOf(clientAddress, 0), 250);
		assert.equal(await fsc.countOf(clientAddress, 0), 10);
	})
	
	it('can approve', async ()=> {
		// only server can approve
		await fsc.connect(server).setArrangedNode(clientAddress, 0, nodeAddress);
		await assertPromiseThrow(fsc.connect(other).approveNode(clientAddress, 0));
		
		let clientBalance: BigNumber = await fst.balanceOf(clientAddress);
		let contractBalance: BigNumber = await fst.balanceOf(fsc.address);
		let nodeBalance: BigNumber = await fst.balanceOf(nodeAddress);
		
		let collateral = 100, commission = 50, downloadFee = 100;
		clientBalance = clientBalance.add(collateral);
		contractBalance = contractBalance.sub(collateral).sub(downloadFee);
		nodeBalance = nodeBalance.add(downloadFee);
		
		console.log(clientBalance.toString());
		console.log(contractBalance.toString());
		console.log(nodeBalance.toString());
		
		await fsc.connect(client).approveNode(0);
		
		console.log((await fst.balanceOf(clientAddress)).toString());
		console.log((await fst.balanceOf(fsc.address)).toString());
		console.log((await fst.balanceOf(nodeAddress)).toString());
		
		assert.equal((await fst.balanceOf(clientAddress)).toString(), clientBalance.toString());
		assert.equal((await fst.balanceOf(fsc.address)).toString(), contractBalance.toString());
		assert.equal((await fst.balanceOf(nodeAddress)).toString(), nodeBalance.toString());
	})
});
