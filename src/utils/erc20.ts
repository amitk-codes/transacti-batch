import { BigNumber, Contract, ethers } from 'ethers';

// ERC20 token minimal interface ABI
const ERC20_ABI = [
    // Read-only functions
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
    'function totalSupply() view returns (uint256)',
    'function allowance(address owner, address spender) view returns (uint256)',

    // Authenticated functions
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)'
];

/**
 * Get an ERC20 token contract instance
 * @param tokenAddress The address of the ERC20 token
 * @param providerOrSigner An ethers.js provider or signer
 * @returns An ethers.js Contract instance for the ERC20 token
 */
export function getERC20Contract(
    tokenAddress: string,
    providerOrSigner: ethers.providers.Provider | ethers.Signer
): Contract {
    return new ethers.Contract(tokenAddress, ERC20_ABI, providerOrSigner);
}

/**
 * Check if a token contract has sufficient allowance for a spender
 * @param tokenAddress The address of the ERC20 token
 * @param ownerAddress The address of the token owner
 * @param spenderAddress The address of the spender
 * @param amountNeeded The amount needed for the transaction
 * @param provider An ethers.js provider
 * @returns A promise that resolves to a boolean indicating if the allowance is sufficient
 */
export async function hasEnoughAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    amountNeeded: BigNumber,
    provider: ethers.providers.Provider
): Promise<boolean> {
    const tokenContract = getERC20Contract(tokenAddress, provider);
    const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
    return allowance.gte(amountNeeded);
}


/**
 * Get information about an ERC20 token
 * @param tokenAddress The address of the ERC20 token
 * @param provider An ethers.js provider
 * @returns A promise that resolves to an object with token information
 */
export async function getTokenInfo(
    tokenAddress: string,
    provider: ethers.providers.Provider
): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: BigNumber;
}> {
    const tokenContract = getERC20Contract(tokenAddress, provider);

    const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply()
    ]);

    return {
        name,
        symbol,
        decimals,
        totalSupply
    };
}

/**
 * Format a token amount from wei to a human-readable format
 * @param amount The amount in wei (or smallest token unit)
 * @param decimals The number of decimals the token has
 * @returns A formatted string representation of the amount
 */
export function formatTokenAmount(amount: BigNumber, decimals: number): string {
    return ethers.utils.formatUnits(amount, decimals);
}

/**
 * Parse a token amount from a human-readable format to wei
 * @param amount The amount as a string
 * @param decimals The number of decimals the token has
 * @returns A BigNumber representing the amount in wei (or smallest token unit)
 */
export function parseTokenAmount(amount: string, decimals: number): BigNumber {
    return ethers.utils.parseUnits(amount, decimals);
}