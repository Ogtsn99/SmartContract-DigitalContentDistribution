/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface FileSharingContractInterface extends ethers.utils.Interface {
  functions: {
    "approveNode(address,uint256)": FunctionFragment;
    "arrangedNodeOf(address,uint256)": FunctionFragment;
    "changeDownloadLimit(uint8)": FunctionFragment;
    "countOf(address,uint256)": FunctionFragment;
    "downloadFeeOf(uint256)": FunctionFragment;
    "payDownloadFee(uint256)": FunctionFragment;
    "paymentOf(address,uint256)": FunctionFragment;
    "setArrangedNode(address,uint256,address)": FunctionFragment;
    "setDownloadFee(uint256,uint256)": FunctionFragment;
    "withdraw()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "approveNode",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "arrangedNodeOf",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "changeDownloadLimit",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "countOf",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "downloadFeeOf",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "payDownloadFee",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "paymentOf",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setArrangedNode",
    values: [string, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setDownloadFee",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "withdraw", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "approveNode",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "arrangedNodeOf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "changeDownloadLimit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "countOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "downloadFeeOf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "payDownloadFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "paymentOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setArrangedNode",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDownloadFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {
    "ApproveNode(address,uint256,address)": EventFragment;
    "ChangeDownloadLimit(uint8)": EventFragment;
    "Claim(address,uint256)": EventFragment;
    "Deposit(address,uint256)": EventFragment;
    "PayDownloadFee(address,uint256,uint256)": EventFragment;
    "SetArrangedNode(address,uint256,address)": EventFragment;
    "SetDownloadFee(uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ApproveNode"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ChangeDownloadLimit"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Claim"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Deposit"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PayDownloadFee"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetArrangedNode"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetDownloadFee"): EventFragment;
}

export class FileSharingContract extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: FileSharingContractInterface;

  functions: {
    approveNode(
      client: string,
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "approveNode(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    arrangedNodeOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "arrangedNodeOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    changeDownloadLimit(
      downloadLimit: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "changeDownloadLimit(uint8)"(
      downloadLimit: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    countOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: number;
    }>;

    "countOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: number;
    }>;

    downloadFeeOf(
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "downloadFeeOf(uint256)"(
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "payDownloadFee(uint256)"(
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "payDownloadFee(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    paymentOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "paymentOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    setArrangedNode(
      client: string,
      contentId: BigNumberish,
      node: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setArrangedNode(address,uint256,address)"(
      client: string,
      contentId: BigNumberish,
      node: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setDownloadFee(
      contentId: BigNumberish,
      fee: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setDownloadFee(uint256,uint256)"(
      contentId: BigNumberish,
      fee: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    withdraw(overrides?: Overrides): Promise<ContractTransaction>;

    "withdraw()"(overrides?: Overrides): Promise<ContractTransaction>;
  };

  approveNode(
    client: string,
    contentId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "approveNode(address,uint256)"(
    client: string,
    contentId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  arrangedNodeOf(
    client: string,
    contentId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  "arrangedNodeOf(address,uint256)"(
    client: string,
    contentId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  changeDownloadLimit(
    downloadLimit: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "changeDownloadLimit(uint8)"(
    downloadLimit: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  countOf(
    client: string,
    contentId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<number>;

  "countOf(address,uint256)"(
    client: string,
    contentId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<number>;

  downloadFeeOf(
    contentId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "downloadFeeOf(uint256)"(
    contentId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "payDownloadFee(uint256)"(
    contentId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "payDownloadFee(address,uint256)"(
    client: string,
    contentId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  paymentOf(
    client: string,
    contentId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "paymentOf(address,uint256)"(
    client: string,
    contentId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  setArrangedNode(
    client: string,
    contentId: BigNumberish,
    node: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setArrangedNode(address,uint256,address)"(
    client: string,
    contentId: BigNumberish,
    node: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setDownloadFee(
    contentId: BigNumberish,
    fee: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setDownloadFee(uint256,uint256)"(
    contentId: BigNumberish,
    fee: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  withdraw(overrides?: Overrides): Promise<ContractTransaction>;

  "withdraw()"(overrides?: Overrides): Promise<ContractTransaction>;

  callStatic: {
    approveNode(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "approveNode(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    arrangedNodeOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    "arrangedNodeOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    changeDownloadLimit(
      downloadLimit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "changeDownloadLimit(uint8)"(
      downloadLimit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    countOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<number>;

    "countOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<number>;

    downloadFeeOf(
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "downloadFeeOf(uint256)"(
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "payDownloadFee(uint256)"(
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "payDownloadFee(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    paymentOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "paymentOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setArrangedNode(
      client: string,
      contentId: BigNumberish,
      node: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setArrangedNode(address,uint256,address)"(
      client: string,
      contentId: BigNumberish,
      node: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setDownloadFee(
      contentId: BigNumberish,
      fee: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "setDownloadFee(uint256,uint256)"(
      contentId: BigNumberish,
      fee: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    withdraw(overrides?: CallOverrides): Promise<void>;

    "withdraw()"(overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    ApproveNode(
      clientAccount: string | null,
      contentId: BigNumberish | null,
      nodeAccount: string | null
    ): EventFilter;

    ChangeDownloadLimit(downloadLimit: null): EventFilter;

    Claim(account: string | null, amount: null): EventFilter;

    Deposit(acount: string | null, amount: null): EventFilter;

    PayDownloadFee(
      account: string | null,
      contentId: BigNumberish | null,
      feeIncludeCollateral: null
    ): EventFilter;

    SetArrangedNode(
      clientAccount: string | null,
      contentId: BigNumberish | null,
      nodeAccount: string | null
    ): EventFilter;

    SetDownloadFee(contentId: BigNumberish | null, fee: null): EventFilter;
  };

  estimateGas: {
    approveNode(
      client: string,
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "approveNode(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    arrangedNodeOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "arrangedNodeOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    changeDownloadLimit(
      downloadLimit: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "changeDownloadLimit(uint8)"(
      downloadLimit: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    countOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "countOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    downloadFeeOf(
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "downloadFeeOf(uint256)"(
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "payDownloadFee(uint256)"(
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "payDownloadFee(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    paymentOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "paymentOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setArrangedNode(
      client: string,
      contentId: BigNumberish,
      node: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setArrangedNode(address,uint256,address)"(
      client: string,
      contentId: BigNumberish,
      node: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setDownloadFee(
      contentId: BigNumberish,
      fee: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setDownloadFee(uint256,uint256)"(
      contentId: BigNumberish,
      fee: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    withdraw(overrides?: Overrides): Promise<BigNumber>;

    "withdraw()"(overrides?: Overrides): Promise<BigNumber>;
  };

  populateTransaction: {
    approveNode(
      client: string,
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "approveNode(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    arrangedNodeOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "arrangedNodeOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    changeDownloadLimit(
      downloadLimit: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "changeDownloadLimit(uint8)"(
      downloadLimit: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    countOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "countOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    downloadFeeOf(
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "downloadFeeOf(uint256)"(
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "payDownloadFee(uint256)"(
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "payDownloadFee(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    paymentOf(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "paymentOf(address,uint256)"(
      client: string,
      contentId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setArrangedNode(
      client: string,
      contentId: BigNumberish,
      node: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setArrangedNode(address,uint256,address)"(
      client: string,
      contentId: BigNumberish,
      node: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setDownloadFee(
      contentId: BigNumberish,
      fee: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setDownloadFee(uint256,uint256)"(
      contentId: BigNumberish,
      fee: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    withdraw(overrides?: Overrides): Promise<PopulatedTransaction>;

    "withdraw()"(overrides?: Overrides): Promise<PopulatedTransaction>;
  };
}
