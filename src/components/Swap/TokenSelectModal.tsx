import React from 'react';
import { TokenData } from '../../utils/constants';
import SearchIcon from '../../assets/search.svg';

interface TokenSelectModalProps {
  open: boolean;
  onClose: () => void;
  tokens: TokenData[];
  onSelect: (token: TokenData) => void;
}

const TokenSelectModal: React.FC<TokenSelectModalProps> = ({ open, onClose, tokens, onSelect }) => {
  const [search, setSearch] = React.useState('');

  if (!open) return null;

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(search.toLowerCase()) ||
    token.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="relative bg-[#F5F6E7] rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-2xl text-[#181A22] hover:opacity-70"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#181A22]">Select a token</h2>
        </div>
        {/* Search */}
        <div className="flex items-center mb-4">
          <input
            className="flex-1 bg-white rounded-lg px-4 py-2 text-base border border-[#E5E5E5] focus:outline-none"
            placeholder="Search tokens"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <img src={SearchIcon} alt="Search" className="ml-2 w-8 h-8" />
        </div>
        {/* Divider and label */}
        <div className="flex items-center mb-2">
          <span className="text-xs text-[#A1A1AA]">Tokens by 24HS volume</span>
          <div className="flex-1 border-t border-[#D4D4D4] ml-2" />
        </div>
        {/* Token list */}
        <div className="space-y-2">
          {filteredTokens.map((token) => (
            <button
              key={token.symbol}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
              onClick={() => onSelect(token)}
            >
              {/* Blue dot or icon */}
              <img
                src={token.icon}
                alt={token.symbol}
                className="w-6 h-6 mr-4"
              />{" "}
              <span className="text-lg font-bold text-[#181A22] mr-1">
                {token.name.toUpperCase()}
              </span>
              <span className="text-sm text-[#A1A1AA]">{token.symbol}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TokenSelectModal; 