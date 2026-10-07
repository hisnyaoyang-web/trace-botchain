// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TRACE Registry
/// @notice On-chain provenance for human–AI design work on BOT Chain.
contract TraceRegistry {
    struct Work { address creator; bytes32 assetHash; bytes32 parentHash; string metadataURI; uint64 createdAt; }
    uint256 public workCount;
    mapping(uint256 => Work) public works;
    mapping(bytes32 => uint256) public workIdByHash;
    event WorkRegistered(uint256 indexed workId, address indexed creator, bytes32 indexed assetHash, bytes32 parentHash, string metadataURI);
    error EmptyAssetHash();
    error WorkAlreadyRegistered(uint256 workId);
    error ParentNotRegistered();
    error ParentCreatorMismatch();

    function registerWork(bytes32 assetHash, bytes32 parentHash, string calldata metadataURI) external returns (uint256 workId) {
        if (assetHash == bytes32(0)) revert EmptyAssetHash();
        if (workIdByHash[assetHash] != 0) revert WorkAlreadyRegistered(workIdByHash[assetHash]);
        if (parentHash != bytes32(0)) {
            uint256 parentId = workIdByHash[parentHash];
            if (parentId == 0) revert ParentNotRegistered();
            if (works[parentId].creator != msg.sender) revert ParentCreatorMismatch();
        }
        workId = ++workCount;
        works[workId] = Work(msg.sender, assetHash, parentHash, metadataURI, uint64(block.timestamp));
        workIdByHash[assetHash] = workId;
        emit WorkRegistered(workId, msg.sender, assetHash, parentHash, metadataURI);
    }
}
