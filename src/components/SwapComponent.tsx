import React, { useState } from 'react';
import { ArrowDownUp, Info, Settings, Loader2 } from 'lucide-react';
import WalletConnect from './WalletConnect';
import USDTIcon from '../assets/usdt.svg';
import USDCIcon from '../assets/usdc.svg';
import ETHIcon from '../assets/eth.svg';

interface TokenData {
  symbol: string;
  icon: string | React.ReactNode;
  balance: string;
  usdValue: string;
  iconBg: string;
}

type SwapType = 'swap' | 'limit';

const AVAILABLE_TOKENS: TokenData[] = [
  {
    symbol: 'ETH',
    icon: <img src={ETHIcon} alt="ETH" className="w-6 h-6 sm:w-8 sm:h-8" />,
    balance: '0.476402',
    usdValue: '1,482.29',
    iconBg: ''
  },
  {
    symbol: 'USDC',
    icon: <img src={USDCIcon} alt="USDC" className="w-6 h-6 sm:w-8 sm:h-8" />,
    balance: '1,234.56',
    usdValue: '1,234.56',
    iconBg: ''
  },
  {
    symbol: 'USDT',
    icon: <img src={USDTIcon} alt="USDT" className="w-6 h-6 sm:w-8 sm:h-8" />,
    balance: '2,345.67',
    usdValue: '2,345.67',
    iconBg: ''
  }
];

