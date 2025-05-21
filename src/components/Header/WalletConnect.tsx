import { useEffect, useState, useRef } from "react";
import { useConnectUI, useDisconnect, useWallet } from "@fuels/react";
import { toast } from "react-hot-toast";

function WalletConnect() {
  const [address, setAddress] = useState("");
  const { connect, isConnecting, isConnected } = useConnectUI();
  const { wallet } = useWallet();
  const { disconnect } = useDisconnect();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wallet) {
      setAddress(wallet.address.toB256());
    }
  }, [wallet]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard
        .writeText(address)
        .then(() => {
          toast.success("Address copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy address: ", err);
          toast.error("Failed to copy address");
        });
    }
  };

  return (
    <>
      {!isConnected ? (
        <button
          onClick={() => connect()}
          className="
            bg-[#181A22] text-white rounded-lg
            px-6 py-2
            text-base sm:text-lg font-bold
            flex items-center justify-center
            transition-colors
            min-w-[140px] sm:min-w-[162px]
            min-h-[38px] sm:min-h-[41px]
            "
        >
          {isConnecting ? "Connecting" : "Connect Wallet"}
        </button>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((open) => !open)}
            className="text-[#181A22] text-base sm:text-lg font-medium cursor-pointer leading-tight px-3 py-1 rounded-lg bg-[#FCF8F2] border border-[#181A22] flex items-center"
            title="Account options"
          >
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 min-w-full w-full bg-[#FCF8F2] border border-[#181A22] rounded-lg shadow-lg z-20">
              <button
                onClick={handleCopyAddress}
                className="block w-full text-left px-4 py-2 text-[#181A22] hover:bg-[#F5F6E7] cursor-pointer rounded-t-lg"
              >
                Copy Address
              </button>
              <a
                href={`https://app-testnet.fuel.network/account/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-[#181A22] hover:bg-[#F5F6E7] cursor-pointer"
              >
                View Account
              </a>
              <button
                onClick={() => {
                  disconnect();
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-[#E74C3C] hover:bg-[#F5F6E7] cursor-pointer rounded-b-lg"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default WalletConnect;
