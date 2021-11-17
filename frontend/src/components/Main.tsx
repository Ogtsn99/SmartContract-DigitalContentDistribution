import React, { useContext, useEffect, useState } from 'react';
import { OwnershipNFTContext, CurrentAddressContext, SignerContext } from "../hardhat/SymfoniContext";
import socketIOClient, { Socket } from "socket.io-client";
import { sha256 } from 'js-sha256';
let FileSaver = require('file-saver');

interface Props {}
let offerSideOfferSDP: RTCSessionDescriptionInit;

const rtcConfig:RTCConfiguration = { "iceServers": [] };

let pc: RTCPeerConnection;

let dataChannel: RTCDataChannel;

let dataChannelOption: RTCDataChannelInit = {
    maxPacketLifeTime: 1000
}

let bufferList: ArrayBuffer[] = [];
let byteSize: number;
let byteCount: number;

let socket: Socket;

let buffer: ArrayBuffer;
let role = "";

export const Main: React.FC<Props> = () => {
    const OWT = useContext(OwnershipNFTContext);
    const [offerSdpInput, setOfferSdpInput] = useState("");
    const [answerSdpInput, setAnswerSdpInput] = useState("");
    const [hash, setHash] = useState("");
    const [role_render, setRole] = useState("before Register");
    const [currentAddress] = useContext(CurrentAddressContext);
    const [signer] = useContext(SignerContext);
    
    let file: File | null;
    let contentId = 0;
    let contentIdToRequest = 0;
    let reader:FileReader = new window.FileReader();
    
    reader.onload = (event) => {
        if(event.target) buffer = event.target.result as ArrayBuffer;
        else return ;
        setHash(sha256(buffer));
    }
    
    function sendFile() {
        if(!dataChannel) {
            alert("data channel is not created");
            return ;
        }
        let length = buffer.byteLength;
    
        dataChannel.send("byteLength-" + length);
    }
    
    useEffect(() => {
        if(!socket) {
            socket = socketIOClient("http://localhost:5000");
            socket.on("response", (data) => {
                if(data.message === "new Node created and settings finished") {
                    console.log("new Node created and settings finished");
                    initPeerConnection();
                }
            });
    
            socket.on("error", (data) => {
                console.log(data);
                alert("error: " + data.error);
            });
        }
    }, []);
    
    function initPeerConnection() {
        pc = new RTCPeerConnection(rtcConfig);
        setupRTCPeerConnectionEventHandler(pc);
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
            console.log("message received", event.data);
            if(typeof event.data == "string") {
                let message:string = event.data;
                let m = message.split('-');
                
                if(m[0] === "byteLength") {
                    byteSize = parseInt(m[1]);
                    byteCount = 0;
                    console.log("byteSize", byteSize);
                    dataChannel.send("require-"+byteCount + "-" + (Math.min(byteSize, byteCount + 64000)));
                } else if(m[0] == "require" /*&& role == "Node"*/) {
                    // TODO: bufferは複数登録できるようになるのでどのコンテンツを要求しているのかを含むようにする必要あり
                    let start = parseInt(m[1]), end = Math.min(buffer.byteLength,  parseInt(m[2]));
                    console.log("start=", start, "end=", end);
                    dataChannel.send(buffer.slice(start, end));
                }
            } else {
                console.log("byteSize=", byteSize);
                bufferList.push(event.data);
                byteCount += event.data.byteLength;
                console.log("byteCount=", byteCount, "byteSize=", byteSize);
                
                if(byteCount === byteSize) {
                    let blob = new Blob(bufferList, {type: "octet/stream"});
                    let buffer = await blob.arrayBuffer();
                    console.log(sha256(buffer));
                    // TODO: ハッシュ値を確認したらノードをapproveする
                    dataChannel.send("all data downloaded. Thank you!");
                    FileSaver.saveAs(blob, "yayFile");
                } else {
                    console.log("require-"+byteCount+ "-" + byteCount + 64000);
                    dataChannel.send("require-"+byteCount + "-" + (Math.min(byteSize, byteCount + 64000)));
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
    
    function setupRTCPeerConnectionEventHandler(pc: RTCPeerConnection) {
        // TODO: ここでイベントハンドラを定義する
    
        // Negotiation needed イベントが発生したときのイベントハンドラ
        // - このイベントは、セッションネゴシエーションを必要とする変更が発生したときに発生する。
        //   一部のセッション変更はアンサーとしてネゴシエートできないため、このネゴシエーションはオファー側として実行されなければならない。
        //   最も一般的には、negotiationneededイベントは、RTCPeerConnectionに送信トラックが追加された後に発生する。
        //   ネゴシエーションがすでに進行しているときに、ネゴシエーションを必要とする方法でセッションが変更された場合、
        //   ネゴシエーションが完了するまで、negotiationneededイベントは発生せず、ネゴシエーションがまだ必要な場合にのみ発生する。
        //   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onnegotiationneeded
        pc.onnegotiationneeded = async () =>
        {
            console.log( "Event : Negotiation needed" );
            offerSideOfferSDP = await pc.createOffer();
            await pc.setLocalDescription(offerSideOfferSDP);
        };
    
        // ICE candidate イベントが発生したときのイベントハンドラ
        // - これは、ローカルのICEエージェントがシグナリング・サーバを介して
        //   他のピアにメッセージを配信する必要があるときはいつでも発生する。
        //   これにより、ブラウザ自身がシグナリングに使用されている技術についての詳細を知る必要がなく、
        //   ICE エージェントがリモートピアとのネゴシエーションを実行できるようになる。
        //   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate
        pc.onicecandidate = ( event ) =>
        {
            console.log( "Event : ICE candidate" );
            if( event.candidate )
            {   // ICE candidateがある
                console.log( "- ICE candidate : ", event.candidate );
            
                // Vanilla ICEの場合は、何もしない
                // Trickle ICEの場合は、ICE candidateを相手に送る
            }
            else
            {   // ICE candiateがない = ICE candidate の収集終了。
                console.log( "- ICE candidate : empty" );
            }
        };
    
        // ICE candidate error イベントが発生したときのイベントハンドラ
        // - このイベントは、ICE候補の収集処理中にエラーが発生した場合に発生する。
        //   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidateerror
        pc.onicecandidateerror = ( event ) =>
        {
            console.error( "Event : ICE candidate error. ", event);
        };
    
        // ICE gathering state change イベントが発生したときのイベントハンドラ
        // - このイベントは、ICE gathering stateが変化したときに発生する。
        //   言い換えれば、ICEエージェントがアクティブに候補者を収集しているかどうかが変化したときに発生する。
        //   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicegatheringstatechange
        pc.onicegatheringstatechange = () =>
        {
            console.log( "Event : ICE gathering state change" );
            console.log( "- ICE gathering state : ", pc.iceGatheringState );
        
            if( "complete" === pc.iceGatheringState )
            {
                // Vanilla ICEの場合は、ICE candidateを含んだOfferSDP/AnswerSDPを相手に送る
                // Trickle ICEの場合は、何もしない
            
                // Offer側のOfferSDP用のテキストエリアに貼付
                console.log(role);
                console.log( "- Set OfferSDP in textarea" );
                console.log(pc.localDescription?.sdp);
                if(role == "Node")
                    socket.emit("setOfferSDP", {offerSDP: pc.localDescription?.sdp});
                else if(role == "Client") {
                    socket.emit("answerSDP", {answerSDP: pc.localDescription?.sdp});
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
        pc.oniceconnectionstatechange = () =>
        {
            console.log( "Event : ICE connection state change" );
            console.log( "- ICE connection state : ", pc.iceConnectionState );
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
        pc.onsignalingstatechange = () =>
        {
            console.log( "Event : Signaling state change" );
            console.log( "- Signaling state : ", pc.signalingState );
        };
    
        // Connection state change イベントが発生したときのイベントハンドラ
        // - このイベントは、ピア接続の状態が変化したときに送信される。
        //   see : https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onconnectionstatechange
        pc.onconnectionstatechange = () =>
        {
            console.log( "Event : Connection state change" );
            console.log( "- Connection state : ", pc.connectionState );
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
        pc.ontrack = ( event ) =>
        {
            console.log( "Event : Track" );
            console.log( "- stream", event.streams[0] );
            console.log( "- track", event.track );
        };
        
        pc.ondatachannel = (event) => {
            console.log( "Event : Data channel" );
            
            dataChannel = event.channel;
            // DataChannelオブジェクトのイベントハンドラの構築
            console.log( "Call : setupDataChannelEventHandler()" );
            setDataChannelEventHandler(dataChannel);
    
            if(role==="Node") {
                console.log("send byteLength", buffer.byteLength);
                dataChannel.send("byteLength-" + buffer.byteLength);
            }
        }
    
    }
    
    // OfferSDPをセットして送信した時
    async function submitOfferSDP(event: any) {
        if(!pc) {
            initPeerConnection();
        }
        
        event.preventDefault();
        
        let remoteDescription: RTCSessionDescriptionInit =
        {
            sdp: offerSdpInput + '\n', // <- this \n is necessary, idk why tho
            type: "offer"
        }
        
        await pc.setRemoteDescription(remoteDescription);
        let answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
    }
    
    async function submitAnswerSDP(event: any) {
        event.preventDefault();
        console.log("Answer SDP received", answerSdpInput);
    
        let remoteDescription: RTCSessionDescriptionInit =
          {
              sdp: answerSdpInput + '\n', // <- this \n is necessary, idk why tho
              type: "answer"
          }
        
        await pc.setRemoteDescription(remoteDescription);
        
        console.log(pc.connectionState);
    }
    
    function changeOfferSdpInput(event: any) {
        setOfferSdpInput(event.target.value);
    }
    
    function changeAnswerSdpInput(event: any) {
        setAnswerSdpInput(event.target.value);
    }
    
    function sendData() {
        dataChannel.send("hello~! Can U see this?");
    }
    
    function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        if(e.target.files)
            file = e.target.files.item(0);
        if(file != null)
            reader.readAsArrayBuffer(file);
    }
    
    function onContentIdInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        contentId = parseInt(e.target.value);
    }
    
    function onContentIdToRequestInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        contentIdToRequest = parseInt(e.target.value);
    }
    
    async function registerAsNode() {
        role = "Node";
        console.log("roleをnodeに", role);
        initPeerConnection();
        let signature = await signer?.signMessage(socket.id);
        setRole("Node");
        
        socket.on("clientInfo", async (data)=> {
            // TODO: 断るケースも作る
            console.log("client Info きた!", data);
            socket.emit("approve", {account: data.account});
        })
        
        socket.on("request", async(data)=> {
            console.log(data);
    
            let remoteDescription: RTCSessionDescriptionInit =
              {
                  sdp: data.answerSDP,
                  type: "answer"
              }
            await pc.setRemoteDescription(remoteDescription);
            
            console.log(data.answerSDP);
            // dataChannel.ondatachannelでコンテンツの長さを伝える
        });
        
        socket.emit("register", {signature: signature, role: "Node"})
    }
    
    async function registerAsClient() {
        role = "Client";
        let signature = await signer?.signMessage(socket.id);
        setRole("Client");
        socket.on("nodeInfo", async (data) => {
            initPeerConnection();
            
            offerSideOfferSDP = data.offerSDP;
            let remoteDescription: RTCSessionDescriptionInit =
              {
                  sdp: data.offerSDP,
                  type: "offer"
              }
            
            await pc.setRemoteDescription(remoteDescription);
            let answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
        });
        socket.emit("register", {signature: signature, role: "Client"})
    }
    
    async function registerContent(e: any) {
        e.preventDefault();
        console.log(role)
        if(role != "Node") {
            alert("You are not a Node");
            return ;
        }
        
        let hasRight = await OWT.instance?.hasOwnership(currentAddress, contentId);
        if(!hasRight) {
            alert("You don't own the content(id = "+ contentId + ")");
            return ;
        }
       
        // TODO: コメントを外し、ハッシュチェックをするようにする
        /*
        if(hash !== await OWT.instance?.hashOf(contentId)) {
            alert("the file hash is wrong");
            return ;
        }*/
        
        socket.emit("setContent", {contentId: contentId});
    }
    
    function requestContent(e: any) {
        e.preventDefault();
        socket.emit("requestContent", {contentId: contentIdToRequest});
    }
    
    function checkBufferedAmount() {
        console.log(dataChannel.bufferedAmount);
    }
    
    return (
        <div>
            <p>NyaHello</p>
            <p>{currentAddress}</p>
            
            <button onClick={registerAsNode}>Become a Node</button>
            <button onClick={registerAsClient}>Become a Client</button>
            <form onSubmit={requestContent}>
                <label >
                    Content Id:
                    <input type="number" onChange={onContentIdToRequestInputChange}/>
                </label>
                <input type="submit" value="Submit"/>
            </form>
    
            <button onClick={()=>{initPeerConnection();}}>create PC and OfferSDP</button>
            
            <form onSubmit={submitOfferSDP}>
                <label>
                    <textarea name="name" id="" value={offerSdpInput} onChange={changeOfferSdpInput}/>
                </label>
                <input type="submit" value={"offerSDP"}/>
            </form>
    
            <form onSubmit={submitAnswerSDP}>
                <label>
                    <textarea name="name" id="" value={answerSdpInput} onChange={changeAnswerSdpInput}/>
                </label>
                <input type="submit" value={"answerSDP"}/>
            </form>
            
            <button onClick={sendData}>send "can u see this?"</button>
    
            <form onSubmit={registerContent}>
                <label >
                    Content Id:
                    <input type="number" onChange={onContentIdInputChange}/>
                </label>
                <input type="file" onChange={onFileInputChange}/>
                <input type="submit" value="Submit"/>
            </form>
    
            <button onClick={sendFile}>send file</button>
            
            <p> ハッシュ: {hash}</p>
            
            <button onClick={checkBufferedAmount}>checkBufferedAmount</button>
            
            <p>ロール: {role_render}</p>
        </div>
    )
}