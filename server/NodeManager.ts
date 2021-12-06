import { Node } from "./modules/Node";
import { Socket } from "socket.io";

class NodeManager {
	contentIdToNodeMap = new Map<number, Set<Node>>();
	addressToNodeMap = new Map<string, Node>();
	socketIdToAddressMap = new Map<string, string>();
	
	createNode(socket: Socket, account: string) {
		let node = new Node(socket, account);
		this.addressToNodeMap.set(account, node);
		this.socketIdToAddressMap.set(socket.id, account);
	}
	
	deleteNode(node: Node) {
		console.log("delete info", node.socket.id);
		this.addressToNodeMap.delete(node.account);
		node.contentIds.forEach((id)=>{
			if(this.contentIdToNodeMap.has(id))
				this.contentIdToNodeMap.get(id)!.delete(node)
		})
		this.socketIdToAddressMap.delete(node.socket.id);
	}
	
	addContent(node: Node, contentId: number) {
		if(this.contentIdToNodeMap.has(contentId)) {
			this.contentIdToNodeMap.set(contentId, (new Set<Node>()));
		}
		this.contentIdToNodeMap.get(contentId)!.add(node);
	}
	
	deleteContent(node: Node, contentId: number) {
		node.contentIds.delete(contentId);
		if(this.contentIdToNodeMap.has(contentId))
			this.contentIdToNodeMap.get(contentId)!.delete(node);
	}
	
	selectNode(contentId: number, nodesToExclude: Node[]) {
		if(!this.contentIdToNodeMap.get(contentId) || this.contentIdToNodeMap.get(contentId)!.size === 0) {
			return null;
		}
		
		let array: Node[] = [];
		
		console.log("node登録数", this.contentIdToNodeMap.get(contentId)!.size)
		
		this.contentIdToNodeMap.get(contentId)!.forEach(node => {
			if(!nodesToExclude.includes(node) && node.client === null) array.push(node);
		})
		
		console.log("候補の数", array.length);
		
		if(array.length === 0) return null;
		return array[Math.floor(Math.random() * array.length)];
	}
}

export const nodeManager = new NodeManager();
