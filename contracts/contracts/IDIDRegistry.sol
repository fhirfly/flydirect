// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library Structs {
    struct HealthDID {
        address owner;
        string healthDid;
        string ipfsUri;
        bool hasWorldId;
        bool hasPolygonId;
        bool hasSocialId;
        uint256 reputationScore;
        string[] altIpfsUris;
    }
}

interface IDIDRegistry {
    function addressDidMapping(address) external view returns (Structs.HealthDID memory);
    function delegateAddresses(address, string memory) external view returns (bool);
    function getHealtDID(string memory) external view returns (Structs.HealthDID memory);
    function registerDID(string memory, string memory) external returns (bool);
    function updateDIDData(string memory, string memory) external returns (bool);
    function addAltData(string memory, string[] memory) external returns (bool);
    function addDelegateAddress(address, string memory) external returns (bool);
    function removeDelegateAddress(address, string memory) external returns (bool);
    function transferOwnership(address, string memory) external returns (bool);
    function resolveChainId(string memory) external pure returns (uint256);
    function getChainID() external view returns (uint256);
    function stringToBytes32(string memory) external pure returns (bytes32);
}
