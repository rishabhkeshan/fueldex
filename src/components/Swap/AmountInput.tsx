import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const AmountInput: React.FC<AmountInputProps> = ({ value, onChange, placeholder, disabled }) => (
  <input
    type="text"
    inputMode="decimal"
    pattern="^[0-9]*[.,]?[0-9]*$"
    className="w-full bg-white border border-[#E5E5E5] rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#181A22] text-right"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder || '0.00'}
    disabled={disabled}
  />
);

export default AmountInput; 