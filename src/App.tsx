import React, { useState } from 'react';
import { ArrowRightLeft, ChevronDown } from 'lucide-react';
import { AdvancedChart } from "react-tradingview-embed";
import FuelLogo from "./assets/Fuel.svg";
import TradingViewWidget from './components/TradingViewWidget';
import WalletConnect from './components/WalletConnect';
import SwapComponent from './components/SwapComponent';
import DepositModal from './components/DepositModal';

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

// Update the mock trades data
const mockTrades = [
  { price: 0.04200, quantity: 2488.5714, time: '15:14:33' },
  { price: 0.04200, quantity: 1885.9524, time: '15:14:33' },
  { price: 0.04200, quantity: 1462.3810, time: '15:14:33' },
  { price: 0.04198, quantity: 2895.2381, time: '15:14:32' },
  { price: 0.04197, quantity: 1468.1292, time: '15:14:31' },
  { price: 0.04201, quantity: 1458.2168, time: '14:56:25' },
  { price: 0.04202, quantity: 1412.2567, time: '14:47:16' },
  { price: 0.04100, quantity: 40.0000, time: '13:35:04' },
  { price: 0.04335, quantity: 30.0000, time: '14:00:48' },
  { price: 0.04650, quantity: 76068.6449, time: '21:40:29' },
  { price: 0.04650, quantity: 9652.4544, time: '21:33:58' },
  { price: 0.04648, quantity: 76231.6484, time: '21:28:44' },
  { price: 0.04652, quantity: 10724.4993, time: '21:27:23' },
  { price: 0.04650, quantity: 62372.0000, time: '21:24:31' },
  { price: 0.04649, quantity: 76108.2142, time: '21:21:37' },
  { price: 0.04650, quantity: 71486.4012, time: '21:18:52' },
  { price: 0.04651, quantity: 70296.0842, time: '21:13:58' },
  { price: 0.04650, quantity: 76151.9388, time: '21:07:07' },
  { price: 0.04649, quantity: 74242.4428, time: '20:59:36' },
  { price: 0.04650, quantity: 74058.6566, time: '20:59:13' },
  { price: 0.04648, quantity: 74812.3014, time: '20:55:36' },
  { price: 0.04650, quantity: 73319.4221, time: '20:51:22' },
  { price: 0.04649, quantity: 72813.2808, time: '20:50:00' },
  { price: 0.04650, quantity: 72936.2528, time: '20:48:48' },
  { price: 0.04655, quantity: 70294.4081, time: '20:47:42' },
  { price: 0.04655, quantity: 70523.4959, time: '20:44:24' },
  { price: 0.04655, quantity: 71431.0845, time: '20:42:45' },
  { price: 0.04655, quantity: 70660.4605, time: '20:41:37' },
  { price: 0.04444, quantity: 67316.0272, time: '20:40:22' },
  { price: 0.04444, quantity: 68001.9068, time: '20:28:55' }
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

function App() {
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [size, setSize] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [activeView, setActiveView] = useState<'orderbook' | 'trades'>('orderbook');
  const [isOrderTypeOpen, setIsOrderTypeOpen] = useState(false);
  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'terminal' | 'swap'>('terminal');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-fuel-dark-900 text-gray-100">
      {/* Header - Always visible */}
      <header className="border-b border-fuel-dark-600 bg-fuel-dark-800 py-2.5">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 justify-center">
              <img
                src={FuelLogo}
                alt="FUEL Logo"
                className="w-4 md:w-7 h-7 mt-2"
              />
              <span className="text-lg font-bold">FUEL DEX</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className={`px-4 py-1.5 rounded text-sm transition-colors
                  ${activeScreen === 'terminal' 
                    ? 'bg-fuel-dark-700 text-fuel-green' 
                    : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setActiveScreen('terminal')}
              >
                Terminal
              </button>
              <button 
                className={`px-4 py-1.5 rounded text-sm transition-colors
                  ${activeScreen === 'swap' 
                    ? 'bg-fuel-dark-700 text-fuel-green' 
                    : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setActiveScreen('swap')}
              >
                Swap
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="px-4 py-1.5 rounded bg-fuel-dark-700 text-gray-100 text-sm hover:bg-fuel-dark-600"
              onClick={() => setIsDepositModalOpen(true)}
            >
              Deposit
            </button>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Trading Pair Info - Only visible in terminal */}
      {activeScreen === 'terminal' && (
        <div className="border-b border-fuel-dark-600 bg-fuel-dark-800 py-2.5">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">FUEL-USDT</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-fuel-green font-medium">$0.041</div>
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
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0">
        {activeScreen === 'terminal' ? (
          <>
            <div className="flex-1 flex min-h-0">
              {/* Chart Section - increased width */}
              <div className="w-[75%] bg-fuel-dark-800 border-r border-fuel-dark-600 flex flex-col">
                <div className="flex-1 min-h-0">
                  {/* <AdvancedChart
                    widgetProps={{
                      interval: "1D",
                      theme: "dark",
                      width: "100%",
                      height: "100%",
                      symbol: "MEXC:FUELUSDT",
                      timezone: "exchange",
                      style: "1",
                      locale: "en",
                      toolbar_bg: "#0F1114",
                      backgroundColor: "#0F1114",
                      enable_publishing: false,
                      hide_top_toolbar: true,
                      save_image: false,
                      container_id: "tradingview_chart",
                    }}
                  /> */}
                  <TradingViewWidget/>
                </div>
              </div>

              {/* Order Book and Trading Interface - decreased width */}
              <div className="w-[25%] flex flex-col min-h-0">
                {/* Order Type Selector */}
                <div className="bg-fuel-dark-800 p-2 border-b border-fuel-dark-600">
                  <div className="flex">
                    <button 
                      className={`flex-1 py-2 text-center text-sm rounded-l transition-colors
                        ${activeView === 'orderbook' 
                          ? 'bg-fuel-dark-700 text-fuel-green' 
                          : 'bg-fuel-dark-800 text-gray-400 hover:text-gray-300'}`}
                      onClick={() => setActiveView('orderbook')}
                    >
                      ORDERBOOK
                    </button>
                    <button 
                      className={`flex-1 py-2 text-center text-sm rounded-r transition-colors
                        ${activeView === 'trades' 
                          ? 'bg-fuel-dark-700 text-fuel-green' 
                          : 'bg-fuel-dark-800 text-gray-400 hover:text-gray-300'}`}
                      onClick={() => setActiveView('trades')}
                    >
                      TRADES
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                {activeView === 'orderbook' ? (
                  // Existing Orderbook content
                  <div className="flex-1 bg-fuel-dark-800 p-2 flex flex-col min-h-0">
                    <div className="text-xs grid grid-cols-3 text-gray-400 mb-2">
                      <span>Price USDC</span>
                      <span className="text-right">Amount FUEL</span>
                      <span className="text-right">Total</span>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-fuel-dark-600 scrollbar-track-transparent">
                      {/* Asks */}
                      <div className="space-y-0.5 mb-2">
                        {mockOrderBook.asks.map((order, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-3 text-xs relative overflow-hidden"
                          >
                            <div
                              className="absolute inset-0 bg-red-500/10"
                              style={{ width: `${(order.total / 16.4) * 100}%` }}
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
                        <div className="text-fuel-green text-sm font-medium">
                          {calculateSpread(mockOrderBook.asks, mockOrderBook.bids).avgPrice} USDC
                        </div>
                        <div className="text-xs text-gray-400">
                          Spread: {calculateSpread(mockOrderBook.asks, mockOrderBook.bids).spread} ({calculateSpread(mockOrderBook.asks, mockOrderBook.bids).spreadPercentage}%)
                        </div>
                      </div>

                      {/* Bids */}
                      <div className="space-y-0.5 mt-2">
                        {mockOrderBook.bids.map((order, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-3 text-xs relative overflow-hidden"
                          >
                            <div
                              className="absolute inset-0 bg-green-900/20"
                              style={{ width: `${(order.total / 948.1) * 100}%` }}
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
                  // New Trades content
                  <div className="flex-1 bg-fuel-dark-800 p-2 flex flex-col min-h-0">
                    <div className="text-xs grid grid-cols-3 text-gray-400 mb-2">
                      <span>Price</span>
                      <span className="text-right">Qty</span>
                      <span className="text-right">Time</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <div className="space-y-0.5">
                        {mockTrades.map((trade, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-3 text-xs"
                          >
                            <span className={`font-mono ${
                              trade.price >= (mockTrades[i + 1]?.price ?? trade.price) 
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
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

                {/* Trading Interface */}
                <div className="bg-fuel-dark-800 p-2 border-t border-fuel-dark-600">
                  <div className="flex mb-4">
                    <button 
                      className={`flex-1 py-2 text-sm font-medium rounded-l transition-colors
                        ${tradeType === 'buy' 
                          ? 'bg-fuel-green text-fuel-dark-900' 
                          : 'bg-fuel-dark-700 text-gray-400 hover:bg-fuel-dark-600'}`}
                      onClick={() => setTradeType('buy')}
                    >
                      BUY
                    </button>
                    <button 
                      className={`flex-1 py-2 text-sm font-medium rounded-r transition-colors
                        ${tradeType === 'sell' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-fuel-dark-700 text-gray-400 hover:bg-fuel-dark-600'}`}
                      onClick={() => setTradeType('sell')}
                    >
                      SELL
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Order type</span>
                        <span className="text-gray-400">Price</span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <button
                            className="w-full bg-fuel-dark-700 rounded p-2 text-sm text-left flex items-center justify-between hover:bg-fuel-dark-600 transition-colors"
                            onClick={() => setIsOrderTypeOpen(!isOrderTypeOpen)}
                          >
                            <span>{orderType.toUpperCase()}</span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOrderTypeOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isOrderTypeOpen && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-fuel-dark-700 rounded shadow-lg border border-fuel-dark-600 z-10">
                              <button
                                className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors"
                                onClick={() => {
                                  setOrderType('limit');
                                  setIsOrderTypeOpen(false);
                                }}
                              >
                                LIMIT
                              </button>
                              <button
                                className="w-full p-2 text-sm text-left hover:bg-fuel-dark-600 transition-colors"
                                onClick={() => {
                                  setOrderType('market');
                                  setIsOrderTypeOpen(false);
                                }}
                              >
                                MARKET
                              </button>
                            </div>
                          )}
                        </div>
                        <input
                          type="number"
                          className="flex-1 bg-fuel-dark-700 rounded p-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          disabled={orderType === "market"}
                        />
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
                            onClick={() => setIsTokenSelectOpen(!isTokenSelectOpen)}
                          >
                            <span>FUEL</span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isTokenSelectOpen ? 'rotate-180' : ''}`} />
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

                    <WalletConnect variant="trade" tradeType={tradeType} />
                  </div>
                </div>
              </div>
            </div>
            {/* Trade History */}
            <div className="bg-fuel-dark-800 border-t border-fuel-dark-600">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-6">
                    <button className="text-fuel-green text-sm font-medium hover:text-opacity-90">
                      ORDERS
                    </button>
                    <button className="text-gray-400 text-sm font-medium hover:text-gray-300">
                      HISTORY
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <p className="text-sm mb-1">You haven't made any trades so far</p>
                  <p className="text-xs">
                    Begin trading to view updates on your portfolio
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <SwapComponent />
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