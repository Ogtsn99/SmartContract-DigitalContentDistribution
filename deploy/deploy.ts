// @ts-ignore
const { ethers, upgrades } = require("hardhat");
import { Signer } from "ethers";

module.exports = async ({
	                        getNamedAccounts,
	                        deployments,
	                        getChainId,
	                        getUnnamedAccounts,
                        }) => {
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();
	
	const ART = await ethers.getContractFactory("AccessRightToken");
	const art = await ART.deploy("Access Right Token", "ART");
	
	console.log("art deployed to:", art.address);
	
};
