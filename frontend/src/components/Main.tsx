import React, { useContext, useEffect, useState } from 'react';
import {
	OwnershipNFTContext,
	CurrentAddressContext,
	SignerContext,
	FileSharingContractContext
} from "../hardhat/SymfoniContext";
import socketIOClient, { Socket } from "socket.io-client";
import { sha256 } from 'js-sha256';
import { ProgressBar, Table } from "react-bootstrap";
import Peer from "skyway-js";
import date from 'date-and-time';
const peer = new Peer({key: "4c89a12b-46ab-4c44-acd6-fd7ca9c7927f"});

peer.on('open', ()=> {
	console.log("Skyway peer Open event");
	// @ts-ignore
	rtcConfig = peer._pcConfig.iceServers;
})

let FileSaver = require('file-saver');

interface Props {
}

let rtcConfig: RTCConfiguration = {};

let pc: RTCPeerConnection;

let dataChannel: RTCDataChannel;

let dataChannelOption: RTCDataChannelInit = {
	ordered: true,
}

let requestedContentId: number;
let bufferList: ArrayBuffer[] = [];
let byteSize: number;
let byteCount: number;

let socket: Socket;

let serverURL = "https://signaling-server-fileshare.herokuapp.com";
// TODO: コメントアウトする↓
//serverURL = "http://localhost:5000";

socket = socketIOClient(serverURL, {
  transports: ['websocket', 'polling', 'flashsocket'],
	withCredentials: true,
});

socket.on("error", (data) => {
	console.log("error");
	console.log(data);
	if(data.error)
		alert("error: " + data.error.toString());
	else alert("error");
});

let buffer: ArrayBuffer;

class Content {
	contentId: number;
	contentHash: string;
	buffer: ArrayBuffer;
	
	constructor(contentId: number, contentHash: string, buffer: ArrayBuffer) {
		this.contentId = contentId;
		this.contentHash = contentHash;
		this.buffer = buffer;
	}
}

let contentId = 0;
let contentIdToRequest = 0;
let contentHashToRequest:string = "";
let uploadSum = 0;

let contents_:Content[] = [];
let blob: Blob;

let chancesToExchangeNode_ = 0;
let nodeAccount_ = "";

let timeRecorder: any = [];

function logTime(message: string) {
	let now = new Date();
	let time:any = {
		message: message,
		time: date.format(now, 'YYYY/MM/DD HH:mm:ss'),
		numTime: now.getTime()
	}
	timeRecorder.push(time);
}

