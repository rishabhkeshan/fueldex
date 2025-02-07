import React, { useState } from 'react';
import { X } from 'lucide-react';

interface WithdrawModalProps {
  onClose: () => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose }) => {
  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  const handleWithdraw = () => {
    // Handle withdraw logic here
    console.log('Withdrawing:', {
      asset: selectedAsset,
      amount,
      to: withdrawAddress
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111] border border-[#27272A] rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light text-white">Withdraw</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Asset</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full bg-[#111] border border-[#27272A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3F3F46]"
            >
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#111] border border-[#27272A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3F3F46]"
              />
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#22c55e] hover:text-[#22c55e]/80"
                onClick={() => setAmount('0.00')} // Set to max available
              >
                MAX
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Withdraw to</label>
            <input
              type="text"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              placeholder="Enter address"
              className="w-full bg-[#111] border border-[#27272A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3F3F46]"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleWithdraw}
              disabled={!amount || !withdrawAddress}
              className="w-full bg-[#22c55e] hover:bg-[#22c55e]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium rounded-lg py-2 text-sm transition-colors"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal; 