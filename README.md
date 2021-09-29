#READ ME

## 使用したリポジトリ

https://github.com/dievardump/EIP2981-implementation
https://github.com/OpenZeppelin/openzeppelin-contracts
https://github.com/symfoni/hardhat-react-boilerplate

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