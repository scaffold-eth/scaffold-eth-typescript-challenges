import { List } from "antd";
import { useEventListener } from "eth-hooks";
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { FC } from 'react';
import { Address, Balance } from "eth-components/ant";
import { Contract, EventFilter } from "ethers";



export interface IEventsProps {
  contract: Contract | undefined;
  eventName: string | EventFilter;
  startBlock: number;
  mainnetProvider: StaticJsonRpcProvider;
}

export const Events: FC<IEventsProps> = (props) => {

  const eventName = props.eventName;

  const events = useEventListener(props.contract, eventName, props.startBlock);

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <h2>
        {eventName} Events
        <br />
        {eventName === "EthToTokenSwap"
          ? " ⟠ -->🎈 Address | Trade | AmountIn | AmountOut"
          : eventName === "TokenToEthSwap"
            ? "🎈-->⟠ Address | Trade | AmountOut | AmountIn"
            : eventName === "LiquidityProvided"
              ? "➕ Address | Liquidity Minted | Eth In | Balloons In"
              : "➖ Address | Liquidity Withdrawn | ETH out | Balloons Out "}
      </h2>
      <List
        bordered
        dataSource={events}
        renderItem={item => {
          if (!item || !item.args || item.args.length === 0) {
            return (
              <List.Item key={item.blockNumber + "_"}>
                No information in event
              </List.Item>
            );
          }
          return (
            <List.Item key={item.blockNumber + "_" + item.args[0].toString()}>
              <Address address={item.args[0]} ensProvider={props.mainnetProvider} fontSize={16} />
              {item.args[1].toString().indexOf("E") == -1 ? (
                <Balance address={undefined} balance={item.args[1]} />
              ) : (
                `${item.args[1].toString()}`
              )}
              <Balance address={undefined} balance={item.args[2]} />
              <Balance address={undefined} balance={item.args[3]} />
            </List.Item>
          );
        }}
      />
    </div>
  );

};
