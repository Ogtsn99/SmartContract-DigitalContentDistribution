import React, { useContext, useEffect, useState } from 'react';
import { AccessRightNFTContext } from "../hardhat/SymfoniContext";

import socketIOClient, { Socket } from "socket.io-client";
let FileSaver = require('file-saver');

interface Props {}
let offerSideOfferSDP: RTCSessionDescriptionInit;

const rtcConfig:RTCConfiguration = { "iceServers": [] };

let pc: RTCPeerConnection;

let dataChannel: RTCDataChannel;

let dataChannelOption = {
    ordered: true,
    maxRetransmits: 3000
}

let bufferList: ArrayBuffer[] = [];
let byteSize: number;
let byteCount: number;

let socket: Socket;

export const Main: React.FC<Props> = () => {
    const ART = useContext(AccessRightNFTContext);
    const [offerSdpInput, setOfferSdpInput] = useState("");
    const [answerSdpInput, setAnswerSdpInput] = useState("");
    
    let file: File | null;
    let reader:FileReader = new window.FileReader();
    
    reader.onload = (event) => {
        let buffer: ArrayBuffer;
        if(event.target) buffer = event.target.result as ArrayBuffer;
        else return ;
        
        let CHUNK_LEN = 64000;
        let length = buffer.byteLength;
        let n = (length + CHUNK_LEN - 1) / CHUNK_LEN | 0;
    
        dataChannel.send("byteLength-" + length);
        
        for (let i = 0; i < n; i++) {
            let start = i * CHUNK_LEN;
            let end = start + CHUNK_LEN;
            
            console.log(start, '-', end - 1);
            
            dataChannel.send(buffer.slice(start, end));
        }
    }
    
    useEffect(() => {
        if(!socket)
            socket = socketIOClient("http://localhost:5000");
        console.log("use Effect");
        
        const doAsync = async () => {
            if (!ART.instance) return;
            console.log("ART is deployed at ", ART.instance.address);
        };
        doAsync();
    }, []);
    
    function initPeerConnection() {
        pc = new RTCPeerConnection(rtcConfig);
        setupRTCPeerConnectionEventHandler(pc);
    }
    
    function createDataChannel(pc: RTCPeerConnection) {
        dataChannel = pc.createDataChannel("LABEL", dataChannelOption);
    
        setDataChannelEventHandler(dataChannel);
    }
    
    function setDataChannelEventHandler(dataChannel: RTCDataChannel) {
        dataChannel.onerror = function (error) {
            console.log("Data Channel Error:", error);
        };
        
        dataChannel.onmessage = function (event) {
            console.log(typeof event.data)
            if(typeof event.data == "string") {
                let message:string = event.data;
                let m = message.split('-');
                console.log(m);
                if(m[0] === "byteLength") {
                    byteSize = parseInt(m[1]);
                    byteCount = 0;
                }
            } else {
               
                bufferList.push(event.data);
                
                byteCount += event.data.byteLength;
                
                if(byteCount === byteSize) {
                    FileSaver.saveAs(new Blob(bufferList, {type: "octet/stream"}), "yayFile");
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
            console.log("create offerSDP");
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
                console.log( "- Set OfferSDP in textarea" );
                console.log(pc.localDescription?.sdp);
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
        offerSideOfferSDP = remoteDescription;
        
        await pc.setRemoteDescription(remoteDescription);
        let answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        console.log("create answer SDP");
        console.log(answer.sdp);
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
    
    function sendFile() {
    
    }
    
    return (
        <div>
            <p>NyaHello</p>
    
            <button onClick={()=>{initPeerConnection(); createDataChannel(pc);}}>create PC and OfferSDP</button>
            
            <form onSubmit={submitOfferSDP}>
                <label>
                    <textarea name="name" id="" value={offerSdpInput} onChange={changeOfferSdpInput}></textarea>
                </label>
                <input type="submit" value={"offerSDP"}/>
            </form>
    
            <form onSubmit={submitAnswerSDP}>
                <label>
                    <textarea name="name" id="" value={answerSdpInput} onChange={changeAnswerSdpInput}></textarea>
                </label>
                <input type="submit" value={"answerSDP"}/>
            </form>
            
            <button onClick={sendData}>send "can u see this?"</button>
    
            <input type="file" onChange={onFileInputChange}/>
    
            <button onClick={sendFile}>send file</button>
        </div>
    )
}