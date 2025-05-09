import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowDownUp, Info, Loader2, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
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
      "0xcb6e26678af543595ff091dccb3697a8216afaf26e802b5debdac5a7b7dd9bd3",
    usdValue: "1,482.29",
    iconBg: "",
  },
  {
    symbol: "USDC",
    icon: <img src={USDCIcon} alt="USDC" className="w-5 h-5 sm:w-6 sm:h-6" />,
    balance: "1,234.56",
    assetID:
      "0x0576490be2a4dc5311d2b2f9dd3676a0cea6d617ded77243aab11a6e21ff5265",
    usdValue: "1,234.56",
    iconBg: "",
  },
  {
    symbol: "FUEL",
    icon: <img src={FUELIcon} alt="FUEL" className="w-5 h-5 sm:w-6 sm:h-6" />,
    balance: "1,234.56",
    assetID:
      "0x9a58a32da507e0350c80a527e3a466ec5746f6b6c335c37c7f6632605252f422",
    usdValue: "1,234.56",
    iconBg: "",
  },
  {
    symbol: "BTC",
    icon: <img src={BTCIcon} alt="BTC" className="w-5 h-5 sm:w-6 sm:h-6" />,
    balance: "2,345.67",
    assetID:
      "0xb2cc1b82b0d1f775c303a135e65ab11de7e7f656c522e09287e0591d84eaae50",
    usdValue: "2,345.67",
    iconBg: "",
  },
];

