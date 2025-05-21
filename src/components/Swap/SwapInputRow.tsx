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
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input
    if (!value) {
      onAmountChange('');
      return;
    }
    // Check if the number has more than 9 decimal places
    const parts = value.split('.');
    if (parts.length > 1 && parts[1].length > 9) {
      return;
    }
    // Only allow numbers and one decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
      onAmountChange(value);
    }
  };

  return (
    <div
      className="flex items-center bg-white rounded-lg px-2 py-2 sm:px-3 sm:py-3 w-full border-2 border-transparent"
      style={{ minHeight: 44 }}
    >
      {/* Token select button */}
      <button
        type="button"
        onClick={onTokenClick}
        className="flex items-center text-[#181A22] text-base sm:text-lg font-medium focus:outline-none truncate flex-shrink-0"
      >
        {tokenLabel ? (
          <>
            {tokenIcon && (
              <img
                src={tokenIcon}
                alt={tokenLabel}
                className="w-5 h-5 sm:w-6 sm:h-6 mr-2"
              />
            )}
            <span>{tokenLabel}</span>
          </>
        ) : (
          <span className="text-[#A1A1AA] font-normal">
            {placeholder || "Choose coin"}
          </span>
        )}
        {/* Divider and dropdown icon inside button */}
        <svg
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          className="ml-2"
        >
          <path
            d="M7 10l5 5 5-5"
            stroke="#181A22"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>{" "}
      </button>

      {/* Editable Amount */}
      <input
        type="text"
        inputMode="decimal"
        pattern="^[0-9]*\.?[0-9]*$"
        value={amount}
        onChange={handleAmountChange}
        placeholder="0.00"
        className="ml-auto flex-1 text-[#181A22] text-base sm:text-xl font-medium tabular-nums text-right bg-transparent border-none outline-none placeholder-[#A1A1AA]"
      />
    </div>
  );
};

export default SwapInputRow; 