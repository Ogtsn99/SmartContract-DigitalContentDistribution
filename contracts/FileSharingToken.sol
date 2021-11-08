//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract FileSharingToken is ERC20 {
    bool enableFaucet;
    address owner;
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        bool _enableFaucet
    ) ERC20(name, symbol) {
        console.log("Token Deploying...");
        console.log("name =", name);
        console.log("symbol =", symbol);
        console.log("initialSupply =", initialSupply);
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
        enableFaucet = _enableFaucet;
    }

    //FIXME　This function is for testing only It should be deleted when deploying to main Network!!
    function faucet() public {
        require(enableFaucet);
        _mint(msg.sender, 10000000000000000000);
    }

    function changeEnableFaucet(bool _ok) public {
        require(owner == msg.sender);
        enableFaucet = _ok;
    }
}
