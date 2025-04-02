import { BigNumber, providers } from "ethers";

export interface SdkConfig {
  provider: providers.Provider | string;
  contractAddress: string;
  defaultGasLimit?: number;
  defaultGasPrice?: string;
}

export interface Recipient {
  address: string;
  amount: string; // in wei or token minimal unit
}

export interface EthBatchParams {
  recipients: Recipient[];
}

export interface EthEqualBatchParams {
  addresses: string[];
  amount: string; // in wei
}

export interface TokenBatchParams {
  tokenAddress: string;
  recipients: Recipient[];
}

export interface TokenEqualBatchParams {
  tokenAddress: string;
  addresses: string[];
  amount: string; // in token minimal unit
}

export interface MixedBatchParams {
  tokenAddress: string;
  recipients: {
    address: string;
    tokenAmount: string; // in token minimal unit
    ethAmount: string; // in wei
  }[];
}

export interface TransactionOptions {
  gasLimit?: number;
  gasPrice?: string;
  nonce?: number;
}

export interface GasEstimation {
  gasLimit: BigNumber;
  gasPrice: BigNumber;
  totalCost: BigNumber;
}