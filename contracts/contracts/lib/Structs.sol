// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library Structs {
    struct Message {
        address toAddress;
        address fromAddress;
        uint256 timestamp;
        string toDid;
        string fromDid;
        string ipfsuri;
    }
}
