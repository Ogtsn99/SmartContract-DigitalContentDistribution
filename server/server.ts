import { cli } from "ts-generator/dist/cli/cli";

require('dotenv').config()
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ethers } from "ethers";
import { SignatureLike } from "@ethersproject/bytes";
import { STATUS } from "./lib/Status";

const env = process.env;

let OwnershipNFTJson = require("../frontend/src/hardhat/deployments/"+ env.NETWORK_NAME +"/OwnershipNFT.json");
let FileSharingContractJson = require("../frontend/src/hardhat/deployments/" + env.NETWORK_NAME + "/FileSharingContract.json");

const provider = ethers.getDefaultProvider(env.NETWORK);
const signer = new ethers.Wallet(env.PRIVATE_KEY, provider);
const art = new ethers.Contract(OwnershipNFTJson.address, OwnershipNFTJson.abi, provider);
const fsc = new ethers.Contract(FileSharingContractJson.address, FileSharingContractJson.abi, provider);

const httpServer = createServer();
console.log(signer.address);

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
const addressToClientMap = new Map<string, Client>();

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
		this.status = "available";
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

class Client {
	socketId: string;
	account: string;
	contentId: number;
	answerSDP: string;
	nodeSocketId: string;
	nodeApproved: boolean;
	nodeAccount: string;

	constructor(socketId: string, account: string) {
		this.socketId = socketId;
		this.account = account;
	}

	setNodeSocketId(socketId: string) {
		this.nodeSocketId = socketId;
	}

	setNodeAccount(nodeAccount: string) {
		this.nodeAccount = nodeAccount;
	}
}

io.on("connection", (socket: Socket) => {

	socket.on("test", (message)=> {
		console.log(message);
	});

	socket.on("register", (data: {signature: SignatureLike, role: ROLE}) => {
		let address;

		try {
			address = ethers.utils.verifyMessage(socket.id, data.signature);
		} catch (e) {
			io.to(socket.id).emit("error",
				{message: "failed to recover address from the signature", error: e});
			return ;
		}

		if(data.role === ROLE.node) {
			console.log("set node. address =", address);
			nodeSocketSetting(socket, address);
			io.to(socket.id).emit("response", {type: "OK", message: "new Node created and settings finished"});
		} else if(data.role === ROLE.client) {
			// TODO: clientの登録
			console.log("set client. address =", address);
			clientSetting(socket, address);
			io.to(socket.id).emit("response", {type: "OK", message: "new Client created and settings finished"});
		}
	})
});

function clientSetting(socket: Socket, address: string) {
	let client = new Client(socket.id, address);
	addressToClientMap[address] = client;
	socket.on("requestContent", (data: {contentId: number})=> {
		if(contentIdToAddressMap[data.contentId] === undefined) {
			io.to(socket.id).emit("error", {type: "NG",
				message: "failed to request a content(id=" + data.contentId + ")",
				error: "No nodes exists"});
			return ;
		}
		// TODO: 支払い確認、ノードの選択、ノードにこのアカウントでいいか聞く、ソケット経由でクライアントにofferSDPを知らせる。
		// TODO: AnswerSDPをノードに知らせる
		if(!art.hasOwnership(address, data.contentId)) {
			io.to(socket.id).emit("error", {type: "NG",
				message: "failed to request the content(id=" + data.contentId + ")",
				error: "You don't have the access right of this content(id= "+ data.contentId + ")"});
			return ;
		}

		let nodeAddress = selectNode(data.contentId);
		client.nodeAccount = nodeAddress;
		let node:Node = addressToNodeMap[nodeAddress];
		client.contentId = data.contentId;
		io.to(socket.id).emit("nodeInfo", {account:node.account, offerSDP: node.offerSDP});
	});

	socket.on("answerSDP", (data: {answerSDP: string}) => {
		console.log("answerSDP");
		console.log(data.answerSDP);
		let node:Node = addressToNodeMap[client.nodeAccount];
		client.answerSDP = data.answerSDP;
		io.to(node.socketId).emit("clientInfo", {account: client.account});
	});

	socket.on("disconnect", ()=> {
		console.log("disconnected address =", address);
		addressToClientMap.delete(address);
	})
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function selectNode(contentId: number) {
	let array = Array.from(contentIdToAddressMap[contentId] as Set<string>);
	return array[getRandomInt(array.length)]
}

function nodeSocketSetting(socket: Socket, address: string) {
	socketIdToAddressMap[socket.id] = address;
	let node = new Node(socket.id, address);
	addressToNodeMap[address] = node;

	socket.on("setContent", (data: {contentId: number})=> {
		console.log("set content id =", data.contentId)
		if(!art.hasOwnership(address, data.contentId)) {
			io.to(socket.id).emit("error", {type: "NG",
				message: "failed to set a content(id=" + data.contentId + ")",
				error: "You don't have access right of this content(id= "+ data.contentId + ")"});
			return ;
		}
		if(!Number.isInteger(data.contentId)) {
			io.to(socket.id).emit("error", {type: "NG",
				message: "failed to set a content(id=" + data.contentId + ")",
				error: "data.contentId is not an integer"});
			return ;
		}
		if(contentIdToAddressMap[data.contentId] === undefined) {
			contentIdToAddressMap[data.contentId] = new Set<string>();
		}

		contentIdToAddressMap[data.contentId].add(address);
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
		node.changeStatus('available');
		console.log("set offer SDP", socket.id, data.offerSDP);
		io.to(socket.id).emit("response", {type: "OK", message: "set offerSDP"});
	});

	socket.on("approve", async (data: {account: string})=> {
		let client:Client = addressToClientMap[data.account];
		console.log(data);
		console.log(data.account);
		console.log("client", client);
		// TODO: fsc で approve
		/*if((await fsc.countOf(client.account, client.contentId)).toString() == "0") {
			io.to(client.socketId).emit("error", {message: "Unable to provide node", error: "You need to pay download fee"});
			io.to(node.socketId).emit("error", {message: "Unable to provide node", error: "client need to pay download fee"});
			return ;
		}*/
		console.log(client.account, client.contentId, node.account);

		console.log("estimate gas =", fsc.estimateGas);

		try {
			console.log((await fsc.countOf(client.account, 0)).toString())
			await fsc.connect(signer).setArrangedNode(client.account, client.contentId, node.account);
		} catch(e) {
			console.log(e);
		}

		io.to(socket.id).emit("request", {contentId:client.contentId ,answerSDP: client.answerSDP});
	});

	socket.on("disconnect", ()=> {
		console.log("delete info");
		addressToNodeMap.delete(address);
		node.contentIds.forEach((id)=>{contentIdToAddressMap[id].delete(address)});
		socketIdToAddressMap.delete(socket.id);
	})
}

httpServer.listen(5000);