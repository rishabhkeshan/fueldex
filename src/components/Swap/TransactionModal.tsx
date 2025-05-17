import React from 'react';

interface TransactionModalProps {
  open: boolean;
  status: 'pending' | 'success';
  onClose: () => void;
  fromAmount: string;
  fromSymbol: string;
  toSymbol: string;
  txHash?: string;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  open, status, onClose, fromAmount, fromSymbol, toSymbol, txHash
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative bg-[#F5F6E7] rounded-2xl shadow-xl w-full max-w-md mx-4 p-8 flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-2xl text-[#181A22] hover:opacity-70"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {status === "pending" ? (
          <>
            <div className="mb-4 text-center text-lg">
              Swapping {fromAmount} {fromSymbol} to {toSymbol}
            </div>
            <div className="my-6">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
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
            </div>
            <div className="text-2xl font-bold text-[#181A22] mb-2">
              waiting for confirmation
            </div>
            <div className="text-[#A1A1AA] text-base">
              Confirm this transaction in your wallet
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 text-center text-lg">
              {fromAmount} {fromSymbol} to {toSymbol}
            </div>
            <div className="my-6">
              <svg width={64} height={64} viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#181A22"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M8 12l3 3 5-5"
                  stroke="#181A22"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[#181A22] mb-2">
              swap success
            </div>
            {txHash && (
              <a
                href={`https://app-testnet.fuel.network/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[#A1A1AA] text-base"
              >
                View on explorer
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionModal; 