import { BigNumber } from "ethers";

export interface Transaction {
    hash: string;
    data: string;
    to: string;
    nonce: number | BigNumber;
    value?: BigNumber;
    amount: string;
    signers: string[];
    signatures: string[];
    address: string;
}