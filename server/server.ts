require('dotenv').config()
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ethers } from "ethers";
import { SignatureLike } from "@ethersproject/bytes";
import { ROLE } from "./modules/Role";
import { Node } from "./modules/Node";
import { Client } from "./modules/Client";
import { nodeManager } from "./NodeManager";
const PORT = process.env.PORT || 5000;

const env = process.env;
console.log(env);

let OwnershipNFTJson = require("../frontend/src/hardhat/deployments/"+ env.NETWORK_NAME +"/OwnershipNFT.json");
let FileSharingContractJson = require("../frontend/src/hardhat/deployments/" + env.NETWORK_NAME + "/FileSharingContract.json");

const httpServer = createServer();
const provider = ethers.getDefaultProvider(env.NETWORK);
const signer = new ethers.Wallet(env.PRIVATE_KEY!, provider);

console.log("address =", signer.address);

export const owt = (new ethers.Contract(OwnershipNFTJson.address, OwnershipNFTJson.abi, provider)).connect(signer);
export const fsc = (new ethers.Contract(FileSharingContractJson.address, FileSharingContractJson.abi, provider)).connect(signer);

console.log("front url =", env.FRONT_URL)

export const io = new Server(httpServer, {
	cors: {
		origin: env.FRONT_URL,
		methods: ["GET", "POST"],
		credentials: true,
	}
});

export const addressSet = new Set<string>();

io.on("connection", (socket: Socket) => {

	socket.on("register", (data: {signature: SignatureLike, role: ROLE}, ack) => {
		let address;

		try {
			address = ethers.utils.verifyMessage(socket.id, data.signature);
		} catch (e) {
			io.to(socket.id).emit("error",
				{message: "failed to recover address from the signature", error: e});
			return ;
		}
		
		if(addressSet.has(address)) {
			console.log("address already exists. address =", address);
			io.to(socket.id).emit("error",
				{message: "failed to recover address from the signature",
					error: "You are already registered."});
			return ;
		}
		
		addressSet.add(address);
		
		console.log("register as", data.role, "address =", address);
		
		if(data.role === "Node") {
			nodeManager.createNode(socket, address);
			ack("Node");
		} else if(data.role === "Client") {
			new Client(socket, address);
			addressSet.add(address);
			ack("Client");
		}
	})
});

httpServer.listen(PORT);

console.log("http server established");
