// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './DEX_Base.sol';
import './DEX_Admin.sol';

contract DEX is DEX_Base, DEX_Admin{

  constructor(uint16 _feePercent, uint16 _royaltyFeePercent) DEX_Internal(_feePercent, _royaltyFeePercent) {
  }

  function makeAuctionOrder(IERC721 _token, uint256 _id, uint256 _startPrice, uint256 duration) external override {
    uint256 _endTime = block.timestamp + duration * 1 seconds;
    _makeOrder(OrderType.AUCTION, _token, _id, _startPrice, 0, _endTime);
  } 

  function makeFixedPriceOrder(IERC721 _token, uint256 _id, uint256 _fixedPrice, uint256 duration) external override  {
    uint256 _endTime = block.timestamp + duration * 1 seconds;
    _makeOrder(OrderType.FIXED, _token, _id, 0, _fixedPrice, _endTime);
  } 

  function makeMixedOrder(IERC721 _token, uint256 _id, uint256 _startPrice, uint256 _fixedPrice, uint256 duration) external override {
    uint256 _endTime = block.timestamp + duration * 1 seconds;
    _makeOrder(OrderType.MIXED, _token, _id, _startPrice, _fixedPrice, _endTime);
  }

  function getCurrentPrice(bytes32 _order) external view override returns (uint256) {
    return _getCurrentPrice(_order);
  }

  function getOrderStatus(bytes32 _order) external view override returns (string memory) {
    return _checkOrderStatus(_order);
  }

  function getOrdersList() external view override returns (bytes32[] memory) {
    return orderList;
  }

  function getOrderForToken(IERC721 tokenContract, uint256 tokenId) external view returns(bytes32) {
        return orderIdByToken[tokenContract][tokenId];
  }

  function getOrderInfo(bytes32 _order) external view returns(OrderInfo memory orderInfo) {
    Order memory order = orderBook[_order];
    return OrderInfo(
              { tokenAddress: order.tokenContract,
                tokenId: order.tokenId,
                tokenMetadataURI: order.tokenContract.getTokenURI(order.tokenId),
                seller: order.seller,
                startPrice: order.startPrice,
                fixedPrice: order.fixedPrice,
                actualPrice: this.getCurrentPrice(_order),
                lastBidder: order.lastBidder,
                endTime: order.endTime
              }
            );
  }

   function sellerTotalOrder(address _seller) external view override returns (uint256) {
    return orderIdBySeller[_seller].length;
  }

  function bid(bytes32 _order) payable external override{
    _bid(_order);
  }

  function buyItNow(bytes32 _order) payable external override  {
    _buyItNow(_order);
  }

  function claim(bytes32 _order) external override {
    _claim(_order);
  }

  function cancelOrder(bytes32 _order) external override {
    _cancelOrder(_order);
  }
}