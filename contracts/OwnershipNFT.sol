//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import './IERC2981Royalties.sol';
import "hardhat/console.sol";

contract OwnershipNFT is ERC721, IERC2981Royalties, Ownable {
    using Strings for uint256;

    string private _baseURIextended;
    uint256 private _nextContentId;
    uint256 private _nextTokenId;

    // mapping from content Id to author address
    mapping(uint256 => address) private _authors;
    // mapping from content Id to token Id
    mapping(uint256 => uint256[]) private _tokens;
    // mapping from token Id to content Id
    mapping(uint256 => uint256) private _contents;
    // mapping from contentId to content SHA256 hash
    mapping(uint256 => string) private _contentHashes;
    // mapping from content Id to price you need to pay when minting
    mapping(uint256 => uint256) private _prices;
    // mapping from content Id to royalty
    mapping(uint256 => uint256) private _royalties;
    // mapping from content Id to royalty receiver
    mapping(uint256 => address) private _receivers;
    // mapping from tokenId to possessor
    // possessor represents not the owner of the NFT,
    // but the owner of the ownership of the content associated with the NFT
    mapping(uint256 => address) private _possessors;
    // mapping from content Id to mapping from address to the number of ownerships.
    mapping(uint256 => mapping(address => uint256)) private ownerships;

    constructor(string memory name_, string memory symbol_)
    ERC721(name_, symbol_)
    {}

    /// @inheritdoc	ERC165
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721)
    returns (bool)
    {
        return
        ERC721.supportsInterface(interfaceId) ||
        interfaceId == type(IERC2981Royalties).interfaceId;
    }

    event Register(address indexed author, uint indexed contentId);
    event SetPrice(uint256 indexed contentId, uint256 price);
    event SetRoyalty(uint256 indexed contentId, uint256 royalty, address receiver);
    event SetContentHash(uint256 indexed contentId, string hash);

    function register(uint256 price, uint256 royalty) public {
        register(price, royalty, msg.sender, "");
    }

    function register(uint256 price, uint256 royalty, address royaltyReceiver, string memory hash) public {
        _authors[_nextContentId] = msg.sender;
        emit Register(msg.sender, _nextContentId);
        bytes memory hashBytes = bytes(hash);
        if(hashBytes.length != 0) {
            _contentHashes[_nextContentId] = hash;
            emit SetContentHash(_nextContentId, hash);
        }

        if(price != 0) {
            _prices[_nextContentId] = price;
            emit SetPrice(_nextContentId, price);
        }

        if(royalty != 0) {
            _royalties[_nextContentId] = royalty;
            _receivers[_nextContentId] = royaltyReceiver;
            emit SetRoyalty(_nextContentId, royalty, royaltyReceiver);
        }

        _nextContentId += 1;
    }

    function setPrice(uint256 contentId, uint256 price) public {
        require(msg.sender == _authors[contentId], "you are not the author");
        _prices[contentId] = price;
        emit SetPrice(contentId, price);
    }

    function setRoyalty(uint256 contentId, uint256 royalty, address receiver) public {
        require(msg.sender == _authors[contentId], "you are not the author");
        if(_royalties[contentId] != royalty) {
            _royalties[contentId] = royalty;
        }
        if(_receivers[contentId] != receiver) {
            _receivers[contentId] = receiver;
        }
        emit SetRoyalty(contentId, royalty, receiver);
    }

    function setContentHash(uint256 contentId, string memory hash) public {
        require(msg.sender == _authors[contentId], "you are not the author");
        _contentHashes[_nextContentId] = hash;
        emit SetContentHash(contentId, hash);
    }

    /// @notice Mint one token to `to`
    /// @param contentId an id of the content
    /// @param to the recipient of the token
    function mint(
        uint256 contentId,
        address to
    ) payable external {
        require(contentId < _nextContentId, "content not existed");

        bool isAuthor = _authors[contentId] == msg.sender;
        require(_prices[contentId] == msg.value || isAuthor,
            "you are not the author and msg.value is not equal to the price");

        if(!isAuthor) {
            payable(_authors[contentId]).transfer(msg.value);
        }

        uint256 tokenId = _nextTokenId;

        _tokens[contentId].push(_nextTokenId);
        _contents[tokenId] = contentId;

        _safeMint(to, tokenId, '');

        _nextTokenId = tokenId + 1;
    }

    function lend(uint256 tokenId, address to) public {
        require(ownerOf(tokenId) == msg.sender, "you are not the owner");
        require(_possessors[tokenId] != to, "the account already possess the token");
        ownerships[_contents[tokenId]][_possessors[tokenId]]--;
        ownerships[_contents[tokenId]][to]++;
        _possessors[tokenId] = to;
    }

    function royaltyInfo(uint256 tokenId, uint256 value) external view override
    returns (address receiver, uint256 royaltyAmount)
    {
        uint256 contentId = _contents[tokenId];
        return (_receivers[contentId], (value * _royalties[contentId]) / 10000);
    }

    function setBaseURI(string memory baseURI_) public onlyOwner() {
        _baseURIextended = baseURI_;
    }

    function hasOwnership(address account, uint256 contentId) public view returns(bool) {
        require(contentId < _nextContentId, "content not existed");
        return ownerships[contentId][account] != 0 || _authors[contentId] == account;
    }

    function contentOf(uint256 tokenId) public view returns (uint256) {
        return _contents[tokenId];
    }

    function authorOf(uint256 contentId) public view returns (address) {
        return _authors[contentId];
    }

    function numberOfTokens() public view returns (uint256) {
        return _nextTokenId;
    }

    function priceOf(uint256 contentId) public view returns (uint256) {
        return _prices[contentId];
    }

    function hashOf(uint contentId) public view returns (string memory) {
        return _contentHashes[contentId];
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, _contents[tokenId].toString())) : "";
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURIextended;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        if(from != address(0)) {
            ownerships[_contents[tokenId]][_possessors[tokenId]] -= 1;
        }
        if(to != address(0)) {
            _possessors[tokenId] = to;
            ownerships[_contents[tokenId]][to] += 1;
        }
    }
}