//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISemaphoreExtended.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

/// @title An anonymous NFT Prover contract enabled by ZK Proofs
/// @author Nishay Madhani (@nshmadhani)
contract ProveNFT is ERC721Holder, ERC721Enumerable {


    uint256 public groupId;    
    uint256 public externalNullifier = 104101121321161041051;

    address public owner;
    ISemaphoreExtended public semaphore;
    IERC721 public collection;

    mapping(uint256 => uint256) public commitments;
    mapping(uint256 => uint256) public memberIndex;



    modifier onlyOwner() {
        require(owner == msg.sender, "onlyOwner");
        _;
    }

    ///@notice sets up addresses of semaphore, nft collection and creates a group
    ///@param _semaphoreAddress address of semaphore contract
    ///@param _groupId id of semaphore group
    ///@param _collection nft collection to prove ownership
    constructor(
        address _semaphoreAddress,
        uint256 _groupId,
        address _collection
    ) ERC721("name", "symbol_"){
        semaphore = ISemaphoreExtended(_semaphoreAddress);
        groupId = _groupId;

        collection = IERC721(_collection);

        owner = msg.sender;

        // Creates a group with specified ID, a depth of 20, zero value and sets contract as admin
        semaphore.createGroup(groupId, 20, 0, address(this));
    }

    ///@notice stakes an nft of collection and mints another nft with same tokenId
    ///@param _identityCommitment commitment to be included in group
    ///@param _nftid tokenId of nft being staked
    ///@dev This funciton will transfer the _nftid to the contract, add the commitment to
    ///     group and will mint another nft with same tokenId to the user.
    function stakeNFT(uint256 _identityCommitment, uint256 _nftid) external {        
        require(collection.ownerOf(_nftid) == msg.sender, "NFT not owned");
        collection.safeTransferFrom(msg.sender, address(this), _nftid);
        _addToGroup(_identityCommitment, _nftid);
        _mint(msg.sender, _nftid);
    }

    ///@notice withdraw the nft and remove commitment from the group
    ///@param _nftid tokenId of nft being staked
    ///@param _identityCommitment commitment to be removed from the group
    ///@param _proofSiblings _pfroofSiblings from semaphore lib
    ///@param _proofPathIndices proofPathIndixesfrom semaphore lib
    ///@dev This function will return the nft, remove commitment from group and burn
    ///     contract given nft.
    function withdraw(
        uint256 _nftid,
        uint256 _identityCommitment,
        uint256[] calldata _proofSiblings,
        uint8[] calldata _proofPathIndices
    ) external {
        
        //security only remove your own commitment
        require(ownerOf(_nftid) == msg.sender, "NFT not owned");
        
        _removeFromGroup(
            _nftid,
            _identityCommitment,
            _proofSiblings,
            _proofPathIndices
        );
        collection.safeTransferFrom(address(this),msg.sender, _nftid);
        _burn(_nftid);
    }

    ///@notice verify the ownership of nft in collection without revelaing tokenid or owner's address
    ///@param _signal signal hash for proof
    ///@param _merkleTreeRoot merkle tree root at the time of proof generation
    ///@param _nullifierHash nullifier hash prevents double singalling
    ///@param _proof zk enabled proof 
    ///@dev This function will prove the ownwership of an nft in the collection and 
    ///     prevent double signalling using the nullifier hash
    function verifyOwnership(
        bytes32 _signal,
        uint256 _merkleTreeRoot,
        uint256 _nullifierHash,
        uint256[8] calldata _proof
    ) external {
        semaphore.verifyProof(
            groupId,
            _merkleTreeRoot,
            _signal,
            _nullifierHash,
            externalNullifier,
            _proof
        );
    }
    ///@notice returns number of merkle tree leaves
    function getNumberOfMerkleTreeLeaves() public view returns (uint256) {
        return semaphore.getNumberOfMerkleTreeLeaves(groupId);
    }

    ///@notice returns merkle tree root
    function getMerkleTreeRoot() public view returns (uint256) {
        return semaphore.getMerkleTreeRoot(groupId);
    }

    ///@notice returns merkle tree leaf present at _index
    ///@param _index index of merkle tree leaf to return
    function getMerkleTreeLeaf(uint256 _index) public view returns (uint256) {
        return commitments[_index];
    }


    ///@notice internal function to add commitment to group
    ///@param _identityCommitment commitment to add to semaphore group
    ///@param _nftid tokenId of nft being staked
    ///@dev This function will add the commitment to group, stores the commitment
    ///     for _nftid and, adds commitment as a merkle tree leaf
    function _addToGroup(uint256 _identityCommitment, uint256 _nftid) internal {
        semaphore.addMember(groupId, _identityCommitment);
        uint256 numOfLeaves = getNumberOfMerkleTreeLeaves();
        commitments[numOfLeaves - 1] = _identityCommitment;
        memberIndex[_nftid] = numOfLeaves - 1;
    }

    ///@notice internal function to remove commitment from group
    ///@param _nftid tokenId of nft being withdrawn
    ///@param _identityCommitment commitment to remove from group
    ///@param _proofSiblings _pfroofSiblings from semaphore lib
    ///@param _proofPathIndices _proofPathIndeces from semaphore lib
    ///@dev This function will remove the commitment from group, resets
    ///     commitment and its memberIndex in merkle tree leaf
    function _removeFromGroup(
        uint256 _nftid,
        uint256 _identityCommitment,
        uint256[] calldata _proofSiblings,
        uint8[] calldata _proofPathIndices
    ) internal {
        semaphore.removeMember(
            groupId,
            _identityCommitment,
            _proofSiblings,
            _proofPathIndices
        );
        commitments[memberIndex[_nftid]] = 0;
    }
}
