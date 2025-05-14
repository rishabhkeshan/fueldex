import React, { useRef, useEffect, useState } from 'react';
import { useWallet, useIsConnected } from '@fuels/react';
import SwapInputRow from './SwapInputRow';
import SwapSummary from './SwapSummary';
import TokenSelectModal from './TokenSelectModal';
import ArrowPathIcon from '../../assets/arrowpath.svg';
import useTokenSwap from '../../hooks/useTokenSwap';
import useTokenBalance from '../../hooks/useTokenBalance';
import useFaucet from '../../hooks/useFaucet';
import { executeSwap } from '../../utils/swap.tsx';
import { AVAILABLE_TOKENS, TokenData } from '../../utils/constants';
import TransactionModal from './TransactionModal';
import FaucetModal from './FaucetModal';

const SwapForm: React.FC = () => {
  const { wallet } = useWallet();
  const { isConnected } = useIsConnected();
  const hasInitialMintRef = useRef(false);
  const [modalOpen, setModalOpen] = useState<'from' | 'to' | null>(null);
  const [tokenSelectType, setTokenSelectType] = useState<'from' | 'to' | null>(null);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalStatus, setTxModalStatus] = useState<'pending' | 'success'>('pending');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

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
  } = useTokenSwap();

  // Balances
  const {
    tokenBalances,
    fetchTokenBalance,
    fetchAllBalances,
  } = useTokenBalance(wallet);

  // Faucet
  const {
    isMinting,
    mintAllAvailableTokens,
    transferBaseETH
  } = useFaucet(wallet, () => fetchAllBalances(AVAILABLE_TOKENS));

  // Fetch token balances when wallet changes
  useEffect(() => {
    if (wallet) {
      fetchAllBalances(AVAILABLE_TOKENS);
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

  // Handle swap button click
  const handleSwap = async () => {
    if (!wallet || !fromAmount) return;
    setTxModalOpen(true);
    setTxModalStatus('pending');
    setIsSwapping(true);
    try {
      const tx = await executeSwap({
        wallet,
        fromToken,
        toToken,
        fromAmount
      });
      if (tx) {
        setTxModalStatus('success');
        setTxHash(tx.id);
        tx.waitForResult().then(async () => {
          await fetchAllBalances(AVAILABLE_TOKENS);
        });
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
        />
        <div className="flex flex-col gap-2 sm:gap-4">
          {/* From label and balance */}
          <div className="flex justify-between items-center text-xs sm:text-sm text-[#A1A1AA] -mb-1 sm:-mb-3">
            <span>From</span>
            <span>
              Balance: {tokenBalances[fromToken.symbol] || "0.000000"}
              <span
                className="ml-1 underline cursor-pointer text-[#181A22] font-semibold"
                onClick={() =>
                  setFromAmount(tokenBalances[fromToken.symbol] || "")
                }
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
            $0.00
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
              <span>To</span>
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
            $0.00
          </div>

          {/* Fees summary */}
          <SwapSummary />
        </div>
      </form>
      {/* Place Order Button and info below the form */}
      <div className="w-10/12 sm:w-11/12 max-w-md mx-auto flex flex-col items-center mt-2 sm:mt-4">
        <button
          type="button"
          className={`w-full ${
            isConnected ? "bg-[#181A22]" : "bg-[#A1A1AA]"
          } text-white rounded-lg py-3 sm:py-4 font-bold text-base sm:text-lg mt-4 cursor-pointer disabled:cursor-not-allowed`}
          disabled={isSwapping || !wallet || !fromAmount}
          onClick={handleSwap}
        >
          {isSwapping ? "Swapping..." : "Place Order"}
        </button>
        <div className="text-center text-xs sm:text-sm text-[#A1A1AA] mt-2">
          {wallet ? "" : "Connect your wallet to proceed"}
        </div>
      </div>
      <TransactionModal
        open={txModalOpen}
        status={txModalStatus}
        onClose={() => setTxModalOpen(false)}
        fromAmount={fromAmount}
        fromSymbol={fromToken.symbol}
        toSymbol={toToken.symbol}
        txHash={txHash}
      />
    </>
  );
};

export default SwapForm; 