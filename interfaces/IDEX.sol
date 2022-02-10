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


    function makeAuctionOrder(IERC721 _token, uint256 _id, uint256 _startPrice, uint256 duration) external;

    function makeFixedPriceOrder(IERC721 _token, uint256 _id, uint256 _fixedPrice, uint256 duration) external;

    function makeMixedOrder(IERC721 _token, uint256 _id, uint256 _startPrice, uint256 _fixedPrice, uint256 duration) external;

    function getCurrentPrice(bytes32 _order) external view returns (uint256);

    function sellerTotalOrder(address _seller) external view returns (uint256);

    function bid(bytes32 _order) payable external;

    function buyItNow(bytes32 _order) payable external;

    function claim(bytes32 _order) external;

    function cancelOrder(bytes32 _order) external;
}