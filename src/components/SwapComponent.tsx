import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownUp, Info, Settings, Loader2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import WalletConnect from './WalletConnect';
import { Address, bn, BN, ScriptTransactionRequest, WalletUnlocked, Wallet, Provider } from 'fuels';
import ETHIcon from '../assets/eth.svg';
import FUELIcon from '../assets/fuelsymbol.svg';
import BTCIcon from '../assets/solvBTC.webp';
import USDCIcon from '../assets/usdc.svg';
import { useWallet, useBalance, useIsConnected } from '@fuels/react';
import axios from 'axios';
const BASE_ASSET_ID =
  "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07";

interface TokenData {
  symbol: string;
  icon: string | React.ReactNode;
  balance: string;
  usdValue: string;
  iconBg: string;
  assetID: string;
}

type SwapType = 'swap' | 'limit';
const BASE_URL = "https://fuelstation-mainnet.xyz";
// const BASE_URL = "http://localhost:3000";

const AVAILABLE_TOKENS: TokenData[] = [
  {
    symbol: "ETH",
    icon: <img src={ETHIcon} alt="ETH" className="w-5 h-5 sm:w-6 sm:h-6" />,
    balance: "0.476402",
    assetID:
      "0x143cd7c86d87664e926965c623cb9979aac62e751426feb7102fac0338e17f3b",
    usdValue: "1,482.29",
    iconBg: "",
  },
  {
    symbol: "USDC",
    icon: <img src={USDCIcon} alt="USDC" className="w-5 h-5 sm:w-6 sm:h-6" />,
    balance: "1,234.56",
    assetID:
      "0x6359423c4a652e99e14677546fef12fc0946ca577c7eebc16202dc47467b09be",
    usdValue: "1,234.56",
    iconBg: "",
  },
  {
    symbol: "FUEL",
    icon: <img src={FUELIcon} alt="FUEL" className="w-5 h-5 sm:w-6 sm:h-6" />,
    balance: "1,234.56",
    assetID:
      "0x85e382f89ae59f89b6fa4c3a6453163dd64a1536c90619741d9b98e7f98e8665",
    usdValue: "1,234.56",
    iconBg: "",
  },
  {
    symbol: "BTC",
    icon: <img src={BTCIcon} alt="BTC" className="w-5 h-5 sm:w-6 sm:h-6" />,
    balance: "2,345.67",
    assetID:
      "0xaa0e099938442e66e5e192b6eac83ef9a486a361a077ea25d3693079e586833a",
    usdValue: "2,345.67",
    iconBg: "",
  },
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
  const { wallet } = useWallet();
  const { balance } = useBalance({
    address: wallet?.address.toB256(),
    assetId: BASE_ASSET_ID,
  });
  const [fromToken, setFromToken] = useState<TokenData>(AVAILABLE_TOKENS[0]);

  const [toToken, setToToken] = useState<TokenData>(AVAILABLE_TOKENS[1]);

  const [slippageDisplay, setSlippageDisplay] = useState('2.00');
  const [deadlineDisplay, setDeadlineDisplay] = useState('30');

  const [activeSwapType, setActiveSwapType] = useState<SwapType>('swap');
  const [limitPrice, setLimitPrice] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  const [isExpiryOpen, setIsExpiryOpen] = useState(false);

  const [enablePartialExecutions, setEnablePartialExecutions] = useState(false);

  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [priceError, setError] = useState<string | null>(null);

  const [tokenBalances, setTokenBalances] = useState<{ [key: string]: string }>({});

  const [isSwapping, setIsSwapping] = useState(false);
  const {isConnected} = useIsConnected();

  // Add ref to track if tokens have been minted
  const hasInitialMintRef = useRef(false);

  // Add new state for minting status
  const [isMinting, setIsMinting] = useState(false);

  const fetchTokenBalance = async (token: TokenData) => {
    if (!wallet) return;
    try {
      const balance = await wallet.getBalance(token.assetID);
      const formattedBalance = balance.format({units: 9}).toString();
      setTokenBalances(prev => ({
        ...prev,
        [token.symbol]: formattedBalance
      }));
    } catch (error) {
      console.error(`Error fetching balance for ${token.symbol}:`, error);
    }
  };

  const fetchAllBalances = async () => {
    if (!wallet) return;
    for (const token of AVAILABLE_TOKENS) {
      await fetchTokenBalance(token);
    }
  };

  useEffect(() => {
    if (wallet) {
      fetchAllBalances();
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet) {
      fetchTokenBalance(fromToken);
    }
  }, [fromToken.symbol, wallet]);

  useEffect(() => {
    setFromAmount('');
    setToAmount('');
  }, [fromToken.symbol]);

  const fetchPrice = async (symbol: string) => {
    setIsPriceLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/price/${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }
      const data = await response.json();
      console.log(data);
      setPrice(data.price);
    } catch (err) {
      setError('Failed to fetch price');
      console.error('Error fetching price:', err);
    } finally {
      setIsPriceLoading(false);
    }
  };

  useEffect(() => {
    if (fromToken && toToken) {
      fetchPrice(fromToken.symbol);
    }
  }, [fromToken.symbol, toToken.symbol]);

  const handlePriceRefresh = async() => {
    await fetchPrice(fromToken.symbol);
  };

  const handleSwapTokens = () => {
    const tempFromToken = { ...fromToken };
    setFromToken({ ...toToken });
    setToToken(tempFromToken);
    setFromAmount('');
    setToAmount('');
  };

  const mint = async (token: TokenData) => {
    if (!wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    const getMintAmount = (symbol: string): number => {
      switch (symbol) {
        case 'ETH':
          return 100000000;
        case 'FUEL':
          return 100000000000;
        case 'BTC':
          return 100000000;
        case 'USDC':
          return 10000000000;
        default:
          return 100000000;
      }
    };

    toast.promise(
      fetch(`${BASE_URL}/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenName: token.symbol,
          address: wallet.address.toB256(),
          amount: getMintAmount(token.symbol)
        })
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to mint');
        }
        const result = await response.json();
        // Fetch updated balances after successful mint
        await fetchAllBalances();
        return result;
      }),
      {
        loading: `Minting ${token.symbol}...`,
        success: `Successfully minted ${token.symbol}!`,
        error: `Failed to mint ${token.symbol}`,
      }
    );
  };

  const handleSwap = async () => {
    console.log("Swapping tokens...");
    if (!wallet || !fromAmount) {
      toast.error('Please connect wallet and enter amount');
      return;
    }

    setIsSwapping(true);
    try {
      // Create script transaction request
      const scriptTransactionRequest = new ScriptTransactionRequest();

      // Get sell token amount in proper format
      const sellTokenAmount = bn.parseUnits(fromAmount, 9);

      // Get resources for the sell token
      const resources = await wallet.getResourcesToSpend([
        {
          assetId: fromToken.assetID,
          amount: sellTokenAmount,
        },
      ]);

      scriptTransactionRequest.addResources(resources);

      // Get and add base asset (gas) resources
      const baseResources = await wallet.getResourcesToSpend([
        {
          assetId: await wallet.provider.getBaseAssetId(),
          amount: new BN(2000000),
        },
      ]);

      scriptTransactionRequest.addResources(baseResources);

      // Add outputs
      const solverAddress = Address.fromB256("0xf8cf8acbe8b4d970c3e1c9ffed11e8b55abfc5287ad7f5e4d0240a4f0651d658");
      scriptTransactionRequest.addCoinOutput(
        // You'll need to get the solver wallet address from your backend
        solverAddress, // Replace with actual solver wallet address
        sellTokenAmount,
        fromToken.assetID
      );
      scriptTransactionRequest.addChangeOutput(
        wallet.address,
        fromToken.assetID
      );

      console.log("Sending fill order request to backend...");
      // Send fill order request to backend
      const { data } = await axios.post(`${BASE_URL}/fill-order`, {
        scriptRequest: scriptTransactionRequest.toJSON(),
        sellTokenName: fromToken.symbol.toLowerCase(),
        sellTokenAmount: sellTokenAmount.toString(),
        recepientAddress: wallet.address.toB256(),
      });

      // Create new request from response
      const responseRequest = new ScriptTransactionRequest();
      Object.assign(responseRequest, data.request);

      // Send transaction
      await toast.promise(
        (async () => {
          const tx = await wallet.sendTransaction(responseRequest);
          const result = await tx.waitForResult();
          console.log('Transaction ID:', result.id);
          // Fetch updated balances after successful swap
          await fetchAllBalances();
          return result;
        })(),
        {
          loading: 'Swapping tokens...',
          success: 'Swap successful!',
          error: 'Swap failed',
        }
      );

    } catch (error) {
      console.error('Swap error:', error);
      toast.error('Failed to execute swap');
    } finally {
      setIsSwapping(false);
    }
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
                  <span className="text-xs text-gray-400">
                    Balance: {tokenBalances[token.symbol] || '0.000000'}
                  </span>
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
  function TempTokenDropdown({ 
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

    const availableTokens = AVAILABLE_TOKENS.filter(token => token.symbol === "USDC");

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
                  <span className="text-xs text-gray-400">
                    Balance: {tokenBalances[token.symbol] || '0.000000'}
                  </span>
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

  // Add this new useEffect for fuel transfer
  useEffect(() => {
    const checkAndTransferFuel = async () => {
      if (wallet && balance?.lt(3000000) ) {
        try {
          const provider = new Provider("https://testnet.fuel.network/v1/graphql");
          const transferWallet: WalletUnlocked = Wallet.fromPrivateKey(
            "0x2822e732c67f525cdf1df36a92a69fa16fcd25e1eee3e5be604b386ca6a5898d",
            provider
          );
          const baseAssetId = await provider.getBaseAssetId();
          await transferWallet.transfer(wallet.address, 3000000, baseAssetId);
        } catch (error) {
          console.error('Error transferring fuel:', error);
        }
      }
    };

    // Set up interval to run every 5 seconds
    const intervalId = setInterval(checkAndTransferFuel, 5000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [balance]); // Dependencies include wallet and balance

  // Update mintAllTokens to remove the fuel transfer logic
  const mintAllTokens = async () => {
    if (!wallet) return;
    
    const getMintAmount = (symbol: string): number => {
      switch (symbol) {
        case 'ETH':
          return 100000000;
        case 'FUEL':
          return 100000000000;
        case 'BTC':
          return 100000000;
        case 'USDC':
          return 10000000000;
        default:
          return 100000000;
      }
    };
    setIsMinting(true);

    try {
      // toast.loading('Checking balances and minting tokens...', { id: 'mint-toast' });

      for (const token of AVAILABLE_TOKENS) {
        // Check current balance
        const balance = await wallet.getBalance(token.assetID);
        const mintAmount = getMintAmount(token.symbol);
        console.log(Number(balance), mintAmount, token.symbol);

        // Only mint if balance is less than mint amount
        if (balance.lt(mintAmount)) {
          try {
            const response = await fetch(`${BASE_URL}/mint`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tokenName: token.symbol,
                address: wallet.address.toB256(),
                amount: mintAmount
              })
            });

            if (!response.ok) {
              throw new Error(`Failed to mint ${token.symbol}`);
            }

            await response.json();
          } catch (error) {
            toast.error(`Failed to mint ${token.symbol}`);
            console.error(`Error minting ${token.symbol}:`, error);
          }
        }
      }

      setIsMinting(false);
      await fetchAllBalances();
      toast.success('Tokens fauceted! You can now swap them.', { id: 'mint-toast' });
    } catch (error) {
      console.error('Error in mintAllTokens:', error);
      toast.error('Failed to complete minting process', { id: 'mint-toast' });
    } finally {
      setIsMinting(false);
    }
  };

  // Update the useEffect for minting
  useEffect(() => {
    if (wallet && !hasInitialMintRef.current) {
      hasInitialMintRef.current = true;
      mintAllTokens();
    }
  }, [isConnected, wallet]);

  // Optional: Reset the ref when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      hasInitialMintRef.current = false;
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-fuel-dark-800 py-1 sm:py-16 overflow-y-auto relative">
      {/* Loading Overlay */}
      {isMinting && (
        <div className="fixed inset-0 bg-fuel-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-fuel-dark-800 rounded-xl p-6 max-w-sm mx-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fuel-green" />
            <h3 className="text-lg font-medium mb-2">Initializing Your Wallet</h3>
            <p className="text-sm text-gray-400">
              Please wait while we mint your test tokens. This may take a few moments...
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-[420px] mx-auto px-2 mb-8 mt-4 sm:mt-0">
        {/* Add mint section with label */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Mint assets for testing
            </span>
            <span className="text-xs text-gray-500">Testnet only</span>
          </div>
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {AVAILABLE_TOKENS.map((token) => (
              <button
                key={token.symbol}
                className="flex items-center justify-center space-x-0.5 sm:space-x-1 bg-fuel-dark-700 hover:bg-fuel-dark-600 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg transition-colors group"
                onClick={() => mint(token)}
              >
                <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-fuel-green group-hover:rotate-180 transition-transform duration-200" />
                <span className="text-xs sm:text-sm">{token.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        {/* <div className="flex items-center justify-between mb-3 sm:mb-4">
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
        </div> */}

        <div className="bg-fuel-dark-800 rounded-xl p-3 sm:p-4 shadow-lg border border-fuel-dark-600">
          {activeSwapType === "swap" ? (
            // Swap Mode UI
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">From</span>
                  <span className="text-gray-400">
                    Balance:{" "}
                    <span className="text-white">
                      {tokenBalances[fromToken.symbol] || "0.000000"}
                    </span>{" "}
                    {fromToken.symbol}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-fuel-dark-700 p-2 rounded-xl">
                  <div className="relative">
                    <button
                      className="flex items-center space-x-1.5 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg hover:bg-fuel-dark-600 min-w-[80px] sm:min-w-[90px]"
                      onClick={() => setIsFromTokenOpen(!isFromTokenOpen)}
                    >
                      <div className="flex items-center justify-center">
                        {fromToken.icon}
                      </div>
                      <span className="text-xs sm:text-sm">
                        {fromToken.symbol}
                      </span>
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
                    className="flex-1 bg-transparent text-xl sm:text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis placeholder-gray-500"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={async (e) => {
                      const value = e.target.value;
                      setFromAmount(value);

                      if (value) {
                        // Fetch latest price when amount changes
                        await fetchPrice(fromToken.symbol);
                        // Calculate to amount based on new price
                        if (price) {
                          const calculatedAmount = (
                            parseFloat(value) * price
                          ).toFixed(6);
                          setToAmount(calculatedAmount);
                        }
                      } else {
                        setToAmount("");
                      }
                    }}
                  />
                </div>
                <div className="text-right text-xs text-gray-400">
                  {/* ≈ $<span className="text-white">{fromToken.usdValue}</span> */}
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center relative z-10">
                <button
                  className="p-2 rounded-xl bg-fuel-dark-700 hover:bg-fuel-dark-600 transition-all duration-200 border-4 border-fuel-dark-800 shadow-lg group"
                  // onClick={handleSwapTokens}
                >
                  <ArrowDownUp className="w-5 h-5 text-fuel-green group-hover:rotate-180 transition-transform duration-200" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">To</span>
                  <span className="text-gray-400">
                    Balance:{" "}
                    <span className="text-white">
                      {tokenBalances[toToken.symbol] || "0.000000"}
                    </span>{" "}
                    {toToken.symbol}
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
                      <span className="text-sm sm:text-base">
                        {toToken.symbol}
                      </span>
                      <span className="text-gray-400">▼</span>
                    </button>
                    <TempTokenDropdown
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
                    onChange={async (e) => {
                      const value = e.target.value;
                      setToAmount(value);

                      if (value) {
                        // Fetch latest price when amount changes
                        await fetchPrice(fromToken.symbol);
                        // Calculate from amount based on new price
                        if (price) {
                          const calculatedAmount = (
                            parseFloat(value) / price
                          ).toFixed(6);
                          setFromAmount(calculatedAmount);
                        }
                      } else {
                        setFromAmount("");
                      }
                    }}
                  />
                </div>
                <div className="text-right text-xs text-gray-400">
                  {/* ≈ $<span className="text-white">{toToken.usdValue}</span> */}
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
                      Balance:{" "}
                      <span className="text-white">
                        {tokenBalances[fromToken.symbol] || "0.000000"}
                      </span>{" "}
                      {fromToken.symbol}
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
                      <span className="text-sm sm:text-base">
                        {fromToken.symbol}
                      </span>
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
                    onChange={async (e) => {
                      const value = e.target.value;
                      setFromAmount(value);

                      if (value) {
                        // Fetch latest price when amount changes
                        await fetchPrice(fromToken.symbol);
                        // Calculate to amount based on new price
                        if (price) {
                          const calculatedAmount = (
                            parseFloat(value) * price
                          ).toFixed(6);
                          setToAmount(calculatedAmount);
                        }
                      } else {
                        setToAmount("");
                      }
                    }}
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
                    <span className="text-sm text-gray-400 px-2">
                      {toToken.symbol}
                    </span>
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
                  <span className="text-gray-400 font-medium">
                    Receive at least
                  </span>
                  <span className="text-gray-400">
                    Balance:{" "}
                    <span className="text-white">
                      {tokenBalances[toToken.symbol] || "0.000000"}
                    </span>{" "}
                    {toToken.symbol}
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
                      <span className="text-sm sm:text-base">
                        {toToken.symbol}
                      </span>
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
                    onChange={async (e) => {
                      const value = e.target.value;
                      setToAmount(value);

                      if (value) {
                        // Fetch latest price when amount changes
                        await fetchPrice(fromToken.symbol);
                        // Calculate from amount based on new price
                        if (price) {
                          const calculatedAmount = (
                            parseFloat(value) / price
                          ).toFixed(6);
                          setFromAmount(calculatedAmount);
                        }
                      } else {
                        setFromAmount("");
                      }
                    }}
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
                <span className="text-xs sm:text-sm text-gray-400">
                  1 {fromToken.symbol} ={" "}
                  {price
                    ? price.toLocaleString("en-US", {
                        minimumFractionDigits: 3,
                      })
                    : "..."}{" "}
                  {toToken.symbol}
                  {priceError && (
                    <span className="text-red-500 ml-2">{priceError}</span>
                  )}
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
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Network costs (est.)</span>
                <span className="font-medium">
                  0.0013 ETH + gas{" "}
                  <span className="text-gray-400">(≈ $0.0038)</span>
                </span>
              </div>
              {activeSwapType === "swap" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Slippage tolerance</span>
                    <span className="font-medium">
                      {slippageTolerance === "auto"
                        ? "Auto"
                        : `${slippageDisplay}%`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Transaction expiration
                    </span>
                    <span className="font-medium">
                      {deadlineDisplay} minutes
                    </span>
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
                    <span className="font-medium">
                      {enablePartialExecutions ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {activeSwapType === "swap" ? (
            <button 
              onClick={handleSwap} 
              disabled={isSwapping}
              className="w-full py-2.5 sm:py-3 bg-fuel-green text-fuel-dark-900 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSwapping ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Swapping...</span>
                </div>
              ) : (
                'Place Order'
              )}
            </button>
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
