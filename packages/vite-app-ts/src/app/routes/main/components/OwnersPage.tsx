import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Button, Input, List, Select, Spin } from 'antd';
import { Address, AddressInput } from 'eth-components/ant';
import { BaseContract, BigNumber } from 'ethers';
import { useLocalStorage } from '~~/app/common/hooks';
import { TypedEvent } from 'eth-hooks/models';
import { Result } from 'ethers/lib/utils';

export interface OwnersPageProps {
    signaturesRequired?: BigNumber,
    ownerEvents: TypedEvent<Result>[],
    mainnetProvider: StaticJsonRpcProvider,
    readContracts: Record<string, BaseContract>,
    contractName: string,
}

export const OwnersPage: FC<OwnersPageProps> = (props) => {
    const history = useHistory();

    const [to, setTo] = useLocalStorage("to", "", 0);
    const [amount, setAmount] = useLocalStorage("amount", "0", 0);
    const [methodName, setMethodName] = useLocalStorage("addSigner", "", 0);
    const [newOwner, setNewOwner] = useLocalStorage("newOwner", "", 0);
    const [newSignaturesRequired, setNewSignaturesRequired] = useLocalStorage("newSignaturesRequired", "", 0);
    const [data, setData] = useLocalStorage("data", "0x", 0);

    const signaturesRequired = props.signaturesRequired;
    const ownerEvents = props.ownerEvents;
    const mainnetProvider = props.mainnetProvider;
    const readContracts = props.readContracts;
    const contractName = props.contractName;

    const { Option } = Select;

    return (
        <div>
            <h2 style={{ marginTop: 32 }}>Signatures Required: {signaturesRequired ? signaturesRequired.toNumber() : <Spin></Spin>}</h2>
            <List
                style={{ maxWidth: 400, margin: "auto", marginTop: 32 }}
                bordered
                dataSource={ownerEvents}
                renderItem={(item: TypedEvent<Result>) => {
                    return (
                        <List.Item key={"owner_" + item.transactionHash}>
                            <Address
                                address={item.args[0]}
                                ensProvider={mainnetProvider}
                                // blockExplorer={blockExplorer}
                                fontSize={32}
                            />
                            <div style={{ padding: 16 }}>
                                {item.args[1] ? "👍" : "👎"}
                            </div>
                        </List.Item>
                    )
                }}
            />

            <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
                <div style={{ margin: 8, padding: 8 }}>
                    <Select value={methodName} style={{ width: "100%" }} onChange={setMethodName}>
                        <Option value="addSigner">addSigner()</Option>
                        <Option value="removeSigner">removeSigner()</Option>
                    </Select>
                </div>
                <div style={{ margin: 8, padding: 8 }}>
                    <AddressInput
                        autoFocus
                        ensProvider={mainnetProvider}
                        placeholder="new owner address"
                        address={newOwner}
                        onChange={setNewOwner}
                    />
                </div>
                <div style={{ margin: 8, padding: 8 }}>
                    <Input
                        // ensProvider={mainnetProvider}
                        placeholder="new # of signatures required"
                        value={newSignaturesRequired}
                        onChange={(e) => { setNewSignaturesRequired(e.target.value) }}
                    />
                </div>
                <div style={{ margin: 8, padding: 8 }}>
                    <Button onClick={() => {
                        console.log("METHOD", setMethodName)
                        let calldata = readContracts[contractName].interface.encodeFunctionData(methodName, [newOwner, newSignaturesRequired])
                        console.log("calldata", calldata)
                        setData(calldata)
                        setAmount("0")
                        setTo(readContracts[contractName].address)
                        setTimeout(() => {
                            history.push('/create')
                        }, 777)
                    }}>
                        Create Tx
                    </Button>
                </div>
            </div>
        </div>
    );
};
