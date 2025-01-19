import React, { useState } from 'react';
import { X, ChevronDown, Info } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickToken {
  symbol: string;
  icon: string;
  color: string;
}

function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState('ETHEREUM');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const [isTokenOpen, setIsTokenOpen] = useState(false);

  if (!isOpen) return null;

  const networks = [
    { id: 'ethereum', name: 'ETHEREUM', icon: 'Ξ', color: 'bg-blue-500' },
    { id: 'arbitrum', name: 'ARBITRUM', icon: 'A', color: 'bg-blue-600' },
    { id: 'base', name: 'BASE', icon: 'B', color: 'bg-blue-700' },
    { id: 'optimism', name: 'OPTIMISM', icon: 'O', color: 'bg-red-500' },
  ];

  const tokens = [
    { symbol: 'USDC', icon: '$', color: 'bg-blue-400' },
    { symbol: 'USDT', icon: '$', color: 'bg-green-400' },
    { symbol: 'ETH', icon: 'Ξ', color: 'bg-blue-500' },
    { symbol: 'wstETH', icon: 'w', color: 'bg-blue-600' },
    { symbol: 'weETH', icon: 'w', color: 'bg-blue-700' },
    { symbol: 'WBTC', icon: '₿', color: 'bg-orange-500' },
    { symbol: 'LBTC', icon: 'L', color: 'bg-yellow-500' },
  ];

  const quickTokensData: QuickToken[] = [
    { symbol: 'USDC', icon: '$', color: 'bg-blue-400' },
    { symbol: 'USDT', icon: '$', color: 'bg-green-400' },
    { symbol: 'ETH', icon: 'Ξ', color: 'bg-blue-500' },
    { symbol: 'wstETH', icon: 'w', color: 'bg-blue-600' },
    { symbol: 'weETH', icon: 'w', color: 'bg-blue-700' },
    { symbol: 'WBTC', icon: '₿', color: 'bg-orange-500' },
    // { symbol: 'LBTC', icon: 'L', color: 'bg-yellow-500' },
    // { symbol: 'cbBTC', icon: 'c', color: 'bg-purple-500' },
    // { symbol: 'sDAI', icon: 'D', color: 'bg-yellow-600' },
    // { symbol: 'sUSDe', icon: '$', color: 'bg-blue-300' },
    // { symbol: 'SolvBTC', icon: 'S', color: 'bg-indigo-500' },
    // { symbol: 'SolvBTCBBN', icon: 'S', color: 'bg-indigo-600' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-fuel-dark-800 w-full max-w-lg rounded-2xl shadow-2xl mx-4 border border-fuel-dark-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-fuel-dark-600">
          <h2 className="text-xl font-semibold">Deposit</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-fuel-dark-700 rounded-full transition-colors text-gray-400 hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Network Selection */}
          <div className="space-y-3">
            <label className="text-sm text-gray-400 flex items-center space-x-2">
              <span>Network</span>
              <Info className="w-4 h-4 text-gray-500" />
            </label>
            <div className="relative">
              <button 
                className="w-full bg-fuel-dark-700 p-4 rounded-xl flex items-center justify-between hover:bg-fuel-dark-600 transition-colors"
                onClick={() => setIsNetworkOpen(!isNetworkOpen)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${networks.find(n => n.name === selectedNetwork)?.color} flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">{networks.find(n => n.name === selectedNetwork)?.icon}</span>
                  </div>
                  <span className="font-medium">{selectedNetwork}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isNetworkOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isNetworkOpen && (
                <div className="absolute w-full mt-2 bg-fuel-dark-700 rounded-xl border border-fuel-dark-600 shadow-xl z-10 py-2">
                  {networks.map((network) => (
                    <button
                      key={network.id}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-fuel-dark-600 transition-colors"
                      onClick={() => {
                        setSelectedNetwork(network.name);
                        setIsNetworkOpen(false);
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full ${network.color} flex items-center justify-center`}>
                        <span className="text-white text-sm font-medium">{network.icon}</span>
                      </div>
                      <span className="font-medium">{network.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Token Selection */}
          <div className="space-y-3">
            <label className="text-sm text-gray-400 flex items-center space-x-2">
              <span>Token</span>
              <Info className="w-4 h-4 text-gray-500" />
            </label>
            <div className="relative">
              <button 
                className="w-full bg-fuel-dark-700 p-4 rounded-xl flex items-center justify-between hover:bg-fuel-dark-600 transition-colors"
                onClick={() => setIsTokenOpen(!isTokenOpen)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${tokens.find(t => t.symbol === selectedToken)?.color} flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">{tokens.find(t => t.symbol === selectedToken)?.icon}</span>
                  </div>
                  <span className="font-medium">{selectedToken}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isTokenOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTokenOpen && (
                <div className="absolute w-full mt-2 bg-fuel-dark-700 rounded-xl border border-fuel-dark-600 shadow-xl z-10 p-2">
                  <div className="grid grid-cols-2 gap-2">
                    {tokens.map((token) => (
                      <button
                        key={token.symbol}
                        className="p-3 flex items-center space-x-3 hover:bg-fuel-dark-600 rounded-lg transition-colors"
                        onClick={() => {
                          setSelectedToken(token.symbol);
                          setIsTokenOpen(false);
                        }}
                      >
                        <div className={`w-8 h-8 rounded-full ${token.color} flex items-center justify-center`}>
                          <span className="text-white text-sm font-medium">{token.icon}</span>
                        </div>
                        <span className="font-medium">{token.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Token Selection */}
            <div className="flex flex-wrap gap-2">
              {quickTokensData.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token.symbol)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedToken === token.symbol 
                      ? 'bg-fuel-dark-600 text-fuel-green' 
                      : 'bg-fuel-dark-700 text-gray-400 hover:bg-fuel-dark-600 hover:text-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full ${token.color} flex items-center justify-center`}>
                    <span className="text-white text-xs">{token.icon}</span>
                  </div>
                  <span>{token.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400 flex items-center space-x-2">
                <span>Amount</span>
                <Info className="w-4 h-4 text-gray-500" />
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Available: 0 {selectedToken}</span>
                <button className="text-xs text-fuel-green font-medium hover:text-opacity-80">MAX</button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-fuel-dark-700 p-4 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-fuel-green/20 transition-all"
                placeholder={`0 ${selectedToken}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Network Fee & APY */}
          <div className="space-y-2 bg-fuel-dark-700 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Network Fee</span>
                <Info className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-sm font-medium">...</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">APY</span>
                <Info className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-green-400">+3.17%</span>
            </div>
          </div>

          {/* Connect Button */}
          <button className="w-full py-4 relative group">
            {/* Gradient background with animated hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#00FFD1] to-[#00D1FF] rounded-xl opacity-100 group-hover:opacity-90 transition-opacity" />
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#00FFD1] to-[#00D1FF] rounded-xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity" />
            
            {/* Button content */}
            <div className="relative flex items-center justify-center space-x-2">
              <span className="text-fuel-dark-900 font-semibold tracking-wide">
                Connect Ethereum Wallet
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DepositModal; 