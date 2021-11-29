// @ts-ignore
import { ethers } from "hardhat";
import { ContractReceipt, Signer } from "ethers";
import { assert, expect } from "chai";

async function assertPromiseThrow(p: Promise<void>) {
  let error;
  return p.catch((err) => {
    error = err;
  }).finally(()=> {
    expect(error).to.be.an(`Error`);
  })
}

describe("OWT", function () {
  let deployer:Signer, author:Signer, author2: Signer,
    buyer: Signer, buyer2: Signer, receiver: Signer;
  let authorAddress, author2Address, buyerAddress, buyer2Address, receiverAddress;
  let owt;

  before(async function () {
    [deployer, author, author2, buyer, buyer2, receiver] = await ethers.getSigners();
    authorAddress = await author.getAddress();
    author2Address = await author2.getAddress();
    buyerAddress = await buyer.getAddress();
    buyer2Address = await buyer2.getAddress();
    receiverAddress = await receiver.getAddress();
    
    const OwnershipNFT = await ethers.getContractFactory("OwnershipNFT", deployer);
    owt = await OwnershipNFT.deploy("OwnershipToken", "OWT");
  });
  
  it("has a name and a symbol", async() => {
    assert.equal("OwnershipToken", await owt.name());
    assert.equal("OWT", await owt.symbol())
  })
  
  it('reverts when trying to mint NFT which content id is not existed', async()=> {
    await assertPromiseThrow(
      owt.connect(author).mint(1, author.getAddress(), {value: 5000}));
  })
  
  it('can register contents and mint NFT', async() => {
    // price: 500 wei, royalty: 5%
    await owt.connect(author)['register(uint256,uint256)'](500, 500);
    // price: 1000 wei, royalty: 0%
    await owt.connect(author2)['register(uint256,uint256)'](1000, 0);
    
    await owt.connect(buyer).mint(0, buyerAddress, {value: 500});
    
    assert.equal(buyerAddress, await owt.ownerOf(0));
    assert.equal("9999999999999999999500", (await buyer.getBalance()).toString());
    assert.equal("10000000000000000000500", (await author.getBalance()).toString());
    
    // mint to receiver
    await owt.connect(buyer2).mint(1, receiverAddress, {value: 1000});
    assert.equal("9999999999999999999000", (await buyer2.getBalance()).toString());
    assert.equal("10000000000000000000000", (await receiver.getBalance()).toString());
    assert.equal("10000000000000000001000", (await author2.getBalance()).toString());
    
    assert.equal(receiverAddress, await owt.ownerOf(1));
    
    assert.equal(0, await owt.contentOf(0));
    assert.equal(1, await owt.contentOf(1));
    assert.equal(authorAddress, await owt.authorOf(0));
    assert.equal(author2Address, await owt.authorOf(1));
  });
  
  it('reverts when msg.value is not enough', async ()=> {
    await assertPromiseThrow(owt.connect(buyer).mint(0, buyerAddress, {value: 499}));
    assert.equal("9999999999999999999500", (await buyer.getBalance()).toString());
    assert.equal("10000000000000000001000", (await author2.getBalance()).toString());
    // check NFT was not minted.
    await assertPromiseThrow(owt.ownerOf(2));
  })
  
  it('can set price', async ()=> {
    // only author can set price
    await assertPromiseThrow(owt.connect(buyer).setPrice(0, 200));
    await owt.connect(author).setPrice(0, 200);
    
    assert.equal("200", (await owt.priceOf(0)).toString());
  })
  
  it('can set royalty', async()=> {
    await assertPromiseThrow(owt.connect(buyer).setRoyalty(1, 500, buyerAddress));
    await owt.connect(author2).setRoyalty(1, 500, receiverAddress);
  
    let royaltyInfo = await owt.royaltyInfo(1, 10000);
    assert.equal(receiverAddress, royaltyInfo[0]);
    assert.equal("500", royaltyInfo[1]);
  })
  
  it('hasOwnership() works correctly', async() => {
    assert.isTrue(await owt.hasOwnership(authorAddress, 0));
    assert.isTrue(await owt.hasOwnership(buyerAddress, 0));
    assert.isTrue(await owt.hasOwnership(receiverAddress, 1));
    assert.isFalse(await owt.hasOwnership(buyer2Address, 0));
    assert.isFalse(await owt.hasOwnership(buyer2Address, 1));
    assert.equal(
      true,
      await owt.hasOwnership(author2Address, 1),
      "the author have ownership even if he have no tokens");
  })
  
  it('transfer works', async()=> {
    await owt.connect(buyer).transferFrom(buyerAddress, buyer2Address, 0);
    assert.equal(buyer2Address, await owt.ownerOf(0));
    assert.equal(true, await owt.hasOwnership(buyer2Address, 0));
    assert.isFalse(
      await owt.hasOwnership(buyerAddress, 0),
      "the author always should be accessible even if he have no tokens");
    await owt.connect(receiver).transferFrom(receiverAddress, author2Address, 1);
    assert.equal(false, await owt.hasOwnership(buyer2Address, 1));
    assert.equal(true, await owt.hasOwnership(author2Address, 1));
    assert.isFalse(await owt.hasOwnership(receiverAddress, 1));
  })
  
  it('lend function', async()=> {
    let tx = await owt.connect(author)['register(uint256,uint256)'](500, 500);
    let receipt: ContractReceipt = await tx.wait();
    let contentId = receipt.events[0].args.contentId;
    tx = await owt.connect(buyer).mint(2, buyerAddress, {value: 500});
    receipt = await tx.wait();
    let tokenId = receipt.events[0].args.tokenId.toString();
    
    // rent to receiver
    await owt.connect(buyer).lend(2, receiverAddress);
    assert.isTrue(await owt.hasOwnership(receiverAddress, contentId));
    assert.isFalse(await owt.hasOwnership(buyerAddress, contentId));
    
    // only token owner can execute lend
    await assertPromiseThrow(owt.connect(receiver).lend(2, buyer2Address));
    
    await owt.connect(buyer).lend(2, buyerAddress);
    assert.isFalse(await owt.hasOwnership(receiverAddress, contentId));
    assert.isTrue(await owt.hasOwnership(buyerAddress, contentId));
  })
});
