import React, { FC, useState } from 'react';
import { BaseContract, BigNumber, Contract, ethers, Signer } from 'ethers';
import axios from 'axios';
import { Button, List, Spin } from 'antd';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { parseEther } from '@ethersproject/units';
import { Transaction } from '../interfaces/Transaction';
import { TransactionListItem } from './TransactionListItem';
import { TTransactor } from 'eth-components/functions';
import usePoller from '../hooks/usePoller';

export interface TransactionsPageProps {
    poolServerUrl: string,
    contractName: string,
    mainnetProvider: StaticJsonRpcProvider,
    localProvider: StaticJsonRpcProvider,
    price: number,
    readContracts: Record<string, BaseContract>,
    writeContracts: Record<string, BaseContract>,
    address?: string,
    signaturesRequired?: BigNumber,
    nonce?: BigNumber,
    tx?: TTransactor,
    signer?: Signer,
    chainId?: number,
}

interface SignatureDescription {
    signature: string,
    signer: string,
}

export const TransactionsPage: FC<TransactionsPageProps> = (props) => {

    const readContracts = props.readContracts;
    const writeContracts = props.writeContracts;
    const contractName = props.contractName;
    const localProvider = props.localProvider;
    const mainnetProvider = props.mainnetProvider;
    const price = props.price;
    const poolServerUrl = props.poolServerUrl;
    const address = props.address;
    const signaturesRequired = props.signaturesRequired;
    const nonce = props.nonce;
    const tx = props.tx;
    const signer = props.signer;
    const chainId = props.chainId;

    const metaMultiSigWallet = readContracts[contractName] as Contract;

    const [transactions, setTransactions] = useState<Transaction[]>();
    
    usePoller(() => {
      const getTransactions = async () => {

        if (true) console.log("🛰 Requesting Transaction List");
        const res = await axios.get<Transaction[]>(
          poolServerUrl + metaMultiSigWallet.address + "_" + chainId,
        );
        const newTransactions = [];
        for (const i in res.data) {
          // console.log("look through signatures of ",res.data[i])
          const thisNonce = ethers.BigNumber.from(res.data[i].nonce);
          if (thisNonce && nonce && thisNonce.gte(nonce)) {
            const validSignatures = [];
            for (const s in res.data[i].signatures) {
              // console.log("RECOVER:",res.data[i].signatures[s],res.data[i].hash)
              const signer = await metaMultiSigWallet.recover(res.data[i].hash, res.data[i].signatures[s]);
              const isOwner = await metaMultiSigWallet.isOwner(signer);
              if (signer && isOwner) {
                validSignatures.push({ signer, signature: res.data[i].signatures[s] });
              }
            }
            const update = { ...res.data[i], validSignatures };
            // console.log("update",update)
            newTransactions.push(update);
          }
        }
        setTransactions(newTransactions);
        console.log("Loaded",newTransactions.length)
      };
      if (readContracts) getTransactions();
    }, 3777);

    const getSortedSigList = async (allSigs: string[], newHash: string) => {
        console.log("allSigs", allSigs);


        const sigList: SignatureDescription[] = [];
        for (const s in allSigs) {
            console.log("SIG", allSigs[s]);
            const recover = await metaMultiSigWallet.recover(newHash, allSigs[s]);
            sigList.push({ signature: allSigs[s], signer: recover });
        }

        sigList.sort((a: SignatureDescription, b: SignatureDescription) => {
            return ethers.BigNumber.from(a.signer).sub(ethers.BigNumber.from(b.signer)).toNumber();
        });

        console.log("SORTED SIG LIST:", sigList);

        const finalSigList = [];
        const finalSigners = [];
        const used: { [key: string]: boolean; } = {};
        for (const s in sigList) {
            if (!used[sigList[s].signature]) {
                finalSigList.push(sigList[s].signature);
                finalSigners.push(sigList[s].signer);
            }
            used[sigList[s].signature] = true;
        }

        console.log("FINAL SIG LIST:", finalSigList);
        return [finalSigList, finalSigners];
    };

    if (!signaturesRequired || !address || !tx) {
        return <Spin />;
    }

    console.log("transactions", transactions)

    return (
        <div style={{ maxWidth: 750, margin: "auto", marginTop: 32, marginBottom: 32 }}>
            <h1>
                <b style={{ padding: 16 }}>#{nonce ? nonce.toNumber() : <Spin />}</b>
            </h1>

            <List
                bordered
                dataSource={transactions}
                renderItem={item => {
                    console.log("ITE88888M", item);

                    const hasSigned = item.signers.indexOf(address) >= 0;
                    const hasEnoughSignatures = item.signatures.length <= signaturesRequired.toNumber();

                    return (
                        <TransactionListItem item={item} mainnetProvider={mainnetProvider}  price={price} readContracts={readContracts} contractName={contractName}>
                            <span>
                                {item.signatures.length}/{signaturesRequired.toNumber()} {hasSigned ? "✅" : ""}
                            </span>
                            <Button
                                onClick={async () => {
                                    console.log("item.signatures", item.signatures);

                                    const newHash = await metaMultiSigWallet.getTransactionHash(
                                        item.nonce,
                                        item.to,
                                        parseEther("" + parseFloat(item.amount).toFixed(12)),
                                        item.data,
                                    );
                                    console.log("newHash", newHash);

                                    const provider = signer?.provider as StaticJsonRpcProvider;
                                    if (!provider) {
                                    return;
                                    }
                                    const signature = await provider.send("personal_sign", [newHash, address.toLowerCase()]);
                                    // const signature = await userProvider.send("personal_sign", [newHash, address]);
                                    console.log("signature", signature);

                                    const recover = await metaMultiSigWallet.recover(newHash, signature);
                                    console.log("recover--->", recover);

                                    const isOwner = await metaMultiSigWallet.isOwner(recover);
                                    console.log("isOwner", isOwner);

                                    if (isOwner) {
                                        const [finalSigList, finalSigners] = await getSortedSigList(
                                            [...item.signatures, signature],
                                            newHash,
                                        );
                                        const res = await axios.post(poolServerUrl, {
                                            ...item,
                                            signatures: finalSigList,
                                            signers: finalSigners,
                                        });
                                    }

                                    // tx( writeContracts[contractName].executeTransaction(item.to,parseEther(""+parseFloat(item.amount).toFixed(12)), item.data, item.signatures))
                                }}
                                // type="secondary"
                            >
                                Sign
                            </Button>
                            <Button

                                key={item.hash}

                                onClick={async () => {
                                    const newHash = await metaMultiSigWallet.getTransactionHash(
                                        item.nonce,
                                        item.to,
                                        parseEther("" + parseFloat(item.amount).toFixed(12)),
                                        item.data,
                                    );
                                    console.log("newHash", newHash);

                                    console.log("item.signatures", item.signatures);

                                    const [finalSigList, finalSigners] = await getSortedSigList(item.signatures, newHash);

                                    const metaMultiSigWalletWrite = writeContracts[contractName] as Contract;

                                    tx(
                                        metaMultiSigWalletWrite.executeTransaction(
                                            item.to,
                                            parseEther("" + parseFloat(item.amount).toFixed(12)),
                                            item.data,
                                            finalSigList,
                                        ),
                                    );
                                }}
                                // type={hasEnoughSignatures ? "primary" : "secondary"}
                            >
                                Exec
                            </Button>
                        </TransactionListItem>
                    );
                }}
            />
        </div>
    );
};
