import { FC, useEffect, useState } from "react";
import { BigNumber, Contract } from "ethers";
import { Balance } from "eth-components/ant";

export interface ITokenContractBalanceProps {
  contract?: Contract;
  dollarMultiplier?: number;
  img?: string;
  address?: string;
}

export const TokenContractBalance: FC<ITokenContractBalanceProps> = (props) => {
  const { contract, address } = props;

  const [balance, setBalance] = useState<BigNumber>();
  useEffect(() => {
    const getBalanceStaked = async () => {
      const balance = contract ? await contract.balanceOf(address ?? '') : BigNumber.from(0);
      // console.log('💵 balance:', balance.toString());
      setBalance(balance);
    };
    getBalanceStaked();
  }, [contract, address]);

  return (
    <>
      {props.img || ''} <Balance address={undefined} balance={balance} dollarMultiplier={props.dollarMultiplier} />
    </>
  );
}
