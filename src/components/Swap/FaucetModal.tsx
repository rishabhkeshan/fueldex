import React from 'react';

const FaucetModal: React.FC<{ open: boolean }> = ({ open }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-[#F5F6E7] rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-sm mx-4">
        <svg
          className="animate-spin mb-4"
          width={48}
          height={48}
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M4.10156 15.0007C6.22534 8.23881 12.5425 3.33398 20.0052 3.33398C27.468 3.33398 33.7851 8.23881 35.9089 15.0007M35.9089 15.0007H36.6716V6.66732M35.9089 15.0007H28.3382"
            stroke="#0E111E"
            strokeWidth="2"
            strokeLinecap="square"
          />
          <path
            d="M35.8988 24.9993C33.775 31.7612 27.4579 36.666 19.9951 36.666C12.5324 36.666 6.21522 31.7612 4.09145 24.9993M4.09145 24.9993H3.32879V33.3327M4.09145 24.9993H11.6621"
            stroke="#0E111E"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
        <div className="text-xl font-bold text-[#181A22] mb-2">Fauceting tokens…</div>
        <div className="text-[#A1A1AA] text-base text-center">
          Please wait while we mint your test tokens. This may take a few moments…
        </div>
      </div>
    </div>
  );
};

export default FaucetModal; 