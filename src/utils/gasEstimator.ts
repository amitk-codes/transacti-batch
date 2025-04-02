import { BigNumber, providers } from "ethers";

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