function SwapComponent() {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [isFromTokenOpen, setIsFromTokenOpen] = useState(false);
  const [isToTokenOpen, setIsToTokenOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState<'auto' | string>('auto');
  const [swapDeadline, setSwapDeadline] = useState('30');
  const [customRecipient, setCustomRecipient] = useState(false);

  const [fromToken, setFromToken] = useState<TokenData>(AVAILABLE_TOKENS[0]);

  const [toToken, setToToken] = useState<TokenData>(AVAILABLE_TOKENS[2]);

  const [slippageDisplay, setSlippageDisplay] = useState('2.00');
  const [deadlineDisplay, setDeadlineDisplay] = useState('30');

  const [activeSwapType, setActiveSwapType] = useState<SwapType>('swap');
  const [limitPrice, setLimitPrice] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  const [isExpiryOpen, setIsExpiryOpen] = useState(false);

  const [enablePartialExecutions, setEnablePartialExecutions] = useState(false);

  const [isPriceLoading, setIsPriceLoading] = useState(false);

  const handlePriceRefresh = () => {
    setIsPriceLoading(true);
    setTimeout(() => setIsPriceLoading(false), 1000);
  };

  const handleSwapTokens = () => {
    const tempFromToken = { ...fromToken };
    setFromToken({ ...toToken });
    setToToken(tempFromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  function TokenDropdown({ 
    isOpen, 
    onClose, 
    onSelect, 
    selectedToken,
    excludeToken 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (token: TokenData) => void;
    selectedToken: TokenData;
    excludeToken?: string; 
  }) {
    if (!isOpen) return null;

    const availableTokens = AVAILABLE_TOKENS.filter(token => token.symbol !== excludeToken);

    return (
      <div className="absolute top-full left-0 mt-2 w-[240px] bg-fuel-dark-800 rounded-xl shadow-lg border border-fuel-dark-600 z-50">
        <div className="p-3">
          <div className="text-sm text-gray-400 mb-2">Select Token</div>
          <div className="space-y-1">
            {availableTokens.map((token) => (
              <button
                key={token.symbol}
                className={`w-full flex items-center space-x-3 p-2.5 rounded-lg hover:bg-fuel-dark-700 transition-colors ${
                  selectedToken.symbol === token.symbol ? 'bg-fuel-dark-700' : ''
                }`}
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
              >
                <div className="flex items-center justify-center">
                  {token.icon}
                </div>
                <div className="flex flex-col items-start flex-1">
                  <span className="text-sm font-medium">{token.symbol}</span>
                  <span className="text-xs text-gray-400">Balance: {token.balance}</span>
                </div>
                {selectedToken.symbol === token.symbol && (
                  <div className="w-2 h-2 rounded-full bg-fuel-green"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center pt-1 sm:pt-16 bg-fuel-dark-800">
      <div className="w-full max-w-[420px] mx-auto px-2">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex p-1 bg-fuel-dark-700 rounded-lg">
            <button
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeSwapType === "swap"
                  ? "bg-fuel-dark-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveSwapType("swap")}
            >
              Swap
            </button>
            <button
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeSwapType === "limit"
                  ? "bg-fuel-dark-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveSwapType("limit")}
            >
              Limit
            </button>
          </div>
          <div className="relative">
            <button
              className="p-1.5 sm:p-2 hover:bg-fuel-dark-700 rounded-full transition-colors"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <Settings className="w-4 h-4 text-gray-400" />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-fuel-dark-800 rounded-xl shadow-lg border border-fuel-dark-600 z-50">
                <div className="p-4">
                  {activeSwapType === "swap" ? (
                    <>
                      <h3 className="text-sm font-medium mb-4">
                        Transaction Settings
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-400">
                              MEV-protected slippage
                            </span>
                            <Info className="w-4 h-4 text-gray-500" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className={`px-3 py-1.5 rounded-lg text-sm ${
                              slippageTolerance === "auto"
                                ? "bg-fuel-green text-fuel-dark-900"
                                : "bg-fuel-dark-700 text-gray-400"
                            }`}
                            onClick={() => setSlippageTolerance("auto")}
                          >
                            Auto
                          </button>
                          <div className="relative flex-1">
                            <input
                              type="text"
                              className="w-full bg-fuel-dark-700 rounded-lg px-3 py-1.5 text-sm text-right pr-8"
                              value={
                                slippageTolerance === "auto"
                                  ? slippageDisplay
                                  : slippageTolerance
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                if (slippageTolerance !== "auto") {
                                  setSlippageTolerance(value);
                                  setSlippageDisplay(value);
                                }
                              }}
                              disabled={slippageTolerance === "auto"}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-400">
                              Swap deadline
                            </span>
                            <Info className="w-4 h-4 text-gray-500" />
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full bg-fuel-dark-700 rounded-lg px-3 py-1.5 text-sm text-left"
                            value={deadlineDisplay}
                            onChange={(e) => {
                              const value = e.target.value;
                              setDeadlineDisplay(value);
                              setSwapDeadline(value);
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                            minutes
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium mb-4">
                        Interface Settings
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-400">
                            Custom Recipient
                          </span>
                          <Info className="w-4 h-4 text-gray-500" />
                        </div>
                        <button
                          className={`w-10 h-6 rounded-full transition-colors relative ${
                            customRecipient
                              ? "bg-fuel-green"
                              : "bg-fuel-dark-700"
                          }`}
                          onClick={() => setCustomRecipient(!customRecipient)}
                        >
                          <div
                            className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${
                              customRecipient ? "right-1" : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-400">
                            Enable Partial Executions
                          </span>
                          <Info className="w-4 h-4 text-gray-500" />
                        </div>
                        <button
                          className={`w-10 h-6 rounded-full transition-colors relative ${
                            enablePartialExecutions
                              ? "bg-fuel-green"
                              : "bg-fuel-dark-700"
                          }`}
                          onClick={() =>
                            setEnablePartialExecutions(!enablePartialExecutions)
                          }
                        >
                          <div
                            className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${
                              enablePartialExecutions ? "right-1" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-fuel-dark-800 rounded-xl p-3 sm:p-4 shadow-lg border border-fuel-dark-600">
          {activeSwapType === "swap" ? (
            // Swap Mode UI
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">From</span>
                  <span className="text-gray-400">
                    Balance: <span className="text-white">{fromToken.balance}</span> {fromToken.symbol}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-fuel-dark-700 p-2 rounded-xl">
                  <div className="relative">
                    <button
                      className="flex items-center space-x-1.5 px-1.5 py-1 rounded-lg hover:bg-fuel-dark-600 min-w-[90px] sm:min-w-[110px]"
                      onClick={() => setIsFromTokenOpen(!isFromTokenOpen)}
                    >
                      <div className="flex items-center justify-center">
                        {fromToken.icon}
                      </div>
                      <span className="text-sm sm:text-base">{fromToken.symbol}</span>
                      <span className="text-gray-400">▼</span>
                    </button>
                    <TokenDropdown
                      isOpen={isFromTokenOpen}
                      onClose={() => setIsFromTokenOpen(false)}
                      onSelect={setFromToken}
                      selectedToken={fromToken}
                      excludeToken={toToken.symbol}
                    />
                  </div>
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis placeholder-gray-500"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                  />
                </div>
                <div className="text-right text-xs text-gray-400">
                  ≈ $<span className="text-white">{fromToken.usdValue}</span>
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  className="p-2 rounded-xl bg-fuel-dark-700 hover:bg-fuel-dark-600 transition-all duration-200 border-4 border-fuel-dark-800 shadow-lg group"
                  onClick={handleSwapTokens}
                >
                  <ArrowDownUp className="w-5 h-5 text-fuel-green group-hover:rotate-180 transition-transform duration-200" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">To</span>
                  <span className="text-gray-400">
                    Balance: <span className="text-white">{toToken.balance}</span> {toToken.symbol}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-fuel-dark-700 p-2 rounded-xl">
                  <div className="relative">
                    <button
                      className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-fuel-dark-600 min-w-[100px] sm:min-w-[120px]"
                      onClick={() => setIsToTokenOpen(!isToTokenOpen)}
                    >
                      <div className="flex items-center justify-center">
                        {toToken.icon}
                      </div>
                      <span className="text-sm sm:text-base">{toToken.symbol}</span>
                      <span className="text-gray-400">▼</span>
                    </button>
                    <TokenDropdown
                      isOpen={isToTokenOpen}
                      onClose={() => setIsToTokenOpen(false)}
                      onSelect={setToToken}
                      selectedToken={toToken}
                      excludeToken={fromToken.symbol}
                    />
                  </div>
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis placeholder-gray-500"
                    placeholder="0.00"
                    value={toAmount}
                    onChange={(e) => setToAmount(e.target.value)}
                  />
                </div>
                <div className="text-right text-xs text-gray-400">
                  ≈ $<span className="text-white">{toToken.usdValue}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">Sell amount</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">
                      Balance: <span className="text-white">{fromToken.balance}</span> {fromToken.symbol}
                    </span>
                    <button className="text-xs text-fuel-green hover:text-fuel-green-light">
                      MAX
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-fuel-dark-700 p-2 rounded-xl">
                  <div className="relative">
                    <button
                      className="flex items-center space-x-1.5 px-1.5 py-1 rounded-lg hover:bg-fuel-dark-600 min-w-[90px] sm:min-w-[110px]"
                      onClick={() => setIsFromTokenOpen(!isFromTokenOpen)}
                    >
                      <div className="flex items-center justify-center">
                        {fromToken.icon}
                      </div>
                      <span className="text-sm sm:text-base">{fromToken.symbol}</span>
                      <span className="text-gray-400">▼</span>
                    </button>
                    <TokenDropdown
                      isOpen={isFromTokenOpen}
                      onClose={() => setIsFromTokenOpen(false)}
                      onSelect={setFromToken}
                      selectedToken={fromToken}
                      excludeToken={toToken.symbol}
                    />
                  </div>
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis placeholder-gray-500"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                  />
                </div>
                <div className="text-right text-xs text-gray-400">
                  ≈ $<span className="text-white">{fromToken.usdValue}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="col-span-2">
                  <div className="text-xs text-gray-400 mb-1">
                    Limit price <span className="text-green-400">(+0.1%)</span>
                  </div>
                  <div className="flex items-center bg-fuel-dark-700 p-2 rounded-xl">
                    <input
                      type="text"
                      className="flex-1 bg-transparent text-sm font-medium focus:outline-none min-w-0"
                      placeholder="0.000000"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                    />
                    <span className="text-sm text-gray-400 px-2">{toToken.symbol}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Expiry</div>
                  <div className="relative">
                    <button
                      className="w-full bg-fuel-dark-700 p-2 rounded-xl text-left flex items-center justify-between text-sm"
                      onClick={() => setIsExpiryOpen(!isExpiryOpen)}
                    >
                      <span>{expiryDays} Days</span>
                      <span className="text-gray-400">▼</span>
                    </button>
                    {isExpiryOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-fuel-dark-700 rounded-xl shadow-lg z-10">
                        {["1", "7", "30"].map((days) => (
                          <button
                            key={days}
                            className="w-full p-2 text-left hover:bg-fuel-dark-600 text-sm"
                            onClick={() => {
                              setExpiryDays(days);
                              setIsExpiryOpen(false);
                            }}
                          >
                            {days} Days
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center my-4">
                <button
                  className="p-2 rounded-xl bg-fuel-dark-700 hover:bg-fuel-dark-600 transition-all duration-200 border-4 border-fuel-dark-800 shadow-lg group"
                  onClick={handleSwapTokens}
                >
                  <ArrowDownUp className="w-5 h-5 text-fuel-green group-hover:rotate-180 transition-transform duration-200" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">Receive at least</span>
                  <span className="text-gray-400">
                    Balance: <span className="text-white">{toToken.balance}</span> {toToken.symbol}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-fuel-dark-700 p-2 rounded-xl">
                  <div className="relative">
                    <button
                      className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-fuel-dark-600 min-w-[100px] sm:min-w-[120px]"
                      onClick={() => setIsToTokenOpen(!isToTokenOpen)}
                    >
                      <div className="flex items-center justify-center">
                        {toToken.icon}
                      </div>
                      <span className="text-sm sm:text-base">{toToken.symbol}</span>
                      <span className="text-gray-400">▼</span>
                    </button>
                    <TokenDropdown
                      isOpen={isToTokenOpen}
                      onClose={() => setIsToTokenOpen(false)}
                      onSelect={setToToken}
                      selectedToken={toToken}
                      excludeToken={fromToken.symbol}
                    />
                  </div>
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis placeholder-gray-500"
                    placeholder="0.00"
                    value={toAmount}
                    onChange={(e) => setToAmount(e.target.value)}
                  />
                </div>
                <div className="text-right text-xs text-gray-400">
                  ≈ $<span className="text-white">{toToken.usdValue}</span>
                </div>
              </div>
            </>
          )}

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-fuel-dark-700/50 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  1 {fromToken.symbol} = {(78079.0602).toLocaleString()} {toToken.symbol}
                </span>
                <Info className="w-4 h-4 text-gray-500" />
              </div>
              <button
                className="flex items-center space-x-1 text-fuel-green hover:text-fuel-green-light transition-colors"
                onClick={handlePriceRefresh}
                disabled={isPriceLoading}
              >
                {isPriceLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-sm">Refresh</span>
                )}
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-fuel-dark-700/50 backdrop-blur-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network costs (est.)</span>
                <span className="font-medium">5.486 FUEL + gas <span className="text-gray-400">(≈ $0.38)</span></span>
              </div>
              {activeSwapType === "swap" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Slippage tolerance</span>
                    <span className="font-medium">
                      {slippageTolerance === "auto" ? "Auto" : `${slippageDisplay}%`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Transaction expiration</span>
                    <span className="font-medium">{deadlineDisplay} minutes</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Order expiration</span>
                    <span className="font-medium">{expiryDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Partial fills</span>
                    <span className="font-medium">{enablePartialExecutions ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {activeSwapType === "swap" ? (
            <WalletConnect
              variant="trade"
              tradeType="buy"
              tokenSymbol={toToken.symbol}
              className="w-full py-3.5 text-base font-medium rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            />
          ) : (
            <button className="w-full py-3.5 bg-fuel-green text-fuel-dark-900 rounded-xl font-medium hover:bg-opacity-90 transition-colors text-base">
              Place Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SwapComponent;
