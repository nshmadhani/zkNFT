import { Identity } from "@semaphore-protocol/identity"
import { Button, Typography } from "antd"
import { useState } from "react"
import { ProveNFT } from "~common/generated/contract-types";



import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof";
import { ethers } from "ethers";

import { setupGroup } from "~~/functions/semaphore";

import { QRCodeCanvas } from 'qrcode.react';


export const ProofGenerator = ({ identity, contract }: { identity: Identity, contract: ProveNFT }) => {

    const [group, setGroup] = useState(null);

    const [proof, setProof] = useState<any>(null)

    const [isLoading, toggleLoading] = useState(false)

    const genProof = async () => {
        let _group = await setupGroup(contract);
        const externalNullifier = await contract.externalNullifier();
        const signal = ethers.utils.formatBytes32String("Verify");
        const fullProof = await generateProof(identity, _group,
            externalNullifier.toString(), signal)

        const solidityProof = packToSolidityProof(fullProof.proof)

        const proofString = {
            solidityProof: solidityProof,
            nullifierHash: fullProof.publicSignals.nullifierHash,
            merkleRoot: fullProof.publicSignals.merkleRoot
        }
        console.log(JSON.stringify(proofString))
        setProof(JSON.stringify(proofString));
        toggleLoading(false)
    }

    const copyProof = async () => {
        console.log(proof.toString())
        window.navigator.clipboard.writeText(proof.toString())
        alert("copied")
    }



    return (
        <div>

            {!proof ? (<>
                <Typography.Text> Generate a Proof</Typography.Text> <br />
                <br />
                <Button type="primary" htmlType="submit" onClick={genProof}>
                    Generate
                </Button>



            </>) : (<>

                {proof.toString().substr(0, 10)}... <br />

                <div style={{ background: 'white', padding: '16px' }}>
                    <QRCodeCanvas value={proof.toString()} size={256} />
                </div>

                <Button type="primary" htmlType="submit" onClick={copyProof}>
                    Copy Proof
                </Button>


            </>)
            }


        </div >
    )
}