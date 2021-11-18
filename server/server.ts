require('dotenv').config()
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ethers } from "ethers";
import { SignatureLike } from "@ethersproject/bytes";
import { ROLE } from "./modules/Role";
import { Node } from "./modules/Node";
import { Client } from "./modules/Client";
import { nodeManager } from "./NodeManager";

const env = process.env;

let OwnershipNFTJson = require("../frontend/src/hardhat/deployments/"+ env.NETWORK_NAME +"/OwnershipNFT.json");
let FileSharingContractJson = require("../frontend/src/hardhat/deployments/" + env.NETWORK_NAME + "/FileSharingContract.json");

const provider = ethers.getDefaultProvider(env.NETWORK);
const signer = new ethers.Wallet(env.PRIVATE_KEY, provider);
export const owt = (new ethers.Contract(OwnershipNFTJson.address, OwnershipNFTJson.abi, provider)).connect(signer);
export const fsc = (new ethers.Contract(FileSharingContractJson.address, FileSharingContractJson.abi, provider)).connect(signer);

const httpServer = createServer();

export const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	}
});

io.on("connection", (socket: Socket) => {

	socket.on("register", (data: {signature: SignatureLike, role: ROLE}) => {
		let address;

		try {
			address = ethers.utils.verifyMessage(socket.id, data.signature);
		} catch (e) {
			io.to(socket.id).emit("error",
				{message: "failed to recover address from the signature", error: e});
			return ;
		}

		if(data.role === "Node") {
			nodeManager.createNode(socket, address);
			io.to(socket.id).emit("response", {type: "OK", message: "new Node created and settings finished"});
		} else if(data.role === "Client") {
			new Client(socket, address);
			io.to(socket.id).emit("response", {type: "OK", message: "new Client created and settings finished"});
		}
	})
});

httpServer.listen(5000);