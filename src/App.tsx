import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowRightLeft, ChevronDown, ExternalLink } from 'lucide-react';
import { AdvancedChart } from "react-tradingview-embed";
import FuelLogo from "./assets/Fuel.svg";
import TradingViewWidget from './components/TradingViewWidget';
import WalletConnect from './components/WalletConnect';
import SwapComponent from './components/SwapComponent';
import DepositModal from './components/DepositModal';
import { TradingService } from './services/tradingService';
import { Order, Trade, OrderBook, ActiveOrder, HistoricalOrder } from './types/trading';
import P2PComponent from './components/P2PComponent';
import ETHIcon from './assets/eth.svg';
import USDCIcon from './assets/usdc.svg';
import USDTIcon from './assets/usdt.svg';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import TradingViewAdvancedWidget from './components/TradingViewAdvancedWidget';

// Add these constants at the top after imports
const PAIR_PRICE_RANGES = {
  'ETH/USDT': {
    basePrice: 3400,
    tickSize: 0.01,
    minQty: 0.001,
    baseAsset: 'ETH',
    quoteAsset: 'USDT'
  },
  'ETH/USDC': {
    basePrice: 3400,
    tickSize: 0.01,
    minQty: 0.001,
    baseAsset: 'ETH',
    quoteAsset: 'USDC'
  },
  'USDC/USDT': {
    basePrice: 1,
    tickSize: 0.0001,
    minQty: 1,
    baseAsset: 'USDC',
    quoteAsset: 'USDT'
  }
} as const;

// Replace the FIXED_ORDERBOOKS constant
const FIXED_ORDERBOOKS = {
  'ETH/USDT': {
    asks: [
      { price: 3325.00, size: 1.850, total: 6151.250 },
      { price: 3324.25, size: 2.650, total: 8809.263 },
      { price: 3323.75, size: 1.350, total: 4486.963 },
      { price: 3323.50, size: 2.150, total: 7145.525 },
      { price: 3322.75, size: 1.840, total: 6113.860 },
      { price: 3322.00, size: 0.950, total: 3155.900 },
      { price: 3321.25, size: 2.750, total: 9133.438 },
      { price: 3320.50, size: 1.250, total: 4150.625 },
      { price: 3319.75, size: 2.950, total: 9793.263 },
      { price: 3319.50, size: 1.550, total: 5144.725 },
      { price: 3329.50, size: 1.693, total: 5849.425 },
      { price: 3321.30, size: 0.850, total: 2144.725 },
      { price: 3322.10, size: 1.550, total: 5269.123 },
      { price: 3319.35, size: 2.250, total: 7468.313 }
    ],
    bids: [
      { price: 3319.25, size: 2.450, total: 8132.163 },
      { price: 3318.50, size: 1.150, total: 3816.275 },
      { price: 3317.75, size: 0.850, total: 2820.088 },
      { price: 3317.00, size: 2.650, total: 8790.050 },
      { price: 3316.25, size: 1.550, total: 5140.188 },
      { price: 3315.50, size: 2.250, total: 7459.875 },
      { price: 3315.00, size: 1.750, total: 5801.250 },
      { price: 3314.75, size: 2.850, total: 9447.038 },
      { price: 3314.25, size: 1.350, total: 4474.238 },
      { price: 3313.75, size: 2.450, total: 8118.688 },
      { price: 3312.75, size: 2.850, total: 9447.038 },
      { price: 3311.25, size: 1.350, total: 4474.238 },
      { price: 3310.75, size: 2.450, total: 8118.688 },
      { price: 3313.25, size: 1.950, total: 6460.838 }
    ]
  },
  'ETH/USDC': {
    asks: [
      { price: 3501.45, size: 1.2500, total: 1.2500 },
      { price: 3502.20, size: 2.1000, total: 3.3500 },
      { price: 3502.95, size: 0.7500, total: 4.1000 },
      { price: 3503.70, size: 3.5000, total: 7.6000 },
      { price: 3504.45, size: 2.2500, total: 9.8500 },
      { price: 3505.20, size: 4.0000, total: 13.8500 }
    ],
    bids: [
      { price: 3500.70, size: 2.9050, total: 2.9050 },
      { price: 3499.95, size: 1.8150, total: 4.7200 },
      { price: 3499.20, size: 0.7500, total: 5.4700 },
      { price: 3498.45, size: 4.9300, total: 10.4000 },
      { price: 3497.70, size: 2.1850, total: 12.5850 },
      { price: 3496.95, size: 1.5800, total: 14.1650 }
    ]
  },
  'USDC/USDT': {
    asks: [
      { price: 1.0002, size: 10000, total: 10000 },
      { price: 1.0003, size: 15000, total: 25000 },
      { price: 1.0004, size: 5000, total: 30000 },
      { price: 1.0005, size: 25000, total: 55000 },
      { price: 1.0006, size: 20000, total: 75000 },
      { price: 1.0007, size: 30000, total: 105000 }
    ],
    bids: [
      { price: 1.0001, size: 12000, total: 12000 },
      { price: 1.0000, size: 18000, total: 30000 },
      { price: 0.9999, size: 8000, total: 38000 },
      { price: 0.9998, size: 22000, total: 60000 },
      { price: 0.9997, size: 15000, total: 75000 },
      { price: 0.9996, size: 25000, total: 100000 }
    ]
  }
} as const;

// Replace the generateMockOrderBook function with fixed data
const generateMockOrderBook = (pair: TradingPair) => {
  return FIXED_ORDERBOOKS[pair];
};

// Add these types
interface HistoricalPrice {
  time: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volumefrom: number;
  volumeto: number;
}

