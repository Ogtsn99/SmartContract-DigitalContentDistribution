//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./AccessRightNFT.sol";

contract AccessRightMarket is Initializable {

  // mapping from token Id to price
  mapping(uint256 => uint256) private _prices;

  AccessRightNFT art;

  function initialize(address artAddress) public initializer {
    art = AccessRightNFT(artAddress);
  }

  event SetPrice(uint256 tokenId, uint256 price);

  function setPrice(uint256 tokenId, uint256 price) public {
    require(art.ownerOf(tokenId) == msg.sender, "you don't own the token");

    _prices[tokenId] = price;
    SetPrice(tokenId, price);
  }

  // with royalty
  function buyNFT(uint256 tokenId) public payable {
    require(art.ownerOf(tokenId) != msg.sender, "you have already own it");
    require(msg.value == _prices[tokenId], "msg.value is not equal to the price");

    (address receiver, uint256 royalty) = art.royaltyInfo(tokenId, msg.value);

    payable(receiver).transfer(royalty);

    address owner = art.ownerOf(tokenId);
    payable(owner).transfer(msg.value - royalty);

    art.safeTransferFrom(owner, msg.sender, tokenId);
  }

  function getPrice(uint256 tokenId) public view returns(uint256) {
    return _prices[tokenId];
  }
}
