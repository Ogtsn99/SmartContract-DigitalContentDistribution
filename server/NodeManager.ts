import { Node } from "./modules/Node";
import { Socket } from "socket.io";

class NodeManager {
	contentIdToNodeMap = new Map<number, Set<Node>>();
	addressToNodeMap = new Map<string, Node>();
	socketIdToAddressMap = new Map<string, string>();
	
	createNode(socket: Socket, account: string) {
		let node = new Node(socket, account);
		this.addressToNodeMap[account] = node;
		this.socketIdToAddressMap[account] = node;
	}
	
	deleteNode(node: Node) {
		console.log("delete info", node.socket.id);
		this.addressToNodeMap.delete(node.account);
		node.contentIds.forEach((id)=>this.contentIdToNodeMap[id].delete(node))
		this.socketIdToAddressMap.delete(node.socket.id);
	}
	
	addContent(node: Node, contentId: number) {
		if(this.contentIdToNodeMap[contentId] === undefined) {
			this.contentIdToNodeMap[contentId] = new Set<Node>();
		}
		this.contentIdToNodeMap[contentId].add(node);
	}
	
	deleteContent(node: Node, contentId: number) {
		node.contentIds.delete(contentId);
		this.contentIdToNodeMap[contentId].add(node);
	}
	
	selectNode(contentId: number) {
		let array = Array.from(this.contentIdToNodeMap[contentId] as Set<Node>);
		return array[Math.floor(Math.random() * array.length)];
	}
}

export const nodeManager = new NodeManager();