// TODO: リファクタリング
export const Main: React.FC<Props> = () => {
	const OWT = useContext(OwnershipNFTContext);
	const FSC = useContext(FileSharingContractContext);
	const [contents, setContents] = useState<Content[]>([]);
	const [hash, setHash] = useState("");
	const [role, setRole] = useState("");
	const [nodeAccount, setNodeAccount] = useState("");
	const [chancesToExchangeNode, setChancesToExchangeNode] = useState(0);
	const [savable, setSavable] = useState(false);
	const [progress, setProgress] = useState(0);
	const [currentAddress] = useContext(CurrentAddressContext);
	const [signer] = useContext(SignerContext);
	
	let file: File | null;
	let reader: FileReader = new window.FileReader();
	
	reader.onload = (event) => {
		if (event.target) buffer = event.target.result as ArrayBuffer;
		else return;
		setHash(sha256(buffer));
	}
	
	function sendFile() {
		if (!dataChannel) {
			alert("data channel is not created");
			return;
		}
		let length = buffer.byteLength;
		
		dataChannel.send("byteLength-" + length);
	}
	
	function initPeerConnection(role: string) {
		if(rtcConfig == {}) {
			console.log("skywayのopenイベントを待機しています。");
			setTimeout(()=>initPeerConnection(role), 1000);
			return ;
		}
		pc = new RTCPeerConnection(rtcConfig);
		setupRTCPeerConnectionEventHandler(pc, role);
		console.log("create datachannel!")
		createDataChannel(pc);
	}
	
	function createDataChannel(pc: RTCPeerConnection) {
		dataChannel = pc.createDataChannel("LABEL", dataChannelOption);
		setDataChannelEventHandler(dataChannel);
	}
	
	function setDataChannelEventHandler(dataChannel: RTCDataChannel) {
		dataChannel.onerror = function (error) {
			console.log("Data Channel Error:", error);
		};
		
		dataChannel.onmessage = async function (event) {
			//console.log("message received", event.data);
			if (typeof event.data == "string") {
				let message: string = event.data;
				let m = message.split('-');
				
				if(m[0] === "finish") {
					pc.close();
					dataChannel.close();
					initPeerConnection("Node");
				} else if (m[0] === "byteLength") {
					byteSize = parseInt(m[1]);
					byteCount = 0;
					bufferList = [];
					logTime("get byteSize");
					dataChannel.send("require-" + byteCount + "-" + (Math.min(byteSize, byteCount + 64000)));
				} else if (m[0] == "require") {
					let start = parseInt(m[1]), end = Math.min(buffer.byteLength, parseInt(m[2]));
					//console.log("start=", start, "end=", end);
					uploadSum += end - start;
					for (const e of contents_) {
						if(e.contentId === requestedContentId) {
							end = Math.min(e.buffer.byteLength, parseInt(m[2]));
							if(uploadSum >= e.buffer.byteLength * 3) {
								alert("アップロードに失敗している、または相手が善良でない可能性があるため。通信を終了します")
								pc.close();
								return ;
							}
							//console.log("send data", start, "to", end);
							dataChannel.send(e.buffer.slice(start, end));
							return ;
						}
					}
				}
			} else { // データが送られてきた時の処理
				bufferList.push(event.data);
				byteCount += event.data.byteLength;
				setProgress(byteCount / byteSize * 100);
				//console.log("byteCount=", byteCount, "byteSize=", byteSize);
				
				if (byteCount === byteSize) {
					logTime("data received");
					blob = new Blob(bufferList, {type: "octet/stream"});
					logTime("bufferList to blob");
					let buffer = await blob.arrayBuffer();
					logTime("blob.arrayBuffer finished");
					
					let hash = sha256(buffer);
					logTime("calc hash");
					
					console.log("もらったファイルのハッシュ=", hash);
					
					console.log("欲しかったファイルのハッシュ=", contentHashToRequest);
					
					if(hash !== contentHashToRequest) {
						alert("received wrong file... Request other node.");
						return ;
					}
					
					logTime("hash Check finished!");
					console.log(timeRecorder);
					
					dataChannel.send("finish");
					FileSaver.saveAs(blob, "downloadedFile");
					setSavable(true);
				} else {
					//console.log("require-" + byteCount + "-" + (Math.min(byteSize, byteCount + 64000)));
					dataChannel.send("require-" + byteCount + "-" + (Math.min(byteSize, byteCount + 64000)));
				}
			}
		};
		
		dataChannel.onopen = function () {
			dataChannel.send("Hello World!");
		};
		
		dataChannel.onclose = function () {
			console.log("The Data Channel is Closed");
		};
	}
	
	function setupRTCPeerConnectionEventHandler(pc: RTCPeerConnection, role: string) {
		
		pc.onnegotiationneeded = async () => {
			await pc.setLocalDescription(await pc.createOffer());
		};
		
		pc.onicecandidate = (event) => {
			console.log("Event : ICE candidate");
			if (event.candidate) {   // ICE candidateがある
				console.log("- ICE candidate : ", event.candidate);
				
			} else {
				console.log("- ICE candidate : empty");
			}
		};

		pc.onicecandidateerror = (event) => {
			console.error("Event : ICE candidate error. ", event);
		};
		
		pc.onicegatheringstatechange = () => {
			// console.log("Event : ICE gathering state change");
			// console.log("- ICE gathering state : ", pc.iceGatheringState);
			
			if ("complete" === pc.iceGatheringState) {
				
				// console.log(role);
				// console.log("- Set OfferSDP in textarea");
				// console.log(pc.localDescription?.sdp);
				if (role == "Node") {
					socket.emit("setOfferSDP", {offerSDP: pc.localDescription?.sdp});
				} else if (role == "Client") {
					if(pc.remoteDescription !== null)
						socket.emit("setAnswerSDP", {answerSDP: pc.localDescription?.sdp});
				} else {
					alert("role: " + role);
				}
			}
		};
		
		// ICE connection state change イベントが発生したときのイベントハンドラ
		// - このイベントは、ネゴシエーションプロセス中にICE connection stateが変化するたびに発生する。
		// - 接続が成功すると、通常、状態は「new」から始まり、「checking」を経て、「connected」、最後に「completed」と遷移します。
		//   ただし、特定の状況下では、「connected」がスキップされ、「checking」から「completed」に直接移行する場合があります。
		//   これは、最後にチェックされた候補のみが成功した場合に発生する可能性があり、成功したネゴシエーションが完了する前に、
		//   収集信号と候補終了信号の両方が発生します。
		//   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceconnectionstatechange_event
		pc.oniceconnectionstatechange = () => {
			console.log("Event : ICE connection state change");
			console.log("- ICE connection state : ", pc.iceConnectionState);
			if(pc.iceConnectionState == "disconnected") {
				alert("通信が切断されました。");
				pc.close();
				dataChannel.close();
				initPeerConnection("Node");
			} else if(pc.iceConnectionState == "connected") {
				logTime("WebRTC conenction established");
			}
			// "disconnected" : コンポーネントがまだ接続されていることを確認するために、RTCPeerConnectionオブジェクトの少なくとも
			//                  1つのコンポーネントに対して失敗したことを確認します。これは、"failed "よりも厳しいテストではなく、
			//                  断続的に発生し、信頼性の低いネットワークや一時的な切断中に自然に解決することがあります。問題が
			//                  解決すると、接続は "接続済み "の状態に戻ることがあります。
			// "failed"       : ICE candidateは、すべての候補のペアを互いにチェックしたが、接続のすべてのコンポーネントに
			//                  互換性のあるものを見つけることができなかった。しかし、ICEエージェントがいくつかの
			//                  コンポーネントに対して互換性のある接続を見つけた可能性がある。
			// see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState
		};
		
		// Signaling state change イベントが発生したときのイベントハンドラ
		// - このイベントは、ピア接続のsignalStateが変化したときに送信される。
		//   これは、setLocalDescription（）またはsetRemoteDescription（）の呼び出しが原因で発生する可能性がある。
		//   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onsignalingstatechange
		pc.onsignalingstatechange = () => {
			console.log("Event : Signaling state change");
			console.log("- Signaling state : ", pc.signalingState);
		};
		
		// Connection state change イベントが発生したときのイベントハンドラ
		// - このイベントは、ピア接続の状態が変化したときに送信される。
		//   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onconnectionstatechange
		pc.onconnectionstatechange = () => {
			console.log("Event : Connection state change");
			console.log("- Connection state : ", pc.connectionState);
			// "disconnected" : 接続のためのICEトランスポートの少なくとも1つが「disconnected」状態であり、
			//                  他のトランスポートのどれも「failed」、「connecting」、「checking」の状態ではない。
			// "failed"       : 接続の1つ以上のICEトランスポートが「失敗」状態になっている。
			// see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionState
		};
		
		// Track イベントが発生したときのイベントハンドラ
		// - このイベントは、新しい着信MediaStreamTrackが作成され、
		//   コネクション上のレシーバーセットに追加されたRTCRtpReceiverオブジェクトに関連付けられたときに送信される。
		//   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack
		// - 古くは、pc.onaddstream に設定していたが、廃止された。
		//   現在は、pc.ontrack に設定する。
		pc.ontrack = (event) => {
			console.log("Event : Track");
			console.log("- stream", event.streams[0]);
			console.log("- track", event.track);
		};
		
		pc.ondatachannel = (event) => {
			console.log("Event : Data channel");
			
			dataChannel = event.channel;
			// DataChannelオブジェクトのイベントハンドラの構築
			console.log("Call : setupDataChannelEventHandler()");
			setDataChannelEventHandler(dataChannel);
			
			console.log("requested contentId", requestedContentId);
			console.log(contents.length);
			
			if (role === "Node") {
				for (const e of contents_) {
					if(e.contentId === requestedContentId) {
						dataChannel.send("byteLength-" + e.buffer.byteLength);
						return;
					}
				}
			}
		}
	}
	
	useEffect(() => {
	
	}, []);
	
	function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		e.preventDefault();
		if (e.target.files)
			file = e.target.files.item(0);
		if (file != null)
			reader.readAsArrayBuffer(file);
	}
	
	function onContentIdInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		e.preventDefault();
		contentId = parseInt(e.target.value);
	}
	
	async function onContentIdToRequestInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		e.preventDefault();
		contentIdToRequest = parseInt(e.target.value);
		contentHashToRequest = await OWT.instance?.hashOf(contentIdToRequest)!;
		let chances = 0;
		// TODO: ノード交換可能回数が更新されない問題を直す
		if(e.target.value === "") chances = 0;
		else {
			try {
				chances = (await FSC.instance?.countOf(currentAddress, e.target.value)!);
			} catch (e) {
				chances = 0;
			}
		}
		chancesToExchangeNode_ = chances;
		setChancesToExchangeNode(chances);
	}
	
	async function registerAsNode() {
		let signature = await signer?.signMessage(socket.id);
		setRole("Node");
		
		socket.on("clientInfo", async (data) => {
			// TODO: 断るケースも作る
			console.log("client Info received", data);
			socket.emit("approve", {account: data.account});
		});
		
		socket.on("request", async (data) => {
			uploadSum = 0;
			requestedContentId = data.contentId;
			// console.log(data);
			// console.log("content id =", data.contentId);
			
			let remoteDescription: RTCSessionDescriptionInit =
				{
					sdp: data.answerSDP,
					type: "answer"
				}
			await pc.setRemoteDescription(remoteDescription);
			
			// console.log(data.answerSDP);
			// dataChannel.ondatachannelでコンテンツの長さを伝える
		});
		
		// TODO: register as nodeの時間を計測
		socket.emit("register", {signature: signature, role: "Node"}, (data: string) => {
			if (data === "Node") {
				console.log("Successfully registered as Node");
				setRole("Node");
				console.log("init peer connection")
				initPeerConnection("Node");
			}
		})
	}
	
	async function registerAsClient() {
		let signature = await signer?.signMessage(socket.id);
		socket.on("nodeInfo", async (data) => {
			logTime("node info received");
			// console.log("node Info", data);
			chancesToExchangeNode_ -= 1;
			setChancesToExchangeNode(chancesToExchangeNode_);
			setNodeAccount(data.account);
			nodeAccount_ = data.account;
			
			// console.log(data.offerSDP);
			let remoteDescription: RTCSessionDescriptionInit =
				{
					sdp: data.offerSDP,
					type: "offer"
				}
			
			await pc.setRemoteDescription(remoteDescription);
			let answer = await pc.createAnswer();
			await pc.setLocalDescription(answer);
		});
		
		socket.emit("register", {signature: signature, role: "Client"}, (data: string) => {
			setRole("Client");
			initPeerConnection("Client");
		})
	}
	
	async function registerContent(e: any) {
		e.preventDefault();
		if (role != "Node") {
			alert("You are not a Node");
			return;
		}
		
		try {
			let isOwn = await OWT.instance?.hasOwnership(currentAddress, contentId);
			if (!isOwn) {
				alert("You don't own the content(id = " + contentId + ")");
				return;
			}
		} catch(e) {
			alert("failed to set content");
			return ;
		}
		
		if(hash !== await OWT.instance?.hashOf(contentId)) {
				alert("the file hash is wrong");
				return ;
		}
		
		socket.emit("setContent", {contentId: contentId, contentHash: hash}, (data: string) => {
			if (data == "OK") {
				contents_ = [...contents, new Content(contentId, hash, buffer)];
				setContents(contents_);
			} else {
				alert("failed to set content");
			}
		});
	}
	
	function requestContent(e: any) {
		e.preventDefault();
		console.log("Request content, id=", contentIdToRequest);
		
		logTime("request content");
		
		socket.emit("requestContent", {contentId: contentIdToRequest});
	}
	
	function deleteContent(contentId: number) {
		socket.emit("deleteContent", ({contentId: contentId}), ()=> {
			let newContents = [];
			for (const e of contents_) {
				if(e.contentId !== contentId) newContents.push(e);
			}
			contents_ = newContents;
			setContents(contents_);
		})
	}
	
	function saveFile() {
		FileSaver.saveAs(blob, "downloadedFile");
	}
	
	function transferAgain() {
		bufferList = []
		byteCount = 0;
		setProgress(0);
		console.log("require-" + byteCount + "-" + (Math.min(byteSize, byteCount + 64000)));
		dataChannel.send("require-" + byteCount + "-" + (Math.min(byteSize, byteCount + 64000)));
	}
	
	function requestOtherNode() {
		pc.close();
		dataChannel.close();
		initPeerConnection("Client");
		socket.emit("requestContent", {contentId: contentIdToRequest});
	}
	
	return (
		<div className="container mt-5">
			
			<button onClick={registerAsNode} disabled={role !== ""}>Become a Node</button>
			<button onClick={registerAsClient} disabled={role !== ""}>Become a Client</button>
			
			<div hidden={role !== "Client"} className="mt-5">
				<p>ノード交換可能回数: {chancesToExchangeNode}</p>
				<form onSubmit={requestContent}>
					<label>
						Content Id:
						<input type="number" onChange={onContentIdToRequestInputChange}/>
					</label>
					<input type="submit" disabled={nodeAccount!==""} value="Request"/>
				</form>
				<p>Node: {nodeAccount}</p>
				<ProgressBar now={progress} />
				<button onClick={saveFile} disabled={!savable}>保存</button>
				<button onClick={transferAgain}>transfer again</button>
				<button onClick={requestOtherNode}>request other node</button>
			</div>
			
			<div hidden={role !== "Node"} className="mt-5">
				<form onSubmit={registerContent}>
					<label>
						Content Id:
						<input type="number" onChange={onContentIdInputChange}/>
					</label>
					<input type="file" onChange={onFileInputChange}/>
					<input type="submit" value="Submit"/>
				</form>
				
				{/*<button onClick={sendFile}>send file</button>*/}
				
				<p> ハッシュ: {hash}</p>
				
				<p>登録コンテンツ数: {contents.length}</p>
				
				<Table className="mx-auto striped bordered hover">
					<thead>
					<tr>
						<th>content id</th>
						<th>contentHash</th>
						<th>delete</th>
					</tr>
					{contents_.map(e => {
							return (
								<tr>
									<th>{e.contentId}</th>
									<th>{e.contentHash}</th>
									<th><button onClick={()=>deleteContent(e.contentId!)}>delete</button></th>
								</tr>
							);
						}
					)}
					</thead>
				</Table>
			</div>
			
			<p>ロール: {role}</p>
			
		</div>
	)
}