// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../utils/Constants.sol";
import "../diamond/interfaces/IDiamondCut.sol";
import "../diamond/libraries/LibAccessControlEnumerable.sol";
import "../diamond/libraries/LibDiamond.sol";

contract MockDiamondCutFacet is IDiamondCut {

    /**
     * diamondCut((address,uint8,bytes4[])[],address,bytes)
     */
    function diamondCut(FacetCut[] calldata _diamondCut, address _init, bytes calldata _calldata) external override {
        LibAccessControlEnumerable.checkRole(Constants.DEPLOYER_ROLE);
        LibDiamond.diamondCut(_diamondCut, _init, _calldata);
    }
}
