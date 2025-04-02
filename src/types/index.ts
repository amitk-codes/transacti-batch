import { providers } from "ethers";

export interface SdkConfig {
    provider: providers.Provider | string;
    contractAddress: string;
    defaultGasLimit?: number;
    defaultGasPrice?: string;
  }