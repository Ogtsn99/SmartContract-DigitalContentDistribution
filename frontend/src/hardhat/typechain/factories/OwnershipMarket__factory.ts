/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { OwnershipMarket } from "../OwnershipMarket";

export class OwnershipMarket__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<OwnershipMarket> {
    return super.deploy(overrides || {}) as Promise<OwnershipMarket>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): OwnershipMarket {
    return super.attach(address) as OwnershipMarket;
  }
  connect(signer: Signer): OwnershipMarket__factory {
    return super.connect(signer) as OwnershipMarket__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OwnershipMarket {
    return new Contract(address, _abi, signerOrProvider) as OwnershipMarket;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
    ],
    name: "SetPrice",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "buyNFT",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owtAddress",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
    ],
    name: "setPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610779806100206000396000f3fe60806040526004361061003f5760003560e01c806351ed828814610044578063c4d66de814610059578063e757223014610079578063f7d97577146100af575b600080fd5b6100576100523660046105a1565b6100cf565b005b34801561006557600080fd5b50610057610074366004610535565b61039d565b34801561008557600080fd5b506100996100943660046105a1565b61042e565b6040516100a691906106f1565b60405180910390f35b3480156100bb57600080fd5b506100576100ca3660046105b9565b610440565b6002546040516331a9108f60e11b815233916001600160a01b031690636352211e906100ff9085906004016106f1565b60206040518083038186803b15801561011757600080fd5b505afa15801561012b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061014f9190610558565b6001600160a01b0316141561017f5760405162461bcd60e51b8152600401610176906105fe565b60405180910390fd5b60008181526001602052604090205434146101ac5760405162461bcd60e51b8152600401610176906106ae565b60025460405163152a902d60e11b815260009182916001600160a01b0390911690632a55205a906101e390869034906004016106fa565b604080518083038186803b1580156101fa57600080fd5b505afa15801561020e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102329190610574565b60405191935091506001600160a01b0383169082156108fc029083906000818181858888f1935050505015801561026d573d6000803e3d6000fd5b506002546040516331a9108f60e11b81526000916001600160a01b031690636352211e9061029f9087906004016106f1565b60206040518083038186803b1580156102b757600080fd5b505afa1580156102cb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102ef9190610558565b90506001600160a01b0381166108fc6103088434610708565b6040518115909202916000818181858888f19350505050158015610330573d6000803e3d6000fd5b50600254604051632142170760e11b81526001600160a01b03909116906342842e0e90610365908490339089906004016105da565b600060405180830381600087803b15801561037f57600080fd5b505af1158015610393573d6000803e3d6000fd5b5050505050505050565b600054610100900460ff16806103b6575060005460ff16155b6103d25760405162461bcd60e51b815260040161017690610660565b600054610100900460ff161580156103fd576000805460ff1961ff0019909116610100171660011790555b600280546001600160a01b0319166001600160a01b038416179055801561042a576000805461ff00191690555b5050565b60009081526001602052604090205490565b6002546040516331a9108f60e11b815233916001600160a01b031690636352211e906104709086906004016106f1565b60206040518083038186803b15801561048857600080fd5b505afa15801561049c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104c09190610558565b6001600160a01b0316146104e65760405162461bcd60e51b81526004016101769061062f565b60008281526001602052604090819020829055517ff9317dc3bc6dda0e00e43855c2c30847aeafb8dcea9d2ce86e9ce7a83d549f019061052990849084906106fa565b60405180910390a15050565b600060208284031215610546578081fd5b81356105518161072b565b9392505050565b600060208284031215610569578081fd5b81516105518161072b565b60008060408385031215610586578081fd5b82516105918161072b565b6020939093015192949293505050565b6000602082840312156105b2578081fd5b5035919050565b600080604083850312156105cb578182fd5b50508035926020909101359150565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6020808252601790820152761e5bdd481a185d9948185b1c9958591e481bdddb881a5d604a1b604082015260600190565b6020808252601790820152763cb7ba903237b713ba1037bbb7103a3432903a37b5b2b760491b604082015260600190565b6020808252602e908201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160408201526d191e481a5b9a5d1a585b1a5e995960921b606082015260800190565b60208082526023908201527f6d73672e76616c7565206973206e6f7420657175616c20746f2074686520707260408201526269636560e81b606082015260800190565b90815260200190565b918252602082015260400190565b60008282101561072657634e487b7160e01b81526011600452602481fd5b500390565b6001600160a01b038116811461074057600080fd5b5056fea26469706673582212208f969310c5528afcc6e211bcb12df721dd6b6f44e972998355cf39d32e284b2864736f6c63430008000033";
