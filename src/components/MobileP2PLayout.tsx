import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Order, Trade, UserOrder, TradingPair, PairStats } from './types';

interface MobileP2PLayoutProps {
  selectedPair: TradingPair;
  baseToken: string;
  quoteToken: string;
  isPairSelectOpen: boolean;
  setIsPairSelectOpen: (open: boolean) => void;
  getTokenIcon: (token: string) => string;
  TRADING_PAIRS: TradingPair[];
  setSelectedPair: (pair: TradingPair) => void;
  orderBook: Record<TradingPair, Order[]>;
  recentTrades: Trade[];
  userOrders: UserOrder[];
  pairStats: Record<TradingPair, PairStats>;
  isBuying: boolean;
  price: string;
  amount: string;
  setPrice: (price: string) => void;
  setAmount: (amount: string) => void;
  placeOrder: () => void;
  showTradingView: boolean;
  setShowTradingView: (show: boolean) => void;
  setIsBuying: (buying: boolean) => void;
  activeTab: 'trades' | 'orders';
  setActiveTab: (tab: 'trades' | 'orders') => void;
}

export function MobileP2PLayout({
  selectedPair,
  baseToken,
  quoteToken,
  isPairSelectOpen,
  setIsPairSelectOpen,
  getTokenIcon,
  TRADING_PAIRS,
  setSelectedPair,
  orderBook,
  recentTrades,
  userOrders,
  pairStats,
  isBuying,
  price,
  amount,
  setPrice,
  setAmount,
  placeOrder,
  showTradingView,
  setShowTradingView,
  setIsBuying,
  activeTab,
  setActiveTab,
}: MobileP2PLayoutProps) {
  const handleMobileTradeClick = (type: 'buy' | 'sell') => {
    setIsBuying(type === 'buy');
    setShowTradingView(true);
  };

  if (showTradingView) {
    return (
      <div className="flex flex-col h-full bg-fuel-dark-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-fuel-dark-600">
          <button 
            onClick={() => setShowTradingView(false)}
            className="text-gray-400 hover:text-white"
          >
            ← Back
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium">{isBuying ? 'Buy' : 'Sell'} {baseToken}</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Trading Form */}
          <div className="p-4 border-b border-fuel-dark-600">
            {/* Price Input */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Price</span>
                <span className="text-xs text-gray-400">
                  Current <span className="text-white">{pairStats[selectedPair].lastPrice}</span>
                </span>
              </div>
              <div className="bg-fuel-dark-900 rounded-lg p-3">
                <input
                  type="text"
                  className="w-full bg-transparent text-xl outline-none font-mono"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Amount</span>
              </div>
              <div className="bg-fuel-dark-900 rounded-lg p-3">
                <input
                  type="text"
                  className="w-full bg-transparent text-xl outline-none font-mono"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Total */}
            <div className="bg-fuel-dark-900 rounded-lg p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total</span>
                <span>{(Number(price || 0) * Number(amount || 0)).toFixed(2)} {quoteToken}</span>
              </div>
            </div>
          </div>

          {/* Orderbook */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-fuel-dark-900 p-4 border-b border-fuel-dark-600">
              <div className="text-xs text-gray-400 grid grid-cols-4 gap-4">
                <div>Price ({quoteToken})</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Total</div>
                <div></div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-1">
                {orderBook[selectedPair]
                  .filter(order => order.type === (isBuying ? 'sell' : 'buy'))
                  .map(order => (
                    <div 
                      key={order.id} 
                      className="grid grid-cols-4 text-[13px] items-center relative overflow-hidden group hover:bg-fuel-dark-700 rounded py-1.5 px-2"
                    >
                      <div 
                        className={`absolute inset-0 ${order.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'}`}
                        style={{
                          width: `${(order.amount / 2) * 100}%`,
                        }}
                      />
                      <div className={`relative z-10 font-mono ${
                        order.type === 'buy' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {order.price.toFixed(2)}
                      </div>
                      <div className="relative z-10 text-right font-mono">
                        {order.amount.toFixed(4)}
                      </div>
                      <div className="relative z-10 text-right text-gray-400 font-mono">
                        {order.total.toFixed(2)}
                      </div>
                      <div className="relative z-10 text-right">
                        <button 
                          className="px-3 py-1 text-xs font-medium rounded transition-all duration-200
                            border-2 border-fuel-dark-800 text-[#3c3c3e]
                            group-hover:bg-green-500/20 group-hover:text-green-400 group-hover:border-transparent"
                          onClick={() => {
                            setPrice(order.price.toString());
                            setAmount(order.amount.toString());
                          }}
                        >
                          {order.type === 'buy' ? 'Sell' : 'Buy'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <div className="p-4 border-t border-fuel-dark-600">
            <button 
              className={`w-full py-4 text-sm font-medium rounded transition-colors
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
    );
  }

  return (
    <div className="flex flex-col h-full bg-fuel-dark-900">
      {/* Header */}
      <div className="flex flex-col p-4 border-b border-fuel-dark-600">
        {/* Top Row - Pair Selector and Stats */}
        <div className="flex items-center justify-between mb-3">
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

          <div className="flex items-center space-x-3">
            <span className={pairStats[selectedPair].priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
              ${pairStats[selectedPair].lastPrice.toFixed(selectedPair === 'USDC/USDT' ? 4 : 2)}
            </span>
            <span className={pairStats[selectedPair].priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
              {pairStats[selectedPair].priceChange > 0 ? '+' : ''}{pairStats[selectedPair].priceChange}%
            </span>
          </div>
        </div>

        {/* Bottom Row - Volume Stats */}
        <div className="flex items-center justify-between text-xs">
          <div className="text-gray-400">
            <span>24h Vol </span>
            <span className="text-white">${pairStats[selectedPair].volume24h.toLocaleString()}</span>
            <span className={`ml-1 ${pairStats[selectedPair].volumeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pairStats[selectedPair].volumeChange > 0 ? '+' : ''}{pairStats[selectedPair].volumeChange}%
            </span>
          </div>
          <div className="text-gray-400">
            <span>Total Vol </span>
            <span className="text-white">${pairStats[selectedPair].totalVolume.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Order Book */}
        <div className="p-4">
          <div className="text-xs text-gray-400 grid grid-cols-4 gap-4 mb-2">
            <div>Price ({quoteToken})</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Total</div>
            <div></div>
          </div>

          {/* Sell Orders - Fixed height with scroll */}
          <div className="mb-2">
            <div className="h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-fuel-dark-700 scrollbar-track-transparent">
              <div className="space-y-0.5">
                {orderBook[selectedPair]
                  .filter(order => order.type === 'sell')
                  .map(order => (
                    <div 
                      key={order.id} 
                      className="grid grid-cols-4 text-[13px] items-center relative overflow-hidden group hover:bg-fuel-dark-700 rounded py-1.5 px-2"
                    >
                      <div 
                        className="absolute inset-0 bg-red-500/10"
                        style={{
                          width: `${(order.amount / 2) * 100}%`,
                        }}
                      />
                      <div className="relative z-10 text-red-400 font-mono">
                        {order.price.toFixed(2)}
                      </div>
                      <div className="relative z-10 text-right font-mono">
                        {order.amount.toFixed(4)}
                      </div>
                      <div className="relative z-10 text-right text-gray-400 font-mono">
                        {order.total.toFixed(2)}
                      </div>
                      <div className="relative z-10 text-right">
                        <button 
                          className="px-3 py-1 text-xs font-medium rounded transition-all duration-200
                            border-2 border-fuel-dark-800 text-[#3c3c3e]
                            group-hover:bg-green-500/20 group-hover:text-green-400 group-hover:border-transparent"
                          onClick={() => handleMobileTradeClick('buy')}
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Current Price */}
          <div className="text-center py-2 text-sm bg-fuel-dark-800 rounded-lg mb-2">
            <span className="text-gray-400">Last Price: </span>
            <span className="text-white">{pairStats[selectedPair].lastPrice}</span>
            <span className={`ml-2 text-xs ${pairStats[selectedPair].priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pairStats[selectedPair].priceChange > 0 ? '+' : ''}{pairStats[selectedPair].priceChange}%
            </span>
          </div>

          {/* Buy Orders - Fixed height with scroll */}
          <div>
            <div className="h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-fuel-dark-700 scrollbar-track-transparent">
              <div className="space-y-0.5">
                {orderBook[selectedPair]
                  .filter(order => order.type === 'buy')
                  .map(order => (
                    <div 
                      key={order.id} 
                      className="grid grid-cols-4 text-[13px] items-center relative overflow-hidden group hover:bg-fuel-dark-700 rounded py-1.5 px-2"
                    >
                      <div 
                        className="absolute inset-0 bg-green-500/10"
                        style={{
                          width: `${(order.amount / 2) * 100}%`,
                        }}
                      />
                      <div className="relative z-10 text-green-400 font-mono">
                        {order.price.toFixed(2)}
                      </div>
                      <div className="relative z-10 text-right font-mono">
                        {order.amount.toFixed(4)}
                      </div>
                      <div className="relative z-10 text-right text-gray-400 font-mono">
                        {order.total.toFixed(2)}
                      </div>
                      <div className="relative z-10 text-right">
                        <button 
                          className="px-3 py-1 text-xs font-medium rounded transition-all duration-200
                            border-2 border-fuel-dark-800 text-[#3c3c3e]
                            group-hover:bg-red-500/20 group-hover:text-red-400 group-hover:border-transparent"
                          onClick={() => handleMobileTradeClick('sell')}
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trades and My Orders Tabs */}
        <div className="border-t border-fuel-dark-600 mb-20">
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
          <div className="p-4">
            {activeTab === 'trades' ? (
              // Recent Trades Content
              <div className="space-y-2">
                {recentTrades.slice(0, 10).map((trade, index) => (
                  <div key={index} className="grid grid-cols-4 text-sm items-center">
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
                    <div className="text-right font-mono">
                      {trade.amount.toFixed(4)}
                    </div>
                    <div className="text-right text-gray-400 font-mono">
                      {trade.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // My Orders Content
              <div>
                {userOrders.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">No orders yet</div>
                ) : (
                  <div className="space-y-2">
                    {userOrders.map((order) => (
                      <div key={order.id} className="grid grid-cols-4 text-sm items-center">
                        <div className={order.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                          {order.type.toUpperCase()}
                        </div>
                        <div className="font-mono">{order.price.toFixed(2)}</div>
                        <div className="text-right font-mono">{order.amount.toFixed(4)}</div>
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

        {/* Buy/Sell Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-2 grid grid-cols-2 gap-2 border-t border-fuel-dark-600 bg-fuel-dark-800">
          <button
            onClick={() => handleMobileTradeClick('buy')}
            className="py-3 text-sm font-medium rounded bg-fuel-green text-fuel-dark-900 hover:bg-opacity-90"
          >
            Buy {baseToken}
          </button>
          <button
            onClick={() => handleMobileTradeClick('sell')}
            className="py-3 text-sm font-medium rounded bg-red-500 text-white hover:bg-opacity-90"
          >
            Sell {baseToken}
          </button>
        </div>
      </div>
    </div>
  );
} 