# TransactiBatch SDK

The TransactiBatch SDK allows you to batch send ETH and ERC-20 tokens to multiple recipients in an easy and efficient way.

## Open Source Contract Addresses

The open-source contract that was used is deployed on the following contract addresses:-

- **Ethereum Mainnet**: 0xcd5485b34c9902527bbee21f69312fe2a73bc802
- **Ethereum Sepolia Testnet**: 0x77913766661274651d367A013861B64111E77A3f
- **Ethereum Holesky Testnet**: 0x068F8339905E65DA559cB6066E0d9F94C3E3b979
- **BSC Mainnet**: 0xe5c6BABcB9209994a989C0339d90fa4a120F0CB6
- **BSC Testnet**: 0x0fd9EDCC7207fF58f88cCA86f4A38aA562F1235a
- **Polygon Mainnet**: 0xe5c6BABcB9209994a989C0339d90fa4a120F0CB6
- **Polygon Amoy Testnet**: 0x068F8339905E65DA559cB6066E0d9F94C3E3b979

## Overview

This SDK enables users to send ETH and ERC-20 tokens in batches, providing a simple way to manage large-scale transfers across multiple addresses. The primary functionalities include:

- Sending ETH to multiple recipients
- Sending equal amounts of ETH to multiple recipients
- Sending ERC-20 tokens to multiple recipients
- Sending equal amounts of ERC-20 tokens to multiple recipients
- Combining both ERC-20 tokens and ETH in a single transaction
- Estimating gas usage for batch transactions

## Usage

1. **Initialization**: First, initialize the SDK with a provider (e.g., an Infura URL or a local provider) and contract address.

2. **Connecting a Signer**: To sign transactions, connect a signer (e.g., a wallet with your private key).

3. **Batch Sending ETH and ERC-20 Tokens**: You can send ETH and ERC-20 tokens in batches, either by specifying individual amounts for each recipient or by sending equal amounts to all recipients in the batch.

4. **Estimating Gas**: Before sending a transaction, you can estimate the gas required for batch operations to ensure efficient execution.

5. **Approving Token Spending**: Before transferring ERC-20 tokens, you may need to approve the contract to spend tokens on your behalf.

## Features

- **ETH Transactions**: Send ETH to multiple addresses in one batch.
- **ERC-20 Token Transactions**: Send ERC-20 tokens to multiple addresses in one batch.
- **Mixed Transactions**: Send both ETH and ERC-20 tokens to multiple addresses in one batch.
- **Gas Estimation**: Estimate the gas required for any batch transaction to ensure that the transaction will be processed efficiently.

## Error Handling

The SDK ensures that errors are thrown for missing parameters, insufficient allowances, or invalid network configurations. You should handle these errors properly to avoid failures in batch transactions.
