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

  // Helper function to update amounts based on prices
  const updateAmountsWithPrices = useCallback((
    currentFromAmount: string,
    currentFromPrice: number | null,
    currentToPrice: number | null
  ) => {
    if (currentFromAmount && !isNaN(Number(currentFromAmount)) && Number(currentFromAmount) > 0 
        && currentFromPrice && currentToPrice && currentToPrice > 0) {
      const calculatedAmount = calculateTokenAmount(
        currentFromAmount,
        currentFromPrice,
        currentToPrice,
        'from-to'
      );
      setToAmount(calculatedAmount);
    }
  }, []);

  // Fetch prices when tokens change
  useEffect(() => {
    if (fromToken && toToken) {
      fetchTokenPrices(fromToken.symbol, toToken.symbol);
    }
  }, [fromToken.symbol, toToken.symbol, fetchTokenPrices]);

  // Update amounts when prices or fromAmount changes
  useEffect(() => {
    updateAmountsWithPrices(fromAmount, fromTokenPrice, toTokenPrice);
  }, [fromAmount, fromTokenPrice, toTokenPrice, updateAmountsWithPrices]);

  /**
   * Handle swapping token positions
   */
  const handleSwapTokens = useCallback(() => {
    setFromToken(prevFromToken => {
      setToToken(prevFromToken);
      return toToken;
    });
    // Swap amounts as well
    setFromAmount(prevFromAmount => {
      setToAmount(prevFromAmount);
      return toAmount;
    });
  }, [toToken, toAmount]);

  /**
   * Handle "from" amount change
   */
  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value);
    
    if (value === '' || parseFloat(value) === 0) {
      setToAmount('');
      return;
    }
    
    updateAmountsWithPrices(value, fromTokenPrice, toTokenPrice);
  }, [fromTokenPrice, toTokenPrice, updateAmountsWithPrices]);

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
   * Set maximum amount and calculate corresponding toAmount
   */
  const setMaxAmount = useCallback((maxAmount: string) => {
    setFromAmount(maxAmount);
    updateAmountsWithPrices(maxAmount, fromTokenPrice, toTokenPrice);
  }, [fromTokenPrice, toTokenPrice, updateAmountsWithPrices]);

  /**
   * Refresh price data
   */
  const handlePriceRefresh = useCallback(async () => {
    if (fromToken && toToken) {
      await fetchTokenPrices(fromToken.symbol, toToken.symbol);
    }
  }, [fromToken, toToken, fetchTokenPrices]);

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
    setMaxAmount,
    setIsSwapping,
    handleSwapTokens,
    handlePriceRefresh,
    fetchTokenPrices
  };
};

export default useTokenSwap; 