import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import USDTIcon from '../assets/usdt.svg';
import USDCIcon from '../assets/usdc.svg';
import ETHIcon from '../assets/eth.svg';

interface Order {
  id: string;
  price: number;
  amount: number;
  total: number;
  fillType: 'FULL' | 'PARTIAL';
  type: 'buy' | 'sell';
  pair: string;
}

interface Trade {
  timestamp: string;
  type: 'buy' | 'sell';
  pair: string;
  price: number;
  amount: number;
  total: number;
}

interface UserOrder extends Order {
  status: 'open' | 'filled' | 'partial';
  filled?: number;
  timestamp: number;
}

interface UserBalance {
  ETH: number;
  USDC: number;
  USDT: number;
}

interface PairStats {
  lastPrice: number;
  priceChange: number;
  volume24h: number;
  volumeChange: number;
  totalVolume: number;
}

type TradingPair = 'ETH/USDC' | 'ETH/USDT' | 'USDC/USDT';

const TRADING_PAIRS: TradingPair[] = ['ETH/USDC', 'ETH/USDT', 'USDC/USDT'];

const initialPairStats: Record<TradingPair, PairStats> = {
  'ETH/USDC': {
    lastPrice: 2150.81,
    priceChange: -1.8,
    volume24h: 176329.9,
    volumeChange: 33.04,
    totalVolume: 1270223.2
  },
  'ETH/USDT': {
    lastPrice: 2151.05,
    priceChange: -1.6,
    volume24h: 165420.5,
    volumeChange: 28.92,
    totalVolume: 1150450.8
  },
  'USDC/USDT': {
    lastPrice: 1.0001,
    priceChange: 0.02,
    volume24h: 985632.4,
    volumeChange: 15.67,
    totalVolume: 5890234.6
  }
};

