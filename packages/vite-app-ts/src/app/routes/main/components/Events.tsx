import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { FC } from 'react';


export interface IEventsProps {
  mainnetProvider: StaticJsonRpcProvider;
}

export const Events: FC<IEventsProps> = (props) => {
  return (
    <></>
  );
};
