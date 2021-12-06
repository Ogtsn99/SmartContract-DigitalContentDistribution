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
	
	let chainId = await getChainId();
	
	console.log("chainId =", chainId);
	console.log("deployer =", deployer);
	
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
	
	console.log("FileSharingToken deployed. address =", result.address);
	
	let fstAddress = result.address;
	
	result = await deploy("FileSharingContract", {
		from: deployer,
		args: [owtAddress, fstAddress, deployer, 10],
	});
	
	console.log("FileSharingContract deployed. address =", result.address);
	
	let signer = (await ethers.getSigners())[0];
	await owt.connect(signer).setBaseURI("https://ipfs.io/ipfs/");
	
	// TODO: ここでサンプルデータの登録をする
};
