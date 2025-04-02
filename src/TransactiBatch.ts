import { BigNumber, Contract, ethers, Signer } from "ethers";
import { EthBatchParams, EthEqualBatchParams, GasEstimation, SdkConfig, TokenBatchParams, TokenEqualBatchParams, TransactionOptions } from "./types";
import MULTI_SEND_ABI from './abi/multiSendAbi.json';
import { estimateGas, getRecommendedGasPrice } from "./utils/gasEstimator";
import { hasEnoughAllowance } from "./utils/erc20";


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

  /**
   * Send ETH to multiple recipients with different amounts
   * @param params Parameters for the batch transaction
   * @param options Transaction options
   * @returns A promise that resolves to the transaction response
   */
  async sendEthBatch(
    params: EthBatchParams,
    options: TransactionOptions = {}
  ): Promise<ethers.providers.TransactionResponse> {
    const { recipients } = params;

    if (!recipients || recipients.length === 0) {
      throw new Error('No recipients provided');
    }

    // Split addresses and amounts
    const addresses = recipients.map(r => r.address);
    const amounts = recipients.map(r => ethers.BigNumber.from(r.amount));

    // Calculate total value to send
    const totalValue = amounts.reduce((acc, amount) => acc.add(amount), ethers.BigNumber.from(0));

    // Set transaction options
    const txOptions = {
      gasLimit: options.gasLimit || this.defaultGasLimit,
      gasPrice: options.gasPrice || this.defaultGasPrice,
      value: totalValue.toString(),
      nonce: options.nonce
    };

    // Send the transaction
    return this.contract.multiTransfer_OST(addresses, amounts, txOptions);
  }

  /**
   * Estimate gas for ETH batch transaction
   * @param params Parameters for the batch transaction
   * @param options Transaction options
   * @returns A promise that resolves to a GasEstimation object
   */
  async estimateEthBatchGas(
    params: EthBatchParams,
    options: TransactionOptions = {}
  ): Promise<GasEstimation> {
    const { recipients } = params;

    if (!recipients || recipients.length === 0) {
      throw new Error('No recipients provided');
    }

    // Split addresses and amounts
    const addresses = recipients.map(r => r.address);
    const amounts = recipients.map(r => ethers.BigNumber.from(r.amount));

    // Calculate total value to send
    const totalValue = amounts.reduce((acc, amount) => acc.add(amount), ethers.BigNumber.from(0));

    return estimateGas(
      this.contract,
      'multiTransfer_OST',
      [addresses, amounts],
      totalValue.toString(),
      options
    );
  }


  /**
 * Send equal amounts of ETH to multiple recipients
 * @param params Parameters for the batch transaction
 * @param options Transaction options
 * @returns A promise that resolves to the transaction response
 */
  async sendEthEqualBatch(
    params: EthEqualBatchParams,
    options: TransactionOptions = {}
  ): Promise<ethers.providers.TransactionResponse> {
    const { addresses, amount } = params;

    if (!addresses || addresses.length === 0) {
      throw new Error('No addresses provided');
    }

    // Calculate total value to send
    const amountBN = ethers.BigNumber.from(amount);
    const totalValue = amountBN.mul(addresses.length);

    // Set transaction options
    const txOptions = {
      gasLimit: options.gasLimit || this.defaultGasLimit,
      gasPrice: options.gasPrice || this.defaultGasPrice,
      value: totalValue.toString(),
      nonce: options.nonce
    };

    // Send the transaction
    return this.contract.multiTransferEqual_L1R(addresses, amountBN, txOptions);
  }

  /**
   * Estimate gas for equal ETH batch transaction
   * @param params Parameters for the batch transaction
   * @param options Transaction options
   * @returns A promise that resolves to a GasEstimation object
   */
  async estimateEthEqualBatchGas(
    params: EthEqualBatchParams,
    options: TransactionOptions = {}
  ): Promise<GasEstimation> {
    const { addresses, amount } = params;

    if (!addresses || addresses.length === 0) {
      throw new Error('No addresses provided');
    }

    // Calculate total value to send
    const amountBN = ethers.BigNumber.from(amount);
    const totalValue = amountBN.mul(addresses.length);

    return estimateGas(
      this.contract,
      'multiTransferEqual_L1R',
      [addresses, amountBN],
      totalValue.toString(),
      options
    );
  }


  /**
 * Send ERC-20 tokens to multiple recipients with different amounts
 * @param params Parameters for the batch transaction
 * @param options Transaction options
 * @returns A promise that resolves to the transaction response
 */
  async sendTokenBatch(
    params: TokenBatchParams,
    options: TransactionOptions = {}
  ): Promise<ethers.providers.TransactionResponse> {
    const { tokenAddress, recipients } = params;

    if (!recipients || recipients.length === 0) {
      throw new Error('No recipients provided');
    }

    if (!this.contract.signer) {
      throw new Error('No signer provided. Call connect() to provide a signer.');
    }

    // Split addresses and amounts
    const addresses = recipients.map(r => r.address);
    const amounts = recipients.map(r => ethers.BigNumber.from(r.amount));

    // Calculate total token amount
    const totalAmount = amounts.reduce((acc, amount) => acc.add(amount), ethers.BigNumber.from(0));

    // Check allowance
    const signerAddress = await this.contract.signer.getAddress();
    const hasAllowance = await hasEnoughAllowance(
      tokenAddress,
      signerAddress,
      this.contractAddress,
      totalAmount,
      this.provider
    );

    if (!hasAllowance) {
      throw new Error(`Insufficient token allowance. Please approve the contract to spend at least ${totalAmount.toString()} tokens.`);
    }

    const txOptions = {
      gasLimit: options.gasLimit || this.defaultGasLimit,
      gasPrice: options.gasPrice || this.defaultGasPrice,
      nonce: options.nonce
    };

    // Send the transaction
    return this.contract.multiTransferToken_a4A(
      tokenAddress,
      addresses,
      amounts,
      totalAmount,
      txOptions
    );
  }

  /**
   * Estimate gas for token batch transaction
   * @param params Parameters for the batch transaction
   * @param options Transaction options
   * @returns A promise that resolves to a GasEstimation object
   */
  async estimateTokenBatchGas(
    params: TokenBatchParams,
    options: TransactionOptions = {}
  ): Promise<GasEstimation> {
    const { tokenAddress, recipients } = params;

    if (!recipients || recipients.length === 0) {
      throw new Error('No recipients provided');
    }

    // Split addresses and amounts
    const addresses = recipients.map(r => r.address);
    const amounts = recipients.map(r => ethers.BigNumber.from(r.amount));

    // Calculate total token amount
    const totalAmount = amounts.reduce((acc, amount) => acc.add(amount), ethers.BigNumber.from(0));

    return estimateGas(
      this.contract,
      'multiTransferToken_a4A',
      [tokenAddress, addresses, amounts, totalAmount],
      '0',
      options
    );
  }

  /**
   * Send equal amounts of ERC-20 tokens to multiple recipients
   * @param params Parameters for the batch transaction
   * @param options Transaction options
   * @returns A promise that resolves to the transaction response
   */
  async sendTokenEqualBatch(
    params: TokenEqualBatchParams,
    options: TransactionOptions = {}
  ): Promise<ethers.providers.TransactionResponse> {
    const { tokenAddress, addresses, amount } = params;

    if (!addresses || addresses.length === 0) {
      throw new Error('No addresses provided');
    }

    // Ensure the contract has a signer
    if (!this.contract.signer) {
      throw new Error('No signer provided. Call connect() to provide a signer.');
    }

    // Calculate total token amount
    const amountBN = ethers.BigNumber.from(amount);
    const totalAmount = amountBN.mul(addresses.length);

    // Check allowance
    const signerAddress = await this.contract.signer.getAddress();
    const hasAllowance = await hasEnoughAllowance(
      tokenAddress,
      signerAddress,
      this.contractAddress,
      totalAmount,
      this.provider
    );

    if (!hasAllowance) {
      throw new Error(`Insufficient token allowance. Please approve the contract to spend at least ${totalAmount.toString()} tokens.`);
    }

    // Set transaction options
    const txOptions = {
      gasLimit: options.gasLimit || this.defaultGasLimit,
      gasPrice: options.gasPrice || this.defaultGasPrice,
      nonce: options.nonce
    };

    // Send the transaction
    return this.contract.multiTransferTokenEqual_71p(
      tokenAddress,
      addresses,
      amountBN,
      txOptions
    );
  }

  /**
   * Estimate gas for equal token batch transaction
   * @param params Parameters for the batch transaction
   * @param options Transaction options
   * @returns A promise that resolves to a GasEstimation object
   */
  async estimateTokenEqualBatchGas(
    params: TokenEqualBatchParams,
    options: TransactionOptions = {}
  ): Promise<GasEstimation> {
    const { tokenAddress, addresses, amount } = params;

    if (!addresses || addresses.length === 0) {
      throw new Error('No addresses provided');
    }

    const amountBN = ethers.BigNumber.from(amount);

    return estimateGas(
      this.contract,
      'multiTransferTokenEqual_71p',
      [tokenAddress, addresses, amountBN],
      '0',
      options
    );
  }


}
