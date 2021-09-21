// @ts-ignore
import { ethers } from "hardhat";
import { ContractReceipt, Signer } from "ethers";
import { assert, expect } from "chai";

import {AccessRightNFT} from "../frontend/src/hardhat/typechain/AccessRightNFT";

describe("ART", function () {
  let deployer:Signer, author:Signer, author2: Signer, buyer: Signer, buyer2: Signer;
  let authorAddress, author2Address, buyerAddress;
  let art;

  before(async function () {
    [deployer, author, author2, buyer, buyer2] = await ethers.getSigners();
    authorAddress = await author.getAddress();
    author2Address = await author2.getAddress();
    buyerAddress = await buyer.getAddress();
    
    const AccessRightNFT = await ethers.getContractFactory("AccessRightNFT", deployer);
    art = await AccessRightNFT.deploy("AccessRightToken", "ART");
  });
  
  it("has a name and a symbol", async() => {
    assert.equal("AccessRightToken", await art.name());
    assert.equal("ART", await art.symbol())
  })
  
  it('reverts when trying to mint NFT which content id is not existed', async()=> {
    let error = null;
    
    try {
      await art.connect(author).mint(1, author.getAddress(), author.getAddress(), 10);
    } catch (err) {
      error = err;
    }
  
    expect(error).to.be.an(`Error`);
  })
  
  it('can register contents and mint NFT', async() => {
    let tx = await art.connect(author).registerContent();
    let tx2 = await art.connect(author2).registerContent();
    
    //let receipt: ContractReceipt = await tx.wait();
    // console.log(receipt.events[0].args);
    
    await art.connect(author).mint(0, authorAddress, authorAddress, 10);
    
    assert.equal(authorAddress, await art.ownerOf(0));
    
    // mint to buyer
    await art.connect(author2).mint(1, buyerAddress, author2Address, 10);
    
    assert.equal(buyerAddress, await art.ownerOf(1));
    
    assert.equal(0, await art.contentOf(0));
    assert.equal(1, await art.contentOf(1));
    assert.equal(authorAddress, await art.authorOf(0));
    assert.equal(author2Address, await art.authorOf(1));
  })
  
  it('isAccessible() works correctly', async() => {
    assert.equal(true, await art.isAccessible(authorAddress, 0));
    assert.equal(false, await art.isAccessible(buyerAddress, 0));
    assert.equal(true, await art.isAccessible(buyerAddress, 1));
    assert.equal(
      true,
      await art.isAccessible(author2Address, 1),
      "the author always should be accessible even if he have no tokens");
    
  })
  
  it('transfer works', async()=> {
    await art.connect(author).transferFrom(authorAddress, buyerAddress, 0);
    assert.equal(buyerAddress, await art.ownerOf(0));
    assert.equal(true, await art.isAccessible(buyerAddress, 0));
    assert.equal(
      true,
      await art.isAccessible(authorAddress, 0),
      "the author always should be accessible even if he have no tokens");
    await art.connect(buyer).transferFrom(buyerAddress, author2Address, 0);
    assert.equal(false, await art.isAccessible(buyerAddress, 0));
    assert.equal(true, await art.isAccessible(author2Address, 0));
    console.log((await author.getBalance()).toString())
  })

});
