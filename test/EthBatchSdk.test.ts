import { ethers } from 'ethers';
import { TransactiBatch } from '../src/TransactiBatch';

// Mock the entire ethers library
jest.mock('ethers');
// Mock the utility functions
jest.mock('../src/utils/gasEstimator');
jest.mock('../src/utils/erc20');

// Mock data
const MOCK_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
const MOCK_TOKEN_ADDRESS = '0x0987654321098765432109876543210987654321';
const MOCK_RECIPIENT_1 = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const MOCK_RECIPIENT_2 = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const MOCK_AMOUNT_1 = '100000000000000000'; // 0.1 ETH
const MOCK_AMOUNT_2 = '200000000000000000'; // 0.2 ETH
const MOCK_TOKEN_AMOUNT = '1000000000000000000'; // 1 token with 18 decimals

// Import mocked modules
import { estimateGas, getRecommendedGasPrice } from '../src/utils/gasEstimator';
import { getERC20Contract, hasEnoughAllowance } from '../src/utils/erc20';

describe('TransactiBatch', () => {
  let sdk: TransactiBatch;

  // Create simpler BigNumber mock
  const mockBigNumber = {
    from: jest.fn().mockImplementation((value) => {
      const instance = {
        _value: value,
        toString: () => String(value),
        add: jest.fn().mockImplementation((other) => {
          const otherValue = typeof other === 'object' && other._value ? other._value : other;
          return {
            _value: Number(value) + Number(otherValue),
            toString: () => String(Number(value) + Number(otherValue)),
            add: jest.fn().mockImplementation((nextOther) => {
              const nextOtherValue = typeof nextOther === 'object' && nextOther._value ? nextOther._value : nextOther;
              return {
                _value: Number(value) + Number(otherValue) + Number(nextOtherValue),
                toString: () => String(Number(value) + Number(otherValue) + Number(nextOtherValue))
              }
            })
          };
        })
      };
      return instance;
    })
  };

  const mockUtils = {
    parseEther: jest.fn().mockImplementation((value) => value + '000000000000000000'),
    parseUnits: jest.fn().mockImplementation((value, unit) => value + '000000000')
  };

  // Mock signer with proper structure
  const mockSigner = {
    _isSigner: true,
    getAddress: jest.fn().mockResolvedValue('0xmockaddress'),
    signMessage: jest.fn().mockResolvedValue('0xmocksignature'),
    signTransaction: jest.fn().mockResolvedValue('0xmocksignedtx'),
    sendTransaction: jest.fn().mockResolvedValue({ hash: '0xmocktxhash' })
  };

  // Mock provider
  const mockProvider = {
    getNetwork: jest.fn().mockResolvedValue({ chainId: 1, name: 'mainnet' })
  };

  // Connected mock contract (with signer property)
  const mockContract = {
    signer: mockSigner,
    connect: jest.fn().mockReturnThis(),
    multiTransfer_OST: jest.fn().mockResolvedValue({ hash: '0xmocktxhash1' }),
    multiTransferEqual_L1R: jest.fn().mockResolvedValue({ hash: '0xmocktxhash2' }),
    multiTransferToken_a4A: jest.fn().mockResolvedValue({ hash: '0xmocktxhash3' }),
    multiTransferTokenEqual_1vz: jest.fn().mockResolvedValue({ hash: '0xmocktxhash4' })
  };

  // Mock ERC20 contract with signer
  const mockErc20Contract = {
    signer: mockSigner,
    approve: jest.fn().mockResolvedValue({ hash: '0xapprovetxhash' })
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup ethers mocks
    (ethers.BigNumber as any) = mockBigNumber;
    (ethers.utils as any) = mockUtils;

    // Type casting required to avoid TypeScript errors
    ((ethers.providers.JsonRpcProvider as unknown) as jest.Mock).mockImplementation(() => mockProvider);
    ((ethers.Contract as unknown) as jest.Mock).mockImplementation(() => mockContract);

    // Setup utility mocks
    (estimateGas as jest.Mock).mockResolvedValue({
      gasLimit: { toString: () => '200000' },
      gasPrice: { toString: () => '50000000000' },
      totalCost: { toString: () => '10000000000000000' }
    });

    (getRecommendedGasPrice as jest.Mock).mockResolvedValue({
      slow: { toString: () => '40000000000' },
      average: { toString: () => '50000000000' },
      fast: { toString: () => '60000000000' }
    });

    (getERC20Contract as jest.Mock).mockReturnValue(mockErc20Contract);
    (hasEnoughAllowance as jest.Mock).mockResolvedValue(true);

    // Initialize SDK
    sdk = new TransactiBatch({
      provider: 'https://mock.infura.io/v3/mock',
      contractAddress: MOCK_CONTRACT_ADDRESS
    });

    // Connect with signer - the contract is already set up with a signer
    sdk.connect(mockSigner as any);
  });

  it('should correctly initialize the SDK', () => {
    expect(sdk).toBeDefined();
    expect(sdk.getContractAddress()).toBe(MOCK_CONTRACT_ADDRESS);
    expect(ethers.Contract).toHaveBeenCalledWith(
      MOCK_CONTRACT_ADDRESS,
      expect.any(Array),
      expect.any(Object)
    );
  });

  it('should send a batch of ETH to multiple recipients', async () => {
    const tx = await sdk.sendEthBatch({
      recipients: [
        { address: MOCK_RECIPIENT_1, amount: MOCK_AMOUNT_1 },
        { address: MOCK_RECIPIENT_2, amount: MOCK_AMOUNT_2 }
      ]
    });

    expect(tx.hash).toBe('0xmocktxhash1');
    expect(mockContract.multiTransfer_OST).toHaveBeenCalled();
  });

  it('should estimate gas for ETH batch transaction', async () => {
    const gasEstimation = await sdk.estimateEthBatchGas({
      recipients: [
        { address: MOCK_RECIPIENT_1, amount: MOCK_AMOUNT_1 },
        { address: MOCK_RECIPIENT_2, amount: MOCK_AMOUNT_2 }
      ]
    });

    expect(gasEstimation).toHaveProperty('gasLimit');
    expect(gasEstimation).toHaveProperty('gasPrice');
    expect(gasEstimation).toHaveProperty('totalCost');
    expect(estimateGas).toHaveBeenCalled();
  });

  it('should get recommended gas prices', async () => {
    const gasPrices = await sdk.getGasPrices();

    expect(gasPrices).toHaveProperty('slow');
    expect(gasPrices).toHaveProperty('average');
    expect(gasPrices).toHaveProperty('fast');
    expect(getRecommendedGasPrice).toHaveBeenCalled();
  });

  it('should send a batch of ERC-20 tokens to multiple recipients', async () => {
    const tx = await sdk.sendTokenBatch({
      tokenAddress: MOCK_TOKEN_ADDRESS,
      recipients: [
        { address: MOCK_RECIPIENT_1, amount: MOCK_TOKEN_AMOUNT },
        { address: MOCK_RECIPIENT_2, amount: MOCK_TOKEN_AMOUNT }
      ]
    });

    expect(tx.hash).toBe('0xmocktxhash3');
    expect(mockContract.multiTransferToken_a4A).toHaveBeenCalled();
  });

  it('should estimate gas for token batch transaction', async () => {
    const gasEstimation = await sdk.estimateTokenBatchGas({
      tokenAddress: MOCK_TOKEN_ADDRESS,
      recipients: [
        { address: MOCK_RECIPIENT_1, amount: MOCK_TOKEN_AMOUNT },
        { address: MOCK_RECIPIENT_2, amount: MOCK_TOKEN_AMOUNT }
      ]
    });

    expect(gasEstimation).toHaveProperty('gasLimit');
    expect(gasEstimation).toHaveProperty('gasPrice');
    expect(gasEstimation).toHaveProperty('totalCost');
    expect(estimateGas).toHaveBeenCalled();
  });

  it('should approve token spending', async () => {
    const tx = await sdk.approveTokenSpending(
      MOCK_TOKEN_ADDRESS,
      '10000000000000000000' // 10 tokens
    );

    expect(tx.hash).toBe('0xapprovetxhash');
    expect(getERC20Contract).toHaveBeenCalledWith(MOCK_TOKEN_ADDRESS, expect.any(Object));
    expect(mockErc20Contract.approve).toHaveBeenCalled();
  });
});