//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import './IERC2981Royalties.sol';
import "hardhat/console.sol";

contract OwnershipNFT is ERC721, IERC2981Royalties, Ownable {
    using Strings for uint256;

    string public baseURIextended;
    uint256 public nextContentId;
    uint256 public nextTokenId;

    // mapping from content Id to author address
    mapping(uint256 => address) private _authors;
    // mapping from content Id to token Id.
    //mapping(uint256 => uint256[]) private _tokens;
    // mapping from token Id to content Id
    mapping(uint256 => uint256) private _contents;
    // mapping from contentId to content SHA256 hash
    // どうしてハッシュをipfsに記録しないか -> ぶっちゃけIPFSに保存しても良い
    // スピードの問題。ガス代はかかるが、ハッシュを取ってくるのに時間をあまりかけたくないと思ったため。
    mapping(uint256 => string) private _contentHashes;
    // mapping from content id to ipfsPath
    mapping(uint256 => string) private _ipfsPaths;
    // mapping from content Id to price you need to pay when minting
    mapping(uint256 => uint256) private _prices;
    // mapping from content Id to royalty
    mapping(uint256 => uint256) private _royalties;
    // mapping from content Id to royalty receiver
    mapping(uint256 => address) private _receivers;
    // mapping from tokenId to address by whom actually have content's ownership
    mapping(uint256 => address) private _ownershipGrantedAddresses;
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

    event Register(address indexed author, uint256 indexed contentId);
    event SetPrice(uint256 indexed contentId, uint256 price);
    event SetRoyalty(uint256 indexed contentId, uint256 royalty, address receiver);
    event SetContentHash(uint256 indexed contentId, string hash);
    event SetIpfsPath(uint256 indexed contentId, string path);

    function register(uint256 price, uint256 royalty) public {
        register(price, royalty, msg.sender, "", "");
    }

    function register(uint256 price, uint256 royalty, address royaltyReceiver, string memory hash, string memory path) public {
        _authors[nextContentId] = msg.sender;

        if(price != 0) {
            _prices[nextContentId] = price;
            emit SetPrice(nextContentId, price);
        }

        if(royalty != 0) {
            _royalties[nextContentId] = royalty;
            _receivers[nextContentId] = royaltyReceiver;
            emit SetRoyalty(nextContentId, royalty, royaltyReceiver);
        }

        if(bytes(hash).length != 0) {
            _contentHashes[nextContentId] = hash;
            emit SetContentHash(nextContentId, hash);
        }

        if(bytes(path).length != 0) {
            _ipfsPaths[nextContentId] = path;
            emit SetIpfsPath(nextContentId, path);
        }

        nextContentId += 1;
        emit Register(msg.sender, nextContentId);
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
        _contentHashes[nextContentId] = hash;
        emit SetContentHash(contentId, hash);
    }

    function setIpfsPath(uint256 contentId, string memory path) public {
        require(msg.sender == _authors[contentId], "you are not the author");
        _ipfsPaths[contentId] = path;
        emit SetIpfsPath(contentId, path);
    }

    /// @notice Mint one token to `to`
    /// @param contentId an id of the content
    /// @param to the recipient of the token
    function mint(
        uint256 contentId,
        address to
    ) payable external {
        require(contentId < nextContentId, "content not existed");

        bool isAuthor = _authors[contentId] == msg.sender;
        require(_prices[contentId] == msg.value || isAuthor,
            "you are not the author and msg.value is not equal to the price");

        if(!isAuthor) {
            payable(_authors[contentId]).transfer(msg.value);
        }

        uint256 tokenId = nextTokenId;

        //_tokens[contentId].push(nextTokenId);
        _contents[tokenId] = contentId;

        _safeMint(to, tokenId, '');

        nextTokenId = tokenId + 1;
    }

    function lend(uint256 tokenId, address to) public {
        require(ownerOf(tokenId) == msg.sender, "you are not the owner");
        require(_ownershipGrantedAddresses[tokenId] != to, "the account already possess the token");
        ownerships[_contents[tokenId]][_ownershipGrantedAddresses[tokenId]]--;
        ownerships[_contents[tokenId]][to]++;
        _ownershipGrantedAddresses[tokenId] = to;
    }

    function royaltyInfo(uint256 tokenId, uint256 value) external view override
    returns (address receiver, uint256 royaltyAmount)
    {
        uint256 contentId = _contents[tokenId];
        return (_receivers[contentId], (value * _royalties[contentId]) / 10000);
    }

    function setBaseURI(string memory baseURI_) public onlyOwner() {
        baseURIextended = baseURI_;
    }

    function hasOwnership(address account, uint256 contentId) public view returns(bool) {
        require(contentId < nextContentId, "content not existed");
        return ownerships[contentId][account] != 0 || _authors[contentId] == account;
    }

    function contentOf(uint256 tokenId) public view returns (uint256) {
        require(ownerOf(tokenId) != address(0), "token not existed");
        return _contents[tokenId];
    }

    function authorOf(uint256 contentId) public view returns (address) {
        require(contentId < nextContentId, "content not existed");
        return _authors[contentId];
    }

    function royaltyOf(uint256 contentId) public view returns (uint256) {
        require(contentId < nextContentId, "content not existed");
        return _royalties[contentId];
    }

    function royaltyReceiverOf(uint256 contentId) public view returns (address) {
        require(contentId < nextContentId, "content not existed");
        return _receivers[contentId];
    }

    function priceOf(uint256 contentId) public view returns (uint256) {
        require(contentId < nextContentId, "content not existed");
        return _prices[contentId];
    }

    function hashOf(uint contentId) public view returns (string memory) {
        require(contentId < nextContentId, "content not existed");
        return _contentHashes[contentId];
    }

    function ipfsPathOf(uint256 contentId) public view returns (string memory) {
        return _ipfsPaths[contentId];
    }

    function contentURI(uint256 contentId) public view returns (string memory) {
        require(contentId < nextContentId, "content not existed");
        string memory baseURI = _baseURI();
        return bytes(_ipfsPaths[contentId]).length > 0 ? string(abi.encodePacked(baseURI, _ipfsPaths[contentId])) : "";
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, _ipfsPaths[_contents[tokenId]])) : "";
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURIextended;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        if(from != address(0)) {
            ownerships[_contents[tokenId]][_ownershipGrantedAddresses[tokenId]] -= 1;
        }
        if(to != address(0)) {
            _ownershipGrantedAddresses[tokenId] = to;
            ownerships[_contents[tokenId]][to] += 1;
        }
    }
}