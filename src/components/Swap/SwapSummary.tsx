import React from 'react';

const SwapSummary: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  // Example values
  const totalFee = '$0.66';
  const swapFeePercent = '0.01%';
  const swapFeeValue = '$0.01';
  const networkFee = '$0.002';

  return (
    <div className="w-full">
      <button
        type="button"
        className="w-full flex items-center justify-between bg-[#F7F3EE] rounded-xl px-4 py-2 text-[#A1A1AA] font-medium focus:outline-none"
        onClick={() => setOpen(o => !o)}
      >
        <span>Total Fees</span>
        <span className="flex items-center gap-1">
          ≈ {totalFee}
          <svg
            className={`transition-transform ml-1 ${open ? 'rotate-180' : ''}`}
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M7 10l5 5 5-5" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-6 py-0.5 text-[#A1A1AA] text-sm">
          <div className="flex justify-between py-1">
            <span>Swap Fee</span>
            <span>{swapFeePercent} (≈ {swapFeeValue})</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>Network Fee</span>
            <span>{networkFee}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapSummary; 