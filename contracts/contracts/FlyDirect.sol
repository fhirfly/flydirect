// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IDIDRegistry.sol";

contract FlyDirect {
    struct Message {
        address toAddress;
        address fromAddress;
        uint256 timestamp;
        string toDid;
        string fromDid;
        string msgUri;
    }

    IDIDRegistry public healthDIDRegistry;

    constructor(address _healthDIDRegistryAddress) {
        healthDIDRegistry = IDIDRegistry(_healthDIDRegistryAddress);
    }

    mapping(address => uint256) public msgCount;
    mapping(address => mapping(uint256 => Message)) public didMessageMap;

    function sendMessage(string memory _msg, string memory _toDid) public returns (bool) {
        require(healthDIDRegistry.getHealtDID(_toDid).owner != address(0), "Address doesn't have any DID");
        require(healthDIDRegistry.addressDidMapping(msg.sender).owner != address(0), "Address doesn't have any DID");
        require(healthDIDRegistry.resolveChainId(_toDid) == healthDIDRegistry.getChainID(), "Incorrect Chain Id in DID");

        didMessageMap[msg.sender][msgCount[msg.sender]].msgUri = _msg;
        didMessageMap[msg.sender][msgCount[msg.sender]].toDid = _toDid;
        didMessageMap[msg.sender][msgCount[msg.sender]].fromDid =
            healthDIDRegistry.addressDidMapping(msg.sender).healthDid;
        didMessageMap[msg.sender][msgCount[msg.sender]].timestamp = block.timestamp;
        didMessageMap[msg.sender][msgCount[msg.sender]].toAddress = healthDIDRegistry.getHealtDID(_toDid).owner;
        didMessageMap[msg.sender][msgCount[msg.sender]].fromAddress = msg.sender;

        return true;
    }

    function getMessage(address _address, uint256 _count) public view returns (Message memory) {
        return didMessageMap[_address][_count];
    }
}
