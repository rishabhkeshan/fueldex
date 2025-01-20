import React, { useState } from 'react';
import { ArrowDownUp, Info, Settings } from 'lucide-react';
import WalletConnect from './WalletConnect';

// Add these interfaces at the top of the file
interface TokenData {
  symbol: string;
  icon: string;
  balance: string;
  usdValue: string;
  iconBg: string;
}

// Add this type and state
type SwapType = 'swap' | 'limit';

function SwapComponent() {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [isFromTokenOpen, setIsFromTokenOpen] = useState(false);
  const [isToTokenOpen, setIsToTokenOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState<'auto' | string>('auto');
  const [swapDeadline, setSwapDeadline] = useState('30');
  const [customRecipient, setCustomRecipient] = useState(false);

  // Add token data state
  const [fromToken, setFromToken] = useState<TokenData>({
    symbol: 'ETH',
    icon: 'Ξ',
    balance: '0.476402',
    usdValue: '1,482.29',
    iconBg: 'bg-blue-500'
  });

  const [toToken, setToToken] = useState<TokenData>({
    symbol: 'FUEL',
    icon: 'F',
    balance: '65,536.6802',
    usdValue: '1,463.37 (-1.28%)',
    iconBg: 'bg-green-500'
  });

  // Add these state variables at the top
  const [slippageDisplay, setSlippageDisplay] = useState('2.00');
  const [deadlineDisplay, setDeadlineDisplay] = useState('30');

  // Add this type and state
  const [activeSwapType, setActiveSwapType] = useState<SwapType>('swap');
  const [limitPrice, setLimitPrice] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  const [isExpiryOpen, setIsExpiryOpen] = useState(false);

  // Add this state
  const [enablePartialExecutions, setEnablePartialExecutions] = useState(false);

  // Add swap function
  const handleSwapTokens = () => {
    const tempFromToken = { ...fromToken };
    setFromToken({ ...toToken });
    setToToken(tempFromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className="flex-1 flex flex-col items-center pt-4 sm:pt-8">
      <div className="w-full max-w-[460px] mx-auto px-3 sm:px-4">
        {/* Swap Type Selector */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex space-x-3 sm:space-x-4 text-xs sm:text-sm font-medium">
            <button
              className={
                activeSwapType === "swap"
                  ? "text-fuel-green"
                  : "text-gray-400 hover:text-gray-300"
              }
              onClick={() => setActiveSwapType("swap")}
            >
              Swap
            </button>
            <button
              className={
                activeSwapType === "limit"
                  ? "text-fuel-green"
                  : "text-gray-400 hover:text-gray-300"
              }
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

                      {/* Slippage Settings */}
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

                      {/* Swap Deadline */}
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

                      {/* Custom Recipient Toggle */}
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

                      {/* Enable Partial Executions Toggle */}
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

        {/* Conditional render based on activeSwapType */}
        {activeSwapType === "swap" ? (
          <div className="bg-fuel-dark-800 rounded-xl p-3 sm:p-4 shadow-lg">
            {/* From Token */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-[10px] sm:text-xs">
                <span className="text-gray-400">From</span>
                <span className="text-gray-400">
                  Balance: {fromToken.balance} {fromToken.symbol}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-fuel-dark-700 p-2 sm:p-3 rounded-lg">
                <button
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-fuel-dark-600 min-w-[100px] sm:min-w-[120px]"
                  onClick={() => setIsFromTokenOpen(!isFromTokenOpen)}
                >
                  <div
                    className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full ${fromToken.iconBg} flex items-center justify-center`}
                  >
                    <span className="text-white text-xs">{fromToken.icon}</span>
                  </div>
                  <span className="text-sm sm:text-base">
                    {fromToken.symbol}
                  </span>
                  <span className="text-gray-400">▼</span>
                </button>
                <input
                  type="text"
                  className="flex-1 bg-transparent text-xl sm:text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                />
              </div>
              <div className="text-right text-xs sm:text-sm text-gray-400">
                ≈ ${fromToken.usdValue}
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center my-2 sm:my-3">
              <button
                className="p-1.5 sm:p-2 rounded-lg bg-fuel-dark-700 hover:bg-fuel-dark-600 transition-colors"
                onClick={handleSwapTokens}
              >
                <ArrowDownUp className="w-4 h-4 sm:w-5 sm:h-5 text-fuel-green" />
              </button>
            </div>

            {/* To Token */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-[10px] sm:text-xs">
                <span className="text-gray-400">To</span>
                <span className="text-gray-400">
                  Balance: {toToken.balance} {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-fuel-dark-700 p-2 sm:p-3 rounded-lg">
                <button
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-fuel-dark-600 min-w-[100px] sm:min-w-[120px]"
                  onClick={() => setIsToTokenOpen(!isToTokenOpen)}
                >
                  <div
                    className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full ${toToken.iconBg} flex items-center justify-center`}
                  >
                    <span className="text-white text-xs">{toToken.icon}</span>
                  </div>
                  <span className="text-sm sm:text-base">{toToken.symbol}</span>
                  <span className="text-gray-400">▼</span>
                </button>
                <input
                  type="text"
                  className="flex-1 bg-transparent text-xl sm:text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis"
                  placeholder="0.00"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                />
              </div>
              <div className="text-right text-xs sm:text-sm text-gray-400">
                ≈ ${toToken.usdValue}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-3 sm:mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm p-2 sm:p-3 rounded-lg bg-fuel-dark-700">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400">
                    1 ETH = 78,079.0602 FUEL
                  </span>
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                </div>
                <span className="text-gray-400">(≈ $3,137.58)</span>
              </div>

              <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-3 rounded-lg bg-fuel-dark-700">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Network costs (est.)</span>
                  <span>5.486 FUEL + gas (≈ $0.38)</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Slippage tolerance</span>
                  <span>
                    {slippageTolerance === "auto"
                      ? "Auto"
                      : `${slippageDisplay}%`}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Transaction expiration</span>
                  <span>{deadlineDisplay} minutes</span>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="mt-3 sm:mt-4">
              <WalletConnect
                variant="trade"
                tradeType="buy"
                tokenSymbol={toToken.symbol}
              />
            </div>
          </div>
        ) : (
          <div className="bg-fuel-dark-800 rounded-xl p-3 sm:p-4 shadow-lg">
            {/* Sell Amount Section */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-[10px] sm:text-xs">
                <span className="text-gray-400">Sell amount</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">
                    Balance: {fromToken.balance} {fromToken.symbol}
                  </span>
                  <button className="text-[10px] sm:text-xs text-fuel-green">
                    MAX
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-fuel-dark-700 p-2 sm:p-3 rounded-lg">
                <button
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-fuel-dark-600 min-w-[100px] sm:min-w-[120px]"
                  onClick={() => setIsFromTokenOpen(!isFromTokenOpen)}
                >
                  <div
                    className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full ${fromToken.iconBg} flex items-center justify-center`}
                  >
                    <span className="text-white text-xs">{fromToken.icon}</span>
                  </div>
                  <span className="text-sm sm:text-base">
                    {fromToken.symbol}
                  </span>
                  <span className="text-gray-400">▼</span>
                </button>
                <input
                  type="text"
                  className="flex-1 bg-transparent text-xl sm:text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                />
              </div>
              <div className="text-right text-xs sm:text-sm text-gray-400">
                ≈ ${fromToken.usdValue}
              </div>
            </div>

            {/* Limit Price Section */}
            <div className="grid grid-cols-3 gap-2 mt-3 sm:mt-4">
              <div className="col-span-2">
                <div className="text-[10px] sm:text-xs text-gray-400 mb-1.5 sm:mb-2">
                  Limit price <span className="text-green-400">(+0.1%)</span>
                </div>
                <div className="flex items-center bg-fuel-dark-700 p-2 sm:p-3 rounded-lg">
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-base sm:text-lg font-medium focus:outline-none min-w-0 overflow-hidden text-ellipsis"
                    placeholder="0.000000"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                  />
                  <button className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 px-2">
                    {fromToken.symbol}
                  </button>
                </div>
              </div>
              <div>
                <div className="text-[10px] sm:text-xs text-gray-400 mb-1.5 sm:mb-2">
                  Expiry
                </div>
                <div className="relative">
                  <button
                    className="w-full bg-fuel-dark-700 p-2 sm:p-3 rounded-lg text-left flex items-center justify-between text-xs sm:text-sm"
                    onClick={() => setIsExpiryOpen(!isExpiryOpen)}
                  >
                    <span>{expiryDays} Days</span>
                    <span className="text-gray-400">▼</span>
                  </button>
                  {isExpiryOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-fuel-dark-700 rounded-lg shadow-lg z-10">
                      {["1", "7", "30"].map((days) => (
                        <button
                          key={days}
                          className="w-full p-2 text-left hover:bg-fuel-dark-600 text-xs sm:text-sm"
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

            {/* Swap Direction Button */}
            <div className="flex justify-center my-2 sm:my-4">
              <button
                className="p-1.5 sm:p-2 rounded-lg bg-fuel-dark-700 hover:bg-fuel-dark-600 transition-colors"
                onClick={handleSwapTokens}
              >
                <ArrowDownUp className="w-4 h-4 sm:w-5 sm:h-5 text-fuel-green" />
              </button>
            </div>

            {/* Receive Amount Section */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-[10px] sm:text-xs">
                <span className="text-gray-400">Receive at least</span>
                <span className="text-gray-400">
                  Balance: {toToken.balance} {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-fuel-dark-700 p-2 sm:p-3 rounded-lg">
                <button
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-fuel-dark-600 min-w-[100px] sm:min-w-[120px]"
                  onClick={() => setIsToTokenOpen(!isToTokenOpen)}
                >
                  <div
                    className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full ${toToken.iconBg} flex items-center justify-center`}
                  >
                    <span className="text-white text-xs">{toToken.icon}</span>
                  </div>
                  <span className="text-sm sm:text-base">{toToken.symbol}</span>
                  <span className="text-gray-400">▼</span>
                </button>
                <input
                  type="text"
                  className="flex-1 bg-transparent text-xl sm:text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis"
                  placeholder="0.00"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                />
              </div>
              <div className="text-right text-xs sm:text-sm text-gray-400">
                ≈ ${toToken.usdValue}
              </div>
            </div>

            {/* Place Order Button */}
            <div className="mt-3 sm:mt-4">
              <button className="w-full py-2.5 sm:py-3 bg-fuel-green text-fuel-dark-900 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm sm:text-base">
                Place limit order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SwapComponent;
