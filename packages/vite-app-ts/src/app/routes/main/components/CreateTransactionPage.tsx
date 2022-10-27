import React, { FC, useState } from 'react';
import axios from 'axios';
import { BaseContract, BigNumber, Contract, ethers, Signer } from 'ethers';
import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers';
import { parseEther } from '@ethersproject/units';
import { Button, Input, Select, Spin } from 'antd';
import { AddressInput, EtherInput } from 'eth-components/ant';
import { useHistory } from 'react-router-dom';
import { useLocalStorage } from '~~/app/common/hooks';
import { Blockie } from './Blockie';
import { Transaction } from '../interfaces/Transaction';

export interface CreateTransactionPageProps {
  poolServerUrl: string,
  contractName: string,
  mainnetProvider: StaticJsonRpcProvider,
  localProvider: StaticJsonRpcProvider,
  price: number,
  readContracts: Record<string, BaseContract>,
  signer?: Signer,
  address?: string,
  userProvider?: JsonRpcProvider,
  nonce?: BigNumber,
  chainId?: number,
}

export const CreateTransactionPage: FC<CreateTransactionPageProps> = (props) => {

  const readContracts = props.readContracts;
  const contractName = props.contractName;
  const localProvider = props.localProvider;
  const mainnetProvider = props.mainnetProvider;
  const price = props.price;
  const poolServerUrl = props.poolServerUrl;
  const address = props.address;
  const signer = props.signer;
  const nonce = props.nonce;
  const chainId = props.chainId;

  const history = useHistory();

  const [customNonce, setCustomNonce] = useState<string>();
  const [methodName, setMethodName] = useState('');
  const [selectDisabled, setSelectDisabled] = useState(false);
  const [to, setTo] = useLocalStorage("to", "", 0);
  const [amount, setAmount] = useLocalStorage("amount", "0", 0);
  const [data, setData] = useLocalStorage("data", "0x", 0);
  const [isCreateTxnEnabled, setCreateTxnEnabled] = useState(true);
  const [result, setResult] = useState("");

  const inputStyle = {
    padding: 10,
  };

  const { Option } = Select;

  const inputPlaceholder = "" + (
    nonce
      ?
      nonce.toNumber()
      :
      "loading..."
  );

  const createTransaction = async () => {

    if (!address) {
      return;
    }

    const metaMultiSigWallet = readContracts[contractName] as Contract;

    console.log("customNonce", customNonce);
    const nonce = customNonce ? BigNumber.from(customNonce) : (await metaMultiSigWallet.nonce());
    console.log("nonce", nonce.toString());

    const newHash = await metaMultiSigWallet.getTransactionHash(
      nonce,
      to,
      parseEther("" + parseFloat(amount).toFixed(12)),
      data,
    );
    console.log("newHash", newHash);

    const provider = signer?.provider as StaticJsonRpcProvider;
    if (!provider) {
      return;
    }

    const signature = await signer?.signMessage(ethers.utils.isHexString(newHash) ? ethers.utils.arrayify(newHash) : newHash);

    console.log("signature", signature);

    const recover = await metaMultiSigWallet.recover(newHash, signature);
    console.log("recover", recover);

    const isOwner = await metaMultiSigWallet.isOwner(recover);
    console.log("isOwner", isOwner);

    if (isOwner) {
      const res = await axios.post<Transaction>(poolServerUrl, {
        chainId,
        address: metaMultiSigWallet.address,
        nonce: nonce.toNumber(),
        to,
        amount,
        data,
        hash: newHash,
        signatures: [signature],
        signers: [recover],
      });
      // IF SIG IS VALUE ETC END TO SERVER AND SERVER VERIFIES SIG IS RIGHT AND IS SIGNER BEFORE ADDING TY

      console.log("RESULT", res.data);

      setTimeout(() => {
        history.push("/pool");
      }, 2777);

      setResult(res.data.hash);
      setTo('');
      setAmount("0");
      setData("0x");
    } else {
      console.log("ERROR, NOT OWNER.");
      setResult("ERROR, NOT OWNER.");
    }
  }

  let resultDisplay = (<></>);
  if (result) {
    if (result.indexOf("ERROR") >= 0) {
      resultDisplay = (<div style={{ margin: 16, padding: 8, color: "red" }}>{result}</div>);
    } else {
      resultDisplay = (
        <div style={{ margin: 16, padding: 8 }}>
          <Blockie size={4} scale={8} address={result} /> Tx {result.substr(0, 6)} Created!
          <div style={{ margin: 8, padding: 4 }}>
            <Spin />
          </div>
        </div>
      );
    }
  }

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <div style={{ margin: 8 }}>
          <div style={inputStyle}>
            <Input
              prefix="#"
              disabled
              value={customNonce}
              placeholder={inputPlaceholder}
              onChange={(e) => {
                setCustomNonce(e.target.value);
              }}
            />
          </div>
          <div style={{ margin: 8, padding: 8 }}>
            <Select value={methodName} disabled={selectDisabled} style={{ width: "100%" }} onChange={setMethodName}>
              {/* <Option key="transferFunds">transferFunds()</Option> */}
              <Option disabled={true} value="addSigner">addSigner()</Option>
              <Option disabled={true} value="removeSigner">removeSigner()</Option>
            </Select>
          </div>
          <div style={inputStyle}>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              placeholder="to address"
              address={to}
              onChange={setTo}
            />
          </div>

          {!selectDisabled && <div style={inputStyle}>
            <EtherInput price={price} value={amount} onChange={setAmount} />
          </div>}
          <div style={inputStyle}>
            <Input
              placeholder="calldata"
              value={data}
              onChange={e => {
                setData(e.target.value);
              }}
            />
          </div>

          <Button
            style={{ marginTop: 32 }}
            disabled={!isCreateTxnEnabled}
            onClick={createTransaction}
          >
            Create
          </Button>
        </div>

        {resultDisplay}
      </div>
    </div>
  );
};
