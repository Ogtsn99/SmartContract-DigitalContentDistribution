import React, { useContext, useEffect, useState } from 'react';
import {
	CurrentAddressContext,
	FileSharingContractContext, FileSharingTokenContext,
	OwnershipNFTContext
} from "../hardhat/SymfoniContext";
import { Table } from "react-bootstrap";
import { BigNumber } from "ethers";

class FscInfo{
	contentId: number;
	author: string;
	count: number;
	downloadFee: BigNumber;
	nodeAddress: string;
	
	constructor(contentId: number, author:string, count: number, downloadFee:BigNumber, nodeAddress: string) {
		this.count = count;
		this.author = author;
		this.contentId = contentId;
		this.nodeAddress = nodeAddress;
		this.downloadFee = downloadFee;
	}
}

export const FileSharingContractInterface = () => {
	const OWT = useContext(OwnershipNFTContext);
	const FSC = useContext(FileSharingContractContext);
	const FST = useContext(FileSharingTokenContext);
	const [currentAddress] = useContext(CurrentAddressContext);
	const [fscInfo, setFscInfo] = useState<FscInfo[]>([]);
	const zeroAddress = "0x0000000000000000000000000000000000000000";
	let contentId: BigNumber;
	let downLoadFee: BigNumber;
	
	useEffect(()=> {
		
		const doAsync = async()=> {
			if(!OWT.instance || !FSC.instance) return ;
			let contentNumber: number = (await OWT.instance?.nextContentId())!.toNumber();
			let tokenNumber: number = (await OWT.instance?.nextTokenId()!).toNumber();
			
			let tmp: FscInfo[] = [];
			for (let i=0; i < contentNumber; i++) {
				let hasOwnership = await OWT.instance.hasOwnership(currentAddress, i);
				if(!hasOwnership) continue;
				let count = await FSC.instance.countOf(currentAddress, i);
				let author = await OWT.instance.authorOf(i);
				let nodeAddress = await FSC.instance.arrangedNodeOf(currentAddress, i);
				let downloadFee = await FSC.instance.downloadFeeOf(i);
				let newFscInfo = new FscInfo(i, author, count, downloadFee, nodeAddress);
				tmp.push(newFscInfo);
			}
			setFscInfo(tmp);
		}
		
		doAsync();
	}, [])
	
	async function payDownloadFee(downloadFee:BigNumber, contentId: number) {
		let b = downloadFee;
		downloadFee = downloadFee.add(b);
		downloadFee = downloadFee.add(b);
		downloadFee = downloadFee.add(b.div(2));
		let address = (await FSC.instance?.address)!.toString();
		if((await FST.instance?.allowance(currentAddress, address)) !== downloadFee)
			await FST.instance?.approve((await FSC.instance?.address)!.toString(), downloadFee);
		await FSC.instance?.["payDownloadFee(address,uint256)"](currentAddress, contentId);
	}
	
	async function setDownloadFee(e: any) {
		e.preventDefault();
		if(await OWT.instance?.authorOf(contentId) != currentAddress) {
			alert("You are not the author.")
			return ;
		} else {
			try {
				await FSC.instance?.setDownloadFee(contentId, downLoadFee);
			} catch (e) {
				alert("failed to set download fee.")
			}
		}
	}
	
	function changeContentId(e: any) {
		if(e.target.value === "")
			contentId = BigNumber.from(0);
		else contentId = BigNumber.from(e.target.value);
	}
	
	function changeDownloadFee(e: any) {
		if(e.target.value === "")
			downLoadFee = BigNumber.from(0);
		else downLoadFee = BigNumber.from(e.target.value);
	}
	
	// TODO: approveボタンをつける
	async function approveNode(contentId: number) {
		await FSC.instance?.approveNode(currentAddress, contentId);
	}
	
	return (
		<div>
			<form>
				<div>
					<label className="form-label">contentId</label>
					<input type="number" onChange={changeContentId} name="contentId"/>
				</div>
				<div>
					<label className="form-label">fee</label>
					<input type="text" onChange={changeDownloadFee} name="fee"/>
				</div>
				<button onClick={setDownloadFee}>Set Download Fee</button>
			</form>
			
			<Table className="mx-auto striped bordered hover">
				<thead>
				<tr>
					<th>contentId</th>
					<th>Remaining count</th>
					<th>downloadFee</th>
					<th>pay download fee</th>
					<th>last Node</th>
					<th>Approve</th>
				</tr>
				{fscInfo.map(e => {
						return (
							<tr>
								<th>{e.contentId}</th>
								<th>{e.count}</th>
								<th>{e.downloadFee.toString()}</th>
								<th>{(e.count !== 0 || e.downloadFee.toString() === "0") || <button onClick={()=>payDownloadFee(e.downloadFee, e.contentId)}>Pay Download Fee</button>}</th>
								<th>{e.nodeAddress}</th>
								<th>{(e.nodeAddress === zeroAddress) || <button onClick={()=>approveNode(e.contentId)}>Approve</button>}</th>
							</tr>
						);
					}
				)}
				</thead>
			</Table>
		</div>
	)
}