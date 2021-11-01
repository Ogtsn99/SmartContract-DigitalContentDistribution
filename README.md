#READ ME

## 使用、参考したサイト

https://github.com/dievardump/EIP2981-implementation
https://github.com/OpenZeppelin/openzeppelin-contracts
https://github.com/symfoni/hardhat-react-boilerplate
https://www.hiramine.com/programming/videochat_webrtc/index.html

## CHANGE LOG

9/27 
* authorだけがmintできる仕様から、authorが決めた価格を支払えば
  誰でもmintできるように変更。
  
* royaltyの仕組みを変更。NFTそれぞれに定めていたものをコンテンツ
  毎に定めるように。これにより、ガス代の削減、
  authorが後からprice, royalty, royaltyReceiverを
  変更することが容易に。
  
9/29
* lend関数を追加。NFTのownerが他のアドレスにアクセス権を貸す
  ことができるように。NFT自体はownerがもったまま。
  また、ownerが強制的に貸したNFTを回収することができ、
  借りパクされる 心配はない
  
10/30 
  * frontend、手動でSDPを交換しWebRTC接続、dataChannelを
    使ってのファイルの転送まで
11/1
  * serverを立ててみる。socket.ioでfront側との接続まで確認。
    また、開発環境を整える。
  * deploy.tsの修正。