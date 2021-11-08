require('dotenv').config()
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ethers } from "ethers";
import { SignatureLike } from "@ethersproject/bytes";

const env = process.env;

let AccessRightNFTJson = require("../frontend/src/hardhat/deployments/"+ env.NETWORK_NAME +"/AccessRightNFT.json");

const provider = ethers.getDefaultProvider(env.NETWORK);
const signer = new ethers.Wallet(env.PRIVATE_KEY, provider);
const art = new ethers.Contract(AccessRightNFTJson.address, AccessRightNFTJson.abi, provider);

const httpServer = createServer();

const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	}
});

// contentIdからNodeのアドレスの集合を返す
const contentIdToAddressMap = new Map<number, Set<string>>();
const addressToNodeMap = new Map<string, Node>();
const socketIdToAddressMap = new Map<string, string>();

const STATUS = {
	available: 'available',
	unavailable: 'unavailable'
} as const;
type STATUS = typeof STATUS[keyof typeof STATUS];

const ROLE = {
	node: 'Node',
	client: 'Client'
} as const;
type ROLE = typeof ROLE[keyof typeof ROLE];

class Node {
	socketId: string;
	account: string;
	status: STATUS; // enumかunionに変える?
	contentIds: Set<number> = new Set<number>(); // number -> BigNumber??
	offerSDP: string;
	
	constructor(socketId: string, account: string) {
		this.socketId = socketId;
		this.account = account;
		// 最初はunavailable
		this.status = STATUS.unavailable;
	}
	
	setOfferSDP(offerSDP: string) {
		this.offerSDP = offerSDP;
	}
	
	addContentId(contentId: number) {
		this.contentIds.add(contentId);
	}
	
	deleteContentId(contentId: number) {
		this.contentIds.delete(contentId);
	}
	
	changeStatus(status: STATUS) {
		this.status = status;
	}
}

io.on("connection", (socket: Socket) => {
	
	socket.on("test", (message)=> {
		console.log(message);
	});
	
	socket.on("register", (data: {signature: SignatureLike, role: ROLE}) => {
		let socketIdBytes = ethers.utils.toUtf8Bytes(socket.id);
		let hash = ethers.utils.keccak256(socketIdBytes);
		let address;
		
		try {
			address = ethers.utils.recoverAddress(hash, data.signature);
		} catch (e) {
			io.to(socket.id).emit("response",
				{type: "NG", message: "failed to recover address from the signature", error: e});
			return ;
		}
		
		if(data.role === ROLE.node) {
			nodeSocketSetting(socket, address);
			io.to(socket.id).emit("response", {type: "OK", message: "new Node created and settings finished"});
		} else {
			// TODO: clientの登録
		}
	})
});

function nodeSocketSetting(socket: Socket, address: string) {
	socketIdToAddressMap[socket.id] = address;
	let node = new Node(socket.id, address);
	addressToNodeMap[address] = node;
	
	socket.on("setContent", (data: {contentId: number})=> {
		if(!art.isAccessible(address, data.contentId)) {
			io.to(socket.id).emit("response", {type: "NG",
				message: "failed to set a content(id=" + data.contentId + ")",
				error: "You don't have access right of this content(id= "+ data.contentId + ")"});
			return ;
		}
		contentIdToAddressMap[data.contentId].push(address);
		node.addContentId(data.contentId);
		io.to(socket.id).emit("response", {type: "OK", message: "set a content(id=" + data.contentId + ")"});
	});
	
	socket.on("deleteContent", (data: {contentId: number})=> {
		node.deleteContentId(data.contentId);
		contentIdToAddressMap[data.contentId].delete(address);
		io.to(socket.id).emit("response", {type: "OK", message: "deleted a content(id=" + data.contentId + ")"});
	});
	
	socket.on("setOfferSDP", (data: {offerSDP: string}) => {
		node.setOfferSDP(data.offerSDP);
		node.changeStatus(STATUS.available);
		console.log("set offer SDP", socket.id, data.offerSDP);
		io.to(socket.id).emit("response", {type: "OK", message: "set offerSDP"});
	});
	
	socket.on("disconnect", ()=> {
		addressToNodeMap.delete(address);
		node.contentIds.forEach((id)=>{contentIdToAddressMap[id].delete(address)});
		socketIdToAddressMap.delete(socket.id);
	})
}

httpServer.listen(5000);