import { Group } from "@semaphore-protocol/group";
import { ProveNFT } from "~common/generated/contract-types";



export async function setupGroup(contract: ProveNFT): Promise<Group> {
    const _group = new Group();
    const numOfLeaves = await contract.getNumberOfMerkleTreeLeaves();
    for (let index = 0; index < numOfLeaves.toNumber(); index++) {
        const _identity = await contract.getMerkleTreeLeaf(index);
        _group.addMember(_identity.toBigInt())
    }
    return _group;
}