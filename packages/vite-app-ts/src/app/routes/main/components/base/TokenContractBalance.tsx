import { FC } from "react";
import { BigNumber, Contract } from "ethers";
import { Balance } from "eth-components/ant";
import { useContractReader } from "eth-hooks";

export interface ITokenContractBalanceProps {
  contract?: Contract;
  contractName: string;
  dollarMultiplier?: number;
  img?: string;
  address?: string;
}

export const TokenContractBalance: FC<ITokenContractBalanceProps> = (props) => {
  const { contract, address, contractName } = props;

  if (!contract) {
    return (<></>);
  }

  const balanceArray = useContractReader<BigNumber[]>(contract, {
    contractName: contractName,
    functionName: 'balanceOf',
    functionArgs: [address]
  });

  const balance = balanceArray ? balanceArray[0] : undefined;

  return (
    <>
      {props.img || ''} <Balance address={undefined} balance={balance} dollarMultiplier={props.dollarMultiplier} />
    </>
  );
}
