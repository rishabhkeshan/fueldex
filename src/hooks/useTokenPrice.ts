import { useState, useCallback, useEffect } from 'react';
import { BASE_URL } from '../utils/constants';

/**
 * Hook for fetching token prices
 */
export const useTokenPrice = () => {
  const [fromTokenPrice, setFromTokenPrice] = useState<number | null>(null);
  const [toTokenPrice, setToTokenPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFromSymbol, setCurrentFromSymbol] = useState<string>('');
  const [currentToSymbol, setCurrentToSymbol] = useState<string>('');

  /**
   * Fetch token prices for trading pair
   */
  const fetchTokenPrices = useCallback(async (fromSymbol: string, toSymbol: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentFromSymbol(fromSymbol);
    setCurrentToSymbol(toSymbol);

    try {
      const [fromResponse, toResponse] = await Promise.all([
        fetch(`${BASE_URL}/price/${fromSymbol}`),
        fetch(`${BASE_URL}/price/${toSymbol}`)
      ]);

      if (!fromResponse.ok || !toResponse.ok) {
        throw new Error('Failed to fetch one or more token prices');
      }

      const fromData = await fromResponse.json();
      const toData = await toResponse.json();

      const newFromPrice = fromData.price;
      const newToPrice = toData.price;

      console.log('Fetched prices:', { from: newFromPrice, to: newToPrice });
      
      setFromTokenPrice(newFromPrice);
      setToTokenPrice(newToPrice);

      return { newFromPrice, newToPrice };
    } catch (err) {
      setError('Failed to fetch prices');
      setFromTokenPrice(null);
      setToTokenPrice(null);
      console.error('Error fetching prices:', err);
      return { newFromPrice: null, newToPrice: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up interval for price updates
  useEffect(() => {
    if (!currentFromSymbol || !currentToSymbol) return;

    // Initial fetch
    fetchTokenPrices(currentFromSymbol, currentToSymbol);

    // Set up interval for subsequent fetches
    const intervalId = setInterval(() => {
      fetchTokenPrices(currentFromSymbol, currentToSymbol);
    }, 10000); // 10 seconds

    // Cleanup interval on unmount or when symbols change
    return () => clearInterval(intervalId);
  }, [currentFromSymbol, currentToSymbol, fetchTokenPrices]);

  return {
    fromTokenPrice,
    toTokenPrice,
    isLoading,
    error,
    fetchTokenPrices
  };
};

export default useTokenPrice; 