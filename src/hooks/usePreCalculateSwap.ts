import { useState, useEffect, useCallback, useRef } from 'react';
import { Provider, Wallet, ScriptTransactionRequest, bn, BN, TransactionRequest } from 'fuels';
import { OrderbookPredicate } from '../out';
import { FUEL_PROVIDER_URL } from '../utils/constants';

interface PreCalculateSwapParams {
  fromToken: {
    symbol: string;
    assetID: string;
  };
  toToken: {
    symbol: string;
    assetID: string;
  };
  fromAmount: string;
  bnToAmount: BN;
  reassembleRequest: boolean;
}

export const usePreCalculateSwap = ({
  fromToken,
  toToken,
  fromAmount,
  bnToAmount,
  reassembleRequest,
}: PreCalculateSwapParams) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [isPreCalculated, setIsPreCalculated] = useState(false);
  const [assembledRequest, setAssembledRequest] = useState<TransactionRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track the latest values
  const isPreCalculatedRef = useRef(false);
  const assembledRequestRef = useRef<TransactionRequest | null>(null);

  const preCalculateSwap = useCallback(async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setAssembledRequest(null);
      setIsPreCalculated(false);
      isPreCalculatedRef.current = false;
      assembledRequestRef.current = null;
      return;
    }

    setIsCalculating(true);
    setError(null);
    setIsPreCalculated(false);
    isPreCalculatedRef.current = false;

    try {
      const provider = new Provider(FUEL_PROVIDER_URL);
      
      // Get burner wallet private key from local storage
      const burnerPrivateKey = localStorage.getItem('burner-wallet-private-key');
      if (!burnerPrivateKey) {
        throw new Error('Burner wallet private key not found');
      }

      // Create burner wallet instance
      const burnerWallet = Wallet.fromPrivateKey(burnerPrivateKey, provider);
      const orderPredicate = new OrderbookPredicate({
        configurableConstants: {
          ASSET_ID_GET: toToken.assetID,
          ASSET_ID_SEND: fromToken.assetID,
          MINIMAL_OUTPUT_AMOUNT: bnToAmount,
          RECEPIENT: burnerWallet.address.b256Address,
        },
        data: [1],
        provider,
      });
      const scriptTransactionRequest = new ScriptTransactionRequest();

      const sellTokenAmount = bn.parseUnits(fromAmount, 9);
      burnerWallet.addTransfer(scriptTransactionRequest, {
        destination: orderPredicate.address,
        amount: sellTokenAmount,
        assetId: fromToken.assetID,
      });
    //   burnerWallet.addTransfer(scriptTransactionRequest, {
    //     destination: orderPredicate.address,
    //     amount: "100000",
    //     assetId: BASE_ASSET_ID,
    //   });
      const {assembledRequest} = await provider.assembleTx({
        request: scriptTransactionRequest,
        feePayerAccount: burnerWallet,
        accountCoinQuantities: [{
          account: burnerWallet,
          amount: sellTokenAmount,
          assetId: fromToken.assetID,
        }]
      });

      setAssembledRequest(assembledRequest);
      setIsPreCalculated(true);
      isPreCalculatedRef.current = true;
      assembledRequestRef.current = assembledRequest;
    } catch (err) {
      console.error('Error pre-calculating swap:', err);
      setError(err instanceof Error ? err.message : 'Failed to pre-calculate swap');
      setAssembledRequest(null);
      setIsPreCalculated(false);
      isPreCalculatedRef.current = false;
      assembledRequestRef.current = null;
    } finally {
      setIsCalculating(false);
    }
  }, [fromAmount, reassembleRequest]);

  // Call preCalculateSwap directly when dependencies change
  useEffect(() => {
    preCalculateSwap();
  }, [preCalculateSwap]);

  return {
    assembledRequest,
    isCalculating,
    isPreCalculated,
    error,
    isPreCalculatedRef,
    assembledRequestRef,
  };
}; 