function SwapComponent() {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [isFromTokenOpen, setIsFromTokenOpen] = useState(false);
  const [isToTokenOpen, setIsToTokenOpen] = useState(false);
  const { wallet } = useWallet();
  const { balance } = useBalance({
    address: wallet?.address.toB256(),
    assetId: BASE_ASSET_ID,
  });
  const [fromToken, setFromToken] = useState<TokenData>(AVAILABLE_TOKENS[0]);

  const [toToken, setToToken] = useState<TokenData>(AVAILABLE_TOKENS[1]);

  const [activeSwapType, setActiveSwapType] = useState<SwapType>('swap');
  const [limitPrice, setLimitPrice] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  const [isExpiryOpen, setIsExpiryOpen] = useState(false);

  const [enablePartialExecutions, setEnablePartialExecutions] = useState(false);

  const [arePricesLoading, setArePricesLoading] = useState(false);
  const [fromTokenPrice, setFromTokenPrice] = useState<number | null>(null);
  const [toTokenPrice, setToTokenPrice] = useState<number | null>(null);
  const [priceFetchError, setPriceFetchError] = useState<string | null>(null);

  const [tokenBalances, setTokenBalances] = useState<{ [key: string]: string }>({});

  const [isSwapping, setIsSwapping] = useState(false);
  const {isConnected} = useIsConnected();

  const hasInitialMintRef = useRef(false);

  const [isMinting, setIsMinting] = useState(false);

  // Define the ETH mint threshold amount (can be derived or hardcoded)
  const ETH_MINT_THRESHOLD = bn(100000000); // Corresponds to getMintAmount('ETH')

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
    if (fromToken && toToken) {
      fetchTokenPrices(fromToken.symbol, toToken.symbol);
    }
  }, [fromToken.symbol, toToken.symbol]);

  const fetchTokenPrices = async (fromSymbol: string, toSymbol: string) => {
    setArePricesLoading(true);
    setPriceFetchError(null);
    // Keep existing prices until new ones are fetched to avoid brief "N/A" display during refresh
    // setFromTokenPrice(null); 
    // setToTokenPrice(null);

    let newFromPrice: number | null = null;
    let newToPrice: number | null = null;

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

      newFromPrice = fromData.price;
      newToPrice = toData.price;

      console.log('Fetched prices:', { from: newFromPrice, to: newToPrice });
      setFromTokenPrice(newFromPrice);
      setToTokenPrice(newToPrice);

    } catch (err) {
      setPriceFetchError('Failed to fetch prices');
      // Clear prices on error
      setFromTokenPrice(null);
      setToTokenPrice(null);
      console.error('Error fetching prices:', err);
    } finally {
      setArePricesLoading(false);
    }
    // Return fetched prices so handlePriceRefresh can use them immediately
    return { newFromPrice, newToPrice };
  };

  const handlePriceRefresh = async () => {
    if (fromToken && toToken) {
      // Fetch prices and get the new values
      const { newFromPrice, newToPrice } = await fetchTokenPrices(fromToken.symbol, toToken.symbol);

      // Recalculate 'toAmount' if 'fromAmount' exists and new prices are valid
      const currentFromAmount = parseFloat(fromAmount);
      if (!isNaN(currentFromAmount) && currentFromAmount > 0 && newFromPrice && newToPrice && newToPrice > 0) {
        const calculatedToAmount = (
          currentFromAmount * (newFromPrice / newToPrice)
        ).toFixed(6); // Use consistent precision
        setToAmount(calculatedToAmount);
      } else if (fromAmount === '' || currentFromAmount === 0) {
        // Optional: Clear toAmount if fromAmount is empty after refresh
        // setToAmount(''); 
      }
    }
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

    try {
      const balance = await wallet.getBalance(token.assetID);
      const mintAmountNumber = getMintAmount(token.symbol);
      const mintAmountInSmallestUnitBN = bn.parseUnits(mintAmountNumber.toString(), 0);

      if (balance.gt(mintAmountInSmallestUnitBN.mul(2))) {
        toast.error(`You already have sufficient ${token.symbol} balance.`);
        return;
      }
    } catch (error) {
       console.error(`Error checking balance for ${token.symbol}:`, error);
       toast.error(`Could not check ${token.symbol} balance. Please try again.`);
       return;
    }

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
    let tx = null;
    try {
      const scriptTransactionRequest = new ScriptTransactionRequest();

      const sellTokenAmount = bn.parseUnits(fromAmount, 9);
      console.log("Sell token amount:", sellTokenAmount);
      const resources = await wallet.getResourcesToSpend([
        {
          assetId: fromToken.assetID,
          amount: sellTokenAmount,
        },
      ]);
      console.log("Resources:", resources);
      scriptTransactionRequest.addResources(resources);
      console.log("debug 1");
      const baseResources = await wallet.getResourcesToSpend([
        {
          assetId: await wallet.provider.getBaseAssetId(),
          amount: new BN(2000000),
        },
      ]);
      console.log("debug 2");
      scriptTransactionRequest.addResources(baseResources);
      console.log("debug 3");
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
      console.log("debug 4");
      console.log("Sending fill order request to backend...");
      const { data } = await axios.post(`${BASE_URL}/fill-order`, {
        scriptRequest: scriptTransactionRequest.toJSON(),
        sellTokenName: fromToken.symbol.toLowerCase(),
        buyTokenName: toToken.symbol.toLowerCase(),
        sellTokenAmount: sellTokenAmount.toString(),
        recepientAddress: wallet.address.toB256(),
      });

      const responseRequest = new ScriptTransactionRequest();
      Object.assign(responseRequest, data.request);
      console.log("Response request:", responseRequest);
      tx = await toast.promise(
        (async () => {
          const tx = await wallet.sendTransaction(responseRequest);
          if (!tx) throw new Error("Failed to send transaction");
          const preConfirmation = await tx.waitForPreConfirmation();
          console.log("Pre confirmation:", preConfirmation);
          return tx;
        })(),
        {
          loading: "Swapping tokens...",
          success: (tx) => (
            <div className="flex flex-col space-y-1">
              <div>Swap successful! 🎉</div>
              <a
                href={`https://app-testnet.fuel.network/tx/${tx.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs text-fuel-green hover:text-fuel-green-light transition-colors"
              >
                <span>
                  {tx.id.substring(0, 8)}...{tx.id.substring(tx.id.length - 8)}
                </span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ),
          error: "Failed to send transaction",
        }
      );



    } catch (error) {
      console.error('Swap error:', error);
      toast.error('Failed to execute swap');
    } finally {
      setIsSwapping(false);
      if (tx) {
        tx.waitForResult().then(async () => {
          await fetchAllBalances();
        });
      }
    }
  };

  function TokenDropdown({ 
    isOpen, 
    onClose, 
    onSelect, 
    selectedToken,
    excludeToken,
    triggerRef
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (token: TokenData) => void;
    selectedToken: TokenData;
    excludeToken?: string; 
    triggerRef: React.RefObject<HTMLButtonElement>;
  }) {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, onClose, triggerRef]);

    if (!isOpen) return null;

    const availableTokens = AVAILABLE_TOKENS.filter(
      (token) => token.symbol !== excludeToken
    );

    return (
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 mt-2 w-[240px] bg-fuel-dark-800 rounded-xl shadow-lg border border-fuel-dark-600 z-50"
      >
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
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-medium">{token.symbol}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    Balance: <span className="inline-block max-w-[100px] overflow-hidden text-ellipsis align-bottom">{tokenBalances[token.symbol] || "0.000000"}</span>
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
    triggerRef
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSelect: (token: TokenData) => void;
    selectedToken: TokenData;
    triggerRef: React.RefObject<HTMLButtonElement>;
  }) {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, onClose, triggerRef]);

    if (!isOpen) return null;

    const availableTokens = AVAILABLE_TOKENS.filter(
      (token) => token.symbol !== fromToken.symbol
    );

    return (
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 mt-2 w-[240px] bg-fuel-dark-800 rounded-xl shadow-lg border border-fuel-dark-600 z-50"
      >
        <div className="p-3">
          <div className="text-sm text-gray-400 mb-2">Select Token</div>
          <div className="space-y-1">
            {availableTokens.map((token) => (
              <button
                key={token.symbol}
                className={`w-full flex items-center space-x-3 p-2.5 rounded-lg hover:bg-fuel-dark-700 transition-colors ${
                  selectedToken.symbol === token.symbol
                    ? "bg-fuel-dark-700"
                    : ""
                }`}
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
              >
                <div className="flex items-center justify-center">
                  {token.icon}
                </div>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-medium">{token.symbol}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    Balance: <span className="inline-block max-w-[100px] overflow-hidden text-ellipsis align-bottom">{tokenBalances[token.symbol] || "0.000000"}</span>
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

  const transferBaseETH = useCallback(async () => {
    if (!wallet) return;
    console.log("Transferring base ETH...");
    const ETHBalance = await wallet.getBalance(BASE_ASSET_ID);
    if (ETHBalance.lt(2900000)) {
      try {
        const provider = new Provider("https://testnet.fuel.network/v1/graphql");
        const transferWallet: WalletUnlocked = Wallet.fromPrivateKey(
          "0x2822e732c67f525cdf1df36a92a69fa16fcd25e1eee3e5be604b386ca6a5898d",
          provider
        );
        const baseAssetId = await provider.getBaseAssetId();
        await transferWallet.transfer(wallet.address, 3000000, baseAssetId);
      } catch (error) {
        console.error("Error transferring fuel:", error);
      }
    }
  }, [wallet]);

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
  }, [transferBaseETH, wallet]);

  // Refactored mintAllTokens function
  const mintAllTokens = async () => {
    if (!wallet) return;

    // Show loading overlay immediately
    setIsMinting(true); 
    try {
      // Find ETH token data to get its asset ID
      const ethToken = AVAILABLE_TOKENS.find(token => token.symbol === 'ETH');
      if (!ethToken) {
        toast.error("ETH token configuration not found.");
        // Hide overlay on configuration error
        setIsMinting(false); 
        return;
      }

      // Check current ETH balance
      const ethBalance = await wallet.getBalance(ethToken.assetID);
      console.log("Current ETH Balance:", ethBalance.toString(), "Threshold:", ETH_MINT_THRESHOLD.toString());

      // Only call mint-all if ETH balance is below the threshold
      if (ethBalance.lt(ETH_MINT_THRESHOLD)) {
        console.log("ETH balance low, calling /mint-all endpoint...");
        
        // Manually handle promise and toasts instead of toast.promise
        try {
          const response = await axios.post(`${BASE_URL}/mint-all`, {
            address: wallet.address.toB256(),
          });

          if (response.status !== 200 && response.status !== 201) {
             throw new Error('Mint all request failed with status: ' + response.status);
          }

          // Show success toast
          setIsMinting(false);
          toast.success('Tokens fauceted successfully! You can now swap.');

          // Fetch balances after successful mint
          console.log("Mint successful, fetching balances...");
          await fetchAllBalances();

        } catch (error) { // Catch errors specifically from the API call
           console.error("Error calling /mint-all:", error);
           const errorMessage = 'Failed to faucet tokens, try manually minting';
           toast.error(errorMessage); 
           // Re-throw the error if needed for outer catch block, or just handle here
           // throw err; // Optional: re-throw if the outer catch needs to act on it
        }

      } else {
        console.log("ETH balance is sufficient, skipping mint-all.");
        // Fetch balances anyway if minting was skipped
         await fetchAllBalances(); 
         // Optional: You could add a non-error toast here if desired
         // toast('Balances already sufficient.');
      }
    } catch (error) {
      // Catch errors from balance check or setup phase
      console.error('Error during minting setup:', error);
      // Only show toast if it's not an API error already handled above
      if (error instanceof Error && !error.message.includes('Mint all request failed')) {
         toast.error('Failed to faucet tokens, try manually minting');
      }
    } finally {
      // Hide loading overlay AFTER all operations are done or fail
      setIsMinting(false); 
    }
  };

  // useEffect to call mintAllTokens on wallet connection remains the same
  useEffect(() => {
    if (wallet && !hasInitialMintRef.current) {
      hasInitialMintRef.current = true;
      mintAllTokens();
    }
  }, [isConnected, wallet]);

  useEffect(() => {
    if (!isConnected) {
      hasInitialMintRef.current = false;
    }
  }, [isConnected]);

  const fromTokenTriggerRef = useRef<HTMLButtonElement>(null);
  const toTokenTriggerRef = useRef<HTMLButtonElement>(null);

  // Effect to update document title
  useEffect(() => {
    const updateTitle = () => {
      let title = "SwaySwap"; // Default title

      if (fromToken && toToken) {
        const pair = `${fromToken.symbol}/${toToken.symbol}`;
        if (arePricesLoading) {
          title = `SwaySwap | ${pair}`;
        } else if (fromTokenPrice && toTokenPrice && toTokenPrice > 0) {
          const relativePrice = (fromTokenPrice / toTokenPrice).toLocaleString("en-US", {
            minimumFractionDigits: 3, // Adjust precision as needed
            maximumFractionDigits: 3,
          });
          title = `SwaySwap | ${relativePrice} | ${pair}`;
        } else {
           title = `SwaySwap`; // Price not available state
        }
      }
      
      document.title = title;
    };

    updateTitle(); // Update title initially and on changes

    // Optional: Cleanup function to reset title when component unmounts
    // return () => {
    //   document.title = "O2 Swap"; // Or your default app title
    // };
    
  }, [fromToken, toToken, fromTokenPrice, toTokenPrice, arePricesLoading]); // Dependencies

  return (
    <div className="min-h-screen bg-fuel-dark-800 py-1 sm:py-16 overflow-y-auto relative">
      {isMinting && (
        <div className="fixed inset-0 bg-fuel-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-fuel-dark-800 rounded-xl p-6 max-w-sm mx-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fuel-green" />
            <h3 className="text-lg font-medium mb-2">
              Initializing Your Wallet
            </h3>
            <p className="text-sm text-gray-400">
              Please wait while we mint your test tokens. This may take a few
              moments...
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-[420px] mx-auto px-2 mb-8 mt-4 sm:mt-0">
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

        <div className="bg-fuel-dark-800 rounded-xl p-3 sm:p-4 shadow-lg border border-fuel-dark-600">
          {activeSwapType === "swap" ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">From</span>
                  <span className="text-gray-400">
                    Balance:{" "}
                    <span className="text-white inline-block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap align-bottom"> 
                      {tokenBalances[fromToken.symbol] || "0.000000"}
                    </span>{" "}
                    {fromToken.symbol}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-fuel-dark-700 p-2 rounded-xl">
                  <div className="relative">
                    <button
                      ref={fromTokenTriggerRef}
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
                      triggerRef={fromTokenTriggerRef}
                    />
                  </div>
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-xl sm:text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis placeholder-gray-500"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={async (e) => {
                      const value = e.target.value;
                      const numericValue = parseFloat(value);
                      setFromAmount(value);

                      if (!isNaN(numericValue) && numericValue > 0 && fromTokenPrice && toTokenPrice && toTokenPrice > 0) {
                        const calculatedAmount = (
                          numericValue * (fromTokenPrice / toTokenPrice)
                        ).toFixed(6);
                        setToAmount(calculatedAmount);
                      } else if (value === '' || numericValue === 0) {
                        setToAmount("");
                      } else if (!fromTokenPrice || !toTokenPrice) {
                        await fetchTokenPrices(fromToken.symbol, toToken.symbol);
                      }
                    }}
                  />
                </div>
                <div className="text-right text-xs text-gray-400">
                </div>
              </div>

              <div className="flex justify-center relative z-10 mb-1">
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
                    Balance:{" "}
                    <span className="text-white inline-block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap align-bottom"> 
                      {tokenBalances[toToken.symbol] || "0.000000"}
                    </span>{" "}
                    {toToken.symbol}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-fuel-dark-700 p-2 rounded-xl">
                  <div className="relative">
                    <button
                      ref={toTokenTriggerRef}
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
                      triggerRef={toTokenTriggerRef}
                    />
                  </div>
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis placeholder-gray-500"
                    placeholder="0.00"
                    value={toAmount}
                    onChange={async (e) => {
                      const value = e.target.value;
                      const numericValue = parseFloat(value);
                      setToAmount(value);

                      if (!isNaN(numericValue) && numericValue > 0 && fromTokenPrice && toTokenPrice && fromTokenPrice > 0) {
                        const calculatedAmount = (
                          numericValue * (toTokenPrice / fromTokenPrice)
                        ).toFixed(6);
                        setFromAmount(calculatedAmount);
                      } else if (value === '' || numericValue === 0) {
                        setFromAmount("");
                      } else if (!fromTokenPrice || !toTokenPrice) {
                        await fetchTokenPrices(fromToken.symbol, toToken.symbol);
                      }
                    }}
                  />
                </div>
                {/* <div className="text-right text-xs text-gray-400">
                  ≈ $<span className="text-white">{toToken.usdValue}</span>
                </div> */}
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
                      <span className="text-white inline-block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap align-bottom">
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
                      triggerRef={fromTokenTriggerRef}
                    />
                  </div>
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis placeholder-gray-500"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={async (e) => {
                      const value = e.target.value;
                      const numericValue = parseFloat(value);
                      setFromAmount(value);

                      if (!isNaN(numericValue) && numericValue > 0 && fromTokenPrice && toTokenPrice && fromTokenPrice > 0) {
                        const calculatedAmount = (
                          numericValue * (fromTokenPrice / toTokenPrice)
                        ).toFixed(6);
                        setToAmount(calculatedAmount);
                      } else if (value === '' || numericValue === 0) {
                        setToAmount("");
                      } else if (!fromTokenPrice || !toTokenPrice) {
                        await fetchTokenPrices(fromToken.symbol, toToken.symbol);
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
                    <span className="text-white inline-block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap align-bottom">
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
                      triggerRef={toTokenTriggerRef}
                    />
                  </div>
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis placeholder-gray-500"
                    placeholder="0.00"
                    value={toAmount}
                    onChange={async (e) => {
                      const value = e.target.value;
                      const numericValue = parseFloat(value);
                      setToAmount(value);

                      if (!isNaN(numericValue) && numericValue > 0 && fromTokenPrice && toTokenPrice && fromTokenPrice > 0) {
                        const calculatedAmount = (
                          numericValue * (toTokenPrice / fromTokenPrice)
                        ).toFixed(6);
                        setFromAmount(calculatedAmount);
                      } else if (value === '' || numericValue === 0) {
                        setFromAmount("");
                      } else if (!fromTokenPrice || !toTokenPrice) {
                        await fetchTokenPrices(fromToken.symbol, toToken.symbol);
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
                  {arePricesLoading
                    ? "..."
                    : fromTokenPrice && toTokenPrice && toTokenPrice > 0
                    ? (fromTokenPrice / toTokenPrice).toLocaleString("en-US", {
                        minimumFractionDigits: 6,
                        maximumFractionDigits: 6,
                      })
                    : "N/A"}{" "}
                  {toToken.symbol}
                  {priceFetchError && (
                    <span className="text-red-500 ml-2 text-xs">Error</span>
                  )}
                </span>
                <Info className="w-4 h-4 text-gray-500" />
              </div>
              <button
                className="flex items-center space-x-1 text-fuel-green hover:text-fuel-green-light transition-colors"
                onClick={handlePriceRefresh}
                disabled={arePricesLoading}
              >
                {arePricesLoading ? (
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
                  0.00013 ETH <span className="text-gray-400">(≈ $0.0038)</span>
                </span>
              </div>
              {activeSwapType === "swap" ? (
                <></>
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
                "Place Order"
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
