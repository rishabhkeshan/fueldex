import React, { useRef, useEffect, useState } from 'react';
import { useWallet, useIsConnected } from '@fuels/react';
import SwapInputRow from './SwapInputRow';
import TokenSelectModal from './TokenSelectModal';
import ArrowPathIcon from '../../assets/arrowpath.svg';
import useTokenSwap from '../../hooks/useTokenSwap';
import useTokenBalance from '../../hooks/useTokenBalance';
import useFaucet from '../../hooks/useFaucet';
import { executeSwap } from '../../utils/swap.tsx';
import { AVAILABLE_TOKENS, TokenData, BASE_ETH_TOKEN } from '../../utils/constants';
import TransactionModal from './TransactionModal';
import FaucetModal from './FaucetModal';
import { bn, type Coin } from "fuels";
import SwapSummary from './SwapSummary';
import { usePreCalculateSwap } from '../../hooks/usePreCalculateSwap';

const SwapForm: React.FC = () => {
  const { wallet } = useWallet();
  const { isConnected } = useIsConnected();
  const hasInitialMintRef = useRef(false);
  const [modalOpen, setModalOpen] = useState<'from' | 'to' | null>(null);
  const [tokenSelectType, setTokenSelectType] = useState<'from' | 'to' | null>(null);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalStatus, setTxModalStatus] = useState<'pending' | 'success'>('pending');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [feeOpen, setFeeOpen] = useState(false);
  const [lastSuccessfulSwapAmount, setLastSuccessfulSwapAmount] = useState<string>('');
  const [lastSuccessfulSwapToAmount, setLastSuccessfulSwapToAmount] = useState<string>('');

  const ethCoinsRef = useRef<Coin[]>([]);
  const btcCoinsRef = useRef<Coin[]>([]);
  const usdcCoinsRef = useRef<Coin[]>([]);
  const fuelCoinsRef = useRef<Coin[]>([]);
  const baseEthCoinsRef = useRef<Coin[]>([]);
  // Swap logic
  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    isSwapping,
    setFromToken,
    setToToken,
    setFromAmount,
    setToAmount,
    setIsSwapping,
    handleSwapTokens,
    setMaxAmount,
    fromTokenPrice,
    toTokenPrice,
    arePricesLoading,
    priceFetchError,
  } = useTokenSwap();

  // Balances
  const {
    tokenBalances,
    fetchTokenBalance,
    fetchAllBalances,
  } = useTokenBalance(wallet,

  );

  // Faucet
  const {
    isMinting,
    mintAllAvailableTokens,
    transferBaseETH
  } = useFaucet(wallet, () => fetchAllBalances(AVAILABLE_TOKENS));

  // Fetch token balances when wallet changes
  useEffect(() => {
    if (wallet) {
      fetchAllBalances([...AVAILABLE_TOKENS, BASE_ETH_TOKEN]);
    }
  }, [wallet, fetchAllBalances]);

  // Update balance when fromToken changes
  useEffect(() => {
    if (wallet) {
      fetchTokenBalance(fromToken);
    }
  }, [fromToken.symbol, wallet, fetchTokenBalance]);

  // Mint tokens on initial wallet connection
  useEffect(() => {
    if (wallet && !hasInitialMintRef.current) {
      hasInitialMintRef.current = true;
      mintAllAvailableTokens();
    }
  }, [isConnected, wallet, mintAllAvailableTokens]);

  // Reset initial mint flag when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      hasInitialMintRef.current = false;
    }
  }, [isConnected]);

  // Monitor and maintain base ETH for gas
  useEffect(() => {
    if (!wallet) return;
    let timeoutId: number;
    const checkBalanceAndTransfer = async () => {
      await transferBaseETH();
      timeoutId = window.setTimeout(checkBalanceAndTransfer, 30000);
    };
    checkBalanceAndTransfer();
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [transferBaseETH, wallet]);

  // Add pre-calculation hook
  const { isPreCalculatedRef, assembledRequestRef } = usePreCalculateSwap({
    fromToken,
    toToken,
    fromAmount,
    bnToAmount: bn.parseUnits("0", 9),
  });

  // Handle swap button click
  const handleSwap = async () => {
    if (!wallet || !fromAmount) return;
    setTxModalOpen(true);
    setTxModalStatus('pending');
    setIsSwapping(true);
    try {
      // Wait for pre-calculation to complete
      const waitForPreCalculation = () => {
        return new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (isPreCalculatedRef.current && assembledRequestRef.current) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100); // Check every 100ms
        });
      };

      // Wait for pre-calculation to complete
      await waitForPreCalculation();

      let coinsToUse: Coin[] = [];
      if (fromToken.symbol === "ETH") coinsToUse = ethCoinsRef.current;
      if (fromToken.symbol === "BTC") coinsToUse = btcCoinsRef.current;
      if (fromToken.symbol === "USDC") coinsToUse = usdcCoinsRef.current;
      if (fromToken.symbol === "FUEL") coinsToUse = fuelCoinsRef.current;
      let baseEthCoinsToUse: Coin[] = [];
      baseEthCoinsToUse = baseEthCoinsRef.current;
      const bnToAmount = bn.parseUnits("0", 9);
      const tx = await executeSwap({
        wallet,
        fromToken,
        toToken,
        fromAmount,
        bnToAmount,
        coins: coinsToUse,
        baseEthCoins: baseEthCoinsToUse,
        ethCoinsRef,
        btcCoinsRef,
        usdcCoinsRef,
        fuelCoinsRef,
        baseEthCoinsRef,
        preCalculatedRequest: assembledRequestRef.current || undefined,
      });
      if (tx) {
        setLastSuccessfulSwapAmount(fromAmount);
        setLastSuccessfulSwapToAmount(bn(tx.buyTokenAmount).formatUnits(toToken.decimals).toString());
        setTxModalStatus('success');
        setTxHash(tx.transactionId);
        setFromAmount("");
        setToAmount("");
        await fetchAllBalances([...AVAILABLE_TOKENS, BASE_ETH_TOKEN]);
      } else {
        setTxModalOpen(false);
      }
    } finally {
      setIsSwapping(false);
    }
  };

  // Modal select handler
  const handleTokenSelect = (token: TokenData) => {
    if (tokenSelectType === 'from') {
      setFromToken(token);
    } else if (tokenSelectType === 'to') {
      setToToken(token);
    }
    setModalOpen(null);
    setTokenSelectType(null);
  };

  // Price display logic (like SwapComponentRefactored)
  let priceDisplay = 'N/A';
  if (arePricesLoading) {
    priceDisplay = '...';
  } else if (fromTokenPrice && toTokenPrice && toTokenPrice > 0) {
    priceDisplay = (fromTokenPrice / toTokenPrice).toLocaleString('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    });
  }
  const totalFee = '$0.38'; // TODO: get real fee

  // Helper function to calculate and format dollar value
  const calculateDollarValue = (amount: string, price: number | null | undefined): string => {
    if (!amount || isNaN(Number(amount)) || !price) return '$0.00';
    return `$${(Number(amount) * price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    })}`;
  };

  return (
    <>
      <FaucetModal open={isMinting} />
      <form className="w-11/12 sm:w-full max-w-xl mx-auto bg-[#FAF7F2] border-[#181A22] rounded-lg border-2 shadow p-3 sm:p-6">
        {/* Token Select Modal */}
        <TokenSelectModal
          open={!!modalOpen}
          onClose={() => {
            setModalOpen(null);
            setTokenSelectType(null);
          }}
          tokens={AVAILABLE_TOKENS}
          onSelect={handleTokenSelect}
          excludeToken={
            modalOpen === "from" ? toToken.symbol : fromToken.symbol
          }
        />
        <div className="flex flex-col gap-2 sm:gap-4">
          {/* From label and balance */}
          <div className="flex justify-between items-center text-xs sm:text-sm text-[#A1A1AA] -mb-1 sm:-mb-3">
            <span className="text-[#0E111E]">From</span>
            <span>
              Balance: {tokenBalances[fromToken.symbol] || "0.000000"}
              <span
                className="ml-1 underline cursor-pointer text-[#181A22] font-semibold"
                onClick={() => {
                  const maxAmount = (
                    tokenBalances[fromToken.symbol] || "0.000000"
                  ).replace(/,/g, "");
                  setMaxAmount(maxAmount);
                }}
              >
                MAX
              </span>
            </span>
          </div>
          <SwapInputRow
            tokenLabel={fromToken.symbol}
            tokenIcon={fromToken.icon}
            onTokenClick={() => {
              setModalOpen("from");
              setTokenSelectType("from");
            }}
            amount={fromAmount}
            onAmountChange={setFromAmount}
            placeholder="Choose coin"
          />
          <div className="flex justify-end text-xs sm:text-sm text-[#A1A1AA] -mt-1 sm:-mt-3">
            {calculateDollarValue(fromAmount, fromTokenPrice)}
          </div>

          {/* Swap icon divider */}
          <div className="flex items-center my-1">
            <div className="flex-1 border-t-2 border-[#181A22]" />
            <button
              type="button"
              className="mx-2 rounded-full p-2 border border-[#181A22] flex items-center justify-center bg-[#181A22]"
              onClick={handleSwapTokens}
            >
              <img src={ArrowPathIcon} alt="Swap" className="w-8 h-8" />
            </button>
            <div className="flex-1 border-t-2 border-[#181A22]" />
          </div>

          {/* To label and input row */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs sm:text-sm text-[#A1A1AA]">
              <span className="text-[#0E111E]">To</span>
              <span>
                Balance: {tokenBalances[toToken.symbol] || "0.000000"}
              </span>
            </div>
            <SwapInputRow
              tokenLabel={toToken.symbol}
              tokenIcon={toToken.icon}
              onTokenClick={() => {
                setModalOpen("to");
                setTokenSelectType("to");
              }}
              amount={toAmount}
              onAmountChange={setToAmount}
              placeholder="Choose coin"
            />
          </div>
          <div className="flex justify-end text-xs sm:text-sm text-[#A1A1AA] -mt-1 sm:-mt-3">
            {calculateDollarValue(toAmount, toTokenPrice)}
          </div>
        </div>
      </form>
      {/* Place Order Button and info below the form */}
      <div className="w-11/12 sm:w-full max-w-xl mx-auto flex flex-col items-center mt-2">
        <button
          type="button"
          className={`w-full ${
            isConnected && parseFloat(fromAmount) > 0 && 
            bn.parseUnits(fromAmount, fromToken.decimals).lte(bn.parseUnits(tokenBalances[fromToken.symbol] || "0", fromToken.decimals))
              ? "bg-[#181A22]"
              : "bg-[#A1A1AA]"
          } text-white rounded-lg py-3 sm:py-4 font-bold text-base sm:text-lg mt-4 cursor-pointer disabled:cursor-not-allowed`}
          disabled={
            isSwapping || 
            !wallet || 
            parseFloat(fromAmount) <= 0 || 
            bn.parseUnits(fromAmount, fromToken.decimals).gt(bn.parseUnits(tokenBalances[fromToken.symbol] || "0", fromToken.decimals))
          }
          onClick={handleSwap}
        >
          {isSwapping
            ? "Swapping..."
            : !wallet
            ? "Connect Wallet"
            : parseFloat(fromAmount) <= 0 || fromAmount === ""
            ? "Enter an Amount"
            : bn.parseUnits(fromAmount, fromToken.decimals).gt(bn.parseUnits(tokenBalances[fromToken.symbol] || "0", fromToken.decimals))
            ? "Insufficient Balance"
            : "Place Order"}
        </button>
        <div className="text-center text-xs sm:text-sm text-[#A1A1AA] mt-2">
          {wallet ? "" : "Connect your wallet to proceed"}
        </div>
        {/* Price info row: always visible */}
        <div className="w-full flex items-center justify-between px-1">
          <div className="text-[#0E111E] text-xs font-medium flex items-center">
            1 {fromToken.symbol} ={" "}
            {arePricesLoading ? (
              <svg
                className="inline w-4 h-4 animate-spin mx-1 text-[#181A1A]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#181A22"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="#181A22"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : (
              <>
                {priceDisplay} {toToken.symbol}
              </>
            )}
            {priceFetchError && (
              <span className="text-[#E74C3C] ml-2 text-xs">Error</span>
            )}
          </div>
          {/* Fee summary and dropdown: only if amount is valid */}
          {((fromAmount &&
            !isNaN(Number(fromAmount)) &&
            Number(fromAmount) > 0) ||
            (toAmount && !isNaN(Number(toAmount)) && Number(toAmount) > 0)) && (
            <button
              type="button"
              className="flex items-center text-[#A1A1AA] text-xs font-medium hover:opacity-80 outline-none"
              onClick={() => setFeeOpen((o) => !o)}
            >
              <svg
                className="w-5 h-5 mr-1 -mt-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="7"
                  y="13"
                  width="10"
                  height="8"
                  rx="2"
                  fill="#A1A1AA"
                />
              </svg>
              {totalFee}
              <svg
                className={`ml-1 w-4 h-4 transition-transform ${
                  feeOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
        {/* Fee breakdown (expandable) */}
        {feeOpen &&
          ((fromAmount &&
            !isNaN(Number(fromAmount)) &&
            Number(fromAmount) > 0) ||
            (toAmount && !isNaN(Number(toAmount)) && Number(toAmount) > 0)) && (
            <div className="w-full mt-2">
              <SwapSummary />
            </div>
          )}
      </div>
      <TransactionModal
        open={txModalOpen}
        status={txModalStatus}
        onClose={() => {
          setTxModalOpen(false);
          setLastSuccessfulSwapAmount('');
          setLastSuccessfulSwapToAmount('');
        }}
        fromAmount={txModalStatus === 'success' ? lastSuccessfulSwapAmount : fromAmount}
        fromSymbol={fromToken.symbol}
        toAmount={txModalStatus === 'success' ? lastSuccessfulSwapToAmount : toAmount}
        toSymbol={toToken.symbol}
        txHash={txHash}
      />
    </>
  );
};

export default SwapForm; 