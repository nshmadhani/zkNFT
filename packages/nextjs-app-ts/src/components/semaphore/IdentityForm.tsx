import { Identity } from "@semaphore-protocol/identity"
import { Button, Form, Input, Typography } from "antd"
import { useEffect } from "react"

export const IdentityForm = ({ identity, setIdentity }: any) => {

    const generateIdentity = (values: any) => {
        setIdentity(new Identity(values.password))
    }

    return (
        <div>

            {!identity ? (<>

                <Typography.Text> Generate an Identity</Typography.Text>
                <Form
                    name="identity"
                    initialValues={{ remember: true }}
                    onFinish={generateIdentity}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ margin: "5px" }}>
                            Generate
                        </Button>
                    </Form.Item>
                </Form>

            </>) : (<>

                <Typography.Text>Your Identity</Typography.Text> <br />
                <Typography.Text><b>Trapdoor</b>: {identity.trapdoor.toString()}</Typography.Text> <br />
                <Typography.Text><b>Nullifier</b>: {identity.nullifier.toString()}</Typography.Text> <br />
                <Typography.Text><b>Commitment</b>: {identity.commitment.toString()}</Typography.Text>


            </>)}


        </div>
    )
}