import { BigNumber, Contract, providers } from "ethers";
import { GasEstimation, TransactionOptions } from "../types";

/**
 * Get the recommended gas price based on current network conditions
 * @param provider The ethers.js provider
 * @returns A promise that resolves to an object with different gas price options
 */
export async function getRecommendedGasPrice(
    provider: providers.Provider
): Promise<{
    slow: BigNumber;
    average: BigNumber;
    fast: BigNumber;
}> {
    try {
        const gasPrice = await provider.getGasPrice();

        // Calculate different gas price options based on the current gas price
        return {
            slow: gasPrice.mul(90).div(100), // 90% of current gas price
            average: gasPrice, // Current gas price
            fast: gasPrice.mul(120).div(100), // 120% of current gas price
        };
    } catch (error) {
        console.error('Error getting gas price:', error);
        throw new Error(`Failed to get recommended gas price: ${error}`);
    }
} 



/**
 * Estimates gas for a transaction on a contract
 * @param contract The ethers.js contract
 * @param method The contract method name
 * @param params The parameters to pass to the method
 * @param value The value to send with the transaction (in wei)
 * @param options Additional transaction options
 * @returns A promise that resolves to a GasEstimation object
 */
export async function estimateGas(
    contract: Contract,
    method: string,
    params: any[],
    value: string = '0',
    options: TransactionOptions = {}
  ): Promise<GasEstimation> {
    try {
      // Estimate gas for the transaction
      const gasLimit = await contract.estimateGas[method](...params, {
        value,
        gasLimit: options.gasLimit,
      });
  
      // Get the current gas price from the network
      const gasPrice = options.gasPrice 
        ? BigNumber.from(options.gasPrice) 
        : await contract.provider.getGasPrice();
  
      // Calculate the total cost of the transaction
      const totalCost = gasLimit.mul(gasPrice);
  
      return {
        gasLimit,
        gasPrice,
        totalCost,
      };
    } catch (error) {
      console.error('Gas estimation error:', error);
      throw new Error(`Failed to estimate gas: ${error}`);
    }
  }
  