// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IERC721.sol";
import "../interfaces/IERC2981.sol";
import "./DEX_Internal.sol";

abstract contract DEX_Admin is DEX_Internal {
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can do this");
        _;
    }

    function changeAdmin(address _newAdmin) external onlyAdmin {
        admin = _newAdmin;
    }

    function changeFeeAddress(address _feeAddress) external onlyAdmin {
        feeAddress = _feeAddress;
    }

    function changeFeePercent(uint16 _percent) external onlyAdmin {
        require(_percent <= 10000, "input value is more than 100%");
        feePercent = _percent;
    }
}