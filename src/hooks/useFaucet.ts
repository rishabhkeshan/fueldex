import { useState, useCallback } from 'react';
import { bn, Account } from 'fuels';
import { toast } from 'react-hot-toast';
import { TokenData, BASE_URL, ETH_MINT_THRESHOLD } from '../utils/constants';
import { mintToken } from '../utils/token';
import axios from 'axios';

/**
 * Hook for token fauceting operations
 */
export const useFaucet = (wallet: Account | null, onSuccess?: () => Promise<void>) => {
  const [isMinting, setIsMinting] = useState(false);

  /**
   * Mint a specific token
   */
  const mintSingleToken = useCallback(async (token: TokenData) => {
    if (!wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      await mintToken(token, wallet);
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error(`Error minting ${token.symbol}:`, error);
    }
  }, [wallet, onSuccess]);

  /**
   * Mint all available tokens
   */
  const mintAllAvailableTokens = useCallback(async () => {
    if (!wallet) return;

    setIsMinting(true);
    
    try {
      // Find ETH token data to get its asset ID
      const ethToken = await wallet.provider.getBaseAssetId();
      
      // Check current ETH balance
      const ethBalance = await wallet.getBalance(ethToken);
      console.log("Current ETH Balance:", ethBalance.toString(), "Threshold:", ETH_MINT_THRESHOLD.toString());

      // Only call mint-all if ETH balance is below the threshold
      if (ethBalance.lt(bn(ETH_MINT_THRESHOLD))) {
        console.log("ETH balance low, calling /mint-all endpoint...");
        
        try {
          const response = await axios.post(`${BASE_URL}/mint-all`, {
            address: wallet.address.toB256(),
          });

          if (response.status !== 200 && response.status !== 201) {
             throw new Error('Mint all request failed with status: ' + response.status);
          }

          // Show success toast
        //   toast.success('Tokens fauceted successfully! You can now swap.');

          // Run callback function after successful mint
          if (onSuccess) {
            await onSuccess();
          }

        } catch (error) {
           console.error("Error calling /mint-all:", error);
           toast.error('Failed to faucet tokens, try manually minting');
        }
      } else {
        console.log("ETH balance is sufficient, skipping mint-all.");
        // Execute callback anyway if minting was skipped
        if (onSuccess) {
          await onSuccess();
        }
      }
    } catch (error) {
      console.error('Error during minting setup:', error);
      toast.error('Failed to faucet tokens, try manually minting');
    } finally {
      setIsMinting(false);
    }
  }, [wallet, onSuccess]);

  /**
   * Transfer base ETH to cover gas
   */
  const transferBaseETH = useCallback(async () => {
    if (!wallet) return;
    
    try {
      const baseAssetId = await wallet.provider.getBaseAssetId();
      const balance = await wallet.getBalance(baseAssetId);
      
      if (balance.lt(bn(2900000))) {
        console.log("Transferring base ETH...");
        
        // This is just a placeholder - real implementation would differ
        // This assumes there's an endpoint to request base ETH
        await axios.post(`${BASE_URL}/request-base-eth`, {
          address: wallet.address.toB256(),
        });
        
        return true;
      }
      
      return false; // No transfer needed
    } catch (error) {
      console.error("Error transferring base ETH:", error);
      return false;
    }
  }, [wallet]);

  return {
    isMinting,
    mintSingleToken,
    mintAllAvailableTokens,
    transferBaseETH
  };
};

export default useFaucet; 