// SPDX-License-Identifier: MIT
// Creator: BuiltByFrancis

pragma solidity ^0.8.16;

contract Optimised {
    uint256 public ignoreMe;

    mapping(uint256 => uint256) public storedIndices;
    mapping(uint256 => uint256) public storedValues;

    constructor(uint256[] memory defaultValues) {
        for (uint256 i = 0; i < defaultValues.length; i++) {
            storedValues[i] = defaultValues[i];
        }
    }

    function setStoredIndices(uint256[] memory indices) external {
        for (uint256 i = 0; i < indices.length; i++) {
            storedIndices[i] = indices[i];
        }
    }

    function findValue(uint256 tokenId) external view returns (uint256 rate) {
        unchecked {
            uint256 shift = 8 * (tokenId % 32);
            return
                storedValues[
                    (storedIndices[tokenId / 32] & (255 << shift)) >> shift
                ];
        }
    }

    function measureFindValue(uint256 tokenId) external returns (uint256 rate) {
        ignoreMe = 1;

        unchecked {
            uint256 shift = 8 * (tokenId % 32);
            return
                storedValues[
                    (storedIndices[tokenId / 32] & (255 << shift)) >> shift
                ];
        }
    }
}
