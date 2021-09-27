// @ts-ignore
import { ethers } from "hardhat";
import { ContractReceipt, Signer } from "ethers";
import { assert, expect } from "chai";

import {AccessRightNFT} from "../frontend/src/hardhat/typechain/AccessRightNFT";

async function assertPromiseThrow(p: Promise<void>) {
  let error;
  return p.catch((err) => {
    error = err;
  }).finally(()=> {
    expect(error).to.be.an(`Error`);
  })
}

describe("ART", function () {
  let deployer:Signer, author:Signer, author2: Signer,
    buyer: Signer, buyer2: Signer, receiver: Signer;
  let authorAddress, author2Address, buyerAddress, buyer2Address, receiverAddress;
  let art;

  before(async function () {
    [deployer, author, author2, buyer, buyer2, receiver] = await ethers.getSigners();
    authorAddress = await author.getAddress();
    author2Address = await author2.getAddress();
    buyerAddress = await buyer.getAddress();
    buyer2Address = await buyer2.getAddress();
    receiverAddress = await receiver.getAddress();
    
    const AccessRightNFT = await ethers.getContractFactory("AccessRightNFT", deployer);
    art = await AccessRightNFT.deploy("AccessRightToken", "ART");
  });
  
  it("has a name and a symbol", async() => {
    assert.equal("AccessRightToken", await art.name());
    assert.equal("ART", await art.symbol())
  })
  
  it('reverts when trying to mint NFT which content id is not existed', async()=> {
    await assertPromiseThrow(
      art.connect(author).mint(1, author.getAddress(), {value: 5000}));
  })
  
  it('can register contents and mint NFT', async() => {
    // price: 500 wei, royalty: 5%
    await art.connect(author)['register(uint256,uint256)'](500, 500);
    // price: 1000 wei, royalty: 0%
    await art.connect(author2)['register(uint256,uint256)'](1000, 0);
    
    await art.connect(buyer).mint(0, buyerAddress, {value: 500});
    
    assert.equal(buyerAddress, await art.ownerOf(0));
    assert.equal("9999999999999999999500", (await buyer.getBalance()).toString());
    assert.equal("10000000000000000000500", (await author.getBalance()).toString());
    
    // mint to receiver
    await art.connect(buyer2).mint(1, receiverAddress, {value: 1000});
    assert.equal("9999999999999999999000", (await buyer2.getBalance()).toString());
    assert.equal("10000000000000000000000", (await receiver.getBalance()).toString());
    assert.equal("10000000000000000001000", (await author2.getBalance()).toString());
    
    assert.equal(receiverAddress, await art.ownerOf(1));
    
    assert.equal(0, await art.contentOf(0));
    assert.equal(1, await art.contentOf(1));
    assert.equal(authorAddress, await art.authorOf(0));
    assert.equal(author2Address, await art.authorOf(1));
  });
  
  it('reverts when msg.value is not enough', async ()=> {
    await assertPromiseThrow(art.connect(buyer).mint(0, buyerAddress, {value: 499}));
    assert.equal("9999999999999999999500", (await buyer.getBalance()).toString());
    assert.equal("10000000000000000001000", (await author2.getBalance()).toString());
    // check NFT was not minted.
    await assertPromiseThrow(art.ownerOf(2));
  })
  
  it('can set price', async ()=> {
    // only author can set price
    await assertPromiseThrow(art.connect(buyer).setPrice(0, 200));
    await art.connect(author).setPrice(0, 200);
    
    assert.equal("200", (await art.priceOf(0)).toString());
  })
  
  it('can set royalty', async()=> {
    await assertPromiseThrow(art.connect(buyer).setRoyalty(1, 500, buyerAddress));
    await art.connect(author2).setRoyalty(1, 500, receiverAddress);
  
    let royaltyInfo = await art.royaltyInfo(1, 10000);
    assert.equal(receiverAddress, royaltyInfo[0]);
    assert.equal("500", royaltyInfo[1]);
  })
  
  it('isAccessible() works correctly', async() => {
    assert.isTrue(await art.isAccessible(authorAddress, 0));
    assert.isTrue(await art.isAccessible(buyerAddress, 0));
    assert.isTrue(await art.isAccessible(receiverAddress, 1));
    assert.isFalse(await art.isAccessible(buyer2Address, 0));
    assert.isFalse(await art.isAccessible(buyer2Address, 1));
    assert.equal(
      true,
      await art.isAccessible(author2Address, 1),
      "the author always should be accessible even if he have no tokens");
  })
  
  it('transfer works', async()=> {
    await art.connect(buyer).transferFrom(buyerAddress, buyer2Address, 0);
    assert.equal(buyer2Address, await art.ownerOf(0));
    assert.equal(true, await art.isAccessible(buyer2Address, 0));
    assert.isFalse(
      await art.isAccessible(buyerAddress, 0),
      "the author always should be accessible even if he have no tokens");
    await art.connect(receiver).transferFrom(receiverAddress, author2Address, 1);
    assert.equal(false, await art.isAccessible(buyer2Address, 1));
    assert.equal(true, await art.isAccessible(author2Address, 1));
  })
  
});
