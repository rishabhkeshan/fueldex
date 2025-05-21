import { useState, useCallback } from 'react';
import { Account } from 'fuels';
import { TokenData } from '../utils/constants';

/**
 * Hook for fetching token balances
 */
export const useTokenBalance = (
  wallet: Account | null,

) => {
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
      // const utxos = await wallet.getCoins(token.assetID);
      // console.log("utxos", utxos);
      const formattedBalance = balance.format({ units: 9 }).toString();
      
      setTokenBalances(prev => ({
        ...prev,
        [token.symbol]: formattedBalance
      }));
      
      // const coinsArray = Array.isArray(utxos) ? utxos : utxos?.coins || [];
      // if (token.symbol === "ETH") ethCoinsRef.current.splice(0, ethCoinsRef.current.length, ...coinsArray);
      // if (token.symbol === "BTC") btcCoinsRef.current.splice(0, btcCoinsRef.current.length, ...coinsArray);
      // if (token.symbol === "USDC") usdcCoinsRef.current.splice(0, usdcCoinsRef.current.length, ...coinsArray);
      // if (token.symbol === "FUEL") fuelCoinsRef.current.splice(0, fuelCoinsRef.current.length, ...coinsArray);
      // if (token.symbol === "BASE_ETH") {
      //   baseEthCoinsRef.current.splice(0, baseEthCoinsRef.current.length, ...coinsArray);
      // }
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