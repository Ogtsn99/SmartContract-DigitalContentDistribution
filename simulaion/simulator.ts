import socketIOClient, { Socket } from "socket.io-client";
import * as console from "console";

const serverURL = "http://localhost:5000";

let socketList:Socket[] = new Array<Socket>();

let timeRecord: any[] = [];

for (let i=0; i<1000; i++) {
	let socket = socketIOClient(serverURL, {
		transports: ['websocket', 'polling', 'flashsocket'],
		withCredentials: true,
	});
	
	timeRecord.push({from: new Date().getTime()});
	
	socket.on("connect", ()=> {
		timeRecord[i]["to"] = new Date().getTime();
	})
	socketList.push(socket);
}

setTimeout(()=> {
	for (const t of timeRecord) {
		console.log(t.from, t.to, "sa =", (t.to - t.from));
	}
}, 10000)