// Add this function to fetch historical data
const fetchHistoricalPrices = async (symbol: string, timeframe: string = 'minute', limit: number = 1500) => {
  try {
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/v2/histo${timeframe}?fsym=${symbol}&tsym=USD&limit=${limit}`
    );
    const data = await response.json();
    return data.Data.Data as HistoricalPrice[];
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    return [];
  }
};

// Update the generateETHPriceHistory function
const generateETHPriceHistory = async (startPrice: number, baseTimestamp: number) => {
  // Fetch real ETH price data
  const historicalPrices = await fetchHistoricalPrices('ETH');
  
  if (historicalPrices.length === 0) {
    // Fallback to synthetic data if API fails
    return generateSyntheticPriceHistory(startPrice, baseTimestamp);
  }

  return historicalPrices.map(price => ({
    open: price.open,
    close: price.close,
    high: price.high,
    low: price.low,
    volume: price.volumeto, // Use quote currency volume
    quantity: price.volumefrom, // Use base currency volume
    price: price.close,
    timestamp: price.time * 1000, // Convert to milliseconds
    time: new Date(price.time * 1000).toLocaleTimeString(),
    type: price.close >= price.open ? 'buy' as const : 'sell' as const
  }));
};

// Rename the old function as fallback
const generateSyntheticPriceHistory = (startPrice: number, baseTimestamp: number) => {
  const pricePoints = [
    ...Array.from({ length: 1152 }, (_, i) => {
      const progress = i / 1152;
      const trend = 50 * Math.sin(progress * Math.PI); // Create a wave pattern
      const volatility = 20 * (1 + Math.sin(progress * Math.PI * 4)); // Variable volatility
      const noise = (Math.random() - 0.5) * volatility;
      const basePrice = startPrice + trend + noise;
      
      // Generate more realistic candle data
      const candleSpread = (5 + Math.random() * 15) * (volatility / 20); // Spread varies with volatility
      const wickSpread = candleSpread * (1 + Math.random()); // Wicks extend beyond body
      
      // Determine if candle is bullish or bearish with slight bullish bias
      const isBullish = Math.random() > 0.48;
      
      // Calculate OHLC
      const open = basePrice;
      const close = isBullish ? basePrice + candleSpread : basePrice - candleSpread;
      const high = Math.max(open, close) + (Math.random() * wickSpread);
      const low = Math.min(open, close) - (Math.random() * wickSpread);
      
      // Generate realistic volume
      const volumeBase = 50000 + Math.random() * 100000; // Increase base volume
      const volumeSpike = Math.abs(close - open) > candleSpread * 1.5 ? 
        Math.random() * 200000 : 0; // Larger volume spikes on big moves
      const volume = volumeBase + volumeSpike;
      
      return {
        open,
        close,
        high,
        low,
        volume,
        quantity: volume / ((high + low) / 2),
        price: close,
        timestamp: baseTimestamp - (14-1)*24*60*60*1000 + i*5*60*1000,
        time: new Date(baseTimestamp - (14-1)*24*60*60*1000 + i*5*60*1000).toLocaleTimeString(),
        type: isBullish ? 'buy' as const : 'sell' as const
      };
    })
  ];

  return pricePoints;
};

// Mock data for the order book
const mockOrderBook = {
  asks: [
    { price: 0.04488, size: 150.000, total: 16.40000 },
    { price: 0.04487, size: 200.000, total: 9.00000 },
    { price: 0.04486, size: 50.000, total: 2.20000 },
    { price: 0.04485, size: 450.000, total: 796.50000 },
    { price: 0.04484, size: 250.000, total: 83.33333 },
    { price: 0.04483, size: 500.000, total: 95.00000 },
  ],
  bids: [
    { price: 0.04375, size: 390.5, total: 390.5 },
    { price: 0.04374, size: 231.5, total: 622.0 },
    { price: 0.04373, size: 0.5, total: 622.5 },
    { price: 0.04372, size: 59.3, total: 681.8 },
    { price: 0.04371, size: 248.5, total: 930.3 },
    { price: 0.04370, size: 17.8, total: 948.1 },
  ]
};

// Update the mock trades data to include timestamps
const mockTrades = [
  { price: 0.04200, quantity: 2488.5714, time: '15:14:33', timestamp: Date.now() - 1000 * 60 * 5 },
  { price: 0.04200, quantity: 1885.9524, time: '15:14:33', timestamp: Date.now() - 1000 * 60 * 4 },
  { price: 0.04200, quantity: 1462.3810, time: '15:14:33', timestamp: Date.now() - 1000 * 60 * 3 },
  { price: 0.04198, quantity: 2895.2381, time: '15:14:32', timestamp: Date.now() - 1000 * 60 * 2 },
  { price: 0.04197, quantity: 1468.1292, time: '15:14:31', timestamp: Date.now() - 1000 * 60 * 1 },
  { price: 0.04201, quantity: 1458.2168, time: '14:56:25', timestamp: Date.now() - 1000 * 60 * 5 },
  { price: 0.04202, quantity: 1412.2567, time: '14:47:16', timestamp: Date.now() - 1000 * 60 * 4 },
  { price: 0.04100, quantity: 40.0000, time: '13:35:04', timestamp: Date.now() - 1000 * 60 * 3 },
  { price: 0.04335, quantity: 30.0000, time: '14:00:48', timestamp: Date.now() - 1000 * 60 * 2 },
  { price: 0.04650, quantity: 76068.6449, time: '21:40:29', timestamp: Date.now() - 1000 * 60 * 1 },
  { price: 0.04650, quantity: 9652.4544, time: '21:33:58', timestamp: Date.now() - 1000 * 60 * 5 },
  { price: 0.04648, quantity: 76231.6484, time: '21:28:44', timestamp: Date.now() - 1000 * 60 * 4 },
  { price: 0.04652, quantity: 10724.4993, time: '21:27:23', timestamp: Date.now() - 1000 * 60 * 3 },
  { price: 0.04650, quantity: 62372.0000, time: '21:24:31', timestamp: Date.now() - 1000 * 60 * 2 },
  { price: 0.04649, quantity: 76108.2142, time: '21:21:37', timestamp: Date.now() - 1000 * 60 * 1 },
  { price: 0.04650, quantity: 71486.4012, time: '21:18:52', timestamp: Date.now() - 1000 * 60 * 5 },
  { price: 0.04651, quantity: 70296.0842, time: '21:13:58', timestamp: Date.now() - 1000 * 60 * 4 },
  { price: 0.04650, quantity: 76151.9388, time: '21:07:07', timestamp: Date.now() - 1000 * 60 * 3 },
  { price: 0.04649, quantity: 74242.4428, time: '20:59:36', timestamp: Date.now() - 1000 * 60 * 2 },
  { price: 0.04650, quantity: 74058.6566, time: '20:59:13', timestamp: Date.now() - 1000 * 60 * 1 },
  { price: 0.04648, quantity: 74812.3014, time: '20:55:36', timestamp: Date.now() - 1000 * 60 * 5 },
  { price: 0.04650, quantity: 73319.4221, time: '20:51:22', timestamp: Date.now() - 1000 * 60 * 4 },
  { price: 0.04649, quantity: 72813.2808, time: '20:50:00', timestamp: Date.now() - 1000 * 60 * 3 },
  { price: 0.04650, quantity: 72936.2528, time: '20:48:48', timestamp: Date.now() - 1000 * 60 * 2 },
  { price: 0.04655, quantity: 70294.4081, time: '20:47:42', timestamp: Date.now() - 1000 * 60 * 1 },
  { price: 0.04655, quantity: 70523.4959, time: '20:44:24', timestamp: Date.now() - 1000 * 60 * 5 },
  { price: 0.04655, quantity: 71431.0845, time: '20:42:45', timestamp: Date.now() - 1000 * 60 * 4 },
  { price: 0.04655, quantity: 70660.4605, time: '20:41:37', timestamp: Date.now() - 1000 * 60 * 3 },
  { price: 0.04444, quantity: 67316.0272, time: '20:40:22', timestamp: Date.now() - 1000 * 60 * 2 },
  { price: 0.04444, quantity: 68001.9068, time: '20:28:55', timestamp: Date.now() - 1000 * 60 * 1 },
];

// Add these helper functions at the top of the file, after mock data
const calculateSpread = (asks: typeof mockOrderBook.asks, bids: typeof mockOrderBook.bids) => {
  if (!asks.length || !bids.length) {
    return {
      spread: 0,          // Return numbers instead of strings
      spreadPercentage: 0,
      avgPrice: 0
    };
  }

  const lowestAsk = Math.min(...asks.map(ask => Number(ask.price)));
  const highestBid = Math.max(...bids.map(bid => Number(bid.price)));
  
  if (isNaN(lowestAsk) || isNaN(highestBid)) {
    return {
      spread: 0,
      spreadPercentage: 0,
      avgPrice: 0
    };
  }

  const spread = lowestAsk - highestBid;
  const spreadPercentage = (spread / lowestAsk) * 100;
  const avgPrice = (lowestAsk + highestBid) / 2;
  
  return {
    spread,              // Return raw numbers
    spreadPercentage,
    avgPrice
  };
};

// Add this type and constant before the App component
type TradingPair = 'ETH/USDT' | 'ETH/USDC' | 'USDC/USDT';

const TRADING_PAIRS: TradingPair[] = ['ETH/USDT', 'ETH/USDC', 'USDC/USDT'];

// Add this helper function
const getTokenIcon = (token: string) => {
  switch (token) {
    case 'ETH':
      return ETHIcon;
    case 'USDC':
      return USDCIcon;
    case 'USDT':
      return USDTIcon;
    default:
      return USDCIcon;
  }
};

// Add to your existing types
interface UserTrade extends Trade {
  type: 'buy' | 'sell';
  timestamp: number;
}

// Add this type near the top with other types
type TimeframeOption = {
  label: string;
  minutes: number;
};

// Add these constants
const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: '5s', minutes: 5/60 },  // 5 seconds
  { label: '1m', minutes: 1 },     // 1 minute
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '1h', minutes: 60 },
  { label: '4h', minutes: 240 },
  { label: '1d', minutes: 1440 },
];

// Add these helper functions to calculate statistics
const calculatePriceStats = (trades: Trade[]) => {
  if (!trades.length) return { last: 0, high: 0, low: 0, volume: 0, change: 0 };

  const last24h = trades.filter(t => t.timestamp > Date.now() - 24 * 60 * 60 * 1000);
  if (!last24h.length) return { last: 0, high: 0, low: 0, volume: 0, change: 0 };

  const prices = last24h.map(t => t.price || t.close || 0);
  const volumes = last24h.map(t => t.quantity);

  const lastPrice = prices[0];
  const openPrice = prices[prices.length - 1];
  const priceChange = ((lastPrice - openPrice) / openPrice) * 100;

  return {
    last: lastPrice,
    high: Math.max(...prices),
    low: Math.min(...prices),
    volume: volumes.reduce((a, b) => a + b, 0),
    change: priceChange
  };
};

function App() {
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [size, setSize] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [activeView, setActiveView] = useState<'orderbook' | 'trades' | 'chart'>('orderbook');
  const [isOrderTypeOpen, setIsOrderTypeOpen] = useState(false);
  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'terminal' | 'swap' | 'p2p'>('terminal');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'chart' | 'orderbook' | 'trades'>('chart');
  const [mobileBottomView, setMobileBottomView] = useState<'orders' | 'history'>('orders');
  const [selectedPair, setSelectedPair] = useState<TradingPair>('ETH/USDT');
  const [isPairSelectOpen, setIsPairSelectOpen] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{
    size: string;
    price: string;
    type: 'limit' | 'market';
    action: 'buy' | 'sell';
  } | null>(null);

  // Add this with other state declarations
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(TIMEFRAME_OPTIONS[2]); // Default to 5m

  const [orderBook, setOrderBook] = useState<OrderBook>(() => {
    const mockData = generateMockOrderBook(selectedPair);
    return {
      asks: mockData.asks.map(ask => ({
        id: Math.random().toString(36).substring(2, 15),
        ...ask,
        // Ensure price is a number
        price: Number(ask.price),
        size: Number(ask.size),
        total: Number(ask.total),
        type: 'sell' as const,
        timestamp: Date.now()
      })),
      bids: mockData.bids.map(bid => ({
        id: Math.random().toString(36).substring(2, 15),
        ...bid,
        // Ensure price is a number
        price: Number(bid.price),
        size: Number(bid.size),
        total: Number(bid.total),
        type: 'buy' as const,
        timestamp: Date.now()
      }))
    };
  });
  
  // Add state for trade data
  const [tradeData, setTradeData] = useState<{
    'ETH/USDT': Trade[];
    'ETH/USDC': Trade[];
    'USDC/USDT': Trade[];
  }>({
    'ETH/USDT': [],
    'ETH/USDC': [],
    'USDC/USDT': []
  });

  // Initialize trades and displayTrades with empty arrays
  const [trades, setTrades] = useState<Trade[]>([]);
  const [displayTrades, setDisplayTrades] = useState<Trade[]>([]);

  // Add this state to track the initial historical data
  const [historicalTrades, setHistoricalTrades] = useState<Trade[]>([]);

  // First add the priceStats state
  const [priceStats, setPriceStats] = useState<Record<TradingPair, {
    last: number;
    high: number;
    low: number;
    volume: number;
    change: number;
  }>>(() => {
    const stats: Record<TradingPair, any> = {};
    TRADING_PAIRS.forEach(pair => {
      stats[pair as TradingPair] = calculatePriceStats(tradeData[pair as keyof typeof tradeData] || []);
    });
    return stats;
  });

  // Update the useEffect for price stats to handle all pairs
  useEffect(() => {
    const newStats: Record<TradingPair, any> = {};
    TRADING_PAIRS.forEach(pair => {
      newStats[pair as TradingPair] = calculatePriceStats(tradeData[pair as keyof typeof tradeData] || []);
    });
    setPriceStats(newStats);
  }, [tradeData]);

  // Fetch historical data on component mount
  useEffect(() => {
    const initializeTradeData = async () => {
      try {
        const ethUsdtTrades = await generateETHPriceHistory(3500, Date.now());
        
        // Create ETH/USDC trades with small price variations
        const ethUsdcTrades = ethUsdtTrades.map(trade => ({
          ...trade,
          open: trade.open * (1 + (Math.random() * 0.001 - 0.0005)),
          close: trade.close * (1 + (Math.random() * 0.001 - 0.0005)),
          high: trade.high * (1 + (Math.random() * 0.001 - 0.0005)),
          low: trade.low * (1 + (Math.random() * 0.001 - 0.0005)),
          price: trade.price * (1 + (Math.random() * 0.001 - 0.0005)),
        }));

        // Generate USDC/USDT trades
        const usdcUsdtTrades = Array.from({ length: 672 }, (_, i) => ({
          price: 1 + (Math.random() * 0.0004 - 0.0002),
          quantity: 5000 + Math.round(Math.random() * 15000),
          timestamp: Date.now() - (14-i/48)*24*60*60*1000,
          time: new Date(Date.now() - (14-i/48)*24*60*60*1000).toLocaleTimeString(),
          type: Math.random() > 0.5 ? 'buy' as const : 'sell' as const,
          open: 1 + (Math.random() * 0.0002 - 0.0001),
          close: 1 + (Math.random() * 0.0002 - 0.0001),
          high: 1 + (Math.random() * 0.0002),
          low: 1 - (Math.random() * 0.0002),
          volume: 1000000 + Math.random() * 2000000
        }));

        const newTradeData = {
          'ETH/USDT': ethUsdtTrades,
          'ETH/USDC': ethUsdcTrades,
          'USDC/USDT': usdcUsdtTrades
        };

        setTradeData(newTradeData);
        
        // Store historical data for the current pair
        setHistoricalTrades(newTradeData[selectedPair]);
        
        // Initialize trades with historical data
        setTrades(newTradeData[selectedPair].sort((a, b) => a.timestamp - b.timestamp));
        setDisplayTrades([...newTradeData[selectedPair]].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50));
      } catch (error) {
        console.error('Error initializing trade data:', error);
      }
    };

    initializeTradeData();
  }, [selectedPair]); // Add selectedPair as dependency

  // Add this effect to update trades and stats when pair changes
  useEffect(() => {
    if (tradeData[selectedPair]) {
      const pairTrades = tradeData[selectedPair];
      setTrades(pairTrades.sort((a, b) => a.timestamp - b.timestamp));
      setDisplayTrades([...pairTrades].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50));
      setHistoricalTrades(pairTrades);
      
      // Update price stats for the new pair
      setPriceStats(prevStats => ({
        ...prevStats,
        [selectedPair]: calculatePriceStats(pairTrades)
      }));
    }
  }, [selectedPair, tradeData]);

  // Add new state for orders and history
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [orderHistory, setOrderHistory] = useState<HistoricalOrder[]>([]);

  // Add state for user trades
  const [userTrades, setUserTrades] = useState<UserTrade[]>([]);

  const tradingService = useMemo(() => new TradingService(), []);
  const [selectedPairr, setSelectedPairr] = useState("RISH/USDC");
  const [selectedInterval, setSelectedInterval] = useState("15");

  const pairs = ["RISH/USDC", "HEM/USDT"];
  const intervals = [
    { label: "1m", value: "1" },
    { label: "5m", value: "5" },
    { label: "15m", value: "15" },
    { label: "30m", value: "30" },
    { label: "1h", value: "60" },
    { label: "4h", value: "240" },
    { label: "1d", value: "D" },
  ];
  // Add effect to update data when pair changes
  useEffect(() => {
    const newMockData = generateMockOrderBook(selectedPair);
    setOrderBook({
      asks: newMockData.asks.map(ask => ({
        id: Math.random().toString(36).substring(2, 15),
        ...ask,
        // Ensure price is a number
        price: Number(ask.price),
        size: Number(ask.size),
        total: Number(ask.total),
        type: 'sell' as const,
        timestamp: Date.now()
      })),
      bids: newMockData.bids.map(bid => ({
        id: Math.random().toString(36).substring(2, 15),
        ...bid,
        // Ensure price is a number
        price: Number(bid.price),
        size: Number(bid.size),
        total: Number(bid.total),
        type: 'buy' as const,
        timestamp: Date.now()
      }))
    });
    setTrades(tradeData[selectedPair]);
  }, [selectedPair, tradeData]);

  // Update the token display in the order form
  const getCurrentPairTokens = useCallback(() => {
    const [baseAsset, quoteAsset] = selectedPair.split('/');
    return { baseAsset, quoteAsset };
  }, [selectedPair]);

  const handlePlaceOrder = useCallback(() => {
    if (!size) return;
    
    // Check if confirmation is disabled in localStorage
    const hideConfirmation = localStorage.getItem('hideOrderConfirmation') === 'true';
    
    if (!hideConfirmation) {
      setPendingOrder({
        size,
        price: price || 'Market',
        type: orderType,
        action: tradeType
      });
      setShowOrderConfirmation(true);
      return;
    }
    
    // Execute order logic here
    executeOrder();
  }, [price, size, tradeType, orderType]);

  const executeOrder = useCallback(() => {
    if (!size) return;

    if (orderType === 'market') {
      // For market orders, match against existing orderbook immediately
      const sizeToFill = parseFloat(size);
      let remainingSize = sizeToFill;
      const newTrades: Trade[] = [];
      const updatedOrders = { ...orderBook };
      
      // For buy orders, match against asks (starting from lowest price)
      // For sell orders, match against bids (starting from highest price)
      const ordersToMatch = tradeType === 'buy' 
        ? [...orderBook.asks].sort((a, b) => a.price - b.price)
        : [...orderBook.bids].sort((a, b) => b.price - a.price);

      for (const order of ordersToMatch) {
        if (remainingSize <= 0) break;

        const fillSize = Math.min(remainingSize, order.size);
        remainingSize -= fillSize;

        // Create trade
        const trade: Trade = {
          price: order.price,
          quantity: fillSize,
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          type: tradeType
        };
        newTrades.push(trade);

        // Update order size or remove if fully filled
        if (tradeType === 'buy') {
          updatedOrders.asks = updatedOrders.asks.map(ask => 
            ask.price === order.price 
              ? { ...ask, size: ask.size - fillSize }
              : ask
          ).filter(ask => ask.size > 0);
        } else {
          updatedOrders.bids = updatedOrders.bids.map(bid => 
            bid.price === order.price 
              ? { ...bid, size: bid.size - fillSize }
              : bid
          ).filter(bid => bid.size > 0);
        }
      }

      if (newTrades.length > 0) {
        // Update orderbook
        setOrderBook(updatedOrders);

        // Update trades list
        setTrades(prev => [...newTrades, ...prev].slice(0, 30));

        // Add to user trades
        newTrades.forEach(trade => {
          const userTrade: UserTrade = {
            ...trade,
            type: tradeType,
          };
          setUserTrades(prev => [...prev, userTrade]);
        });

        // Add to history
        const historicalOrder: HistoricalOrder = {
          id: tradingService.generateOrderId(),
          price: newTrades.reduce((avg, t) => avg + t.price * t.quantity, 0) / 
                newTrades.reduce((sum, t) => sum + t.quantity, 0),
          size: sizeToFill,
          total: newTrades.reduce((sum, t) => sum + t.price * t.quantity, 0),
          type: tradeType,
          timestamp: Date.now(),
          status: remainingSize === 0 ? 'filled' : 'partial',
          filled: sizeToFill - remainingSize,
          completedAt: Date.now()
        };
        setOrderHistory(prev => [historicalOrder, ...prev]);
      }
    } else {
      // Existing limit order logic
      if (!price) return;

      const { trades: newTrades, updatedOrderBook, remainingOrder } = tradingService.createOrder(
        tradeType,
        parseFloat(price),
        parseFloat(size),
        orderBook
      );

      // Update orderbook
      setOrderBook(updatedOrderBook);

      // Update trades
      if (newTrades.length > 0) {
        setTrades(prev => [...newTrades, ...prev].slice(0, 30));
        
        // Add user trade marker
        const userTrade: UserTrade = {
          price: parseFloat(price),
          quantity: parseFloat(size),
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          type: tradeType,
        };
        setUserTrades(prev => [...prev, userTrade]);
      }

      // Add to active orders if partially filled or not filled at all
      if (remainingOrder) {
        const activeOrder: ActiveOrder = {
          ...remainingOrder,
          status: newTrades.length > 0 ? 'partial' : 'open',
          filled: newTrades.reduce((acc, trade) => acc + trade.quantity, 0)
        };
        setActiveOrders(prev => [...prev, activeOrder]);
      } 
      
      // Add to history if fully filled
      if (newTrades.length > 0 && !remainingOrder) {
        const historicalOrder: HistoricalOrder = {
          id: tradingService.generateOrderId(),
          price: parseFloat(price),
          size: parseFloat(size),
          total: parseFloat(price) * parseFloat(size),
          type: tradeType,
          timestamp: Date.now(),
          status: 'filled',
          filled: parseFloat(size),
          completedAt: Date.now()
        };
        setOrderHistory(prev => [historicalOrder, ...prev]);
      }
    }

    // Reset form
    setPrice('');
    setSize('');
    setShowOrderConfirmation(false);
    setPendingOrder(null);
  }, [price, size, tradeType, orderType, orderBook, tradingService]);

  // Update the cancel order function
  const handleCancelOrder = useCallback((orderId: string) => {
    setActiveOrders(prev => {
      const orderToCancel = prev.find(order => order.id === orderId);
      if (!orderToCancel) return prev;

      // Add to history as cancelled
      const historicalOrder: HistoricalOrder = {
        ...orderToCancel,
        status: 'cancelled',
        filled: orderToCancel.filled || 0, // Provide default value for filled
        completedAt: Date.now()
      };
      setOrderHistory(prev => [historicalOrder, ...prev]);

      // Remove from active orders
      return prev.filter(order => order.id !== orderId);
    });
  }, []);

  // Add these near the top with other state declarations
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);

  // Add these helper functions
  const getRandomPrice = (basePrice: number, spread: number, pair: TradingPair) => {
    if (pair === 'USDC/USDT') {
      const stableSpread = 0.0002;
      return 1 + (Math.random() * stableSpread - stableSpread/2);
    }
    
    const variation = (Math.random() - 0.5) * 2 * spread;
    return Number((basePrice + variation).toFixed(2));
  };

  // Add effect to update simulation when timeframe changes
  useEffect(() => {
    if (isSimulating) {
      // Stop current simulation
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
      
      // Restart simulation with new interval
      simulateMarketActivity();
      const interval = setInterval(simulateMarketActivity, 
        Math.min(selectedTimeframe.minutes * 60 * 1000 / 5, 1000)
      );
      setSimulationInterval(interval);
    }
  }, [selectedTimeframe, isSimulating]); // Add cleanup to prevent memory leaks

  // Add this helper function to get the latest price
  const getLatestPrice = (trades: Trade[]) => {
    if (!trades.length) return 0;
    return trades[trades.length - 1].close || trades[trades.length - 1].price;
  };

  // Update the simulateMarketActivity function
  const simulateMarketActivity = () => {
    if (!trades.length) return;

    const lastPrice = getLatestPrice(trades);
    const timeframeMinutes = selectedTimeframe.minutes;
    
    // Calculate realistic volatility based on timeframe
    const baseVolatility = timeframeMinutes < 1 ? 0.0001 : // 0.01% for sub-minute
                          timeframeMinutes < 5 ? 0.0003 : // 0.03% for 1m
                          timeframeMinutes < 15 ? 0.0005 : // 0.05% for 5m
                          timeframeMinutes < 60 ? 0.001 : // 0.1% for 15m
                          timeframeMinutes < 240 ? 0.002 : // 0.2% for 1h
                          0.005; // 0.5% for 4h and above

    // Generate fewer trades for smaller timeframes
    const tradesPerUpdate = selectedTimeframe.minutes < 1 ? 1 : 
                           selectedTimeframe.minutes < 5 ? 2 : 3;
                         
    const newSimulatedTrades: Trade[] = [];
    
    for (let i = 0; i < tradesPerUpdate; i++) {
      // Use previous trade as base for next trade
      const prevTrade = trades[trades.length - 1];
      const prevPrice = prevTrade.close || prevTrade.price;
      
      // Calculate price movement
      const trend = Math.random() - 0.48; // Slight bullish bias
      const volatility = baseVolatility * (1 + Math.random()); // Random volatility spike
      const priceChange = prevPrice * volatility * (trend > 0 ? 1 : -1);
      
      // Calculate OHLC
      const basePrice = prevPrice + priceChange;
      const spread = basePrice * (baseVolatility / 2);
      const wickSize = spread * (1 + Math.random());
      
      const open = basePrice;
      const close = basePrice + (Math.random() - 0.5) * spread;
      const high = Math.max(open, close) + Math.random() * wickSize;
      const low = Math.min(open, close) - Math.random() * wickSize;
      
      // Generate realistic volume
      const baseVolume = selectedPair === 'USDC/USDT' ? 
        (50000 + Math.random() * 100000) : // Higher volume for stablePair
        (10 + Math.random() * 20); // Lower volume for ETH pairs
      
      const volumeSpike = Math.abs(close - open) > spread * 1.5 ? 
        baseVolume * (1 + Math.random() * 3) : 0; // Volume spike on big moves
      
      const volume = baseVolume + volumeSpike;
      
      // Create timestamp with proper time progression
      const timestamp = Date.now() + (i * 100); // Add small time offset for each trade
      const timeStr = new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const newTrade = {
        price: close,
        quantity: volume / ((high + low) / 2),
        timestamp,
        time: timeStr,
        type: close >= open ? 'buy' as const : 'sell' as const,
        open,
        close,
        high,
        low,
        volume
      };

      newSimulatedTrades.push(newTrade);
    }

    // Update trades while preserving historical data
    setTrades(prev => {
      // Combine historical and new trades
      const allTrades = [...historicalTrades, ...prev.filter(t => t.timestamp > historicalTrades[historicalTrades.length - 1].timestamp), ...newSimulatedTrades];
      
      // Sort by timestamp
      const sortedTrades = allTrades.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove duplicates based on timestamp
      const uniqueTrades = sortedTrades.filter((trade, index, self) =>
        index === self.findIndex(t => t.timestamp === trade.timestamp)
      );
      
      // Update price stats for the current pair
      setPriceStats(prevStats => ({
        ...prevStats,
        [selectedPair]: calculatePriceStats(uniqueTrades)
      }));
      
      return uniqueTrades;
    });

    // Update display trades
    setDisplayTrades(prev => {
      const newTrades = [...newSimulatedTrades, ...prev].slice(0, 50);
      return newTrades.sort((a, b) => b.timestamp - a.timestamp);
    });

    // Update order book with the new price
    setOrderBook(prev => {
      // Get the latest trade's close price
      const latestTrade = newSimulatedTrades[newSimulatedTrades.length - 1];
      const currentPrice = latestTrade.close;
      
      const spread = currentPrice * 0.0002; // 0.02% spread
      const newAsks = [...prev.asks];
      const newBids = [...prev.bids];

      // Update asks
      for (let i = 0; i < newAsks.length; i++) {
        const randomChange = (Math.random() - 0.5) * spread;
        const newSize = Math.max(0.1, newAsks[i].size + (Math.random() - 0.5) * 2);
        const newPrice = Number(currentPrice + spread + randomChange + (i * spread));
        newAsks[i] = {
          ...newAsks[i],
          price: newPrice,
          size: newSize,
          total: Number((newSize * newPrice).toFixed(5)),
          timestamp: Date.now(),
          type: 'sell' as const
        };
      }

      // Update bids
      for (let i = 0; i < newBids.length; i++) {
        const randomChange = (Math.random() - 0.5) * spread;
        const newSize = Math.max(0.1, newBids[i].size + (Math.random() - 0.5) * 2);
        const newPrice = Number(currentPrice - spread + randomChange - (i * spread));
        newBids[i] = {
          ...newBids[i],
          price: newPrice,
          size: newSize,
          total: Number((newSize * newPrice).toFixed(5)),
          timestamp: Date.now(),
          type: 'buy' as const
        };
      }

      // Sort asks ascending and bids descending by price
      newAsks.sort((a, b) => a.price - b.price);
      newBids.sort((a, b) => b.price - a.price);

      return {
        asks: newAsks,
        bids: newBids
      };
    });
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
  };

  // Add cleanup for simulation
  useEffect(() => {
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [simulationInterval]);

  // Add this function back to App.tsx
  const startSimulation = () => {
    setIsSimulating(true);
    simulateMarketActivity(); // Run once immediately
    const interval = setInterval(simulateMarketActivity, 
      Math.min(selectedTimeframe.minutes * 60 * 1000 / 5, 1000)
    );
    setSimulationInterval(interval);
  };

  // Add effect to reset trades when stopping simulation
  useEffect(() => {
    if (!isSimulating && historicalTrades.length > 0) {
      setTrades(historicalTrades);
      setDisplayTrades([...historicalTrades].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50));
    }
  }, [isSimulating, historicalTrades]);

  // Add these new state variables near the top with other state declarations
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-screen flex flex-col bg-fuel-dark-900 text-gray-100">
      {/* Header - Always visible */}
      <header className="border-b border-fuel-dark-600 bg-fuel-dark-800 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 space-y-2 sm:space-y-0">
          <div className="flex items-center justify-between sm:space-x-8">
            <div className="flex items-center space-x-1">
              <img src={FuelLogo} alt="FUEL Logo" className="w-5 h-5 sm:w-7 sm:h-7 mt-1.5" />
              <span className="text-base sm:text-lg font-bold">FUEL DEX</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                className={`px-3 sm:px-4 py-1.5 rounded text-xs sm:text-sm transition-colors outline-none
                  ${
                    activeScreen === "terminal"
                      ? "bg-fuel-dark-700 text-fuel-green"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                onClick={() => setActiveScreen("terminal")}
              >
                Terminal
              </button>
              <button
                className={`px-3 sm:px-4 py-1.5 rounded text-xs sm:text-sm transition-colors outline-none
                  ${
                    activeScreen === "swap"
                      ? "bg-fuel-dark-700 text-fuel-green"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                onClick={() => setActiveScreen("swap")}
              >
                Swap
              </button>
              <button
                className={`px-3 sm:px-4 py-1.5 rounded text-xs sm:text-sm transition-colors outline-none
                  ${
                    activeScreen === "p2p"
                      ? "bg-fuel-dark-700 text-fuel-green"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                onClick={() => setActiveScreen("p2p")}
              >
                P2P
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {activeScreen === "terminal" && (
              <div className="flex items-center space-x-2">
                {isSimulating ? (
                  <button
                    onClick={stopSimulation}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-xs font-medium rounded bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors outline-none border border-red-500/30"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Stop Simulation</span>
                  </button>
                ) : (
                  <button
                    onClick={startSimulation}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-xs font-medium rounded bg-fuel-green/10 text-fuel-green hover:bg-fuel-green/20 transition-colors outline-none border border-fuel-green/30"
                  >
                    <span>Start Simulation</span>
                  </button>
                )}
              </div>
            )}
            <button
              className="px-3 sm:px-4 py-1.5 rounded bg-fuel-dark-700 text-gray-100 text-xs sm:text-sm hover:bg-fuel-dark-600 outline-none"
              onClick={() => setIsDepositModalOpen(true)}
            >
              Deposit
            </button>
            <WalletConnect />
          </div>
        </div>
      </header>



      {/* Mobile Navigation Tabs */}
      {activeScreen === "terminal" && (
        <div className="sm:hidden bg-fuel-dark-800 border-b border-fuel-dark-600">
          <div className="flex">
            <button
              className={`flex-1 py-3 text-center text-sm border-b-2 transition-colors outline-none
                ${
                  mobileView === "chart"
                    ? "border-fuel-green text-fuel-green"
                    : "border-transparent text-gray-400"
                }`}
              onClick={() => setMobileView("chart")}
            >
              Chart
            </button>
            <button
              className={`flex-1 py-3 text-center text-sm border-b-2 transition-colors outline-none
                ${
                  mobileView === "orderbook"
                    ? "border-fuel-green text-fuel-green"
                    : "border-transparent text-gray-400"
                }`}
              onClick={() => setMobileView("orderbook")}
            >
              Order Book
            </button>
            <button
              className={`flex-1 py-3 text-center text-sm border-b-2 transition-colors outline-none
                ${
                  mobileView === "trades"
                    ? "border-fuel-green text-fuel-green"
                    : "border-transparent text-gray-400"
                }`}
              onClick={() => setMobileView("trades")}
            >
              Trades
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0">
        {activeScreen === "terminal" ? (
          <>
            {/* Mobile View Content */}
            <div className="sm:hidden flex flex-col h-full">
              {/* Main Content Area */}
              <div className="flex-1 overflow-hidden">
                {mobileView === "chart" && (
                  <div className="h-[300px]">
                    <TradingViewWidget
                      trades={trades}
                      userTrades={userTrades}
                      selectedTimeframe={selectedTimeframe}
                      onTimeframeChange={setSelectedTimeframe} // Add this prop
                    />
                  </div>
                )}

                {mobileView === "orderbook" && (
                  <div className="h-[300px] overflow-auto">
                    <div className="p-2">
                      <div className="text-[10px] grid grid-cols-3 text-gray-400 mb-2">
                        <span>Price</span>
                        <span className="text-right">Amount</span>
                        <span className="text-right">Total</span>
                      </div>

                      {/* Asks */}
                      <div className="space-y-0.5 mb-2">
                        {orderBook.asks.map((order, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-3 text-[10px] sm:text-xs relative overflow-hidden"
                          >
                            <div
                              className="absolute inset-0 bg-red-500/10"
                              style={{
                                width: `${(order.total / 2016.4) * 100}%`,
                              }}
                            ></div>
                            <span className="relative z-10 text-red-400">
                              {order.price.toFixed(3)}
                            </span>
                            <span className="relative z-10 text-right">
                              {order.size.toFixed(3)}
                            </span>
                            <span className="relative z-10 text-right text-gray-500">
                              {order.total.toFixed(3)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Current Price */}
                      <div className="sticky top-0 text-center py-1.5 space-y-1 border-y border-fuel-dark-600 bg-fuel-dark-700">
                        <div className="text-fuel-green text-xs sm:text-sm font-medium">
                          {calculateSpread(
                            orderBook.asks,
                            orderBook.bids
                          ).avgPrice.toFixed(3)}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-400">
                          Spread:{" "}
                          {calculateSpread(
                            orderBook.asks,
                            orderBook.bids
                          ).spread.toFixed(3)}{" "}
                          (
                          {calculateSpread(
                            orderBook.asks,
                            orderBook.bids
                          ).spreadPercentage.toFixed(2)}
                          %)
                        </div>
                      </div>

                      {/* Bids */}
                      <div className="space-y-0.5 mt-2">
                        {orderBook.bids.map((order, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-3 text-[10px] sm:text-xs relative overflow-hidden"
                          >
                            <div
                              className="absolute inset-0 bg-green-900/20"
                              style={{
                                width: `${(order.total / 948.1) * 100}%`,
                              }}
                            ></div>
                            <span className="relative z-10 text-green-400">
                              {order.price.toFixed(3)}
                            </span>
                            <span className="relative z-10 text-right">
                              {order.size.toFixed(3)}
                            </span>
                            <span className="relative z-10 text-right text-gray-500">
                              {order.total.toFixed(3)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {mobileView === "trades" && (
                  <div className="h-[300px] overflow-auto">
                    <div className="p-2">
                      <div className="text-[10px] sm:text-xs grid grid-cols-3 text-gray-400 mb-2">
                        <span>Price</span>
                        <span className="text-right">Size</span>
                        <span className="text-right">Time</span>
                      </div>
                      <div className="space-y-0.5">
                        {trades.map((trade, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-3 text-[10px] sm:text-xs"
                          >
                            <span
                              className={`font-mono ${
                                trade.price >=
                                (trades[i + 1]?.price ?? trade.price)
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {(trade.price || trade.close || 0).toFixed(3)}
                            </span>
                            <span className="text-right font-mono">
                              {trade.quantity.toFixed(3)}
                            </span>
                            <span className="text-right text-gray-500 font-mono">
                              {trade.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Orders/History Section */}
              <div className="h-[200px] bg-fuel-dark-800 border-t border-fuel-dark-600">
                <div className="flex border-b border-fuel-dark-600">
                  <button
                    className={`flex-1 py-2 text-center text-sm font-medium transition-colors outline-none
                      ${
                        mobileBottomView === "orders"
                          ? "text-fuel-green"
                          : "text-gray-400"
                      }`}
                    onClick={() => setMobileBottomView("orders")}
                  >
                    Orders
                    {activeOrders.length > 0 ? ` (${activeOrders.length})` : ""}
                  </button>
                  <button
                    className={`flex-1 py-2 text-center text-sm font-medium transition-colors outline-none
                      ${
                        mobileBottomView === "history"
                          ? "text-fuel-green"
                          : "text-gray-400"
                      }`}
                    onClick={() => setMobileBottomView("history")}
                  >
                    History
                    {orderHistory.length > 0 ? ` (${orderHistory.length})` : ""}
                  </button>
                </div>

                <div className="overflow-auto h-[calc(200px-40px)]">
                  {mobileBottomView === "orders" ? (
                    activeOrders.length > 0 ? (
                      <div>
                        {/* Table Headers */}
                        <div className="grid grid-cols-5 text-[10px] text-gray-400 p-2 border-b border-fuel-dark-600">
                          <div>Date</div>
                          <div>Pair</div>
                          <div>Type</div>
                          <div>Amount</div>
                          <div>Price</div>
                        </div>
                        {/* Table Content */}
                        <div className="divide-y divide-fuel-dark-600">
                          {activeOrders.map((order) => (
                            <div
                              key={order.id}
                              className="grid grid-cols-5 p-2 text-xs hover:bg-fuel-dark-700 group"
                            >
                              <div className="text-gray-400">
                                {new Date(order.timestamp).toLocaleTimeString()}
                              </div>
                              <div>FUEL/USDT</div>
                              <div
                                className={`${
                                  order.type === "buy"
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {order.type.toUpperCase()}
                                {order.status === "partial" && " (PARTIAL)"}
                              </div>
                              <div>
                                {order.size.toFixed(3)}
                                {order.status === "partial" && (
                                  <span className="text-gray-400">
                                    {" "}
                                    ({order.filled!.toFixed(3)} filled)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span>{order.price.toFixed(3)}</span>
                                <button
                                  className="px-2 py-0.5 text-[10px] text-gray-400 hover:text-gray-300 hover:bg-fuel-dark-600 rounded opacity-0 group-hover:opacity-100 transition-opacity outline-none"
                                  onClick={() => handleCancelOrder(order.id)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-sm">No active orders</p>
                      </div>
                    )
                  ) : orderHistory.length > 0 ? (
                    <div>
                      {/* Table Headers */}
                      <div className="grid grid-cols-5 text-[10px] text-gray-400 p-2 border-b border-fuel-dark-600">
                        <div>Date</div>
                        <div>Pair</div>
                        <div>Type</div>
                        <div>Amount</div>
                        <div>Price</div>
                      </div>
                      {/* Table Content */}
                      <div className="divide-y divide-fuel-dark-600">
                        {orderHistory.map((order) => (
                          <div
                            key={order.id}
                            className="grid grid-cols-5 p-2 text-xs hover:bg-fuel-dark-700"
                          >
                            <div className="text-gray-400">
                              {new Date(order.completedAt).toLocaleTimeString()}
                            </div>
                            <div>FUEL/USDT</div>
                            <div
                              className={`flex items-center space-x-2 ${
                                order.type === "buy"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              <span>{order.type.toUpperCase()}</span>
                              <span
                                className={`text-[6px] md:text-[10px] px-1 md:px-1.5 rounded ${
                                  order.status === "filled"
                                    ? "bg-green-400/10 text-green-400"
                                    : "bg-gray-400/10 text-gray-400"
                                }`}
                              >
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                            <div>{order.filled.toFixed(3)}</div>
                            <div>{order.price.toFixed(3)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p className="text-sm">No order history</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trading Interface - Mobile */}
              <div className="border-t border-fuel-dark-600">
                <div className="p-2">
                  {/* Buy/Sell Buttons - More compact */}
                  <div className="flex mb-2">
                    <button
                      className={`flex-1 py-1.5 text-xs font-medium rounded-l transition-colors outline-none
                        ${
                          tradeType === "buy"
                            ? "bg-fuel-green text-fuel-dark-900"
                            : "bg-fuel-dark-700 text-gray-400"
                        }`}
                      onClick={() => setTradeType("buy")}
                    >
                      BUY
                    </button>
                    <button
                      className={`flex-1 py-1.5 text-xs font-medium rounded-r transition-colors outline-none
                        ${
                          tradeType === "sell"
                            ? "bg-red-500 text-white"
                            : "bg-fuel-dark-700 text-gray-400"
                        }`}
                      onClick={() => setTradeType("sell")}
                    >
                      SELL
                    </button>
                  </div>

                  {/* Order Form - More compact */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Order type</span>
                        {orderType === "limit" && (
                          <span className="text-gray-400">Price</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <button
                            className="w-full bg-fuel-dark-700 rounded p-2 text-sm text-left flex items-center justify-between hover:bg-fuel-dark-600 transition-colors outline-none"
                            onClick={() => setIsOrderTypeOpen(!isOrderTypeOpen)}
                          >
                            <span>{orderType.toUpperCase()}</span>
                            <ChevronDown
                              className={`h-4 w-4 text-gray-400 transition-transform ${
                                isOrderTypeOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isOrderTypeOpen && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-fuel-dark-700 rounded shadow-lg border border-fuel-dark-600 z-10">
                              <button
                                className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors outline-none"
                                onClick={() => {
                                  setOrderType("limit");
                                  setIsOrderTypeOpen(false);
                                }}
                              >
                                LIMIT
                              </button>
                              <button
                                className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors outline-none"
                                onClick={() => {
                                  setOrderType("market");
                                  setIsOrderTypeOpen(false);
                                  setPrice(""); // Clear price when switching to market
                                }}
                              >
                                MARKET
                              </button>
                            </div>
                          )}
                        </div>
                        {orderType === "limit" && (
                          <input
                            type="number"
                            className="flex-1 bg-fuel-dark-700 rounded p-2 text-sm"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Order size</span>
                        <span className="text-gray-400">MAX</span>
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          className="flex-1 bg-fuel-dark-700 rounded p-1.5 text-xs hover:bg-fuel-dark-600 transition-colors"
                          placeholder="0.00"
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          step={0.001}
                        />
                        <div className="relative">
                          <button
                            className="w-24 bg-fuel-dark-700 rounded p-2 text-sm text-left flex items-center justify-between hover:bg-fuel-dark-600 transition-colors outline-none"
                            onClick={() =>
                              setIsTokenSelectOpen(!isTokenSelectOpen)
                            }
                          >
                            <span>{getCurrentPairTokens().baseAsset}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Connect Wallet Button - More compact */}
                    {/* <div className="mt-2">
                      <WalletConnect variant="trade" tradeType={tradeType} />
                    </div> */}
                    <div className="mt-4">
                      <button
                        className={`w-full py-2 text-sm font-medium rounded transition-colors outline-none
                          ${
                            (
                              orderType === "market"
                                ? Boolean(size)
                                : Boolean(price && size)
                            )
                              ? "bg-fuel-green text-fuel-dark-900 hover:bg-opacity-90"
                              : "bg-fuel-green/50 text-fuel-dark-900 cursor-not-allowed"
                          }`}
                        onClick={handlePlaceOrder}
                        disabled={
                          orderType === "market" ? !size : !price || !size
                        }
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View - Hide on mobile */}
            <div className="hidden sm:flex flex-1 min-h-0">
              {/* Left section containing Chart, Orderbook/Trades, and Orders/History */}
              <div className="flex-1 flex flex-col">
                {/* Top section with Chart and Orderbook/Trades */}
                <div className="flex flex-1 overflow-hidden"> {/* Add overflow-hidden */}
                  {/* Chart */}
                  <div className="flex-1 bg-fuel-dark-800 border-r border-fuel-dark-600 flex flex-col overflow-hidden"> {/* Add flex flex-col overflow-hidden */}
                    {/* Add trading pair header */}
                    <div className="shrink-0 p-3 border-b border-fuel-dark-600"> {/* Add shrink-0 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-between sm:justify-start">
                            <div className="relative">
                              <button
                                className="flex items-center space-x-2 text-lg font-bold hover:bg-fuel-dark-700 rounded px-3 py-2 outline-none min-w-[200px]"
                                onClick={() => setIsPairSelectOpen(!isPairSelectOpen)}
                              >
                                <div className="flex items-center">
                                  <div className="flex -space-x-2 mr-2">
                                    <img
                                      src={getTokenIcon(selectedPair.split("/")[0])}
                                      className="w-6 h-6 rounded-full ring-2 ring-fuel-dark-900"
                                      alt={selectedPair.split("/")[0]}
                                    />
                                    <img
                                      src={getTokenIcon(selectedPair.split("/")[1])}
                                      className="w-6 h-6 rounded-full ring-2 ring-fuel-dark-900 relative z-10"
                                      alt={selectedPair.split("/")[1]}
                                    />
                                  </div>
                                  <span>{selectedPair}</span>
                                </div>
                                <ChevronDown
                                  className={`w-5 h-5 transition-transform ${
                                    isPairSelectOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {isPairSelectOpen && (
                                <div className="absolute top-full left-0 mt-1 w-[570px] bg-fuel-dark-800 rounded-lg shadow-lg border border-fuel-dark-600 z-50">
                                  {/* Search input */}
                                  <div className="p-3 border-b border-fuel-dark-600">
                                    <input
                                      type="text"
                                      placeholder="Search pairs..."
                                      className="w-full bg-fuel-dark-700 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-fuel-green"
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                  </div>

                                  {/* Table Header */}
                                  <div className="grid grid-cols-6 gap-4 px-4 py-2 border-b border-fuel-dark-600 text-[11px] text-gray-400">
                                    <div className="col-span-2">Asset Pair</div>
                                    <div className="text-right">Price</div>
                                    <div className="text-right">24h Change</div>
                                    <div className="text-right">24h High/Low</div>
                                    <div className="text-right">24h Volume</div>
                                  </div>

                                  {/* Market pairs list */}
                                  <div className="max-h-[300px] overflow-y-auto">
                                    {TRADING_PAIRS.filter(pair => 
                                      pair.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map((pair) => {
                                      const [base, quote] = pair.split("/");
                                      const stats = priceStats[pair as keyof typeof priceStats];
                                      
                                      return (
                                        <button
                                          key={pair}
                                          className="w-full px-4 py-2.5 text-left hover:bg-fuel-dark-700 transition-colors outline-none border-b border-fuel-dark-600 last:border-b-0"
                                          onClick={() => {
                                            setSelectedPair(pair);
                                            setIsPairSelectOpen(false);
                                            setSearchQuery('');
                                          }}
                                        >
                                          <div className="grid grid-cols-6 gap-4 items-center">
                                            {/* Asset Pair */}
                                            <div className="flex items-center space-x-3 col-span-2">
                                              <div className="flex -space-x-2">
                                                <img
                                                  src={getTokenIcon(base)}
                                                  className="w-5 h-5 rounded-full ring-2 ring-fuel-dark-800"
                                                  alt={base}
                                                />
                                                <img
                                                  src={getTokenIcon(quote)}
                                                  className="w-5 h-5 rounded-full ring-2 ring-fuel-dark-800 relative z-10"
                                                  alt={quote}
                                                />
                                              </div>
                                              <div>
                                                <div className="font-medium text-sm">{pair}</div>
                                              </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right text-[11px]">
                                              ${stats?.last.toFixed(2)}
                                            </div>

                                            {/* 24h Change */}
                                            <div className={`text-right text-[11px] ${stats?.change >= 0 ? 'text-fuel-green' : 'text-red-400'}`}>
                                              {stats?.change >= 0 ? '+' : ''}{stats?.change.toFixed(2)}%
                                            </div>

                                            {/* 24h High/Low Combined */}
                                            <div className="text-right text-[11px] text-gray-200">
                                              <div>${stats?.high.toFixed(2)}</div>
                                              <div className="text-gray-400">${stats?.low.toFixed(2)}</div>
                                            </div>

                                            {/* 24h Volume */}
                                            <div className="text-right text-[11px] text-gray-200">
                                              {(stats?.volume || 0).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                              })} {base}
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">
                              ${priceStats[selectedPair]?.last.toFixed(2)}
                            </div>
                            <div
                              className={`text-xs ${
                                priceStats[selectedPair]?.change >= 0
                                  ? "text-fuel-green"
                                  : "text-red-400"
                              }`}
                            >
                              {priceStats[selectedPair]?.change >= 0 ? "+" : ""}
                              {priceStats[selectedPair]?.change.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-right">
                          <div>
                            <div className="text-xs text-gray-400">24h High</div>
                            <div className="text-sm">
                              ${priceStats[selectedPair]?.high.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">24h Low</div>
                            <div className="text-sm">
                              ${priceStats[selectedPair]?.low.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">24h Volume</div>
                            <div className="text-sm">
                              {priceStats[selectedPair]?.volume.toFixed(2)}{" "}
                              {getCurrentPairTokens().baseAsset}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden"> {/* Add wrapper div with flex-1 and overflow-hidden */}
                      <TradingViewWidget
                        trades={trades}
                        userTrades={userTrades}
                        selectedTimeframe={selectedTimeframe}
                        onTimeframeChange={setSelectedTimeframe}
                      />
                    </div>
                  </div>

                  {/* Order Book/Trades Column */}
                  <div className="w-[250px] flex flex-col min-h-0 border-r border-fuel-dark-600 bg-fuel-dark-800">
                    {/* Tabs for Orderbook/Trades */}
                    <div className="flex border-b border-fuel-dark-600">
                      <button
                        className={`flex-1 py-2 text-center text-xs font-medium transition-colors outline-none
                          ${
                            activeView === "orderbook"
                              ? "text-fuel-green"
                              : "text-gray-400"
                          }`}
                        onClick={() => setActiveView("orderbook")}
                      >
                        Order Book
                      </button>
                      <button
                        className={`flex-1 py-2 text-center text-xs font-medium transition-colors outline-none
                          ${
                            activeView === "trades"
                              ? "text-fuel-green"
                              : "text-gray-400"
                          }`}
                        onClick={() => setActiveView("trades")}
                      >
                        Trades
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {activeView === "orderbook" ? (
                        <div className="h-full flex flex-col">
                          <div className="p-2 flex flex-col h-full">
                            {/* Header */}
                            <div
                              className="text-[8px] sm:text-[10px] grid grid-cols-3 text-gray-400 mb-2 p-1.5"
                              style={{ gridTemplateColumns: "30% 30% 40%" }}
                            >
                              <span>Price</span>
                              <span className="text-right">Amount</span>
                              <span className="text-right">Total</span>
                            </div>

                            {/* Scrollable areas */}
                            <div className="flex-1 flex flex-col min-h-0">
                              {/* Asks */}
                              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-fuel-dark-600 scrollbar-track-transparent">
                                <div className="flex flex-col-reverse space-y-reverse space-y-[2px]">
                                  {orderBook.asks.map((order, i) => (
                                    <div
                                      key={i}
                                      className="grid grid-cols-3 text-[8px] sm:text-[10px] relative overflow-hidden p-[2px]"
                                      style={{
                                        gridTemplateColumns: "30% 30% 40%",
                                      }}
                                    >
                                      <div
                                        className="absolute inset-0 bg-red-500/10"
                                        style={{
                                          width: `${
                                            (order.total / 2016.4) * 100
                                          }%`,
                                        }}
                                      ></div>
                                      <span className="relative z-10 text-red-400">
                                        {order.price.toFixed(3)}
                                      </span>
                                      <span className="relative z-10 text-right">
                                        {order.size.toFixed(3)}
                                      </span>
                                      <span className="relative z-10 text-right text-gray-500">
                                        {order.total.toFixed(3)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Spread section - not scrollable */}
                              <div className="py-1.5 space-y-1 border-y border-fuel-dark-600 bg-fuel-dark-700 flex flex-col items-center justify-center">
                                <div className="text-fuel-green text-[8px] sm:text-[10px] font-medium">
                                  {calculateSpread(
                                    orderBook.asks,
                                    orderBook.bids
                                  ).avgPrice.toFixed(3)}
                                </div>
                                <div className="text-[8px] sm:text-[10px] text-gray-400">
                                  Spread:{" "}
                                  {calculateSpread(
                                    orderBook.asks,
                                    orderBook.bids
                                  ).spread.toFixed(3)}{" "}
                                  (
                                  {calculateSpread(
                                    orderBook.asks,
                                    orderBook.bids
                                  ).spreadPercentage.toFixed(2)}
                                  %)
                                </div>
                              </div>

                              {/* Bids */}
                              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-fuel-dark-600 scrollbar-track-transparent">
                                <div className="space-y-[2px]">
                                  {orderBook.bids.map((order, i) => (
                                    <div
                                      key={i}
                                      className="grid grid-cols-3 text-[8px] sm:text-[10px] relative overflow-hidden p-[2px]"
                                      style={{
                                        gridTemplateColumns: "30% 30% 40%",
                                      }}
                                    >
                                      <div
                                        className="absolute inset-0 bg-green-900/20"
                                        style={{
                                          width: `${
                                            (order.total / 11948.1) * 100
                                          }%`,
                                        }}
                                      ></div>
                                      <span className="relative z-10 text-green-400">
                                        {order.price.toFixed(3)}
                                      </span>
                                      <span className="relative z-10 text-right">
                                        {order.size.toFixed(3)}
                                      </span>
                                      <span className="relative z-10 text-right text-gray-500">
                                        {order.total.toFixed(3)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col overflow-hidden">
                          <div className="p-2 flex flex-col h-full">
                            {/* Header */}
                            <div
                              className="text-[8px] sm:text-[10px] grid grid-cols-3 text-gray-400 mb-2 p-1.5"
                              style={{ gridTemplateColumns: "30% 25% 45%" }}
                            >
                              <span>Price</span>
                              <span className="text-right">Size</span>
                              <span className="text-right">Time</span>
                            </div>

                            {/* Scrollable trades */}
                            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-fuel-dark-600 scrollbar-track-transparent">
                              <div className="space-y-[2px]">
                                {trades.map((trade, i) => (
                                  <div
                                    key={i}
                                    className="grid grid-cols-3 text-[8px] sm:text-[10px] items-center hover:bg-fuel-dark-700/50 rounded p-1.5"
                                    style={{
                                      gridTemplateColumns: "30% 25% 45%",
                                    }}
                                  >
                                    <span
                                      className={`font-mono ${
                                        trade.price >=
                                        (trades[i + 1]?.price ?? trade.price)
                                          ? "text-green-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      {(
                                        trade.price ||
                                        trade.close ||
                                        0
                                      ).toFixed(3)}
                                    </span>
                                    <span className="text-right font-mono">
                                      {trade.quantity.toFixed(3)}
                                    </span>
                                    <span className="text-right font-mono text-gray-400 flex items-center justify-end gap-2">
                                      {trade.time}
                                      <a
                                        href="https://app.fuel.network"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-fuel-green hover:text-fuel-green/80"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom section for Orders and History */}
                <div className="h-[200px] bg-fuel-dark-800 border-t border-fuel-dark-600">
                  <div className="flex border-b border-fuel-dark-600">
                    <button
                      className={`flex-1 py-2 text-center text-sm font-medium transition-colors outline-none
                        ${
                          mobileBottomView === "orders"
                            ? "text-fuel-green"
                            : "text-gray-400"
                        }`}
                      onClick={() => setMobileBottomView("orders")}
                    >
                      Orders
                      {activeOrders.length > 0
                        ? ` (${activeOrders.length})`
                        : ""}
                    </button>
                    <button
                      className={`flex-1 py-2 text-center text-sm font-medium transition-colors outline-none
                        ${
                          mobileBottomView === "history"
                            ? "text-fuel-green"
                            : "text-gray-400"
                        }`}
                      onClick={() => setMobileBottomView("history")}
                    >
                      History
                      {orderHistory.length > 0
                        ? ` (${orderHistory.length})`
                        : ""}
                    </button>
                  </div>

                  <div className="overflow-auto h-[calc(200px-40px)]">
                    {mobileBottomView === "orders" ? (
                      activeOrders.length > 0 ? (
                        <div>
                          {/* Table Headers */}
                          <div className="grid grid-cols-5 text-[10px] text-gray-400 p-2 border-b border-fuel-dark-600">
                            <div>Date</div>
                            <div>Pair</div>
                            <div>Type</div>
                            <div>Amount</div>
                            <div>Price</div>
                          </div>
                          {/* Table Content */}
                          <div className="divide-y divide-fuel-dark-600">
                            {activeOrders.map((order) => (
                              <div
                                key={order.id}
                                className="grid grid-cols-5 p-2 text-xs hover:bg-fuel-dark-700 group"
                              >
                                <div className="text-gray-400">
                                  {new Date(
                                    order.timestamp
                                  ).toLocaleTimeString()}
                                </div>
                                <div>FUEL/USDT</div>
                                <div
                                  className={
                                    order.type === "buy"
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }
                                >
                                  {order.type.toUpperCase()}
                                  {order.status === "partial" && " (PARTIAL)"}
                                </div>
                                <div>
                                  {order.size.toFixed(3)}
                                  {order.status === "partial" && (
                                    <span className="text-gray-400">
                                      {" "}
                                      ({order.filled!.toFixed(3)} filled)
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>{order.price.toFixed(3)}</span>
                                  <button
                                    className="px-2 py-0.5 text-[10px] text-gray-400 hover:text-gray-300 hover:bg-fuel-dark-600 rounded opacity-0 group-hover:opacity-100 transition-opacity outline-none"
                                    onClick={() => handleCancelOrder(order.id)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <p className="text-sm">No active orders</p>
                        </div>
                      )
                    ) : orderHistory.length > 0 ? (
                      <div>
                        {/* Table Headers */}
                        <div className="grid grid-cols-5 text-[10px] text-gray-400 p-2 border-b border-fuel-dark-600">
                          <div>Date</div>
                          <div>Pair</div>
                          <div>Type</div>
                          <div>Amount</div>
                          <div>Price</div>
                        </div>
                        {/* Table Content */}
                        <div className="divide-y divide-fuel-dark-600">
                          {orderHistory.map((order) => (
                            <div
                              key={order.id}
                              className="grid grid-cols-5 p-2 text-xs hover:bg-fuel-dark-700"
                            >
                              <div className="text-gray-400">
                                {new Date(
                                  order.completedAt
                                ).toLocaleTimeString()}
                              </div>
                              <div>FUEL/USDT</div>
                              <div
                                className={`flex items-center space-x-2 ${
                                  order.type === "buy"
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                <span>{order.type.toUpperCase()}</span>
                                <span
                                  className={`text-[6px] md:text-[10px] px-1 md:px-1.5 rounded ${
                                    order.status === "filled"
                                      ? "bg-green-400/10 text-green-400"
                                      : "bg-gray-400/10 text-gray-400"
                                  }`}
                                >
                                  {order.status.toUpperCase()}
                                </span>
                              </div>
                              <div>{order.filled.toFixed(3)}</div>
                              <div>{order.price.toFixed(3)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-sm">No order history</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right section for Trading Interface */}
              <div className="w-[250px] flex flex-col min-h-0 border-l border-fuel-dark-600 bg-fuel-dark-800">
                <div className="p-3">
                  {/* Buy/Sell Buttons - More compact */}
                  <div className="flex mb-2">
                    <button
                      className={`flex-1 py-1 text-[10px] font-medium rounded-l transition-colors outline-none
                        ${
                          tradeType === "buy"
                            ? "bg-fuel-green text-fuel-dark-900"
                            : "bg-fuel-dark-700 text-gray-400"
                        }`}
                      onClick={() => setTradeType("buy")}
                    >
                      BUY
                    </button>
                    <button
                      className={`flex-1 py-1 text-[10px] font-medium rounded-r transition-colors outline-none
                        ${
                          tradeType === "sell"
                            ? "bg-red-500 text-white"
                            : "bg-fuel-dark-700 text-gray-400"
                        }`}
                      onClick={() => setTradeType("sell")}
                    >
                      SELL
                    </button>
                  </div>

                  {/* Order Form - More compact */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-400">Order type</span>
                        {orderType === "limit" && (
                          <span className="text-gray-400">Price</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <button
                            className="w-full bg-fuel-dark-700 rounded p-1.5 text-[10px] text-left flex items-center justify-between hover:bg-fuel-dark-600 transition-colors outline-none"
                            onClick={() => setIsOrderTypeOpen(!isOrderTypeOpen)}
                          >
                            <span>{orderType.toUpperCase()}</span>
                            <ChevronDown
                              className={`h-3 w-3 text-gray-400 transition-transform ${
                                isOrderTypeOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isOrderTypeOpen && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-fuel-dark-700 rounded shadow-lg border border-fuel-dark-600 z-10">
                              <button
                                className="w-full p-1.5 text-[10px] text-left hover:bg-fuel-dark-600 transition-colors outline-none"
                                onClick={() => {
                                  setOrderType("limit");
                                  setIsOrderTypeOpen(false);
                                }}
                              >
                                LIMIT
                              </button>
                              <button
                                className="w-full p-1.5 text-[10px] text-left hover:bg-fuel-dark-600 transition-colors outline-none"
                                onClick={() => {
                                  setOrderType("market");
                                  setIsOrderTypeOpen(false);
                                  setPrice("");
                                }}
                              >
                                MARKET
                              </button>
                            </div>
                          )}
                        </div>
                        {orderType === "limit" && (
                          <input
                            type="number"
                            className="flex-1 bg-fuel-dark-700 rounded p-1.5 text-[10px]"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-400">Order size</span>
                        <span className="text-gray-400">MAX</span>
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          className="flex-1 bg-fuel-dark-700 rounded p-1.5 text-[10px] hover:bg-fuel-dark-600 transition-colors"
                          placeholder="0.00"
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          step={0.001}
                        />
                        <div className="relative">
                          <button
                            className="w-fit bg-fuel-dark-700 rounded p-1.5 text-[10px] text-left flex items-center justify-between hover:bg-fuel-dark-600 transition-colors outline-none"
                            onClick={() =>
                              setIsTokenSelectOpen(!isTokenSelectOpen)
                            }
                          >
                            <span>{getCurrentPairTokens().baseAsset}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <button
                        className={`w-full py-1.5 text-[10px] font-medium rounded transition-colors outline-none
                          ${
                            (
                              orderType === "market"
                                ? Boolean(size)
                                : Boolean(price && size)
                            )
                              ? "bg-fuel-green text-fuel-dark-900 hover:bg-opacity-90"
                              : "bg-fuel-green/50 text-fuel-dark-900 cursor-not-allowed"
                          }`}
                        onClick={handlePlaceOrder}
                        disabled={
                          orderType === "market" ? !size : !price || !size
                        }
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeScreen === "swap" ? (
          <SwapComponent />
        ) : (
          <P2PComponent />
        )}
      </main>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />

      {pendingOrder && (
        <OrderConfirmationModal
          isOpen={showOrderConfirmation}
          onClose={() => {
            setShowOrderConfirmation(false);
            setPendingOrder(null);
          }}
          onConfirm={executeOrder}
          orderDetails={{
            action: pendingOrder.action,
            size: pendingOrder.size,
            price: pendingOrder.price,
            type: pendingOrder.type,
          }}
        />
      )}
    </div>
  );
}

export default App;