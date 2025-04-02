import { Contract, providers } from "ethers";
import { SdkConfig } from "./types";
import MULTI_SEND_ABI from './abi/multiSendAbi.json';


export class TransactiBatch {
  private provider: providers.Provider;
  private contract: Contract;
  private contractAddress: string;
  private defaultGasLimit?: number;
  private defaultGasPrice?: string;

  /**
 * Creates a new instance of the TransactiBatch SDK
 * @param config The SDK configuration
 */
  constructor(config: SdkConfig) {
    // Provider setup
    if (typeof config.provider === 'string') {
      this.provider = new providers.JsonRpcProvider(config.provider);
    } else {
      this.provider = config.provider;
    }

    this.contractAddress = config.contractAddress;
    this.contract = new Contract(this.contractAddress, MULTI_SEND_ABI, this.provider);
    this.defaultGasLimit = config.defaultGasLimit;
    this.defaultGasPrice = config.defaultGasPrice;
  }
}
