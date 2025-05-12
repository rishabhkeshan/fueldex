import { useEffect, useState } from "react";
import { Wallet, LogOut } from "lucide-react";
import { useConnectUI, useDisconnect, useWallet } from "@fuels/react";
import { toast } from "react-hot-toast";

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

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
        .then(() => {
          toast.success('Address copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy address: ', err);
          toast.error('Failed to copy address');
        });
    }
  };

  if (variant === 'trade') {
    return (
      <button 
        onClick={() => !isConnected && connect()}
        className={`w-full py-2.5 rounded text-sm font-medium transition-colors
          ${tradeType === 'buy' 
            ? 'bg-dex-blue text-dex-white hover:bg-dex-teal' 
            : 'bg-dex-orange text-dex-white hover:bg-dex-brown'}`}
      >
        {isConnected 
          ? `${tradeType.toUpperCase()} ${tokenSymbol}` 
          : `Connect`}
      </button>
    );
  }

  return (
    <>
      {!isConnected ? (
        <button
          onClick={() => connect()}
          className="bg-dex-coral text-dex-white rounded-full px-8 py-2 text-base font-medium hover:opacity-90 transition-colors"
        >
          <span className="flex items-center justify-center space-x-2 font-bold">
            <Wallet className="w-4 h-4" />
            <span>{isConnecting ? "Connecting" : "Connect Wallet"}</span>
          </span>
        </button>
      ) : (
        <div className="flex items-center space-x-2 bg-dex-coral px-4 py-1.5 rounded-full border border-dex-coral">
          <div
            onClick={handleCopyAddress}
            className="flex items-center space-x-2 text-base cursor-pointer"
            title="Copy address"
          >
            <Wallet className="w-4 h-4 text-dex-white" />
            <span className="font-bold text-dex-white">
              {address.substring(0, 6)}...{address.substring(address.length - 4)}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="ml-2 p-1 rounded-full transition-colors"
            title="Disconnect wallet"
          >
            <LogOut className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
    </>
  );
}

export default WalletConnect;
