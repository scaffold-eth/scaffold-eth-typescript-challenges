import React, { FC, useState } from 'react';
import { Button, List } from 'antd';
import { Address, Balance } from 'eth-components/ant';
import { parseEther } from '@ethersproject/units';
import { EllipsisOutlined } from "@ant-design/icons";
import { FunctionFragment, Result, TransactionDescription } from 'ethers/lib/utils';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { BaseContract, BigNumber } from 'ethers';
import { Blockie } from './Blockie';
import { Transaction } from '../interfaces/Transaction';
import { TransactionDetailsModal } from './TransactionDetailsModal';

export interface TransactionListItemProps {
  item: Transaction,
  price: number,
  mainnetProvider: StaticJsonRpcProvider,
  readContracts: Record<string, BaseContract>,
  contractName: string,
}

export const TransactionListItem: FC<TransactionListItemProps> = (props) => {

  const item = props.item;
  const price = props.price;
  const mainnetProvider = props.mainnetProvider;
  const readContracts = props.readContracts;
  const contractName = props.contractName;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const buildTxnTransferData = (transaction: any): TransactionDescription => {
    const fragment = new FunctionFragment('Transfer', []);
    return new TransactionDescription({
      args: [transaction.to],
      functionFragment: fragment ,
      name: '',
      signature: '',
      sighash: item.data,
      value: BigNumber.from("0")
    });
  };

  let txnData: TransactionDescription | undefined;
  try {
    txnData = item.data === "" || item.data === "0x" || item.data === "0x00" ? buildTxnTransferData(item) : readContracts[contractName].interface.parseTransaction(item);
  } catch (error) {
    console.log("ERROR", error)
  }

  return (
    <>
      <TransactionDetailsModal
        visible={isModalVisible}
        txnInfo={txnData}
        handleOk={handleOk}
        mainnetProvider={mainnetProvider}
        price={price}
      />
      {txnData && <List.Item key={item.hash} style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 55,
            fontSize: 12,
            opacity: 0.5,
            display: "flex",
            flexDirection: "row",
            width: "90%",
            justifyContent: "space-between",
          }}
        >
          <p>
            <b>Event Name :&nbsp;</b>
            {txnData.functionFragment.name}&nbsp;
          </p>
          <p>
            <b>Addressed to :&nbsp;</b>
            {txnData.args[0].toString()}
          </p>
        </div>
        {<b style={{ padding: 16 }}>#{typeof (item.nonce) === "number" ? item.nonce : item.nonce.toNumber()}</b>}
        <span>
          <Blockie size={4} scale={8} address={item.hash} /> {item.hash.substr(0, 6)}
        </span>
        <Address address={item.to} fontSize={16} />
        <Balance address={undefined} balance={item.value ? item.value : parseEther("" + parseFloat(item.amount).toFixed(12))} price={price} />
        <Button
          onClick={showModal}
        >
          <EllipsisOutlined />
        </Button>

      </List.Item>}
    </>
  );
};
