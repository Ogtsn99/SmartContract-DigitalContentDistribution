// @ts-ignore
import { ContractFactory } from "@ethersproject/contracts";

module.exports = async ({
	                        getNamedAccounts,
	                        deployments,
	                        getChainId,
	                        getUnnamedAccounts,
                        }) => {
	const { deploy } = deployments;
	
	const { deployer } = await getNamedAccounts();
	
	let result = await deploy("AccessRightNFT", {
			from: deployer,
		args: ["AccessRightToken", "ART"]
		}
	);
	
	console.log("AccessRightNFT deployed. address =", result.address);
	
	result = await deploy("AccessRightMarket", {
		from: deployer,
		args: [result.address],
		proxy: true
	});
	
	console.log("AccessRightMarket deployed. address =", result.address);
	
	result = await deploy("FileSharingToken", {
		from: deployer,
		args: ["FileSharingToken", "FST", "10000000000000000000000", true]
	})
	
	console.log("FileSharingToken deployed. address =", result.address);
};
