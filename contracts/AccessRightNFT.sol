//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import './ERC2981PerTokenRoyalties.sol';

contract AccessRightNFT is ERC721, ERC2981PerTokenRoyalties, Ownable {
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
    // mapping from content Id to mapping address to the number of content it holds.
    mapping(uint256 => mapping(address => uint256)) private _contentNumber;

    constructor(string memory name_, string memory symbol_)
    ERC721(name_, symbol_)
    {}

    /// @inheritdoc	ERC165
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC2981PerTokenRoyalties)
    returns (bool)
    {
        return
        ERC721.supportsInterface(interfaceId) ||
        ERC2981PerTokenRoyalties.supportsInterface(interfaceId);
    }

    event register(address indexed author, uint indexed contentId);

    function registerContent() public returns (uint256) {
        _authors[_nextContentId] = msg.sender;
        emit register(msg.sender, _nextContentId);
        _nextContentId += 1;
        return _nextContentId - 1;
    }

    /// @notice Mint one token to `to`
    /// @param contentId an id of the content
    /// @param to the recipient of the token
    /// @param royaltyRecipient the recipient for royalties (if royaltyValue > 0)
    /// @param royaltyValue the royalties asked for (EIP2981)
    function mint(
        uint256 contentId,
        address to,
        address royaltyRecipient,
        uint256 royaltyValue
    ) external {
        require(contentId < _nextContentId, "content not existed");
        require(_authors[contentId] == msg.sender, "you aren't the author");

        uint256 tokenId = _nextTokenId;

        _tokens[contentId].push(_nextTokenId);
        _contents[tokenId] = contentId;

        _safeMint(to, tokenId, '');

        if (royaltyValue > 0) {
            _setTokenRoyalty(tokenId, royaltyRecipient, royaltyValue);
        }

        _nextTokenId = tokenId + 1;
    }

    /// @notice Mint several tokens at once
    /// @param contentId an id of the content
    /// @param recipients an array of recipients for each token
    /// @param royaltyRecipients an array of recipients for royalties (if royaltyValues[i] > 0)
    /// @param royaltyValues an array of royalties asked for (EIP2981)
    function mintBatch(
        uint256 contentId,
        address[] memory recipients,
        address[] memory royaltyRecipients,
        uint256[] memory royaltyValues
    ) external {
        uint256 tokenId = _nextTokenId;
        require(
            recipients.length == royaltyRecipients.length &&
            recipients.length == royaltyValues.length,
            'ERC721: Arrays length mismatch'
        );
        require(contentId < _nextContentId, "content not existed");
        require(_authors[contentId] == msg.sender, "you aren't the author");

        for (uint256 i; i < recipients.length; i++) {
            _tokens[contentId].push(_nextTokenId);
            _contents[tokenId] = contentId;

            _safeMint(recipients[i], tokenId, '');
            if (royaltyValues[i] > 0) {
                _setTokenRoyalty(
                    tokenId,
                    royaltyRecipients[i],
                    royaltyValues[i]
                );
            }

            tokenId++;
        }

        _nextTokenId = tokenId;
    }

    function setBaseURI(string memory baseURI_) public onlyOwner() {
        _baseURIextended = baseURI_;
    }

    function isAccessible(address account, uint256 contentId) public view returns(bool) {
        require(contentId < _nextContentId, "content not existed");
        return _contentNumber[contentId][account] != 0 || _authors[contentId] == account;
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
            _contentNumber[_contents[tokenId]][from] -= 1;
        }
        if(to != address(0)) {
            _contentNumber[_contents[tokenId]][to] += 1;
        }
    }
}