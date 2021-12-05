//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./OwnershipNFT.sol";
import "./FileSharingToken.sol";

contract FileSharingContract {
    // mapping from content Id to download fee
    mapping(uint256 => uint256) private _downloadFees;
    // mapping from client's address to mapping from contentId to remaining count
    mapping(address => mapping(uint256 => uint8)) private _count;
    // mapping from client's address to mapping from contentId to node's address
    mapping(address => mapping(uint256 => address)) private _arrangedNode;
    // mapping from client's address to mapping from contentId to payment in advance for download
    mapping(address => mapping(uint256 => uint256)) private _payments;
    address private _server;
    uint8 private _downloadLimit;

    OwnershipNFT owt;
    FileSharingToken fst;

    constructor(address owtAddress, address fstAddress, address server, uint8 downloadLimit) {
        owt = OwnershipNFT(owtAddress);
        fst = FileSharingToken(fstAddress);
        _server = server;
        _downloadLimit = downloadLimit;
    }

    event Deposit(address indexed acount, uint256 amount);
    event Claim(address indexed account, uint256 amount);
    event ChangeDownloadLimit(uint8 downloadLimit);
    event SetDownloadFee(uint256 indexed contentId, uint256 fee);
    event PayDownloadFee(address indexed account, uint256 indexed contentId, uint256 feeIncludeCollateral);
    event SetArrangedNode(address indexed clientAccount, uint256 indexed contentId, address indexed nodeAccount);
    event ApproveNode(address indexed clientAccount, uint256 indexed contentId, address indexed nodeAccount);

    function setDownloadFee(uint256 contentId, uint256 fee) public {
        require(msg.sender == owt.authorOf(contentId), "you are not the author");
        _downloadFees[contentId] = fee;
        emit SetDownloadFee(contentId, fee);
    }

    function setArrangedNode(address client, uint256 contentId, address node) external {
        require(msg.sender == _server);
        require(owt.hasOwnership(client, contentId));
        require(owt.hasOwnership(node, contentId));
        require(_count[client][contentId] >= 1, "you need to pay download Fee");
        _count[client][contentId] -= 1;
        _arrangedNode[client][contentId] = node;
        emit SetArrangedNode(client, contentId, node);
    }

    function payDownloadFee(uint256 contentId) public {
        payDownloadFee(msg.sender, contentId);
    }

    function payDownloadFee(address client, uint256 contentId) public {
        require(owt.hasOwnership(client, contentId), "you don't have the ownership");
        require(_downloadFees[contentId] != 0, "download fee should not be zero");
        require(_count[client][contentId] == 0, "still have chances");
        uint256 feeIncludeCollateral = _downloadFees[contentId] * 5 / 2;
        fst.transferFrom(msg.sender, address(this), feeIncludeCollateral);
        _payments[client][contentId] = feeIncludeCollateral;
        emit PayDownloadFee(msg.sender, contentId, feeIncludeCollateral);
        _count[client][contentId] = _downloadLimit;
        if(_arrangedNode[client][contentId] != address(0)) {
            _arrangedNode[client][contentId] = address(0);
        }
    }

    function approveNode(address client, uint256 contentId) external {
        require(msg.sender == client || msg.sender == _server, "You don't have permission.");
        require(_arrangedNode[client][contentId] != address(0), "node not arranged");
        address node = _arrangedNode[client][contentId];
        _arrangedNode[client][contentId] = address(0);
        _payments[client][contentId] -= _payments[client][contentId] / 5;
        uint256 payment = (_payments[client][contentId] + 1) / 2;
        uint256 collateral = _payments[client][contentId] - payment;
        fst.transfer(node, payment);
        fst.transfer(client, collateral);
        _payments[client][contentId] = 0;
        if(_count[client][contentId] != 0) {
            _count[client][contentId] = 0;
        }
        emit ApproveNode(client, contentId, node);
    }

    function changeDownloadLimit(uint8 downloadLimit) public {
        require(msg.sender == _server, "Only server can change Download Limit");
        _downloadLimit = downloadLimit;
        emit ChangeDownloadLimit(downloadLimit);
    }

    function withdraw() public {
        require(msg.sender == _server, "Only server can change Download Limit");
        console.log(fst.balanceOf(address(this)));
        fst.transfer(msg.sender, fst.balanceOf(address(this)));
    }

    function countOf(address client, uint256 contentId) public view returns(uint8) {
        return _count[client][contentId];
    }

    function arrangedNodeOf(address client, uint256 contentId) public view returns(address) {
        return _arrangedNode[client][contentId];
    }

    function downloadFeeOf(uint256 contentId) public view returns(uint256) {
        return _downloadFees[contentId];
    }

    function paymentOf(address client, uint256 contentId) public view returns(uint256) {
        return _payments[client][contentId];
    }
}
