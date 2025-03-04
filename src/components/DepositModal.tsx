import React, { useState } from 'react';
import { X, ChevronDown, Info, LogOut } from 'lucide-react';
import arbitrumLogo from '../assets/arbitrum.svg';
import baseLogo from '../assets/base.svg';
import optimismLogo from '../assets/optimism.svg';
import ethLogo from '../assets/eth.svg';
import usdcLogo from '../assets/usdc.svg';
import usdtLogo from '../assets/usdt.svg';
import wstethLogo from '../assets/wsteth.svg';
import weethLogo from '../assets/weETH.webp';
import solvbtcLogo from '../assets/solvBTC.webp';
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
    { id: 'ethereum', name: 'ETHEREUM', icon: ethLogo, color: 'bg-blue-500' },
    { id: 'arbitrum', name: 'ARBITRUM', icon: arbitrumLogo, color: 'bg-blue-600' },
    { id: 'base', name: 'BASE', icon: baseLogo, color: 'bg-blue-700' },
    { id: 'optimism', name: 'OPTIMISM', icon: optimismLogo, color: 'bg-red-500' },
  ];

  const tokens = [
    { symbol: 'USDC', icon: usdcLogo, color: 'bg-blue-400' },
    { symbol: 'USDT', icon: usdtLogo, color: 'bg-green-400' },
    { symbol: 'ETH', icon: ethLogo, color: 'bg-blue-500' },
    { symbol: 'wstETH', icon: wstethLogo, color: 'bg-blue-600' },
    { symbol: 'weETH', icon: weethLogo, color: 'bg-blue-700' },
    { symbol: 'solvBTC', icon: solvbtcLogo, color: 'bg-orange-500' },
    // { symbol: 'LBTC', icon: 'L', color: 'bg-yellow-500' },
  ];

  const quickTokensData: QuickToken[] = [
    { symbol: 'USDC', icon: usdcLogo, color: 'bg-blue-400' },
    { symbol: 'USDT', icon: usdtLogo, color: 'bg-green-400' },
    { symbol: 'ETH', icon: ethLogo, color: 'bg-blue-500' },
    { symbol: 'wstETH', icon: wstethLogo, color: 'bg-blue-600' },
    { symbol: 'weETH', icon: weethLogo, color: 'bg-blue-700' },
    { symbol: 'solvBTC', icon: solvbtcLogo, color: 'bg-orange-500' },
    // { symbol: 'LBTC', icon: 'L', color: 'bg-yellow-500' },
    // { symbol: 'cbBTC', icon: 'c', color: 'bg-purple-500' },
    // { symbol: 'sDAI', icon: 'D', color: 'bg-yellow-600' },
    // { symbol: 'sUSDe', icon: '$', color: 'bg-blue-300' },
    // { symbol: 'SolvBTC', icon: 'S', color: 'bg-indigo-500' },
    // { symbol: 'SolvBTCBBN', icon: 'S', color: 'bg-indigo-600' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center sm:pt-20">
      <div className="bg-fuel-dark-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-[380px] sm:rounded-2xl shadow-2xl sm:mx-4 border border-fuel-dark-600 overflow-auto">
        <div className="sticky top-0 z-10 bg-fuel-dark-800 flex items-center justify-between p-2.5 sm:p-3.5 border-b border-fuel-dark-600">
          <h2 className="text-base sm:text-lg font-semibold">Deposit</h2>
          <button 
            onClick={onClose}
            className="p-1 sm:p-1.5 hover:bg-fuel-dark-700 rounded-full transition-colors text-gray-400 hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2.5 sm:p-3.5 space-y-3 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 flex items-center space-x-2">
              <span>Network</span>
              <Info className="w-3.5 h-3.5 text-gray-500" />
            </label>
            <div className="relative">
              <button 
                className="w-full bg-fuel-dark-700 p-2.5 rounded-xl flex items-center justify-between hover:bg-fuel-dark-600 transition-colors"
                onClick={() => setIsNetworkOpen(!isNetworkOpen)}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center">
                    <img 
                      src={networks.find(n => n.name === selectedNetwork)?.icon} 
                      alt={selectedNetwork}
                      className="w-5 h-5"
                    />
                  </div>
                  <span className="font-medium text-sm">{selectedNetwork}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isNetworkOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isNetworkOpen && (
                <div className="absolute w-[calc(100%-1.5rem)] sm:w-full mt-2 bg-fuel-dark-700 rounded-xl border border-fuel-dark-600 shadow-xl z-10 py-1">
                  {networks.map((network) => (
                    <button
                      key={network.id}
                      className="w-full px-2.5 py-1.5 flex items-center space-x-2.5 hover:bg-fuel-dark-600 transition-colors"
                      onClick={() => {
                        setSelectedNetwork(network.name);
                        setIsNetworkOpen(false);
                      }}
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center">
                        <img 
                          src={network.icon} 
                          alt={network.name}
                          className="w-5 h-5"
                        />
                      </div>
                      <span className="font-medium text-sm">{network.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 flex items-center space-x-2">
              <span>Token</span>
              <Info className="w-3.5 h-3.5 text-gray-500" />
            </label>
            <div className="relative">
              <button 
                className="w-full bg-fuel-dark-700 p-2.5 rounded-xl flex items-center justify-between hover:bg-fuel-dark-600 transition-colors"
                onClick={() => setIsTokenOpen(!isTokenOpen)}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center">
                    <img 
                      src={tokens.find(t => t.symbol === selectedToken)?.icon} 
                      alt={selectedToken}
                      className="w-5 h-5 rounded-full"
                    />
                  </div>
                  <span className="font-medium text-sm">{selectedToken}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isTokenOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 mt-1.5">
                {quickTokensData.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol)}
                    className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedToken === token.symbol 
                        ? 'bg-fuel-dark-600 text-fuel-green' 
                        : 'bg-fuel-dark-700 text-gray-400 hover:bg-fuel-dark-600 hover:text-gray-300'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      <img 
                        src={token.icon} 
                        alt={token.symbol}
                        className="w-3.5 h-3.5 rounded-full"
                      />
                    </div>
                    <span className="text-xs">{token.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-0">
              <label className="text-xs text-gray-400 flex items-center space-x-2">
                <span>Amount</span>
                <Info className="w-3.5 h-3.5 text-gray-500" />
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Available: 0 {selectedToken}</span>
                <button className="text-xs text-fuel-green font-medium hover:text-opacity-80">MAX</button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-fuel-dark-700 p-2.5 rounded-xl text-base outline-none focus:ring-2 focus:ring-fuel-green/20 transition-all"
                placeholder={`0 ${selectedToken}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 bg-fuel-dark-700 p-3 rounded-xl text-xs">
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

          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              if (!ready) return null;

              return (
                <button 
                  onClick={account?.address ? openAccountModal : openConnectModal}
                  className="w-full py-3 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#00FFD1] to-[#00D1FF] rounded-xl opacity-100 group-hover:opacity-90 transition-opacity" />
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3] via-[#00FFD1] to-[#00D1FF] rounded-xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity" />
                  
                  <div className="relative flex items-center justify-center space-x-2">
                    <span className="text-fuel-dark-900 font-semibold tracking-wide text-sm sm:text-base">
                      {account?.address 
                        ? `Connected to ${account.address.slice(0, 6)}...${account.address.slice(-4)}`
                        : 'Connect Wallet'
                      }
                    </span>
                    {account?.address && (
                      <LogOut 
                        className="w-4 h-4 text-fuel-dark-900 opacity-70 group-hover:opacity-100 transition-opacity" 
                      />
                    )}
                  </div>
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </div>
  );
}

export default DepositModal; 

