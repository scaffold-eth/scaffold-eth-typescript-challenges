import React, { FC } from 'react';
import { BaseContract } from 'ethers';
import { TypedEvent } from 'eth-hooks/models';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { List } from 'antd';
import { Address, Balance } from 'eth-components/ant';
import { Result } from 'ethers/lib/utils';
import QR from "qrcode.react";
import { TransactionListItem } from './TransactionListItem';
import './FrontPage.css';

export interface FrontPageProps {
  executeTransactionEvents: TypedEvent<Result>[],
  contractName: string,
  localProvider: StaticJsonRpcProvider,
  readContracts: Record<string, BaseContract>,
  price: number,
  mainnetProvider: StaticJsonRpcProvider,
}

export const FrontPage: FC<FrontPageProps> = (props) => {

  const readContracts = props.readContracts;
  const contractName = props.contractName;
  const mainnetProvider = props.mainnetProvider;
  const contract = readContracts ? readContracts[contractName] : undefined;
  const address = contract ? contract.address : '';
  const price = props.price;
  const executeTransactionEvents = props.executeTransactionEvents;

  return (
    <div style={{ padding: 32, maxWidth: 750, margin: "auto" }}>
      <div style={{ paddingBottom: 32 }}>
        <div className='balance' >
          <Balance
            address={address}
            price={price}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <QR
            value={address ?? ""}
            size={180}
            level="H"
            includeMargin
            renderAs="svg"
          // imageSettings={{ excavate: false }}
          />
        </div>
        <div>
          <Address
            address={address}
            ensProvider={mainnetProvider}
            fontSize={32}
          />
        </div>
      </div>
      <List
        bordered
        dataSource={executeTransactionEvents}
        renderItem={item => {
          return (
            <>
              <TransactionListItem
                item={item.args}
                mainnetProvider={mainnetProvider}
                price={price}
                readContracts={readContracts}
                contractName={contractName} />
            </>
          );
        }}
      />
    </div>
  );
};
