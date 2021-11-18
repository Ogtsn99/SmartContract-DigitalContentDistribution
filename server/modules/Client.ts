import { Node } from "./Node";
import { Socket } from "socket.io";
import { nodeManager } from "../NodeManager";
import { io, owt } from "../server";

export class Client {
	socket: Socket;
	account: string;
	contentId: number;
	answerSDP: string;
	node: Node;
	
	constructor(socket: Socket, account: string) {
		this.socket = socket;
		this.account = account;
		this.clientSetting(socket, account);
	}
	
	setNode(node: Node) {
		this.node = node;
	}
	
	deleteNode() {
		this.node = null;
	}
	
	private clientSetting(socket: Socket, address: string) {
		socket.on("requestContent", (data: {contentId: number})=> {
			try {
				if(!owt.hasOwnership(address, data.contentId)) {
					io.to(socket.id).emit("error", {type: "NG",
						message: "failed to request the content(id=" + data.contentId + ")",
						error: "You don't have the ownership of this content(id= "+ data.contentId + ")"});
					return ;
				}
			} catch(e) {
				io.to(socket.id).emit("error", {type: "NG",
					message: "failed to request the content(id=" + data.contentId + ")",
					error: e});
				return;
			}
			
			let node = nodeManager.selectNode(data.contentId);
			
			if(!node) {
				io.to(socket.id).emit("error", {type: "NG",
					message: "failed to request a content(id=" + data.contentId + ")",
					error: "Maybe there's no node"});
				return;
			}
			
			node.client = this;
			this.setNode(node);
			
			this.contentId = data.contentId;
			io.to(socket.id).emit("nodeInfo", {account:node.account, offerSDP: node.offerSDP});
		});
		
		socket.on("setAnswerSDP", (data: {answerSDP: string}) => {
			if(!this.node) {
				io.to(this.node.socket.id).emit("error", {message: "failed to set answerSDP",
				error: "Node is not selected."});
				return ;
			}
			console.log("answerSDP");
			console.log(data.answerSDP);
			this.answerSDP = data.answerSDP;
			io.to(this.node.socket.id).emit("clientInfo", {account: this.account});
		});
		
		socket.on("disconnect", ()=> {
			console.log("disconnected address =", address);
			this.node.deleteClient();
		})
	}
}