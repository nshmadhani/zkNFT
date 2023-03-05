import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import exp from "constants"
import { PrivateKeyInput, sign } from "crypto"
import { ContractFactory } from "ethers"
import { ProveNFT, Semaphore, MockERC721 } from "../../generated/contract-types/"

import { SEMAPHORE_ADDRESS } from '~common/constants/addresses'

const { Identity } = require("@semaphore-protocol/identity")

const { Group } = require("@semaphore-protocol/group")

const { generateProof, packToSolidityProof, verifyProof } = require("@semaphore-protocol/proof")

const { expect } = require("chai")

const { run, ethers } = require("hardhat")

const path = require('path')





describe("NFTProve", function () {

    let contract: ProveNFT
    let collectionContract: MockERC721
    let signers: SignerWithAddress[] = [];

    let semaphoreContract: Semaphore;

    let admin: SignerWithAddress;

    const users: any = []
    const groupId = 20000000000

    before(async () => {


        signers = await ethers.getSigners();

        admin = signers[signers.length - 1];

        let contractFactory = await ethers.getContractFactory("MockERC721");
        collectionContract = await contractFactory
            .connect(admin)
            .deploy("Mock", "Mock", "");

        semaphoreContract = (await ethers
            .getContractAt("Semaphore", SEMAPHORE_ADDRESS)
        ) as Semaphore;

        contractFactory = await ethers.getContractFactory("ProveNFT") as ContractFactory;
        contract = await contractFactory
            .connect(admin)
            .deploy(semaphoreContract.address,
                groupId, collectionContract.address) as ProveNFT;


        await _setupUsers();
    })


    async function _setupUsers() {

        for (let index = 0; index < 6; index++) {
            let signer = index % 2;
            await collectionContract.connect(signers[signer])
                .mint(signers[signer].address, index);

            let identity = new Identity();
            users.push({
                identity,
                signer: signers[signer],
                nft: index,
                commitment: identity.generateCommitment()
            })

            await collectionContract.connect(signers[signer])
                .approve(contract.address, index);
        }
    }

    async function _setupGroup(contract: ProveNFT) {
        const group = new Group();
        const numOfLeaves = await contract.getNumberOfMerkleTreeLeaves();
        for (let index = 0; index < numOfLeaves.toNumber(); index++) {
            const identity = await contract.getMerkleTreeLeaf(index);
            group.addMember(identity)
        }
        return group;
    }

    describe("# stakeNFT", () => {
        it("Should allow users to stake nft", async () => {
            for (let index = 0; index < 6; index++) {
                let tx = contract.connect(users[index].signer).stakeNFT(users[index].commitment,
                    users[index].nft)
                await expect(tx).to.not.be.reverted
            }
        })
    })

    describe("# proveOwnersip", () => {
        it("Should allow users to prove ownership of nft", async () => {

            const group = await _setupGroup(contract);
            const signal = ethers.utils.formatBytes32String("Verify");

            for (let index = 0; index < users.length; index++) {

                const transaction = contract.verifyOwnership(
                    signal,
                    fullProof.publicSignals.merkleRoot,
                    fullProof.publicSignals.nullifierHash,
                    solidityProof
                )

                expect(transaction).to.not.be.reverted;

            }
        })
    })

    describe("# unstakeNFt", () => {
        it("Should allow users to remove nft", async () => {


            for (let index = 0; index < users.length; index++) {
                const group = await _setupGroup(contract);
                const { commitment, signer, nft } = users[index];

                const { siblings, pathIndices } =
                    group.generateProofOfMembership(index)
                const tx = contract.connect(signer).unstake(nft,
                    commitment, siblings,
                    pathIndices)

                await expect(tx).to.not.be.reverted;
                expect(await collectionContract.ownerOf(nft)).eq(signer.address)
            }
        })
    })

});