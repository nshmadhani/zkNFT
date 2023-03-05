import { useEthersAppContext } from "eth-hooks/context";
import { TEthersAdaptor } from "eth-hooks/models";
import { Contract } from "ethers";
import React, { useState } from "react";
import { ERC721, MockERC721, ProveNFT } from "~common/generated/contract-types";
import { Button, Card, Divider, Form, Input, Typography } from 'antd';

import { Identity } from "@semaphore-protocol/identity"
import { IdentityForm } from "../semaphore/IdentityForm";
import { ProofGenerator } from "../semaphore/ProofGenerator";
import { setupGroup } from "~~/functions/semaphore";

interface IStakeAppProps {
    contractName: string,
    contract: ProveNFT,
    nftContract: ERC721 | MockERC721
}



export const StakeApp = ({ contractName, contract, nftContract }: IStakeAppProps): any => {

    const [nftid, setNFTID] = useState<number>(-1);

    const [identity, setIdentity] = useState<any>(null);

    const ethersAppContext = useEthersAppContext();

    const [group, setGroup] = useState<any>(null);

    const isLoadingContract =
        ethersAppContext.provider == null ||
        ethersAppContext.signer == null ||
        (contract != null && contract?.provider == null);

    const checkForAllowance = async (nftid: number): Promise<boolean> => {
        return (await nftContract.getApproved(nftid)) === contract.address
    }

    const stakeNFT = async (): Promise<any> => {
        if (!identity) {
            alert("Generate an Identity First")
            return;
        }
        if (nftid < 0) {
            alert('NFT ID not valid');
            return;
        }
        console.log(nftid)
        const isAllowed = await checkForAllowance(nftid);
        if (isAllowed) {
            await contract.stakeNFT(identity.commitment, nftid);
        } else {
            await nftContract.approve(contract.address, nftid)
        }
    }

    const unstakeNFT = async (values: any) => {
        if (!identity) {
            alert("Generate an Identity First")
            return;
        }
        if (nftid < 0) {
            alert('NFT ID not valid');
            return;
        }

        const group = await setupGroup(contract);



        const { siblings, pathIndices } =
            group.generateProofOfMembership(group.indexOf(identity.commitment))

        await contract.withdraw(
            nftid,
            identity.commitment,
            siblings,
            pathIndices)

    }

    const onFinishFailed = () => {

    }


    return (

        <div style={{ margin: 'auto', width: '70vw' }}>
            <Card
                title={
                    "StakeApp"
                }
                size="default"
                style={{ marginTop: 25, width: '100%' }}
                loading={isLoadingContract}>


                <IdentityForm identity={identity} setIdentity={setIdentity} />
                <Divider />
                <Typography.Text> Now Stake an NFT</Typography.Text>

                <Form
                    name="stakeunstake"
                    initialValues={{ remember: true }}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="NFT ID"
                        name="nftid"
                        rules={[{ required: true, message: 'Please input your nftid!' }]}
                    >
                        { /**  @ts-ignore  **/}
                        <Input type="number" value={nftid} onChange={(e) => setNFTID(e.target.value)} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit"
                            style={{ margin: "5px" }} onClick={stakeNFT}>
                            Stake
                        </Button>
                        <Button type="primary" htmlType="button" onClick={unstakeNFT}>
                            Withdraw
                        </Button>
                    </Form.Item>
                </Form>

                <Divider />

                <ProofGenerator identity={identity} contract={contract} />

            </Card>
        </div >




    )
}






