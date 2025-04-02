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