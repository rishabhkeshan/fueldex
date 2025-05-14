import React from 'react';

interface SwapInputRowProps {
  tokenLabel?: string;
  tokenIcon?: string;
  onTokenClick: () => void;
  amount: string;
  onAmountChange: (v: string) => void;
  placeholder?: string;
}

const SwapInputRow: React.FC<SwapInputRowProps> = ({
  tokenLabel,
  tokenIcon,
  onTokenClick,
  amount,
  onAmountChange,
  placeholder,
}) => (
  <div
    className="flex items-center bg-white rounded-lg px-2 py-2 sm:px-3 sm:py-3 w-full border-2 border-transparent"
    style={{ minHeight: 44 }}
  >
    {/* Token select button */}
    <button
      type="button"
      onClick={onTokenClick}
      className="flex items-center text-[#181A22] text-base sm:text-lg font-medium focus:outline-none truncate"
    >
      {tokenLabel ? (
        <>
          {tokenIcon && <img src={tokenIcon} alt={tokenLabel} className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />}
          <span>{tokenLabel}</span>
        </>
      ) : (
        <span className="text-[#A1A1AA] font-normal">{placeholder || 'Choose coin'}</span>
      )}
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="ml-2">
        <path d="M7 10l5 5 5-5" stroke="#181A22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    {/* Divider */}
    <div className="mx-2 h-6 border-l border-[#181A22]/30" />
    {/* Editable Amount */}
    <input
      type="text"
      inputMode="decimal"
      pattern="^[0-9]*[.,]?[0-9]*$"
      value={amount}
      onChange={e => onAmountChange(e.target.value)}
      placeholder="0,00"
      className="ml-auto text-[#181A22] text-base sm:text-xl font-medium tabular-nums text-right bg-transparent border-none outline-none w-full placeholder-[#A1A1AA]"
    />
  </div>
);

export default SwapInputRow; 