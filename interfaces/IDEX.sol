// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './IERC721.sol';

interface IDEX {
    
    event MakeOrder(
        IERC721 indexed tokenContract,
        uint256 tokenId,
        bytes32 indexed orderId,
        address seller
    );
    event CancelOrder(
        IERC721 indexed tokenContract,
        uint256 tokenId,
        bytes32 indexed orderId,
        address seller
    );
    event Bid(
        IERC721 indexed tokenContract,
        uint256 tokenId,
        bytes32 indexed orderId,
        address bidder,
        uint256 bidPrice
    );
    event Claim(
        IERC721 indexed tokenContract,
        uint256 tokenId,
        bytes32 indexed orderId,
        address seller,
        address taker,
        uint256 price
    );

    event TestEvent(
        address _operator,
        address _from,
        uint256 _tokenId,
        bytes _data
    );
}