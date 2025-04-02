import { BigNumber, Contract, ethers, Signer } from "ethers";
import { SdkConfig } from "./types";
import MULTI_SEND_ABI from './abi/multiSendAbi.json';
import { getRecommendedGasPrice } from "./utils/gasEstimator";


export class TransactiBatch {
  private provider: ethers.providers.Provider;
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
      this.provider = new ethers.providers.JsonRpcProvider(config.provider);
    } else {
      this.provider = config.provider;
    }

    this.contractAddress = config.contractAddress;
    this.contract = new Contract(this.contractAddress, MULTI_SEND_ABI, this.provider);
    this.defaultGasLimit = config.defaultGasLimit;
    this.defaultGasPrice = config.defaultGasPrice;
  }

  /**
 * Connect a signer to the SDK
 * @param signer An ethers.js signer
 * @returns A new instance of TransactiBatch SDK with the signer connected
 */
  connect(signer: Signer): TransactiBatch {
    this.contract = this.contract.connect(signer);
    return this;
  }

  /**
   * Fetch the current provider
   * @returns The current ethers.js provider
   */
  getProvider(): ethers.providers.Provider {
    return this.provider;
  }

  /**
   * Fetch the contract interface
   * @returns The ethers.js contract interface
   */
  getContract(): Contract {
    return this.contract;
  }

  /**
   * Fetch the contract address
   * @returns The contract address
   */
  getContractAddress(): string {
    return this.contractAddress;
  }

  /**
   * Get recommended gas prices based on current network conditions
   * @returns A promise that resolves to an object with different gas price options
 */
  async getGasPrices(): Promise<{
    slow: BigNumber;
    average: BigNumber;
    fast: BigNumber;
  }> {
    return getRecommendedGasPrice(this.provider);
  }

}
