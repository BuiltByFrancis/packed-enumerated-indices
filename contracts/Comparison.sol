// SPDX-License-Identifier: MIT
// Creator: BuiltByFrancis

pragma solidity ^0.8.16;

contract Comparison {
    uint256 public ignoreMe;

    mapping(uint256 => uint256) public storedIndices;
    mapping(uint256 => uint256) public storedValues;

    constructor(uint256[] memory defaultValues)
    {
        for (uint256 i = 0; i < defaultValues.length; i++) {
            storedValues[i] = defaultValues[i];
        }
    }

    function setStoredIndices(
        uint256[] memory _tokenIds,
        uint256 index
    ) external {
        for (uint256 i; i < _tokenIds.length; i++) {
            storedIndices[_tokenIds[i]] = index;
        }
    }

    function findValue(uint256 tokenId) external view returns (uint256 rate) {
        uint256 idx = storedIndices[tokenId];
        return storedValues[idx];
    }

    function measureFindValue(uint256 tokenId) external returns (uint256 rate) {
        ignoreMe = 1;

        uint256 idx = storedIndices[tokenId];
        return storedValues[idx];
    }
}
