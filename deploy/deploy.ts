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
	let fst = await ethers.getContractAt("FileSharingToken", fstAddress);
	
	result = await deploy("FileSharingContract", {
		from: deployer,
		args: [owtAddress, fstAddress, deployer, 10],
	});
	
	console.log("FileSharingContract deployed. address =", result.address);
	
	let fscAddress = result.address;
	let fsc = await ethers.getContractAt("FileSharingContract", fscAddress);
	
	let signer = (await ethers.getSigners())[0];
	await owt.connect(signer).setBaseURI("https://ipfs.io/ipfs/");
	
	// サンプルデータの登録
	let author = (await ethers.getSigners())[0];
	let buyer = (await ethers.getSigners())[1];
	await fst.connect(buyer).faucet();
	const register = async (fileHash:string, path:string) => {
		console.log("register content");
		console.log("we have now", (await owt.nextContentId()).toNumber());
		let contentId = (await owt.nextContentId()).toNumber();
		await owt.connect(author)["register(uint256,uint256,address,string,string)"](100000, 0, await author.getAddress(), fileHash, path);
		await owt.connect(buyer).mint(contentId, await buyer.getAddress(), {value: 100000});
		await fsc.connect(author).setDownloadFee(contentId , 100);
		await fst.connect(buyer).approve(fscAddress, 250);
		await fsc.connect(buyer)["payDownloadFee(uint256)"](contentId);
	}
	
	let hashOfOneMbFile = "30e14955ebf1352266dc2ff8067e68104607e750abb9d3b36582b8af909fcb58"
	let pathOfOneMbFile = "QmdB1KFvW7iPL3yQYUZj6DXMTUz7unMQwyYdSqedHYseeP";
	await register(hashOfOneMbFile, pathOfOneMbFile);
	
	let hashOfTenMbFile = "e5b844cc57f57094ea4585e235f36c78c1cd222262bb89d53c94dcb4d6b3e55d";
	let pathOftenMbFile = "QmdzXf6h7nnPvQLG2xUgUugC5KCpbzL9XwK2GRhExyatYT";
	await register(hashOfTenMbFile, pathOftenMbFile);
	
	let hashOfHundredMbFile = "20492a4d0d84f8beb1767f6616229f85d44c2827b64bdbfb260ee12fa1109e0e";
	let pathOfHundredMbFile = "QmUhEYxrXmRj5xRdDSNgFWfXASDDfbdvhssTJ9Svrycg1A";
	await register(hashOfHundredMbFile, pathOfHundredMbFile);
	
	let pathOfOneGbFile = "QmZBwa2Pb4aasPjFSkAqv7647deSE6Apw1kWYRFBcYFCqJ";
	let hashOfOneGbFile = "49bc20df15e412a64472421e13fe86ff1c5165e18b2afccf160d4dc19fe68a14";
	await register(hashOfOneGbFile, pathOfOneGbFile);
	
};
