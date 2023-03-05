
const ethers = require('ethers');

const ABI = require('../../artifacts/ProveNFT.json');

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract("0xdD0AEF74980C0d8Ac8b547c80E93895E11fE9Cbe",
    ABI.abi,
    signer)


const signal = ethers.utils.formatBytes32String("Verify");




async function doesThisSmellFishyToYou(proof) {

    await contract.verifyOwnership(
        signal,
        proof.merkleRoot,
        proof.nullifierHash,
        proof.solidityProof
    )
}

module.exports = {
    doesThisSmellFishyToYou
}