import React, { useEffect, useState } from "react";
import { Wallet, LogOut } from "lucide-react";
import { useConnectUI, useDisconnect, useWallet } from "@fuels/react";

interface WalletConnectProps {
  variant?: 'header' | 'trade';
  tradeType?: 'buy' | 'sell';
  tokenSymbol?: string;
}

function WalletConnect({ variant = 'header', tradeType = 'buy', tokenSymbol = 'FUEL' }: WalletConnectProps) {
  const [address, setAddress] = useState("");
  const { connect, isConnecting, isConnected } = useConnectUI();
  const { wallet } = useWallet();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (wallet) {
      setAddress(wallet.address.toB256());
    }
  }, [wallet]);

  if (variant === 'trade') {
    return (
      <button 
        onClick={() => !isConnected && connect()}
        className={`w-full py-2.5 rounded text-sm font-medium transition-colors
          ${tradeType === 'buy' 
            ? 'bg-fuel-green text-fuel-dark-900 hover:bg-opacity-90' 
            : 'bg-red-500 text-white hover:bg-opacity-90'}`}
      >
        {isConnected 
          ? `${tradeType.toUpperCase()} ${tokenSymbol}` 
          : `Connect wallet to ${tradeType.toUpperCase()}`}
      </button>
    );
  }

  return (
    <>
      {!isConnected ? (
        <button
          onClick={() => connect()}
          className="flex items-center space-x-2 bg-fuel-green text-fuel-dark-900 px-4 py-1.5 rounded text-sm font-medium hover:bg-opacity-90 transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span>{isConnecting ? "Connecting" : "Connect wallet"}</span>
        </button>
      ) : (
        <div className="flex items-center space-x-2 bg-fuel-dark-700 px-4 py-1.5 rounded">
          <div className="flex items-center space-x-2 text-sm">
            <Wallet className="w-4 h-4 text-fuel-green" />
            <span className="text-gray-100">
              {address.substring(0, 6)}...{address.substring(address.length - 4)}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="ml-2 p-1 hover:bg-fuel-dark-600 rounded-full transition-colors"
            title="Disconnect wallet"
          >
            <LogOut className="w-4 h-4 text-gray-400 hover:text-gray-300" />
          </button>
        </div>
      )}
    </>
  );
}

export default WalletConnect;
