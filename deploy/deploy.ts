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
	
	await deploy("AccessRightMarket", {
		from: deployer,
		args: [result.address],
		proxy: true
	})
};
