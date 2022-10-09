import React, { FC } from 'react';
import { Modal } from 'antd';
import { Address, Balance } from 'eth-components/ant';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { TransactionDescription } from 'ethers/lib/utils';

export interface TransactionDetailsModalProps {
  visible: boolean,
  handleOk: (e: React.MouseEvent<HTMLElement>) => void,
  txnInfo?: TransactionDescription,
  mainnetProvider: StaticJsonRpcProvider,
  price: number,
}

export const TransactionDetailsModal: FC<TransactionDetailsModalProps> = (props) => {

  const visible = props.visible;
  const handleOk = props.handleOk;
  const txnInfo = props.txnInfo;
  const mainnetProvider = props.mainnetProvider;
  const price = props.price;

  return (
    <Modal
      title="Transaction Details"
      visible={visible}
      onCancel={handleOk}
      destroyOnClose
      onOk={handleOk}
      footer={null}
      closable
      maskClosable
    >
      {txnInfo && (
        <div>
          <p>
            <b>Event Name :</b> {txnInfo.functionFragment.name}
          </p>
          <p>
            <b>Function Signature :</b> {txnInfo.signature}
          </p>
          <h4>Arguments :&nbsp;</h4>
          {txnInfo.functionFragment.inputs.map((element: any, index: number) => {
            if (element.type === "address") {
              return (
                <div key={element.name} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left" }}>
                  <b>{element.name} :&nbsp;</b>
                  <Address fontSize={16} address={txnInfo.args[index]} ensProvider={mainnetProvider} />
                </div>
              );
            }
            if (element.type === "uint256") {
              return (
                <p key={element.name}>
                  {element.name === "value" ? <><b>{element.name} : </b> <Balance address={undefined} balance={txnInfo.args[index]} price={price} /> </> : <><b>{element.name} : </b> {txnInfo.args[index] && txnInfo.args[index].toNumber()}</>}
                </p>
              );
            }
          })}
          <p>
            <b>SigHash : &nbsp;</b>
            {txnInfo.sighash}
          </p>
        </div>
      )}
    </Modal>
  );
};
