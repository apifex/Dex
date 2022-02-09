// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './DEX_Base.sol';
import './DEX_Admin.sol';

contract DEX is DEX_Base, DEX_Admin{

  constructor(uint16 _feePercent, uint16 _royaltyFeePercent) DEX_Internal(_feePercent, _royaltyFeePercent) {
  }

  function makeAuctionOrder(IERC721 _token, uint256 _id, uint256 _startPrice, uint256 duration) external {
    uint256 _endTime = block.timestamp + duration;
    _makeOrder(OrderType.AUCTION, _token, _id, _startPrice, 0, _endTime);
  } 

  function makeFixedPriceOrder(IERC721 _token, uint256 _id, uint256 _fixedPrice, uint256 duration) external {
    uint256 _endTime = block.timestamp + duration;
    _makeOrder(OrderType.FIXED, _token, _id, 0, _fixedPrice, _endTime);
  } 

  function makeMixedOrder(IERC721 _token, uint256 _id, uint256 _startPrice, uint256 _fixedPrice, uint256 duration) external {
    uint256 _endTime = block.timestamp + duration;
    _makeOrder(OrderType.MIXED, _token, _id, _startPrice, _fixedPrice, _endTime);
  }

  function getCurrentPrice(bytes32 _order) public view returns (uint256) {
    return _getCurrentPrice(_order);
  }

  function sellerTotalOrder(address _seller) external view returns (uint256) {
    return orderIdBySeller[_seller].length;
  }

  function bid(bytes32 _order) payable external {
    _bid(_order);
  }

  function buyItNow(bytes32 _order) payable external {
    _buyItNow(_order);
  }

  function claim(bytes32 _order) external {
    _claim(_order);
  }

  function cancelOrder(bytes32 _order) external {
    _cancelOrder(_order);
  }
}