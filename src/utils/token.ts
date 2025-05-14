import { Account, bn } from 'fuels';
import { toast } from 'react-hot-toast';
import { BASE_URL } from './constants';
import { TokenData } from './constants';

/**
 * Gets the mint amount for a specific token symbol
 */
export const getMintAmount = (symbol: string): number => {
  switch (symbol) {
    case 'ETH':
      return 100000000;
    case 'FUEL':
      return 100000000000;
    case 'BTC':
      return 100000000;
    case 'USDC':
      return 10000000000;
    default:
      return 100000000;
  }
};

/**
 * Mints a specific token for testing purposes
 */
export const mintToken = async (token: TokenData, wallet: Account | null) => {
  if (!wallet) {
    toast.error('Please connect your wallet first');
    return;
  }

  try {
    const balance = await wallet.getBalance(token.assetID);
    const mintAmountNumber = getMintAmount(token.symbol);
    const mintAmountInSmallestUnitBN = bn(mintAmountNumber);

    if (balance.gt(mintAmountInSmallestUnitBN.mul(2))) {
      toast.error(`You already have sufficient ${token.symbol} balance.`);
      return;
    }
  } catch (error) {
     console.error(`Error checking balance for ${token.symbol}:`, error);
     toast.error(`Could not check ${token.symbol} balance. Please try again.`);
     return;
  }

  return toast.promise(
    fetch(`${BASE_URL}/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenName: token.symbol,
        address: wallet.address.toB256(),
        amount: getMintAmount(token.symbol)
      })
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to mint');
      }
      return response.json();
    }),
    {
      loading: `Minting ${token.symbol}...`,
      success: `Successfully minted ${token.symbol}!`,
      error: `Failed to mint ${token.symbol}`,
    }
  );
};

/**
 * Mints all tokens for a wallet
 */
export const mintAllTokens = async (wallet: Account | null) => {
  if (!wallet) return;
  
  try {
    const response = await fetch(`${BASE_URL}/mint-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: wallet.address.toB256(),
      })
    });
    
    if (!response.ok) {
      throw new Error('Mint all request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error minting all tokens:', error);
    throw error;
  }
}; 