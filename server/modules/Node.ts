import { STATUS } from "./Status";
import { Socket } from "socket.io";
import { Client } from "./Client";
import { nodeManager } from "../NodeManager";
import {
	addressSet,
	fsc,
	io,
	owt,
} from "../server";

export class Node {
	socket: Socket;
	account: string; // イーサリアムのアカウントアドレス
	status: STATUS; // enumかunionに変える?
	client: Client | null;
	contentIds: Set<number> = new Set<number>(); // number -> BigNumber??
	offerSDP: string;
	
	constructor(socket: Socket, account: string) {
		this.socket = socket;
		this.account = account;
		this.client = null;
		this.nodeSocketSetting(socket, account);
	}
	
	setOfferSDP(offerSDP: string) {
		this.offerSDP = offerSDP;
	}
	
	addContentId(contentId: number) {
		this.contentIds.add(contentId);
	}
	
	deleteContentId(contentId: number) {
		this.contentIds.delete(contentId);
		nodeManager.deleteContent(this, contentId);
	}
	
	changeStatus(status: STATUS) {
		this.status = status;
	}
	
	deleteClient() {
		this.client = null;
	}
	
	nodeSocketSetting(socket: Socket, address: string) {
		socket.on("setContent", async (data: {contentId: number}, ack)=> {
			try {
				if(!await owt.hasOwnership(address, data.contentId)) {
					io.to(socket.id).emit("error", {type: "NG",
						message: "failed to set a content(id=" + data.contentId + ")",
						error: "You don't have access right of this content(id= "+ data.contentId + ")"})
				}
			} catch (e) {
				io.to(socket.id).emit("error", {type: "NG",
					message: "failed to set a content(id=" + data.contentId + ")",
					error: e});
				return ;
			}
			
			nodeManager.addContent(this, data.contentId);
			this.addContentId(data.contentId);
			console.log("set content id =", data.contentId);
			ack("OK");
		});
		
		socket.on("deleteContent", (data: {contentId: number}, ack)=> {
			this.deleteContentId(data.contentId);
			nodeManager.deleteContent(this, data.contentId);
			console.log("delete content id =", data.contentId)
			ack();
		});
		
		socket.on("setOfferSDP", (data: {offerSDP: string}) => {
			this.setOfferSDP(data.offerSDP);
			this.changeStatus('available');
			console.log("set offer SDP", socket.id, data.offerSDP);
			io.to(socket.id).emit("response", {type: "OK", message: "set offerSDP"});
		});
		
		socket.on("approve", async ()=> {
			if(!this.client) {
				io.to(this.socket.id).emit("error", {message: "can't approve", error: "no client set"});
				return ;
			}
			
			let client:Client = this.client;
			
			try {
				if((await fsc.countOf(client.account, client.contentId)).toString() == "0") {
					io.to(client.socket.id).emit("error", {message: "Unable to provide node", error: "You need to pay download fee"});
					io.to(this.socket.id).emit("error", {message: "Unable to provide node", error: "client need to pay download fee"});
					return ;
				} else {
					await fsc.setArrangedNode(client.account, client.contentId, this.account);
				}
			} catch(e) {
				io.to(this.socket.id).emit("error", {message: "failed to approve", error: e});
				return ;
			}
			
			io.to(socket.id).emit("request", {contentId: client.contentId ,answerSDP: client.answerSDP});
		});
		
		socket.on("reject", ()=> {
			this.client.setNode(null);
			io.to(this.client.socket.id).emit("requestRejected");
			this.client = null;
		})
		
		socket.on("disconnect", ()=> {
			console.log("disconnect", this.socket.id);
			nodeManager.deleteNode(this);
			addressSet.delete(this.account);
		})
	}
}