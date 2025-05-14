import { useState, useCallback } from 'react';
import { Account } from 'fuels';
import { TokenData } from '../utils/constants';

/**
 * Hook for fetching token balances
 */
export const useTokenBalance = (wallet: Account | null) => {
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch a single token balance
   */
  const fetchTokenBalance = useCallback(async (token: TokenData) => {
    if (!wallet) return;

    try {
      const balance = await wallet.getBalance(token.assetID);
      const formattedBalance = balance.format({ units: 9 }).toString();
      
      setTokenBalances(prev => ({
        ...prev,
        [token.symbol]: formattedBalance
      }));
      
      return formattedBalance;
    } catch (err) {
      console.error(`Error fetching balance for ${token.symbol}:`, err);
      return null;
    }
  }, [wallet]);

  /**
   * Fetch all token balances
   */
  const fetchAllBalances = useCallback(async (tokens: TokenData[]) => {
    if (!wallet) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const promises = tokens.map(token => fetchTokenBalance(token));
      await Promise.all(promises);
    } catch (err) {
      console.error('Error fetching all balances:', err);
      setError('Failed to fetch token balances');
    } finally {
      setIsLoading(false);
    }
  }, [wallet, fetchTokenBalance]);

  return {
    tokenBalances,
    isLoading,
    error,
    fetchTokenBalance,
    fetchAllBalances
  };
};

export default useTokenBalance; 