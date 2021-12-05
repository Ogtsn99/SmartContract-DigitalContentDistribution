import React, { useContext, useEffect, useState } from 'react';
import { CurrentAddressContext, FileSharingTokenContext, OwnershipNFTContext } from "../hardhat/SymfoniContext";
import { sha256 } from "js-sha256";
import { Table } from "react-bootstrap";
import ipfsClient from 'ipfs-http-client';
import { BigNumber } from "ethers";

const ipfs = ipfsClient.create({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

class Content{
	contentId: number;
	contentHash: string;
	author: string;
	price: BigNumber;
	royalty: number;
	royaltyReceiver: string;
	uri: string;
	constructor(contentId: number, contentHash: string, author:string,
	            price: BigNumber, royalty: number, royaltyReceiver: string, uri: string) {
		this.contentId = contentId;
		this.contentHash = contentHash;
		this.author = author;
		this.price = price;
		this.royalty = royalty;
		this.royaltyReceiver = royaltyReceiver;
		this.uri = uri;
	}
}

class NFT {
	tokenId: number;
	owner: string;
	contentId: number;
	constructor(tokenId: number, owner: string, contentId: number) {
		this.tokenId = tokenId;
		this.owner = owner;
		this.contentId = contentId;
	}
}

export const ContentAndTokenInterface = () => {
	const OWT = useContext(OwnershipNFTContext);
	const FST = useContext(FileSharingTokenContext);
	const [currentAddress] = useContext(CurrentAddressContext);
	
	let file: File | null;
	let fileHash: string;
	let reader: FileReader = new window.FileReader();
	const [contents, setContents] = useState<Array<Content>>(new Array<Content>());
	const [nfts, setNfts] = useState<Array<NFT>>(new Array<NFT>());
	const [fstBalance, setFstBalance] = useState<string>("0");
	
	reader.onload = (event) => {
		let buffer: ArrayBuffer;
		if (event.target) buffer = event.target.result as ArrayBuffer;
		else return;
		fileHash = sha256(buffer)
	}
	
	useEffect(()=> {
		
		const doAsync = async()=> {
			if(!OWT.instance || !FST.instance) return ;
			let contentNumber: number = (await OWT.instance?.nextContentId())!.toNumber();
			let tokenNumber: number = (await OWT.instance?.nextTokenId()!).toNumber();
			setFstBalance((await FST.instance.balanceOf(currentAddress)).toString());
			
			let tmp: Array<Content> = new Array<Content>();
			for (let i=0; i < contentNumber; i++) {
				let author = await OWT.instance?.authorOf(i);
				let price = (await OWT.instance?.priceOf(i));
				let royalty = (await OWT.instance?.royaltyOf(i)).toNumber();
				let royaltyReceiver = await OWT.instance?.royaltyReceiverOf(i);
				let hash = await OWT.instance?.hashOf(i);
				console.log("hash is ", hash);
				let uri = await OWT.instance?.ipfsPathOf(i);
				console.log(uri);
				let newContent = new Content(i, hash, author, price, royalty, royaltyReceiver, uri);
				tmp.push(newContent);
			}
			setContents(tmp);
			
			let tmpNfts: NFT[] = [];
			for (let i=0; i < tokenNumber; i++) {
				let owner = await OWT.instance.ownerOf(i);
				let contentId = (await OWT.instance.contentOf(i)).toNumber();
				let nft = new NFT(i, owner, contentId);
				tmpNfts.push(nft);
			}
			setNfts(tmpNfts);
		}
		
		doAsync();
	}, [])
	
	async function registerContent(e: any) {
		e.preventDefault();
		let price = e.target.price.value;
		let royalty = e.target.royalty.value;
		let royaltyReceiver = e.target.royaltyReceiver.value
		let metadata = {name: e.target.title.value};
		let json = JSON.stringify(metadata);
		console.log(json);
		let result = await ipfs.add(json);
		console.log(result);
		await OWT.instance?.["register(uint256,uint256,address,string,string)"](price, royalty, royaltyReceiver, fileHash, result.path);
	}
	
	function onFileInputChange(e: any) {
			e.preventDefault();
			if (e.target.files)
				file = e.target.files.item(0);
			if (file != null)
				reader.readAsArrayBuffer(file);
	}
	
	async function mint(contentId: number, price: BigNumber) {
		console.log(currentAddress);
		// @ts-ignore
		await OWT.instance?.mint(contentId, currentAddress, {value: price});
	}
	
	function faucet() {
		FST.instance?.faucet();
	}
	
	return (
		<div>
			<p>FST: {fstBalance}   <button onClick={faucet}>faucet</button></p>
			<h2>Content</h2>
			<form onSubmit={registerContent}>
				<div>
					<label className="form-label">タイトル</label>
					<input type="text" name="title"/>
				</div>
				<div>
					<label className="form-label">Price:</label>
					<input type="text" name="price"/>
				</div>
				<div>
					<label className="form-label">Royalty:</label>
					<input type="number" name="royalty"/>
				</div>
				<div>
					<label className="form-label">Royalty Receiver:</label>
					<input type="text" name="royaltyReceiver"/>
				</div>
				<div>
					<label className="form-label">登録ファイル:</label>
					<input type="file" onChange={onFileInputChange}/>
				</div>
				<button type="submit">Register</button>
			</form>
			
			<Table className="mx-auto striped bordered hover">
				<thead>
				<tr>
					<th>id</th>
					<th>mint</th>
					<th>Hash</th>
					<th>author</th>
					<th>price</th>
					<th>royalty</th>
					<th>royaltyReceiver</th>
					<th>uri</th>
				</tr>
				{contents.map((e:Content) => {
						return (
							<tr>
								<th>{e.contentId}</th>
								<th><button onClick={()=>mint(e.contentId, e.price)}>mint</button></th>
								<th>{e.contentHash}</th>
								<th>{e.author===currentAddress? "You": e.author}</th>
								<th>{e.price.toString()}</th>
								<th>{e.royalty / 100}%</th>
								<th>{e.royaltyReceiver}</th>
								<th>{"https://ipfs.io/ipfs/"+e.uri}</th>
							</tr>
						);
					}
					
				)}
				</thead>
			</Table>
			
			<h2>NFT</h2>
			<Table className="mx-auto striped bordered hover">
				<thead>
				<tr>
					<th>id</th>
					<th>owner</th>
					<th>content Id</th>
				</tr>
				{nfts.map(e => {
						return (
							<tr>
								<th>{e.tokenId}</th>
								<th>{e.owner===currentAddress? "You" : e.owner}</th>
								<th>{e.contentId}</th>
							</tr>
						);
					}
				)}
				</thead>
			</Table>
		</div>
	)
}