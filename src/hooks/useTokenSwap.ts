import { useState, useEffect, useCallback } from 'react';
import { TokenData, AVAILABLE_TOKENS } from '../utils/constants';
import { calculateTokenAmount } from '../utils/swap.tsx';
import useTokenPrice from './useTokenPrice';

/**
 * Hook to manage swap-related state and operations
 */
export const useTokenSwap = () => {
  const [fromToken, setFromToken] = useState<TokenData>(AVAILABLE_TOKENS[0]);
  const [toToken, setToToken] = useState<TokenData>(AVAILABLE_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState(false);
  
  const { 
    fromTokenPrice, 
    toTokenPrice, 
    isLoading: arePricesLoading,
    error: priceFetchError,
    fetchTokenPrices 
  } = useTokenPrice();

  // Initialize token prices on token change
  useEffect(() => {
    setFromAmount('');
    setToAmount('');
    if (fromToken && toToken) {
      fetchTokenPrices(fromToken.symbol, toToken.symbol);
    }
  }, [fromToken.symbol, toToken.symbol, fetchTokenPrices]);

  /**
   * Handle swapping token positions
   */
  const handleSwapTokens = useCallback(() => {
    setFromToken(prevFromToken => {
      setToToken(prevFromToken);
      return toToken;
    });
    setFromAmount('');
    setToAmount('');
  }, [toToken]);

  /**
   * Handle "from" amount change
   */
  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value);
    
    const numericValue = parseFloat(value);
    
    if (!isNaN(numericValue) && numericValue > 0 && fromTokenPrice && toTokenPrice && toTokenPrice > 0) {
      const calculatedAmount = calculateTokenAmount(
        value, 
        fromTokenPrice, 
        toTokenPrice,
        'from-to'
      );
      setToAmount(calculatedAmount);
    } else if (value === '' || numericValue === 0) {
      setToAmount('');
    }
  }, [fromTokenPrice, toTokenPrice]);

  /**
   * Handle "to" amount change
   */
  const handleToAmountChange = useCallback((value: string) => {
    setToAmount(value);
    
    const numericValue = parseFloat(value);
    
    if (!isNaN(numericValue) && numericValue > 0 && fromTokenPrice && toTokenPrice && fromTokenPrice > 0) {
      const calculatedAmount = calculateTokenAmount(
        value, 
        fromTokenPrice, 
        toTokenPrice,
        'to-from'
      );
      setFromAmount(calculatedAmount);
    } else if (value === '' || numericValue === 0) {
      setFromAmount('');
    }
  }, [fromTokenPrice, toTokenPrice]);

  /**
   * Refresh price data
   */
  const handlePriceRefresh = useCallback(async () => {
    if (fromToken && toToken) {
      // Fetch prices and get the new values
      const { newFromPrice, newToPrice } = await fetchTokenPrices(fromToken.symbol, toToken.symbol);

      // Recalculate 'toAmount' if 'fromAmount' exists and new prices are valid
      const currentFromAmount = parseFloat(fromAmount);
      if (!isNaN(currentFromAmount) && currentFromAmount > 0 && newFromPrice && newToPrice && newToPrice > 0) {
        const calculatedToAmount = calculateTokenAmount(
          fromAmount,
          newFromPrice,
          newToPrice,
          'from-to'
        );
        setToAmount(calculatedToAmount);
      }
    }
  }, [fromToken, toToken, fromAmount, fetchTokenPrices]);

  return {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    fromTokenPrice,
    toTokenPrice,
    arePricesLoading,
    priceFetchError,
    isSwapping,
    setFromToken,
    setToToken,
    setFromAmount: handleFromAmountChange,
    setToAmount: handleToAmountChange,
    setIsSwapping,
    handleSwapTokens,
    handlePriceRefresh,
    fetchTokenPrices
  };
};

export default useTokenSwap; 