const mockOrders: Record<TradingPair, Order[]> = {
  'ETH/USDC': [
    // Buy Orders
    { id: 'b1', price: 2150.81, amount: 1.5, total: 3226.21, fillType: 'FULL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b2', price: 2150.75, amount: 2.2, total: 4731.65, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b3', price: 2150.70, amount: 0.8, total: 1720.56, fillType: 'FULL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b4', price: 2150.65, amount: 1.7, total: 3656.10, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b5', price: 2150.60, amount: 3.1, total: 6666.86, fillType: 'FULL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b6', price: 2150.55, amount: 0.9, total: 1935.49, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b7', price: 2150.50, amount: 1.4, total: 3010.70, fillType: 'FULL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b8', price: 2150.45, amount: 2.5, total: 5376.12, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b9', price: 2150.40, amount: 1.2, total: 2580.48, fillType: 'FULL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b10', price: 2150.35, amount: 0.6, total: 1290.21, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b11', price: 2150.30, amount: 1.8, total: 3870.54, fillType: 'FULL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b12', price: 2150.25, amount: 2.2, total: 4730.55, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b13', price: 2150.20, amount: 1.1, total: 2365.22, fillType: 'FULL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b14', price: 2150.15, amount: 3.3, total: 7095.49, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b15', price: 2150.10, amount: 0.7, total: 1505.07, fillType: 'FULL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b16', price: 2150.05, amount: 1.5, total: 3225.07, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b17', price: 2150.00, amount: 2.0, total: 4300.00, fillType: 'FULL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b18', price: 2149.95, amount: 0.4, total: 859.98, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b19', price: 2149.90, amount: 1.6, total: 3439.84, fillType: 'FULL', type: 'buy', pair: 'ETH/USDC' },
    { id: 'b20', price: 2149.85, amount: 2.8, total: 6019.58, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDC' },

    // Sell Orders
    { id: 's1', price: 2151.00, amount: 1.2, total: 2581.20, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's2', price: 2151.05, amount: 2.4, total: 5162.52, fillType: 'FULL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's3', price: 2151.10, amount: 0.9, total: 1935.99, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's4', price: 2151.15, amount: 1.8, total: 3872.07, fillType: 'FULL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's5', price: 2151.20, amount: 3.2, total: 6883.84, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's6', price: 2151.25, amount: 0.7, total: 1505.87, fillType: 'FULL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's7', price: 2151.30, amount: 1.5, total: 3226.95, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's8', price: 2151.35, amount: 2.1, total: 4517.83, fillType: 'FULL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's9', price: 2151.40, amount: 1.3, total: 2796.82, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's10', price: 2151.45, amount: 0.5, total: 1075.72, fillType: 'FULL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's11', price: 2151.50, amount: 1.9, total: 4087.85, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's12', price: 2151.55, amount: 2.3, total: 4948.56, fillType: 'FULL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's13', price: 2151.60, amount: 1.0, total: 2151.60, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's14', price: 2151.65, amount: 3.4, total: 7315.61, fillType: 'FULL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's15', price: 2151.70, amount: 0.8, total: 1721.36, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's16', price: 2151.75, amount: 1.6, total: 3442.80, fillType: 'FULL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's17', price: 2151.80, amount: 2.0, total: 4303.60, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's18', price: 2151.85, amount: 0.3, total: 645.55, fillType: 'FULL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's19', price: 2151.90, amount: 1.7, total: 3658.23, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDC' },
    { id: 's20', price: 2151.95, amount: 2.5, total: 5379.87, fillType: 'FULL', type: 'sell', pair: 'ETH/USDC' },
  ],
  'ETH/USDT': [
    // Buy Orders
    { id: 'tb1', price: 2150.50, amount: 1.8, total: 3870.90, fillType: 'FULL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb2', price: 2150.45, amount: 2.5, total: 5376.12, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb3', price: 2150.40, amount: 0.9, total: 1935.36, fillType: 'FULL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb4', price: 2150.35, amount: 1.6, total: 3440.56, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb5', price: 2150.30, amount: 3.3, total: 7096.00, fillType: 'FULL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb6', price: 2150.25, amount: 0.7, total: 1505.17, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb7', price: 2150.20, amount: 1.4, total: 3010.28, fillType: 'FULL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb8', price: 2150.15, amount: 2.2, total: 4730.33, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb9', price: 2150.10, amount: 1.1, total: 2365.11, fillType: 'FULL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb10', price: 2150.05, amount: 0.5, total: 1075.02, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb11', price: 2150.00, amount: 1.9, total: 4085.00, fillType: 'FULL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb12', price: 2149.95, amount: 2.3, total: 4944.88, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb13', price: 2149.90, amount: 1.2, total: 2579.88, fillType: 'FULL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb14', price: 2149.85, amount: 3.1, total: 6664.53, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb15', price: 2149.80, amount: 0.8, total: 1719.84, fillType: 'FULL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb16', price: 2149.75, amount: 1.5, total: 3224.62, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb17', price: 2149.70, amount: 2.0, total: 4299.40, fillType: 'FULL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb18', price: 2149.65, amount: 0.4, total: 859.86, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb19', price: 2149.60, amount: 1.7, total: 3654.32, fillType: 'FULL', type: 'buy', pair: 'ETH/USDT' },
    { id: 'tb20', price: 2149.55, amount: 2.6, total: 5588.83, fillType: 'PARTIAL', type: 'buy', pair: 'ETH/USDT' },

    // Sell Orders
    { id: 'ts1', price: 2150.90, amount: 1.3, total: 2796.17, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts2', price: 2150.95, amount: 2.4, total: 5162.28, fillType: 'FULL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts3', price: 2151.00, amount: 0.9, total: 1935.90, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts4', price: 2151.05, amount: 1.8, total: 3871.89, fillType: 'FULL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts5', price: 2151.10, amount: 3.2, total: 6883.52, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts6', price: 2151.15, amount: 0.7, total: 1505.80, fillType: 'FULL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts7', price: 2151.20, amount: 1.5, total: 3226.80, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts8', price: 2151.25, amount: 2.1, total: 4517.62, fillType: 'FULL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts9', price: 2151.30, amount: 1.3, total: 2796.69, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts10', price: 2151.35, amount: 0.5, total: 1075.67, fillType: 'FULL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts11', price: 2151.40, amount: 1.9, total: 4087.66, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts12', price: 2151.45, amount: 2.3, total: 4948.33, fillType: 'FULL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts13', price: 2151.50, amount: 1.0, total: 2151.50, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts14', price: 2151.55, amount: 3.4, total: 7315.27, fillType: 'FULL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts15', price: 2151.60, amount: 0.8, total: 1721.28, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts16', price: 2151.65, amount: 1.6, total: 3442.64, fillType: 'FULL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts17', price: 2151.70, amount: 2.0, total: 4303.40, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts18', price: 2151.75, amount: 0.3, total: 645.52, fillType: 'FULL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts19', price: 2151.80, amount: 1.7, total: 3658.06, fillType: 'PARTIAL', type: 'sell', pair: 'ETH/USDT' },
    { id: 'ts20', price: 2151.85, amount: 2.5, total: 5379.62, fillType: 'FULL', type: 'sell', pair: 'ETH/USDT' },
  ],
  'USDC/USDT': [
    { id: '31', price: 1.0012, amount: 5000, total: 5006.00, fillType: 'FULL', type: 'buy', pair: 'USDC/USDT' },
    { id: '32', price: 1.0010, amount: 7500, total: 7507.50, fillType: 'PARTIAL', type: 'buy', pair: 'USDC/USDT' },
    { id: '33', price: 1.0008, amount: 3000, total: 3002.40, fillType: 'PARTIAL', type: 'buy', pair: 'USDC/USDT' },
    { id: '34', price: 1.0005, amount: 10000, total: 10005.00, fillType: 'FULL', type: 'buy', pair: 'USDC/USDT' },
    { id: '35', price: 1.0003, amount: 4500, total: 4501.35, fillType: 'PARTIAL', type: 'buy', pair: 'USDC/USDT' },
    { id: '36', price: 0.9998, amount: 6000, total: 5998.80, fillType: 'PARTIAL', type: 'sell', pair: 'USDC/USDT' },
    { id: '37', price: 0.9995, amount: 8500, total: 8495.75, fillType: 'FULL', type: 'sell', pair: 'USDC/USDT' },
    { id: '38', price: 0.9993, amount: 4000, total: 3997.20, fillType: 'PARTIAL', type: 'sell', pair: 'USDC/USDT' },
    { id: '39', price: 0.9990, amount: 12000, total: 11988.00, fillType: 'PARTIAL', type: 'sell', pair: 'USDC/USDT' },
    { id: '40', price: 0.9988, amount: 5500, total: 5493.40, fillType: 'FULL', type: 'sell', pair: 'USDC/USDT' }
  ],
};

const mockTrades: Trade[] = [
  { timestamp: '10:45', type: 'sell', pair: 'ETH/USDC', price: 2150.80, amount: 0.5, total: 1075.40 },
  { timestamp: '10:42', type: 'buy', pair: 'ETH/USDC', price: 2150.75, amount: 1.2, total: 2580.90 },
  { timestamp: '10:40', type: 'sell', pair: 'ETH/USDT', price: 2150.82, amount: 0.8, total: 1720.66 },
  { timestamp: '10:38', type: 'buy', pair: 'USDC/USDT', price: 1.0001, amount: 1000, total: 1000.10 },
  { timestamp: '10:35', type: 'sell', pair: 'ETH/USDC', price: 2150.90, amount: 0.3, total: 645.27 },
  { timestamp: '10:32', type: 'buy', pair: 'ETH/USDT', price: 2150.70, amount: 1.5, total: 3226.05 },
  { timestamp: '10:30', type: 'sell', pair: 'USDC/USDT', price: 0.9999, amount: 500, total: 499.95 },
  { timestamp: '10:28', type: 'buy', pair: 'ETH/USDC', price: 2150.65, amount: 0.7, total: 1505.46 },
  { timestamp: '10:25', type: 'sell', pair: 'ETH/USDT', price: 2150.85, amount: 0.4, total: 860.34 },
  { timestamp: '10:22', type: 'buy', pair: 'USDC/USDT', price: 1.0002, amount: 2000, total: 2000.40 }
];

function P2PComponent() {
  const [selectedPair, setSelectedPair] = useState<TradingPair>('ETH/USDC');
  const [isPairSelectOpen, setIsPairSelectOpen] = useState(false);
  const [isBuying, setIsBuying] = useState(true);
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>(mockTrades);
  const [userBalance] = useState<UserBalance>({
    ETH: 10,
    USDC: 25000,
    USDT: 25000
  });
  const [orderBook, setOrderBook] = useState<Record<TradingPair, Order[]>>(mockOrders);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);
  const [pairStats, setPairStats] = useState<Record<TradingPair, PairStats>>(initialPairStats);
  const [activeTab, setActiveTab] = useState<'trades' | 'orders'>('trades');

  const getTokens = (pair: string) => {
    const [baseToken, quoteToken] = pair.split('/');
    return { baseToken, quoteToken };
  };

  const { baseToken, quoteToken } = getTokens(selectedPair);

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

  const getTradeTokens = () => {
    if (isBuying) {
      return {
        buyToken: baseToken,
        sellToken: quoteToken,
        buyAmount: amount,
        sellAmount: price,
        setBuyAmount: setAmount,
        setSellAmount: setPrice,
      };
    } else {
      return {
        buyToken: quoteToken,
        sellToken: baseToken,
        buyAmount: price,
        sellAmount: amount,
        setBuyAmount: setPrice,
        setSellAmount: setAmount,
      };
    }
  };

  const { buyToken, sellToken, buyAmount, sellAmount, setBuyAmount, setSellAmount } = getTradeTokens();

  const generateOrderId = () => Math.random().toString(36).substr(2, 9);

  const matchOrder = (newOrder: Order) => {
    const existingOrders = [...orderBook[selectedPair]];
    const matchingOrders = existingOrders.filter(order => {
      if (newOrder.type === 'buy') {
        return order.type === 'sell' && order.price <= newOrder.price;
      } else {
        return order.type === 'buy' && order.price >= newOrder.price;
      }
    }).sort((a, b) => {
      return newOrder.type === 'buy' ? a.price - b.price : b.price - a.price;
    });

    if (matchingOrders.length > 0) {
      const matchedOrder = matchingOrders[0];
      const matchAmount = Math.min(newOrder.amount, matchedOrder.amount);
      
      const trade: Trade = {
        timestamp: new Date().toLocaleTimeString(),
        type: newOrder.type,
        pair: selectedPair,
        price: matchedOrder.price,
        amount: matchAmount,
        total: matchAmount * matchedOrder.price
      };

      // Update recent trades
      setRecentTrades(prev => [trade, ...prev]);

      // Create user order with correct status
      const userOrder: UserOrder = {
        ...newOrder,
        price: matchedOrder.price, // Use matched price
        status: matchAmount < newOrder.amount ? 'partial' : 'filled',
        filled: matchAmount,
        timestamp: Date.now()
      };
      setUserOrders(prev => [userOrder, ...prev]);

      // Update the orderbook
      const updatedOrders = existingOrders.map(order => {
        if (order.id === matchedOrder.id) {
          const remainingAmount = order.amount - matchAmount;
          if (remainingAmount <= 0) {
            return null; // Remove fully filled order
          }
          return {
            ...order,
            amount: remainingAmount,
            total: remainingAmount * order.price
          };
        }
        return order;
      }).filter(Boolean) as Order[];

      setOrderBook(prev => ({
        ...prev,
        [selectedPair]: updatedOrders
      }));

      return true;
    }
    return false;
  };

  const placeOrder = () => {
    if (!amount || !price) return;

    const newOrder: UserOrder = {
      id: generateOrderId(),
      type: isBuying ? 'buy' : 'sell',
      price: Number(price),
      amount: Number(amount),
      total: Number(price) * Number(amount),
      status: 'open',
      fillType: 'FULL',
      pair: selectedPair,
      timestamp: Date.now(),
    };

    // Check if order can be matched
    const isMatched = matchOrder(newOrder);

    // Only add to orderbook and user orders if not matched
    if (!isMatched) {
      const userOrder: UserOrder = {
        ...newOrder,
        status: 'open',
        filled: 0,
        timestamp: Date.now()
      };
      setUserOrders(prev => [userOrder, ...prev]);

      // Add to orderbook
      setOrderBook(prev => ({
        ...prev,
        [selectedPair]: [...prev[selectedPair], newOrder]
      }));
    }

    // Reset form
    setAmount('');
    setPrice('');
  };

  const handleOrderSelect = (order: Order, action: 'buy' | 'sell') => {
    setPrice(order.price.toString());
    setAmount(order.amount.toString());
    setIsBuying(action === 'buy');
  };

  const getRandomAmount = (min: number, max: number) => {
    return Number((Math.random() * (max - min) + min).toFixed(4));
  };

  const getRandomPrice = (basePrice: number, spread: number, pair: string) => {
    // Special handling for USDC/USDT pair
    if (pair === 'USDC/USDT') {
      const baseStablePrice = 1.00;
      const stableSpread = 0.02; // This gives us range of 0.98 to 1.02
      const variation = (Math.random() - 0.5) * 2 * stableSpread;
      return Number((baseStablePrice + variation).toFixed(4));
    }
    
    // Normal price generation for other pairs
    const variation = (Math.random() - 0.5) * 2 * spread;
    return Number((basePrice + variation).toFixed(2));
  };

  const simulateTransaction = () => {
    for (let i = 0; i < 10; i++) {
      const pair = TRADING_PAIRS[Math.floor(Math.random() * TRADING_PAIRS.length)];
      const existingOrders = [...orderBook[pair]];
      
      const shouldMatchExisting = Math.random() > 0.5 && existingOrders.length > 0;

      if (shouldMatchExisting) {
        // Pick a random existing order to match
        const orderToMatch = existingOrders[Math.floor(Math.random() * existingOrders.length)];
        const matchingPrice = orderToMatch.price;
        const matchingAmount = Math.min(orderToMatch.amount, getRandomAmount(0.1, orderToMatch.amount));
        
        // Create matching order with opposite type
        const newOrder: Order = {
          id: generateOrderId(),
          price: matchingPrice,
          amount: matchingAmount,
          total: matchingPrice * matchingAmount,
          type: orderToMatch.type === 'buy' ? 'sell' : 'buy',
          pair,
          fillType: 'PARTIAL'
        };

        // Create the trade
        const trade: Trade = {
          timestamp: new Date().toLocaleTimeString([], { hour12: false }),
          type: newOrder.type,
          pair,
          price: matchingPrice,
          amount: matchingAmount,
          total: matchingPrice * matchingAmount
        };

        // Update orderbook - remove or reduce the matched order
        const updatedOrders = existingOrders.map(order => {
          if (order.id === orderToMatch.id) {
            const remainingAmount = order.amount - matchingAmount;
            if (remainingAmount <= 0) return null;
            return {
              ...order,
              amount: remainingAmount,
              total: remainingAmount * order.price
            };
          }
          return order;
        }).filter(Boolean) as Order[];

        // Update state
        setOrderBook(prev => ({
          ...prev,
          [pair]: updatedOrders
        }));
        setRecentTrades(prev => [trade, ...prev.slice(0, 49)]);

        // Update pair stats
        updatePairStats(pair as TradingPair, trade);

      } else {
        // Create a new order
        const basePrice = pair === 'USDC/USDT' ? 1.00 : 2150.81;
        const type = Math.random() > 0.5 ? 'buy' : 'sell';
        const amount = pair === 'USDC/USDT' 
          ? getRandomAmount(100, 10000) // Larger amounts for stablecoin pairs
          : getRandomAmount(0.1, 2);
        const price = getRandomPrice(basePrice, 5, pair);

        const newOrder: Order = {
          id: generateOrderId(),
          price,
          amount,
          total: price * amount,
          type,
          pair,
          fillType: 'PARTIAL'
        };

        // Add to orderbook
        setOrderBook(prev => ({
          ...prev,
          [pair]: [newOrder, ...prev[pair]]
        }));

        // Add to recent trades
        const trade: Trade = {
          timestamp: new Date().toLocaleTimeString([], { hour12: false }),
          type,
          pair,
          price,
          amount,
          total: price * amount
        };
        setRecentTrades(prev => [trade, ...prev.slice(0, 49)]);

        // Update pair stats
        updatePairStats(pair as TradingPair, trade);
      }
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    // Run every 100ms instead of 1000ms, creating about 100 trades per second
    const interval = setInterval(simulateTransaction, 100);
    setSimulationInterval(interval);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
  };

  const updatePairStats = (pair: TradingPair, trade: Trade) => {
    setPairStats(prev => {
      const currentStats = prev[pair];
      const priceChange = ((trade.price - currentStats.lastPrice) / currentStats.lastPrice) * 100;
      
      return {
        ...prev,
        [pair]: {
          ...currentStats,
          lastPrice: trade.price,
          priceChange: Number(priceChange.toFixed(2)),
          volume24h: currentStats.volume24h + trade.total,
          totalVolume: currentStats.totalVolume + trade.total
        }
      };
    });
  };

  useEffect(() => {
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [simulationInterval]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-fuel-dark-900">
      {/* Header - add min-height to prevent shrinking */}
      <div className="flex items-center justify-between p-4 border-b border-fuel-dark-600 min-h-[72px] flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                className="flex items-center space-x-2 text-lg font-bold hover:bg-fuel-dark-700 rounded px-2 py-1"
                onClick={() => setIsPairSelectOpen(!isPairSelectOpen)}
              >
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-2">
                    <img 
                      src={getTokenIcon(baseToken)} 
                      className="w-6 h-6 rounded-full ring-2 ring-fuel-dark-900" 
                      alt={baseToken} 
                    />
                    <img 
                      src={getTokenIcon(quoteToken)} 
                      className="w-6 h-6 rounded-full ring-2 ring-fuel-dark-900 relative z-10" 
                      alt={quoteToken} 
                    />
                  </div>
                  <span>{selectedPair}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${isPairSelectOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isPairSelectOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-fuel-dark-800 rounded shadow-lg border border-fuel-dark-600 z-50">
                  {TRADING_PAIRS.map((pair) => {
                    const [base, quote] = pair.split('/');
                    return (
                      <button
                        key={pair}
                        className="w-full px-4 py-2 text-left hover:bg-fuel-dark-700 transition-colors flex items-center space-x-2"
                        onClick={() => {
                          setSelectedPair(pair);
                          setIsPairSelectOpen(false);
                        }}
                      >
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
                        <span>{pair}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <span className={pairStats[selectedPair].priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
              ${pairStats[selectedPair].lastPrice.toFixed(selectedPair === 'USDC/USDT' ? 4 : 2)}
            </span>
            <span className={pairStats[selectedPair].priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
              {pairStats[selectedPair].priceChange > 0 ? '+' : ''}{pairStats[selectedPair].priceChange}%
            </span>
          </div>
          <div className="text-sm text-gray-400">
            <span>24h Vol </span>
            <span className="text-white">${pairStats[selectedPair].volume24h.toLocaleString()}</span>
            <span className={`ml-1 ${pairStats[selectedPair].volumeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pairStats[selectedPair].volumeChange > 0 ? '+' : ''}{pairStats[selectedPair].volumeChange}%
            </span>
          </div>
          <div className="text-sm text-gray-400">
            <span>Total Vol </span>
            <span className="text-white">${pairStats[selectedPair].totalVolume.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isSimulating ? (
            <button
              onClick={stopSimulation}
              className="px-4 py-1.5 text-sm font-medium rounded bg-red-500 text-white hover:bg-opacity-90 transition-colors"
            >
              Stop Simulation
            </button>
          ) : (
            <button
              onClick={startSimulation}
              className="px-4 py-1.5 text-sm font-medium rounded bg-fuel-green text-fuel-dark-900 hover:bg-opacity-90 transition-colors"
            >
              Start Simulation
            </button>
          )}
        </div>
      </div>

      {/* Main content - update to be more flexible */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main content wrapper - make scrollable if needed */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Order Book - update height calculation */}
          <div className="flex flex-1 border-r border-fuel-dark-600 min-h-0">
            {/* Buy Orders - make scrollable */}
            <div className="flex-1 p-4 border-r border-fuel-dark-600 flex flex-col min-h-0 overflow-hidden">
              <div className="text-xs text-gray-400 grid grid-cols-4 mb-2 flex-shrink-0">
                <div>Price {quoteToken}</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Total</div>
                <div></div>
              </div>
              <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-fuel-dark-700 scrollbar-track-transparent hover:scrollbar-thumb-fuel-dark-600">
                <div className="space-y-1">
                  {orderBook[selectedPair]
                    .filter(order => order.type === 'buy')
                    .map(order => (
                      <div 
                        key={order.id} 
                        className="grid grid-cols-4 text-sm items-center relative overflow-hidden group hover:bg-fuel-dark-700 rounded p-2"
                      >
                        <div 
                          className="absolute inset-0 bg-green-500/10" 
                          style={{
                            width: `${(order.amount / 2) * 100}%`,
                          }}
                        />
                        <div className="relative z-10 text-green-400 font-mono">
                          {order.price.toFixed(selectedPair === 'USDC/USDT' ? 4 : 2)}
                        </div>
                        <div className="relative z-10 text-right font-mono">
                          {order.amount.toFixed(selectedPair === 'USDC/USDT' ? 2 : 4)}
                        </div>
                        <div className="relative z-10 text-right text-gray-400 font-mono">
                          {order.total.toFixed(2)}
                        </div>
                        <div className="relative z-10 text-right">
                          <button 
                            className="px-3 py-1 text-xs font-medium rounded transition-all duration-200
                              border-2 border-fuel-dark-800 text-[#3c3c3e]
                              group-hover:bg-red-500/20 group-hover:text-red-400 group-hover:border-transparent"
                            onClick={() => handleOrderSelect(order, 'sell')}
                          >
                            Sell
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Sell Orders - make scrollable */}
            <div className="flex-1 p-4 flex flex-col min-h-0 overflow-hidden">
              <div className="text-xs text-gray-400 grid grid-cols-4 mb-2 flex-shrink-0">
                <div>Price {quoteToken}</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Total</div>
                <div></div>
              </div>
              <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-fuel-dark-700 scrollbar-track-transparent hover:scrollbar-thumb-fuel-dark-600">
                <div className="space-y-1">
                  {orderBook[selectedPair]
                    .filter(order => order.type === 'sell')
                    .map(order => (
                      <div 
                        key={order.id} 
                        className="grid grid-cols-4 text-sm items-center relative overflow-hidden group hover:bg-fuel-dark-700 rounded p-2"
                      >
                        <div 
                          className="absolute inset-0 bg-red-500/10" 
                          style={{
                            width: `${(order.amount / 2) * 100}%`,
                          }}
                        />
                        <div className="relative z-10 text-red-400 font-mono">
                          {order.price.toFixed(selectedPair === 'USDC/USDT' ? 4 : 2)}
                        </div>
                        <div className="relative z-10 text-right font-mono">
                          {order.amount.toFixed(selectedPair === 'USDC/USDT' ? 2 : 4)}
                        </div>
                        <div className="relative z-10 text-right text-gray-400 font-mono">
                          {order.total.toFixed(2)}
                        </div>
                        <div className="relative z-10 text-right">
                          <button 
                            className="px-3 py-1 text-xs font-medium rounded transition-all duration-200
                              border-2 border-fuel-dark-800 text-[#3c3c3e]
                              group-hover:bg-green-500/20 group-hover:text-green-400 group-hover:border-transparent"
                            onClick={() => handleOrderSelect(order, 'buy')}
                          >
                            Buy
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Trades Section */}
          <div className="h-[250px] min-h-[250px] border-t border-fuel-dark-600 flex flex-col flex-shrink-0">
            {/* Tab Navigation */}
            <div className="flex items-center space-x-2 px-4 py-3 border-b border-fuel-dark-600 bg-fuel-dark-800">
              <button
                className={`text-sm font-medium transition-colors outline-none
                  ${activeTab === "trades" ? "text-fuel-green" : "text-gray-400 hover:text-gray-300"}`}
                onClick={() => setActiveTab("trades")}
              >
                Recent Trades
              </button>
              <span className="text-gray-600">|</span>
              <button
                className={`text-sm font-medium transition-colors outline-none
                  ${activeTab === "orders" ? "text-fuel-green" : "text-gray-400 hover:text-gray-300"}`}
                onClick={() => setActiveTab("orders")}
              >
                My Orders ({userOrders.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-fuel-dark-700 scrollbar-track-transparent hover:scrollbar-thumb-fuel-dark-600">
              {activeTab === 'trades' ? (
                // Recent Trades Content
                <div className="p-4">
                  <div className="grid grid-cols-6 text-xs text-gray-400 mb-3 px-2">
                    <div>Time</div>
                    <div>Type</div>
                    <div>Pair</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Total</div>
                  </div>
                  <div className="space-y-1">
                    {recentTrades.map((trade, index) => (
                      <div 
                        key={index} 
                        className="grid grid-cols-6 text-sm items-center hover:bg-fuel-dark-700/50 px-2 py-2.5 rounded transition-colors"
                      >
                        <div className="text-gray-400 font-mono text-xs">{trade.timestamp}</div>
                        <div>
                          <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${
                            trade.type === 'buy' 
                              ? 'bg-green-500/10 text-green-400' 
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {trade.type === 'buy' ? 'BUY' : 'SELL'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <div className="flex -space-x-1.5">
                            <img 
                              src={getTokenIcon(trade.pair.split('/')[0])} 
                              className="w-4 h-4 rounded-full ring-1 ring-fuel-dark-800" 
                              alt={trade.pair.split('/')[0]} 
                            />
                            <img 
                              src={getTokenIcon(trade.pair.split('/')[1])} 
                              className="w-4 h-4 rounded-full ring-1 ring-fuel-dark-800 relative z-10" 
                              alt={trade.pair.split('/')[1]} 
                            />
                          </div>
                          <span className="text-xs">{trade.pair}</span>
                        </div>
                        <div className={`text-right font-mono text-xs ${
                          trade.type === 'buy' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trade.price.toFixed(2)}
                        </div>
                        <div className="text-right font-mono text-xs">
                          {trade.amount.toFixed(4)}
                        </div>
                        <div className="text-right font-mono text-xs text-gray-400">
                          {trade.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // My Orders Content
                <div className="p-4">
                  <div className="grid grid-cols-7 text-xs text-gray-400 mb-3 px-2">
                    <div>Date</div>
                    <div>Type</div>
                    <div>Pair</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Filled</div>
                    <div className="text-right">Status</div>
                  </div>
                  {userOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[150px] text-gray-400">
                      <span className="text-sm">No orders found</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {userOrders.map((order) => (
                        <div 
                          key={order.id}
                          className="grid grid-cols-7 text-sm items-center hover:bg-fuel-dark-700/50 px-2 py-2.5 rounded transition-colors"
                        >
                          <div className="text-gray-400 font-mono text-xs">
                            {(() => {
                              const orderDate = new Date(order.timestamp);
                              const today = new Date();
                              const isToday = orderDate.toDateString() === today.toDateString();

                              if (isToday) {
                                return orderDate.toLocaleTimeString(undefined, {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });
                              }

                              return orderDate.toLocaleString(undefined, {
                                year: '2-digit',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              });
                            })()}
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${
                              order.type === 'buy' 
                                ? 'bg-green-500/10 text-green-400' 
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {order.type === 'buy' ? 'BUY' : 'SELL'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <div className="flex -space-x-1.5">
                              <img 
                                src={getTokenIcon(order.pair.split('/')[0])} 
                                className="w-4 h-4 rounded-full ring-1 ring-fuel-dark-800" 
                                alt={order.pair.split('/')[0]} 
                              />
                              <img 
                                src={getTokenIcon(order.pair.split('/')[1])} 
                                className="w-4 h-4 rounded-full ring-1 ring-fuel-dark-800 relative z-10" 
                                alt={order.pair.split('/')[1]} 
                              />
                            </div>
                            <span className="text-xs">{order.pair}</span>
                          </div>
                          <div className="text-right font-mono text-xs">
                            {order.price.toFixed(2)}
                          </div>
                          <div className="text-right font-mono text-xs">
                            {order.amount.toFixed(4)}
                          </div>
                          <div className="text-right font-mono text-xs">
                            {(order.filled || 0).toFixed(4)}
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded ${
                              order.status === 'filled' ? 'bg-green-500/20 text-green-400' :
                              order.status === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trading Interface - make it scrollable and set min-width */}
        <div className="w-[350px] min-w-[350px] border-l border-fuel-dark-600 bg-fuel-dark-800 flex flex-col overflow-hidden">
          {/* Trading Form */}
          <div className="p-4 flex-shrink-0">
            <div className="flex items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2 mr-2">
                  <img 
                    src={getTokenIcon(baseToken)} 
                    className="w-6 h-6 rounded-full ring-2 ring-fuel-dark-800" 
                    alt={baseToken} 
                  />
                  <img 
                    src={getTokenIcon(quoteToken)} 
                    className="w-6 h-6 rounded-full ring-2 ring-fuel-dark-800 relative z-10" 
                    alt={quoteToken} 
                  />
                </div>
                <span className="text-lg">{selectedPair}</span>
                {/* <span className="text-xs px-2 py-0.5 rounded bg-fuel-dark-700">
                  {price || '2150.81'} {quoteToken}
                </span> */}
              </div>
            </div>

            {/* Buy/Sell Toggle */}
            <div className="flex mb-4">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-l transition-colors
                  ${isBuying ? 'bg-fuel-green text-fuel-dark-900' : 'bg-fuel-dark-700 text-gray-400'}`}
                onClick={() => setIsBuying(true)}
              >
                BUY {baseToken}
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-r transition-colors
                  ${!isBuying ? 'bg-red-500 text-white' : 'bg-fuel-dark-700 text-gray-400'}`}
                onClick={() => setIsBuying(false)}
              >
                SELL {baseToken}
              </button>
            </div>

            {/* Price Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">PRICE</span>
                <span className="text-xs text-gray-400">
                  Current <span className="text-white">2150.81</span>
                </span>
              </div>
              <div className="bg-fuel-dark-900 rounded-lg p-3">
                <input
                  type="text"
                  className="w-full bg-transparent text-2xl outline-none font-mono"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">AMOUNT</span>
                {/* Only show balance when selling */}
                {!isBuying && (
                  <span className="text-xs text-gray-400">
                    Balance <span className="text-white">0 {baseToken}</span>
                  </span>
                )}
              </div>
              <div className="bg-fuel-dark-900 rounded-lg">
                <div className="p-3">
                  <input
                    type="text"
                    className="w-full bg-transparent text-2xl outline-none font-mono"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="px-3 pb-3 flex items-center">
                  <div className="flex items-center space-x-2">
                    <img src={getTokenIcon(baseToken)} className="w-5 h-5" alt={baseToken} />
                    <span>{baseToken}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="bg-fuel-dark-900 rounded-lg p-3 mb-4">
              <div className="flex flex-col space-y-2">
                {/* Show quote token balance when buying */}
                {isBuying && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Balance</span>
                    <span>0.00 {quoteToken}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total</span>
                  {isBuying ? (
                    <span>{(Number(price || 0) * Number(amount || 0)).toFixed(2)} {quoteToken}</span>
                  ) : (
                    <span>{Number(amount || 0).toFixed(4)} {baseToken}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Connect Wallet Button */}
            <button 
              className={`w-full py-3 text-sm font-medium cursor-pointer rounded transition-colors
                ${isBuying 
                  ? 'bg-fuel-green text-fuel-dark-900 hover:bg-opacity-90' 
                  : 'bg-red-500 text-white hover:bg-opacity-90'}`}
              disabled={!amount || !price}
              onClick={placeOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default P2PComponent;