import React, { useState, useEffect, useRef } from 'react';
import { Trade, UserTrade, ActiveOrder, HistoricalOrder } from '../types/trading';
import { Line } from 'react-chartjs-2';
import { ExternalLink, ChevronDown } from 'lucide-react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// } from 'chart.js';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

interface AssetBalances {
  available: {
    ETH: number;
    USDT: number;
    USDC: number;
  };
  inOrders: {
    ETH: number;
    USDT: number;
    USDC: number;
  };
  total: {
    ETH: number;
    USDT: number;
    USDC: number;
  };
}

interface PortfolioProps {
  trades: Trade[];
  userTrades: UserTrade[];
  activeOrders: ActiveOrder[];
  orderHistory: HistoricalOrder[];
  onCancelOrder: (orderId: string) => void;
  balances: AssetBalances;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface EquityPoint {
  timestamp: number;
  value: number;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        className="flex items-center justify-between w-full px-3 py-1.5 text-sm text-white bg-[#111] border border-[#27272A] rounded-lg hover:border-[#3F3F46] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[#111] border border-[#27272A] rounded-lg shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-900 transition-colors
                ${option.value === value ? 'text-[#22c55e] bg-gray-900' : 'text-white'}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Portfolio: React.FC<PortfolioProps> = ({ 
  trades, 
  userTrades, 
  activeOrders,
  orderHistory,
  onCancelOrder,
  balances 
}) => {
  const [activeTab, setActiveTab] = useState<'balances' | 'orders' | 'history'>('balances');
  const [prices, setPrices] = useState<{[key: string]: number}>({
    ETH: 0,
    USDT: 1,
    USDC: 1 
  });
  const [totalEquity, setTotalEquity] = useState<number>(0);
  const [chartType, setChartType] = useState<'pnl' | 'account'>('pnl');
  const [equityHistory, setEquityHistory] = useState<EquityPoint[]>([]);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const data = await response.json();
        
        setPrices(prevPrices => ({
          ...prevPrices,
          ETH: data.ethereum.usd
        }));
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
    // Fetch prices every minute
    const interval = setInterval(fetchPrices, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculateTotalEquity = () => {
      const total = Object.entries(balances.total).reduce((sum, [asset, amount]) => {
        return sum + (amount * prices[asset]);
      }, 0);
      
      setTotalEquity(total);
    };

    calculateTotalEquity();
  }, [prices, balances]);

  useEffect(() => {
    if (totalEquity <= 0) return;

    setEquityHistory(prev => {
      const now = Date.now();
      const filtered = prev.filter(point => 
        now - point.timestamp > 1000
      );
      
      return [...filtered, { 
        timestamp: now, 
        value: totalEquity 
      }].sort((a, b) => a.timestamp - b.timestamp);
    });
  }, [totalEquity]);

  const calculateVolume = () => {
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const recentOrders = orderHistory.filter(order => 
      new Date(order.completedAt).getTime() >= fourteenDaysAgo && 
      order.status === 'filled'
    );
    
    const volume = recentOrders.reduce((sum, order) => {
      // Calculate the USD value of the filled order
      const orderValue = order.price * order.filled;
      return sum + orderValue;
    }, 0);

    // Return volume in thousands (K)
    return volume / 1000;
  };

  // Calculate PnL
  const calculatePnL = () => {
    // Track positions for each asset
    const positions: { [key: string]: { quantity: number; totalCost: number } } = {};
    let totalPnL = 0;

    const sortedTrades = [...userTrades].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sortedTrades.forEach(trade => {
      const asset = trade.symbol;
      
      if (!positions[asset]) {
        positions[asset] = { quantity: 0, totalCost: 0 };
      }

      if (trade.type === 'buy') {
        // Add to position
        const cost = trade.quantity * trade.price;
        positions[asset].quantity += trade.quantity;
        positions[asset].totalCost += cost;
      } else {
        const avgCost = positions[asset].quantity > 0 
          ? positions[asset].totalCost / positions[asset].quantity 
          : 0;
        
        const saleValue = trade.quantity * trade.price;
        const costBasis = trade.quantity * avgCost;
        
        if (positions[asset].quantity > 0) {
          totalPnL += saleValue - costBasis;
        }

        positions[asset].quantity -= trade.quantity;
        if (positions[asset].quantity > 0) {
          positions[asset].totalCost = positions[asset].quantity * avgCost;
        } else {
          // Reset position if fully sold
          positions[asset].quantity = 0;
          positions[asset].totalCost = 0;
        }
      }
    });

    return totalPnL;
  };

  // Calculate fees
  const calculateFees = () => {
    const takerFee = 0.0336; // 0.0336%
    const makerFee = 0.0096; // 0.0096%
    
    return {
      takerFee,
      makerFee
    };
  };

  // Calculate account equity components
  const calculateEquity = () => {
    const perpsEquity = userTrades.reduce((total, trade) => {
      const tradeValue = trade.quantity * (trade.price || 0);
      return total + tradeValue;
    }, 0);

    return {
      totalEquity: totalEquity, // Use the calculated total equity
      perpsEquity,
      spotEquity: totalEquity, // Update spot equity to use real calculation
      vaultEquity: 0
    };
  };

  // Update the drawdown calculations
  const calculateMaxDrawdown = () => {
    if (equityHistory.length < 2) return 0;

    let maxDrawdown = 0;
    let capitalInvested = 0;

    // Calculate capital invested from buy trades
    const sortedTrades = [...userTrades]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sortedTrades.forEach(trade => {
      if (trade.type === 'buy') {
        capitalInvested += trade.quantity * trade.price;
      }
    });

    if (capitalInvested <= 0) return 0;

    // Calculate max loss from peak
    let peak = totalEquity;
    const currentLoss = peak - totalEquity;
    const drawdownPercentage = (currentLoss / capitalInvested) * 100;

    return Math.max(0, Math.min(100, drawdownPercentage)); // Cap between 0-100%
  };

  const calculateCurrentDrawdown = () => {
    if (equityHistory.length < 2) return 0;

    let capitalInvested = 0;

    // Calculate capital invested from buy trades
    const sortedTrades = [...userTrades]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sortedTrades.forEach(trade => {
      if (trade.type === 'buy') {
        capitalInvested += trade.quantity * trade.price;
      }
    });

    if (capitalInvested <= 0) return 0;

    // Calculate current loss
    const currentLoss = Math.max(0, capitalInvested - totalEquity);
    const drawdownPercentage = (currentLoss / capitalInvested) * 100;

    return Math.max(0, Math.min(100, drawdownPercentage)); // Cap between 0-100%
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (chartType === 'pnl') {
      // Track positions over time
      const positions: { [key: string]: { quantity: number; totalCost: number } } = {};
      let runningPnL = 0;
      
      const data = userTrades
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(trade => {
          const asset = trade.symbol;
          
          if (!positions[asset]) {
            positions[asset] = { quantity: 0, totalCost: 0 };
          }

          if (trade.type === 'buy') {
            const cost = trade.quantity * trade.price;
            positions[asset].quantity += trade.quantity;
            positions[asset].totalCost += cost;
          } else {
            // Calculate PnL for sells
            if (positions[asset].quantity > 0) {
              const avgCost = positions[asset].totalCost / positions[asset].quantity;
              const saleValue = trade.quantity * trade.price;
              const costBasis = trade.quantity * avgCost;
              runningPnL += saleValue - costBasis;
            }

            positions[asset].quantity -= trade.quantity;
            if (positions[asset].quantity > 0) {
              const avgCost = positions[asset].totalCost / (positions[asset].quantity + trade.quantity);
              positions[asset].totalCost = positions[asset].quantity * avgCost;
            } else {
              positions[asset].quantity = 0;
              positions[asset].totalCost = 0;
            }
          }

          return {
            x: new Date(trade.timestamp).toLocaleString(),
            y: runningPnL
          };
        });

      return {
        labels: data.map(point => point.x),
        datasets: [
          {
            label: 'PNL',
            data: data.map(point => point.y),
            fill: true,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          }
        ]
      };
    } else {
      // Account value over time (existing logic)
      const data = userTrades.map(trade => ({
        x: new Date(trade.timestamp).toLocaleString(),
        y: calculateEquity().totalEquity
      }));

      return {
        labels: data.map(point => point.x),
        datasets: [
          {
            label: 'Account Value',
            data: data.map(point => point.y),
            fill: true,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          }
        ]
      };
    }
  };

  // const chartOptions = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: {
  //       display: false
  //     }
  //   },
  //   scales: {
  //     x: {
  //       display: false
  //     },
  //     y: {
  //       grid: {
  //         color: 'rgba(255, 255, 255, 0.1)'
  //       },
  //       border: {
  //         display: false
  //       }
  //     }
  //   }
  // };

  const { takerFee, makerFee } = calculateFees();

  return (
    <div className="h-full flex items-start justify-center p-4 bg-black overflow-auto">
      <div className="w-[1200px] bg-[#111]/80 rounded-2xl overflow-hidden border border-[#27272A]">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Top section with fixed height - reduced padding */}
          <div className="p-6 flex-none">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-light text-white">Portfolio</h1>
              <div className="flex items-center space-x-2 text-gray-400">
                <span className="text-sm">Last updated: {new Date().toLocaleTimeString()}</span>

              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#111] rounded-xl p-4 border border-[#27272A]">
                <div className="text-sm text-gray-400">14 Day Volume</div>
                <div className="text-2xl text-white mt-1 font-light">
                  ${calculateVolume().toLocaleString(undefined, { maximumFractionDigits: 2 })}K
                </div>
                <div className="text-[#22c55e] text-xs mt-1">+12.5% from last month</div>
              </div>
              <div className="bg-[#111] rounded-xl p-4 border border-[#27272A]">
                <div className="text-sm text-gray-400">Total Equity</div>
                <div className="text-2xl text-white mt-1 font-light">
                  ${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <button 
                    className="flex-1 px-2 py-1 text-xs bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-medium rounded transition-colors"
                    onClick={() => setIsDepositModalOpen(true)}
                  >
                    Deposit
                  </button>
                  <button 
                    className="flex-1 px-2 py-1 text-xs border border-[#27272A] hover:bg-white/5 text-white font-medium rounded transition-colors"
                    onClick={() => setIsWithdrawModalOpen(true)}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
              <div className="bg-[#111] rounded-xl p-4 border border-[#27272A]">
                <div className="text-sm text-gray-400">Drawdown</div>
                <div className="text-2xl text-white mt-1 font-light">
                  {calculateCurrentDrawdown().toFixed(2)}%
                </div>
                <div className="flex items-center space-x-1 text-xs mt-1">
                  <span className="text-gray-400">Max:</span>
                  <span className="text-red-400">{calculateMaxDrawdown().toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111] rounded-xl p-6 border border-[#27272A] shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="text-[#22c55e] font-medium text-base">
                    {chartType === 'pnl' ? 'PNL' : 'Account Value'}
                  </div>
                  <div className="text-xl text-white font-light">
                    ${(chartType === 'pnl' ? calculatePnL() : totalEquity).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[#22c55e] text-xs">+2.5% today</div>
                </div>
                <div className="flex items-center space-x-3">
                  <CustomDropdown
                    options={[
                      { value: 'pnl', label: 'PNL' },
                      { value: 'account', label: 'Account Value' }
                    ]}
                    value={chartType}
                    onChange={(value) => setChartType(value as 'pnl' | 'account')}
                    className="w-36"
                  />
                  <CustomDropdown
                    options={[
                      { value: 'all', label: 'All-time' },
                      { value: '1y', label: '1 Year' },
                      { value: '6m', label: '6 Months' },
                      { value: '1m', label: '1 Month' },
                      { value: '1w', label: '1 Week' }
                    ]}
                    value="all"
                    onChange={() => {}}
                    className="w-32"
                  />
                </div>
              </div>

              <div className="h-[250px]">
                <Line data={prepareChartData()} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col bg-[#111]/50">
            <div className="flex border-b border-[#27272A] px-6 flex-none">
              <button
                className={`py-2 px-4 text-sm font-medium transition-colors outline-none border-b-2 ${
                  activeTab === 'balances'
                    ? 'border-fuel-green text-fuel-green'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('balances')}
              >
                Balances
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium transition-colors outline-none border-b-2 ${
                  activeTab === 'orders'
                    ? 'border-fuel-green text-fuel-green'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                Open Orders {activeOrders.length > 0 && `(${activeOrders.length})`}
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium transition-colors outline-none border-b-2 ${
                  activeTab === 'history'
                    ? 'border-fuel-green text-fuel-green'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('history')}
              >
                History {orderHistory.length > 0 && `(${orderHistory.length})`}
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {activeTab === 'balances' && (
                <div className="bg-[#111] rounded-xl p-4 border border-[#27272A] shadow-lg">
                  <h2 className="text-base font-medium mb-4 text-white">Asset Balances</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="text-xs text-gray-400 border-b border-fuel-dark-600">
                          <th className="pb-3 text-left w-32">Asset</th>
                          <th className="pb-3 text-right">Available</th>
                          <th className="pb-3 text-right">In Orders</th>
                          <th className="pb-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-fuel-dark-600">
                        {Object.entries(balances.available).map(([asset, balance]) => (
                          <tr key={asset} className="text-sm">
                            <td className="py-4 w-32 font-medium text-white">{asset}</td>
                            <td className="py-4 text-right text-white">{balance.toFixed(3)}</td>
                            <td className="py-4 text-right text-gray-400">
                              {balances.inOrders[asset as keyof typeof balances.inOrders].toFixed(3)}
                            </td>
                            <td className="py-4 text-right text-white">
                              {balances.total[asset as keyof typeof balances.total].toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="bg-[#111] rounded-xl p-4 border border-[#27272A] shadow-lg">
                  {activeOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="text-xs text-gray-400 border-b border-fuel-dark-600">
                            <th className="pb-3 text-left w-32">Date</th>
                            <th className="pb-3 text-left">Pair</th>
                            <th className="pb-3 text-left">Type</th>
                            <th className="pb-3 text-left">Amount</th>
                            <th className="pb-3 text-left">Price</th>
                            <th className="pb-3 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-fuel-dark-600">
                          {activeOrders.map(order => (
                            <tr key={order.id} className="text-sm hover:bg-fuel-dark-700/50">
                              <td className="py-4 text-gray-400">
                                {new Date(order.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="py-4 text-white">{order.symbol}</td>
                              <td className={`py-4 ${order.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                                {order.type.toUpperCase()}
                              </td>
                              <td className="py-4 text-white">
                                {order.size.toFixed(3)}
                                {order.status === 'partial' && (
                                  <span className="text-gray-400"> ({order.filled?.toFixed(3)} filled)</span>
                                )}
                              </td>
                              <td className="py-4 text-white">{order.price.toFixed(3)}</td>
                              <td className="py-4">
                                <button
                                  className="px-2 py-1 text-xs bg-fuel-dark-600 text-gray-300 hover:text-white hover:bg-fuel-dark-500 rounded transition-colors"
                                  onClick={() => onCancelOrder(order.id)}
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                      <p className="text-sm">No active orders</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="bg-[#111] rounded-xl p-4 border border-[#27272A] shadow-lg">
                  {orderHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="text-xs text-gray-400 border-b border-fuel-dark-600">
                            <th className="pb-3 text-left w-32">Date</th>
                            <th className="pb-3 text-left">Pair</th>
                            <th className="pb-3 text-left">Type</th>
                            <th className="pb-3 text-left">Amount</th>
                            <th className="pb-3 text-left">Price</th>
                            <th className="pb-3 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-fuel-dark-600">
                          {orderHistory.map(order => (
                            <tr key={order.id} className="text-sm hover:bg-fuel-dark-700/50">
                              <td className="py-4 text-gray-400">
                                {new Date(order.completedAt).toLocaleTimeString()}
                              </td>
                              <td className="py-4 text-white">{order.type}</td>
                              <td className={`py-4 ${order.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                                {order.type.toUpperCase()}
                              </td>
                              <td className="py-4 text-white">{order.filled.toFixed(3)}</td>
                              <td className="py-4 text-white">{order.price.toFixed(3)}</td>
                              <td className="py-4">
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    order.status === 'filled'
                                      ? 'bg-green-400/10 text-green-400'
                                      : 'bg-gray-400/10 text-gray-400'
                                  }`}
                                >
                                  {order.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                      <p className="text-sm">No order history</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isDepositModalOpen && (
        <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
      )}
      {isWithdrawModalOpen && (
        <WithdrawModal onClose={() => setIsWithdrawModalOpen(false)} />
      )}
    </div>
  );
};

export default Portfolio; 