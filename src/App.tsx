import React, { useState, useMemo, useCallback } from 'react';
import { ArrowRightLeft, ChevronDown } from 'lucide-react';
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
  const lowestAsk = Math.min(...asks.map(ask => ask.price));
  const highestBid = Math.max(...bids.map(bid => bid.price));
  const spread = lowestAsk - highestBid;
  const spreadPercentage = (spread / lowestAsk) * 100;
  const avgPrice = (lowestAsk + highestBid) / 2;
  
  return {
    spread: spread.toFixed(5),
    spreadPercentage: spreadPercentage.toFixed(2),
    avgPrice: avgPrice.toFixed(5)
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

function App() {
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [size, setSize] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [activeView, setActiveView] = useState<'orderbook' | 'trades'>('orderbook');
  const [isOrderTypeOpen, setIsOrderTypeOpen] = useState(false);
  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'terminal' | 'swap' | 'p2p'>('terminal');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'chart' | 'orderbook' | 'trades'>('chart');
  const [mobileBottomView, setMobileBottomView] = useState<'orders' | 'history'>('orders');
  const [selectedPair, setSelectedPair] = useState<TradingPair>('ETH/USDT');
  const [isPairSelectOpen, setIsPairSelectOpen] = useState(false);

  const [orderBook, setOrderBook] = useState<OrderBook>({
    asks: mockOrderBook.asks.map(ask => ({
      id: Math.random().toString(36).substring(2, 15),
      ...ask,
      type: 'sell' as const,
      timestamp: Date.now()
    })),
    bids: mockOrderBook.bids.map(bid => ({
      id: Math.random().toString(36).substring(2, 15),
      ...bid,
      type: 'buy' as const,
      timestamp: Date.now()
    }))
  });
  
  const [trades, setTrades] = useState<Trade[]>(mockTrades.map(trade => ({
    ...trade,
    type: Math.random() > 0.5 ? 'buy' : 'sell',
    timestamp: Date.now()
  })));

  // Add new state for orders and history
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [orderHistory, setOrderHistory] = useState<HistoricalOrder[]>([]);

  // Add state for user trades
  const [userTrades, setUserTrades] = useState<UserTrade[]>([]);

  const tradingService = useMemo(() => new TradingService(), []);

  const handlePlaceOrder = useCallback(() => {
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

  return (
    <div className="h-screen flex flex-col bg-fuel-dark-900 text-gray-100">
      {/* Header - Always visible */}
      <header className="border-b border-fuel-dark-600 bg-fuel-dark-800 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 space-y-2 sm:space-y-0">
          <div className="flex items-center justify-between sm:space-x-8">
            <div className="flex items-center space-x-2">
              <img src={FuelLogo} alt="FUEL Logo" className="w-5 sm:w-7 h-7" />
              <span className="text-base sm:text-lg font-bold">FUEL DEX</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                className={`px-3 sm:px-4 py-1.5 rounded text-xs sm:text-sm transition-colors
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
                className={`px-3 sm:px-4 py-1.5 rounded text-xs sm:text-sm transition-colors
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
                className={`px-3 sm:px-4 py-1.5 rounded text-xs sm:text-sm transition-colors
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
          <div className="flex items-center justify-end space-x-2 sm:space-x-4">
            <button
              className="px-3 sm:px-4 py-1.5 rounded bg-fuel-dark-700 text-gray-100 text-xs sm:text-sm hover:bg-fuel-dark-600"
              onClick={() => setIsDepositModalOpen(true)}
            >
              Deposit
            </button>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Trading Pair Info - Only visible in terminal */}
      {activeScreen === "terminal" && (
        <div className="bg-fuel-dark-800 px-4 py-2 border-b border-fuel-dark-600">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center justify-between sm:justify-start">
              <div className="flex items-center justify-between sm:justify-start">
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 text-lg font-bold hover:bg-fuel-dark-700 rounded px-2 py-1"
                    onClick={() => setIsPairSelectOpen(!isPairSelectOpen)}
                  >
                    <div className="flex items-center">
                      <div className="flex -space-x-2 mr-2">
                        <img 
                          src={getTokenIcon(selectedPair.split('/')[0])} 
                          className="w-6 h-6 rounded-full ring-2 ring-fuel-dark-900" 
                          alt={selectedPair.split('/')[0]} 
                        />
                        <img 
                          src={getTokenIcon(selectedPair.split('/')[1])} 
                          className="w-6 h-6 rounded-full ring-2 ring-fuel-dark-900 relative z-10" 
                          alt={selectedPair.split('/')[1]} 
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
              </div>
              <div className="text-fuel-green font-medium sm:ml-4">$0.041</div>
            </div>

            {/* Stats - Grid on mobile, flex on desktop */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:space-x-6 text-xs sm:text-sm">
              <div className="text-gray-400">
                24h volume
                <span className="ml-2 text-gray-100">$1.64273</span>
              </div>
              <div className="text-gray-400">
                24h High
                <span className="ml-2 text-gray-100">$0.0452</span>
              </div>
              <div className="text-gray-400">
                24h Low
                <span className="ml-2 text-gray-100">$0.041</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Tabs */}
      {activeScreen === "terminal" && (
        <div className="sm:hidden bg-fuel-dark-800 border-b border-fuel-dark-600">
          <div className="flex">
            <button
              className={`flex-1 py-3 text-center text-sm border-b-2 transition-colors
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
              className={`flex-1 py-3 text-center text-sm border-b-2 transition-colors
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
              className={`flex-1 py-3 text-center text-sm border-b-2 transition-colors
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
                    />
                  </div>
                )}

                {mobileView === "orderbook" && (
                  <div className="h-[300px] overflow-auto">
                    <div className="p-2">
                      <div className="text-[10px] grid grid-cols-3 text-gray-400 mb-2">
                        <span>Price USDC</span>
                        <span className="text-right">Amount FUEL</span>
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
                                width: `${(order.total / 16.4) * 100}%`,
                              }}
                            ></div>
                            <span className="relative z-10 text-red-400">
                              {order.price.toFixed(5)}
                            </span>
                            <span className="relative z-10 text-right">
                              {order.size.toFixed(3)}
                            </span>
                            <span className="relative z-10 text-right text-gray-500">
                              {order.total.toFixed(5)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Current Price */}
                      <div className="sticky top-0 text-center py-1.5 space-y-1 border-y border-fuel-dark-600 bg-fuel-dark-700">
                        <div className="text-fuel-green text-xs sm:text-sm font-medium">
                          {
                            calculateSpread(orderBook.asks, orderBook.bids)
                              .avgPrice
                          }{" "}
                          USDC
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-400">
                          Spread:{" "}
                          {
                            calculateSpread(orderBook.asks, orderBook.bids)
                              .spread
                          }{" "}
                          (
                          {
                            calculateSpread(orderBook.asks, orderBook.bids)
                              .spreadPercentage
                          }
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
                              {order.price.toFixed(5)}
                            </span>
                            <span className="relative z-10 text-right">
                              {order.size.toFixed(3)}
                            </span>
                            <span className="relative z-10 text-right text-gray-500">
                              {order.total.toFixed(5)}
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
                      <div className="text-[10px] grid grid-cols-3 text-gray-400 mb-2">
                        <span>Price</span>
                        <span className="text-right">Qty</span>
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
                              {trade.price.toFixed(5)}
                            </span>
                            <span className="text-right font-mono">
                              {trade.quantity.toFixed(4)}
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
                    className={`flex-1 py-2 text-center text-sm font-medium transition-colors
                      ${
                        mobileBottomView === "orders"
                          ? "text-fuel-green"
                          : "text-gray-400"
                      }`}
                    onClick={() => setMobileBottomView("orders")}
                  >
                    Orders
                  </button>
                  <button
                    className={`flex-1 py-2 text-center text-sm font-medium transition-colors
                      ${
                        mobileBottomView === "history"
                          ? "text-fuel-green"
                          : "text-gray-400"
                      }`}
                    onClick={() => setMobileBottomView("history")}
                  >
                    History
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
                                {order.size.toFixed(4)}
                                {order.status === "partial" && (
                                  <span className="text-gray-400">
                                    {" "}
                                    ({order.filled!.toFixed(4)} filled)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span>{order.price.toFixed(5)}</span>
                                <button
                                  className="px-2 py-0.5 text-[10px] text-gray-400 hover:text-gray-300 hover:bg-fuel-dark-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
                            <div>{order.filled.toFixed(4)}</div>
                            <div>{order.price.toFixed(5)}</div>
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
                      className={`flex-1 py-1.5 text-xs font-medium rounded-l transition-colors
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
                      className={`flex-1 py-1.5 text-xs font-medium rounded-r transition-colors
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
                        {orderType === 'limit' && <span className="text-gray-400">Price</span>}
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <button
                            className="w-full bg-fuel-dark-700 rounded p-2 text-sm text-left flex items-center justify-between hover:bg-fuel-dark-600 transition-colors"
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
                                className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors"
                                onClick={() => {
                                  setOrderType("limit");
                                  setIsOrderTypeOpen(false);
                                }}
                              >
                                LIMIT
                              </button>
                              <button
                                className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors"
                                onClick={() => {
                                  setOrderType("market");
                                  setIsOrderTypeOpen(false);
                                  setPrice(''); // Clear price when switching to market
                                }}
                              >
                                MARKET
                              </button>
                            </div>
                          )}
                        </div>
                        {orderType === 'limit' && (
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
                        />
                        <div className="relative">
                          <button
                            className="w-20 bg-fuel-dark-700 rounded p-1.5 text-xs text-left flex items-center justify-between hover:bg-fuel-dark-600 transition-colors"
                            onClick={() =>
                              setIsTokenSelectOpen(!isTokenSelectOpen)
                            }
                          >
                            <span>FUEL</span>
                            <ChevronDown
                              className={`h-3 w-3 text-gray-400 transition-transform ${
                                isTokenSelectOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isTokenSelectOpen && (
                            <div className="absolute top-full right-0 w-24 mt-1 bg-fuel-dark-700 rounded shadow-lg border border-fuel-dark-600 z-10">
                              <button
                                className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors"
                                onClick={() => {
                                  setIsTokenSelectOpen(false);
                                }}
                              >
                                FUEL
                              </button>
                              <button
                                className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors"
                                onClick={() => {
                                  setIsTokenSelectOpen(false);
                                }}
                              >
                                USDC
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Connect Wallet Button - More compact */}
                    {/* <div className="mt-2">
                      <WalletConnect variant="trade" tradeType={tradeType} />
                    </div> */}
                    <div className="mt-4">
                      <button
                        className={`w-full py-2 text-sm font-medium rounded transition-colors
                          ${
                            (orderType === 'market' ? Boolean(size) : Boolean(price && size))
                              ? 'bg-fuel-green text-fuel-dark-900 hover:bg-opacity-90'
                              : 'bg-fuel-green/50 text-fuel-dark-900 cursor-not-allowed'
                          }`}
                        onClick={handlePlaceOrder}
                        disabled={orderType === 'market' ? !size : !price || !size}
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
              <div className="flex flex-1">
                {/* Left side - Chart and Orders/History */}
                <div className="flex-[3] flex flex-col min-h-0">
                  {/* Chart */}
                  <div className="flex-1 min-h-[400px] bg-fuel-dark-800 border-r border-fuel-dark-600">
                    <TradingViewWidget 
                      trades={trades} 
                      userTrades={userTrades}
                    />
                  </div>

                  {/* Desktop Orders and History Section */}
                  <div className="h-[200px] bg-fuel-dark-800 border-t border-fuel-dark-600">
                    <div className="flex border-b border-fuel-dark-600">
                      <button
                        className={`flex-1 py-2 text-center text-sm font-medium transition-colors
                          ${
                            mobileBottomView === "orders"
                              ? "text-fuel-green"
                              : "text-gray-400"
                          }`}
                        onClick={() => setMobileBottomView("orders")}
                      >
                        Orders
                      </button>
                      <button
                        className={`flex-1 py-2 text-center text-sm font-medium transition-colors
                          ${
                            mobileBottomView === "history"
                              ? "text-fuel-green"
                              : "text-gray-400"
                          }`}
                        onClick={() => setMobileBottomView("history")}
                      >
                        History
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
                                    {order.size.toFixed(4)}
                                    {order.status === "partial" && (
                                      <span className="text-gray-400">
                                        {" "}
                                        ({order.filled!.toFixed(4)} filled)
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>{order.price.toFixed(5)}</span>
                                    <button
                                      className="px-2 py-0.5 text-[10px] text-gray-400 hover:text-gray-300 hover:bg-fuel-dark-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() =>
                                        handleCancelOrder(order.id)
                                      }
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
                                    className={`text-[10px] px-1.5 rounded ${
                                      order.status === "filled"
                                        ? "bg-green-400/10 text-green-400"
                                        : "bg-gray-400/10 text-gray-400"
                                    }`}
                                  >
                                    {order.status.toUpperCase()}
                                  </span>
                                </div>
                                <div>{order.filled.toFixed(4)}</div>
                                <div>{order.price.toFixed(5)}</div>
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

                {/* Right side - Order Book and Trading Interface */}
                <div className="w-[350px] flex flex-col min-h-0 bg-fuel-dark-800 border-l border-fuel-dark-600">
                  {/* Order Book/Trades Toggle */}
                  <div className="flex border-b border-fuel-dark-600">
                    <button
                      className={`flex-1 py-3 text-center text-sm font-medium transition-colors
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
                      className={`flex-1 py-3 text-center text-sm font-medium transition-colors
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

                  {/* Order Book/Trades Content */}
                  <div className="flex-1 overflow-auto">
                    {activeView === "orderbook" ? (
                      // Orderbook content
                      <div className="p-2">
                        <div className="text-[10px] sm:text-xs grid grid-cols-3 text-gray-400 mb-2">
                          <span>Price USDC</span>
                          <span className="text-right">Amount FUEL</span>
                          <span className="text-right">Total</span>
                        </div>

                        <div className="flex-1 overflow-y-auto h-[200px] sm:h-auto scrollbar-thin scrollbar-thumb-fuel-dark-600 scrollbar-track-transparent">
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
                                    width: `${(order.total / 16.4) * 100}%`,
                                  }}
                                ></div>
                                <span className="relative z-10 text-red-400">
                                  {order.price.toFixed(5)}
                                </span>
                                <span className="relative z-10 text-right">
                                  {order.size.toFixed(3)}
                                </span>
                                <span className="relative z-10 text-right text-gray-500">
                                  {order.total.toFixed(5)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Current Price */}
                          <div className="text-center py-1.5 space-y-1 border-y border-fuel-dark-600 bg-fuel-dark-700">
                            <div className="text-fuel-green text-xs sm:text-sm font-medium">
                              {
                                calculateSpread(orderBook.asks, orderBook.bids)
                                  .avgPrice
                              }{" "}
                              USDC
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-400">
                              Spread:{" "}
                              {
                                calculateSpread(orderBook.asks, orderBook.bids)
                                  .spread
                              }{" "}
                              (
                              {
                                calculateSpread(orderBook.asks, orderBook.bids)
                                  .spreadPercentage
                              }
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
                                  {order.price.toFixed(5)}
                                </span>
                                <span className="relative z-10 text-right">
                                  {order.size.toFixed(3)}
                                </span>
                                <span className="relative z-10 text-right text-gray-500">
                                  {order.total.toFixed(5)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Trades content
                      <div className="p-2">
                        <div className="text-[10px] sm:text-xs grid grid-cols-3 text-gray-400 mb-2">
                          <span>Price</span>
                          <span className="text-right">Qty</span>
                          <span className="text-right">Time</span>
                        </div>

                        <div className="flex-1 overflow-y-auto h-[200px] sm:h-auto custom-scrollbar">
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
                                  {trade.price.toFixed(5)}
                                </span>
                                <span className="text-right font-mono">
                                  {trade.quantity.toFixed(4)}
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

                  {/* Trading Interface */}
                  <div className="p-3 border-t border-fuel-dark-600">
                    <div className="flex mb-4">
                      <button
                        className={`flex-1 py-2 text-sm font-medium rounded-l transition-colors
                          ${
                            tradeType === "buy"
                              ? "bg-fuel-green text-fuel-dark-900"
                              : "bg-fuel-dark-700 text-gray-400 hover:bg-fuel-dark-600"
                          }`}
                        onClick={() => setTradeType("buy")}
                      >
                        BUY
                      </button>
                      <button
                        className={`flex-1 py-2 text-sm font-medium rounded-r transition-colors
                          ${
                            tradeType === "sell"
                              ? "bg-red-500 text-white"
                              : "bg-fuel-dark-700 text-gray-400 hover:bg-fuel-dark-600"
                          }`}
                        onClick={() => setTradeType("sell")}
                      >
                        SELL
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Order type</span>
                          {orderType === 'limit' && <span className="text-gray-400">Price</span>}
                        </div>
                        <div className="flex space-x-2">
                          <div className="flex-1 relative">
                            <button
                              className="w-full bg-fuel-dark-700 rounded p-2 text-sm text-left flex items-center justify-between hover:bg-fuel-dark-600 transition-colors"
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
                                  className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors"
                                  onClick={() => {
                                    setOrderType("limit");
                                    setIsOrderTypeOpen(false);
                                  }}
                                >
                                  LIMIT
                                </button>
                                <button
                                  className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors"
                                  onClick={() => {
                                    setOrderType("market");
                                    setIsOrderTypeOpen(false);
                                    setPrice(''); // Clear price when switching to market
                                  }}
                                >
                                  MARKET
                                </button>
                              </div>
                            )}
                          </div>
                          {orderType === 'limit' && (
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
                            className="flex-1 bg-fuel-dark-700 rounded p-2 text-sm hover:bg-fuel-dark-600 transition-colors"
                            placeholder="0.00"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                          />
                          <div className="relative">
                            <button
                              className="w-24 bg-fuel-dark-700 rounded p-2 text-sm text-left flex items-center justify-between hover:bg-fuel-dark-600 transition-colors"
                              onClick={() =>
                                setIsTokenSelectOpen(!isTokenSelectOpen)
                              }
                            >
                              <span>FUEL</span>
                              <ChevronDown
                                className={`h-4 w-4 text-gray-400 transition-transform ${
                                  isTokenSelectOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {isTokenSelectOpen && (
                              <div className="absolute top-full right-0 w-24 mt-1 bg-fuel-dark-700 rounded shadow-lg border border-fuel-dark-600 z-10">
                                <button
                                  className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors"
                                  onClick={() => {
                                    setIsTokenSelectOpen(false);
                                  }}
                                >
                                  FUEL
                                </button>
                                <button
                                  className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors"
                                  onClick={() => {
                                    setIsTokenSelectOpen(false);
                                  }}
                                >
                                  USDC
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* <WalletConnect variant="trade" tradeType={tradeType} /> */}
                    </div>

                    <div className="mt-4">
                      <button
                        className={`w-full py-2 text-sm font-medium rounded transition-colors
                          ${
                            (orderType === 'market' ? Boolean(size) : Boolean(price && size))
                              ? 'bg-fuel-green text-fuel-dark-900 hover:bg-opacity-90'
                              : 'bg-fuel-green/50 text-fuel-dark-900 cursor-not-allowed'
                          }`}
                        onClick={handlePlaceOrder}
                        disabled={orderType === 'market' ? !size : !price || !size}
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeScreen === 'swap' ? (
          <SwapComponent />
        ) : (
          <P2PComponent />
        )}
      </main>

      {/* <footer className="border-t border-fuel-dark-600 bg-fuel-dark-800 py-2">
        <div className="container mx-auto flex items-center text-xs text-gray-500 px-4">
          <span>Powered by Fuel</span>
        </div>
      </footer> */}

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  );
}

export default App;