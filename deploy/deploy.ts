// @ts-ignore
import { ethers } from "hardhat";
import { ContractFactory } from "@ethersproject/contracts";
require('dotenv').config();
const env = process.env;

module.exports = async ({
	                        getNamedAccounts,
	                        deployments,
	                        getChainId,
	                        getUnnamedAccounts,
                        }) => {
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();
	
	let result = await deploy("OwnershipNFT", {
			from: deployer,
		args: ["OwnershipToken", "OWT"]
		}
	);
	
	let owtAddress = result.address;
	let owt = await ethers.getContractAt("OwnershipNFT", owtAddress);
	
	result = await deploy("OwnershipMarket", {
		from: deployer,
		args: [result.address],
		proxy: true
	});
	
	console.log("OwnershipMarket deployed. address =", result.address);
	
	result = await deploy("FileSharingToken", {
		from: deployer,
		args: ["FileSharingToken", "FST", "10000000000000000000000", true]
	});
	
	let fstAddress = result.address;
	let fst = await ethers.getContractAt("FileSharingToken", fstAddress);
	
	
	result = await deploy("FileSharingContract", {
		from: deployer,
		args: [owtAddress, fstAddress, (await ethers.getSigners())[1].address, 10],
	});
	
	let fsc = await ethers.getContractAt("FileSharingContract", result.address);
	
	let author = (await ethers.getSigners())[0];
	await owt.connect(author)['register(uint256,uint256,address,string)'](500, 500, await author.getAddress(), "e9e4cbda60f1d0b09487f87a89005c52a1133b642f4e43e2a211def82a88b88e");
	await owt.connect(author).mint(0, "0x56D46A22B46011e14Bdc4aA826060f7D0b9CfFe3");
	await fsc.connect(author).setDownloadFee(0, 100);
	await fst.connect(author).approve(fsc.address, 250);
	await fsc.connect(author).payDownloadFee(0);
	let user2 = (await ethers.getSigners())[1];
	fst.connect(author).transfer("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 10000);
	await owt.connect(author).mint(0, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
	await fst.connect(user2).approve(fsc.address, 250);
	await fsc.connect(user2).payDownloadFee(0);
	console.log(author.address);
	console.log("server address ..." , (await ethers.getSigners())[1].address);
	
};
