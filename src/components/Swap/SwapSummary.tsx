import React from 'react';

const SwapSummary: React.FC = () => {
  // Example values
  const swapFeePercent = '0.01%';
  const swapFeeValue = '$0.21';
  const networkFee = '$0.17';

  return (
    <div className="w-full">
        <div className="text-[#A1A1AA] text-xs px-1">
          <div className="flex justify-between">
            <span>Swap Fee</span>
            <span>{swapFeePercent} (≈ {swapFeeValue})</span>
          </div>
          <div className="flex justify-between">
            <span>Network Fee</span>
            <span>{networkFee}</span>
          </div>
        </div>
    </div>
  );
};

export default SwapSummary; 