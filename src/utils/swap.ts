import { Account, Address, bn, ScriptTransactionRequest } from 'fuels';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BASE_URL } from './constants';
import { logTime } from './timeLogger';

interface SwapParams {
  wallet: Account;
  fromToken: {
    symbol: string;
    assetID: string;
  };
  toToken: {
    symbol: string;
  };
  fromAmount: string;
}

/**
 * Execute a token swap
 */
export const executeSwap = async ({ wallet, fromToken, toToken, fromAmount }: SwapParams) => {
  logTime('swap_initiated', `${fromAmount} ${fromToken.symbol} -> ${toToken.symbol}`);
  
  if (!wallet || !fromAmount) {
    toast.error('Please connect wallet and enter amount');
    return null;
  }

  try {
    const scriptTransactionRequest = new ScriptTransactionRequest();
    logTime('create_transaction_request');

    const sellTokenAmount = bn.parseUnits(fromAmount, 9);
    console.log("Sell token amount:", sellTokenAmount);
    
    logTime('get_resources_start');
    const resources = await wallet.getResourcesToSpend([
      {
        assetId: fromToken.assetID,
        amount: sellTokenAmount,
      },
    ]);
    logTime('get_resources_end');
    
    scriptTransactionRequest.addResources(resources);
    
    logTime('get_base_resources_start');
    const baseResources = await wallet.getResourcesToSpend([
      {
        assetId: await wallet.provider.getBaseAssetId(),
        amount: bn(2000000),
      },
    ]);
    logTime('get_base_resources_end');
    
    scriptTransactionRequest.addResources(baseResources);
    
    const solverAddress = Address.fromB256("0xf8cf8acbe8b4d970c3e1c9ffed11e8b55abfc5287ad7f5e4d0240a4f0651d658");
    scriptTransactionRequest.addCoinOutput(
      solverAddress,
      sellTokenAmount,
      fromToken.assetID
    );
    scriptTransactionRequest.addChangeOutput(
      wallet.address,
      fromToken.assetID
    );
    
    logTime('fill_order_request_start');
    console.log("Sending fill order request to backend...");
    
    const { data } = await axios.post(`${BASE_URL}/fill-order`, {
      scriptRequest: scriptTransactionRequest.toJSON(),
      sellTokenName: fromToken.symbol.toLowerCase(),
      buyTokenName: toToken.symbol.toLowerCase(),
      sellTokenAmount: sellTokenAmount.toString(),
      recepientAddress: wallet.address.toB256(),
    });
    logTime('fill_order_request_end');

    const responseRequest = new ScriptTransactionRequest();
    Object.assign(responseRequest, data.request);
    
    logTime('send_transaction_start');
    const tx = await toast.promise(
      (async () => {
        const tx = await wallet.sendTransaction(responseRequest);
        if (!tx) throw new Error("Failed to send transaction");
        logTime('pre_confirmation_start');
        const preConfirmation = await tx.waitForPreConfirmation();
        logTime('pre_confirmation_end');
        console.log("Pre confirmation:", preConfirmation);
        return tx;
      })(),
      {
        loading: "Swapping tokens...",
        success: (tx) => {
          logTime('send_transaction_success');
          return `Swap successful! Transaction ID: ${tx.id.substring(0, 8)}...${tx.id.substring(tx.id.length - 8)}`;
        },
        error: (err) => {
          logTime('send_transaction_error', `Error: ${err.message}`);
          return "Failed to send transaction";
        },
      }
    );
    
    logTime('swap_completed', `Transaction ID: ${tx.id}`);
    return tx;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Swap error:', error);
    logTime('swap_failed', errorMessage);
    toast.error('Failed to execute swap');
    return null;
  }
};

/**
 * Calculate equivalent token amount based on prices
 */
export const calculateTokenAmount = (
  amount: string,
  fromTokenPrice: number | null, 
  toTokenPrice: number | null,
  direction: 'from-to' | 'to-from'
): string => {
  const numericAmount = parseFloat(amount);
  
  if (isNaN(numericAmount) || numericAmount <= 0 || !fromTokenPrice || !toTokenPrice) {
    return '';
  }
  
  if (direction === 'from-to' && toTokenPrice > 0) {
    return (numericAmount * (fromTokenPrice / toTokenPrice)).toFixed(6);
  } else if (direction === 'to-from' && fromTokenPrice > 0) {
    return (numericAmount * (toTokenPrice / fromTokenPrice)).toFixed(6);
  }
  
  return '';
}; 