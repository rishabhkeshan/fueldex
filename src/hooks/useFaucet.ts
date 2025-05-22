import { useState, useCallback, useEffect } from 'react';
import { bn, Account, WalletUnlocked, Provider } from 'fuels';
import { toast } from 'react-hot-toast';
import { TokenData, BASE_URL, ETH_MINT_THRESHOLD, BASE_ASSET_ID } from '../utils/constants';
import { mintToken } from '../utils/token';
import axios from 'axios';
import { Wallet } from 'fuels';
import { FUEL_PROVIDER_URL } from '../utils/constants';

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
      const ethToken = "0xcb6e26678af543595ff091dccb3697a8216afaf26e802b5debdac5a7b7dd9bd3";
      
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
    // console.log("Transferring base ETH...");
    const ETHBalance = await wallet.getBalance(BASE_ASSET_ID);
    if (ETHBalance.lt(2900000)) {
      try {
        const provider = new Provider(FUEL_PROVIDER_URL);
        const transferWallet: WalletUnlocked = Wallet.fromPrivateKey(
          "0x2822e732c67f525cdf1df36a92a69fa16fcd25e1eee3e5be604b386ca6a5898d",
          provider
        );
        const baseAssetId = await provider.getBaseAssetId();
        const tx = await transferWallet.transfer(wallet.address, 3000000, baseAssetId);
        tx.waitForResult();
        // console.log("final", final);
      } catch (error) {
        console.error("Error transferring fuel:", error);
      }
    }
  }, [wallet]);

  // Monitor and maintain base ETH for gas
  useEffect(() => {
    if (!wallet) return;

    let timeoutId: number;

    const checkBalanceAndTransfer = async () => {
      const ETHBalance = await wallet.getBalance(BASE_ASSET_ID);
      if (ETHBalance.lt(2900000)) {
        await transferBaseETH();
        // If balance is low, check again in 2 seconds
        timeoutId = window.setTimeout(checkBalanceAndTransfer, 2000);
      } else {
        // If balance is sufficient, wait 30 seconds before next check
        timeoutId = window.setTimeout(checkBalanceAndTransfer, 30000);
      }
    };

    // Initial check
    checkBalanceAndTransfer();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [wallet]);

  return {
    isMinting,
    mintSingleToken,
    mintAllAvailableTokens,
    transferBaseETH
  };
};

export default useFaucet; 