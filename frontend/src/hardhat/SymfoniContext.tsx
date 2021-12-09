/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { providers, Signer, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Web3Modal, { IProviderOptions } from "web3modal";
import OwnershipMarket_ImplementationDeployment from "./deployments/mumbai/OwnershipMarket_Implementation.json";
import OwnershipMarket_ProxyDeployment from "./deployments/mumbai/OwnershipMarket_Proxy.json";
import FileSharingContractDeployment from "./deployments/mumbai/FileSharingContract.json";
import { FileSharingContract } from "./typechain/FileSharingContract";
import { FileSharingContract__factory } from "./typechain/factories/FileSharingContract__factory";
import FileSharingTokenDeployment from "./deployments/mumbai/FileSharingToken.json";
import { FileSharingToken } from "./typechain/FileSharingToken";
import { FileSharingToken__factory } from "./typechain/factories/FileSharingToken__factory";
import OwnershipNFTDeployment from "./deployments/mumbai/OwnershipNFT.json";
import { OwnershipNFT } from "./typechain/OwnershipNFT";
import { OwnershipNFT__factory } from "./typechain/factories/OwnershipNFT__factory";
import OwnershipMarketDeployment from "./deployments/mumbai/OwnershipMarket.json";
import { OwnershipMarket } from "./typechain/OwnershipMarket";
import { OwnershipMarket__factory } from "./typechain/factories/OwnershipMarket__factory";
import { ERC20 } from "./typechain/ERC20";
import { ERC20__factory } from "./typechain/factories/ERC20__factory";
import { ERC721 } from "./typechain/ERC721";
import { ERC721__factory } from "./typechain/factories/ERC721__factory";

const emptyContract = {
    instance: undefined,
    factory: undefined
};
const defaultProvider: providers.Provider | undefined = undefined;
export const ProviderContext = React.createContext<[providers.Provider | undefined, React.Dispatch<React.SetStateAction<providers.Provider | undefined>>]>([defaultProvider, () => { }]);
const defaultCurrentAddress: string = "";
export const CurrentAddressContext = React.createContext<[string, React.Dispatch<React.SetStateAction<string>>]>([defaultCurrentAddress, () => { }]);
const defaultSigner: Signer | undefined = undefined;
export const SignerContext = React.createContext<[Signer | undefined, React.Dispatch<React.SetStateAction<Signer | undefined>>]>([defaultSigner, () => { }]);
const defaultSymfoniContext: SymfoniContextInterface = {
    currentHardhatProvider: "",
    init: () => { throw Error("Symfoni context not initialized") },
    loading: false,
    messages: [],
    providers: []
};
export const SymfoniContext = React.createContext<SymfoniContextInterface>(defaultSymfoniContext);
export const OwnershipMarket_ImplementationContext = React.createContext<SymfoniOwnershipMarket>(emptyContract);
export const OwnershipMarket_ProxyContext = React.createContext<SymfoniOwnershipMarket>(emptyContract);
export const FileSharingContractContext = React.createContext<SymfoniFileSharingContract>(emptyContract);
export const FileSharingTokenContext = React.createContext<SymfoniFileSharingToken>(emptyContract);
export const OwnershipNFTContext = React.createContext<SymfoniOwnershipNFT>(emptyContract);
export const OwnershipMarketContext = React.createContext<SymfoniOwnershipMarket>(emptyContract);
export const ERC20Context = React.createContext<SymfoniERC20>(emptyContract);
export const ERC721Context = React.createContext<SymfoniERC721>(emptyContract);

export interface SymfoniContextInterface {
    init: (provider?: string) => void;
    loading: boolean;
    messages: string[];
    currentHardhatProvider: string;
    providers: string[];
}

export interface SymfoniProps {
    autoInit?: boolean;
    showLoading?: boolean;
    loadingComponent?: React.ReactNode;
}

export interface SymfoniOwnershipMarket {
    instance?: OwnershipMarket;
    factory?: OwnershipMarket__factory;
}

export interface SymfoniOwnershipMarket {
    instance?: OwnershipMarket;
    factory?: OwnershipMarket__factory;
}

export interface SymfoniFileSharingContract {
    instance?: FileSharingContract;
    factory?: FileSharingContract__factory;
}

export interface SymfoniFileSharingToken {
    instance?: FileSharingToken;
    factory?: FileSharingToken__factory;
}

export interface SymfoniOwnershipNFT {
    instance?: OwnershipNFT;
    factory?: OwnershipNFT__factory;
}

export interface SymfoniOwnershipMarket {
    instance?: OwnershipMarket;
    factory?: OwnershipMarket__factory;
}

export interface SymfoniERC20 {
    instance?: ERC20;
    factory?: ERC20__factory;
}

export interface SymfoniERC721 {
    instance?: ERC721;
    factory?: ERC721__factory;
}

export const Symfoni: React.FC<SymfoniProps> = ({
    showLoading = true,
    autoInit = true,
    ...props
}) => {
    const [initializeCounter, setInitializeCounter] = useState(0);
    const [currentHardhatProvider, setCurrentHardhatProvider] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);
    const [signer, setSigner] = useState<Signer | undefined>(defaultSigner);
    const [provider, setProvider] = useState<providers.Provider | undefined>(defaultProvider);
    const [currentAddress, setCurrentAddress] = useState<string>(defaultCurrentAddress);
    const [fallbackProvider] = useState<string | undefined>(undefined);
    const [providerPriority, setProviderPriority] = useState<string[]>(["web3modal", "hardhat"]);
    const [OwnershipMarket_Implementation, setOwnershipMarket_Implementation] = useState<SymfoniOwnershipMarket>(emptyContract);
    const [OwnershipMarket_Proxy, setOwnershipMarket_Proxy] = useState<SymfoniOwnershipMarket>(emptyContract);
    const [FileSharingContract, setFileSharingContract] = useState<SymfoniFileSharingContract>(emptyContract);
    const [FileSharingToken, setFileSharingToken] = useState<SymfoniFileSharingToken>(emptyContract);
    const [OwnershipNFT, setOwnershipNFT] = useState<SymfoniOwnershipNFT>(emptyContract);
    const [OwnershipMarket, setOwnershipMarket] = useState<SymfoniOwnershipMarket>(emptyContract);
    const [ERC20, setERC20] = useState<SymfoniERC20>(emptyContract);
    const [ERC721, setERC721] = useState<SymfoniERC721>(emptyContract);
    useEffect(() => {
        if (messages.length > 0)
            console.debug(messages.pop())
    }, [messages])

    const getProvider = async (): Promise<{ provider: providers.Provider, hardhatProviderName: string } | undefined> => {
        let hardhatProviderName = "Not set";
        let _providerPriority = [...providerPriority];
        // Fallback provider
        if (fallbackProvider && autoInit && initializeCounter === 0) {
            if (localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER") === null) {
                _providerPriority = _providerPriority.sort((a, b) => {
                    return a === fallbackProvider ? -1 : b === fallbackProvider ? 1 : 0;
                })
            }
        }
        const provider = await _providerPriority.reduce(async (maybeProvider: Promise<providers.Provider | undefined>, providerIdentification) => {
            let foundProvider = await maybeProvider
            if (foundProvider) {
                return Promise.resolve(foundProvider)
            }
            else {
                switch (providerIdentification.toLowerCase()) {
                    case "web3modal":
                        try {
                            const provider = await getWeb3ModalProvider()
                            const web3provider = new ethers.providers.Web3Provider(provider);
                            hardhatProviderName = "web3modal";
                            return Promise.resolve(web3provider)
                        } catch (error) {
                            return Promise.resolve(undefined)
                        }
                    case "hardhat":
                        try {
                            const provider = new ethers.providers.JsonRpcProvider({
                                url: "http://127.0.0.1:8545",
                            });
                            hardhatProviderName = "hardhat";
                            return Promise.resolve(provider)
                        } catch (error) {
                            return Promise.resolve(undefined)
                        } default:
                        return Promise.resolve(undefined)
                }
            }
        }, Promise.resolve(undefined)) // end reduce
        return provider ? { provider, hardhatProviderName } : undefined
    };
    const getSigner = async (_provider: providers.Provider, hardhatProviderName: string): Promise<Signer | undefined> => {
        switch (hardhatProviderName) {
            case "web3modal":
                const web3provider = _provider as ethers.providers.Web3Provider
                return await web3provider.getSigner()
            case "hardhat":
                return ethers.Wallet.fromMnemonic("test test test test test test test test test test test junk").connect(_provider)
            default:
                return undefined
        }
    };
    const getWeb3ModalProvider = async (): Promise<any> => {
        const providerOptions: IProviderOptions = {

        };
        const web3Modal = new Web3Modal({
            // network: "mainnet",
            cacheProvider: false,
            providerOptions, // required
        });
        return await web3Modal.connect();
    };

    useEffect(() => {
        let subscribed = true
        const doAsync = async () => {
            const finish = (text: string) => {
                setLoading(false)
                setMessages(old => [...old, text])
            }
            const finishWithContracts = (text: string) => {
                setOwnershipMarket_Implementation(getOwnershipMarket_Implementation(_provider, _signer))
                setOwnershipMarket_Proxy(getOwnershipMarket_Proxy(_provider, _signer))
                setFileSharingContract(getFileSharingContract(_provider, _signer))
                setFileSharingToken(getFileSharingToken(_provider, _signer))
                setOwnershipNFT(getOwnershipNFT(_provider, _signer))
                setOwnershipMarket(getOwnershipMarket(_provider, _signer))
                setERC20(getERC20(_provider, _signer))
                setERC721(getERC721(_provider, _signer))
                finish(text)
            }
            if (!autoInit && initializeCounter === 0) return finish("Auto init turned off.")
            setLoading(true)
            setMessages(old => [...old, "Initiating Symfoni React"])
            const providerObject = await getProvider() // getProvider can actually return undefined, see issue https://github.com/microsoft/TypeScript/issues/11094

            if (!subscribed || !providerObject) return finish("No provider or signer.")
            const _provider = providerObject.provider
            setProvider(_provider)
            setMessages(old => [...old, "Useing " + providerObject.hardhatProviderName])
            setCurrentHardhatProvider(providerObject.hardhatProviderName)
            const _signer = await getSigner(_provider, providerObject.hardhatProviderName);

            if (!subscribed || !_signer) return finishWithContracts("Provider, without signer.")
            setSigner(_signer)
            setMessages(old => [...old, "Useing signer"])
            const address = await _signer.getAddress()

            if (!subscribed || !address) return finishWithContracts("Provider and signer, without address.")
            setCurrentAddress(address)

            return finishWithContracts("Completed Symfoni context initialization.")
        };
        doAsync();
        return () => { subscribed = false }
    }, [initializeCounter])

    const getOwnershipMarket_Implementation = (_provider: providers.Provider, _signer?: Signer) => {

        const contractAddress = OwnershipMarket_ImplementationDeployment.receipt.contractAddress
        const instance = _signer ? OwnershipMarket__factory.connect(contractAddress, _signer) : OwnershipMarket__factory.connect(contractAddress, _provider)
        const contract: SymfoniOwnershipMarket = {
            instance: instance,
            factory: _signer ? new OwnershipMarket__factory(_signer) : undefined,
        }
        return contract
    }
        ;
    const getOwnershipMarket_Proxy = (_provider: providers.Provider, _signer?: Signer) => {

        const contractAddress = OwnershipMarket_ProxyDeployment.receipt.contractAddress
        const instance = _signer ? OwnershipMarket__factory.connect(contractAddress, _signer) : OwnershipMarket__factory.connect(contractAddress, _provider)
        const contract: SymfoniOwnershipMarket = {
            instance: instance,
            factory: _signer ? new OwnershipMarket__factory(_signer) : undefined,
        }
        return contract
    }
        ;
    const getFileSharingContract = (_provider: providers.Provider, _signer?: Signer) => {

        const contractAddress = FileSharingContractDeployment.receipt.contractAddress
        const instance = _signer ? FileSharingContract__factory.connect(contractAddress, _signer) : FileSharingContract__factory.connect(contractAddress, _provider)
        const contract: SymfoniFileSharingContract = {
            instance: instance,
            factory: _signer ? new FileSharingContract__factory(_signer) : undefined,
        }
        return contract
    }
        ;
    const getFileSharingToken = (_provider: providers.Provider, _signer?: Signer) => {

        const contractAddress = FileSharingTokenDeployment.receipt.contractAddress
        const instance = _signer ? FileSharingToken__factory.connect(contractAddress, _signer) : FileSharingToken__factory.connect(contractAddress, _provider)
        const contract: SymfoniFileSharingToken = {
            instance: instance,
            factory: _signer ? new FileSharingToken__factory(_signer) : undefined,
        }
        return contract
    }
        ;
    const getOwnershipNFT = (_provider: providers.Provider, _signer?: Signer) => {

        const contractAddress = OwnershipNFTDeployment.receipt.contractAddress
        const instance = _signer ? OwnershipNFT__factory.connect(contractAddress, _signer) : OwnershipNFT__factory.connect(contractAddress, _provider)
        const contract: SymfoniOwnershipNFT = {
            instance: instance,
            factory: _signer ? new OwnershipNFT__factory(_signer) : undefined,
        }
        return contract
    }
        ;
    const getOwnershipMarket = (_provider: providers.Provider, _signer?: Signer) => {

        const contractAddress = OwnershipMarketDeployment.receipt.contractAddress
        const instance = _signer ? OwnershipMarket__factory.connect(contractAddress, _signer) : OwnershipMarket__factory.connect(contractAddress, _provider)
        const contract: SymfoniOwnershipMarket = {
            instance: instance,
            factory: _signer ? new OwnershipMarket__factory(_signer) : undefined,
        }
        return contract
    }
        ;
    const getERC20 = (_provider: providers.Provider, _signer?: Signer) => {
        let instance = _signer ? ERC20__factory.connect(ethers.constants.AddressZero, _signer) : ERC20__factory.connect(ethers.constants.AddressZero, _provider)
        const contract: SymfoniERC20 = {
            instance: instance,
            factory: _signer ? new ERC20__factory(_signer) : undefined,
        }
        return contract
    }
        ;
    const getERC721 = (_provider: providers.Provider, _signer?: Signer) => {
        let instance = _signer ? ERC721__factory.connect(ethers.constants.AddressZero, _signer) : ERC721__factory.connect(ethers.constants.AddressZero, _provider)
        const contract: SymfoniERC721 = {
            instance: instance,
            factory: _signer ? new ERC721__factory(_signer) : undefined,
        }
        return contract
    }
        ;

    const handleInitProvider = (provider?: string) => {
        if (provider) {
            setProviderPriority(old => old.sort((a, b) => {
                return a === provider ? -1 : b === provider ? 1 : 0;
            }))
        }
        setInitializeCounter(initializeCounter + 1)
    }
    return (
        <SymfoniContext.Provider value={{ init: (provider) => handleInitProvider(provider), providers: providerPriority, currentHardhatProvider, loading, messages }}>
            <ProviderContext.Provider value={[provider, setProvider]}>
                <SignerContext.Provider value={[signer, setSigner]}>
                    <CurrentAddressContext.Provider value={[currentAddress, setCurrentAddress]}>
                        <OwnershipMarket_ImplementationContext.Provider value={OwnershipMarket_Implementation}>
                            <OwnershipMarket_ProxyContext.Provider value={OwnershipMarket_Proxy}>
                                <FileSharingContractContext.Provider value={FileSharingContract}>
                                    <FileSharingTokenContext.Provider value={FileSharingToken}>
                                        <OwnershipNFTContext.Provider value={OwnershipNFT}>
                                            <OwnershipMarketContext.Provider value={OwnershipMarket}>
                                                <ERC20Context.Provider value={ERC20}>
                                                    <ERC721Context.Provider value={ERC721}>
                                                        {showLoading && loading ?
                                                            props.loadingComponent
                                                                ? props.loadingComponent
                                                                : <div>
                                                                    {messages.map((msg, i) => (
                                                                        <p key={i}>{msg}</p>
                                                                    ))}
                                                                </div>
                                                            : props.children
                                                        }
                                                    </ERC721Context.Provider >
                                                </ERC20Context.Provider >
                                            </OwnershipMarketContext.Provider >
                                        </OwnershipNFTContext.Provider >
                                    </FileSharingTokenContext.Provider >
                                </FileSharingContractContext.Provider >
                            </OwnershipMarket_ProxyContext.Provider >
                        </OwnershipMarket_ImplementationContext.Provider >
                    </CurrentAddressContext.Provider>
                </SignerContext.Provider>
            </ProviderContext.Provider>
        </SymfoniContext.Provider>
    )

};
