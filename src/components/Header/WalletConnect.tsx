import { useEffect, useState } from "react";
import { useConnectUI, useDisconnect, useWallet } from "@fuels/react";
import { toast } from "react-hot-toast";
import LogoutIcon from "../../assets/logout.svg";

function WalletConnect() {
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
        <div className="flex items-center space-x-2">
          <span
            className="
              text-[#181A22]
              text-base sm:text-lg
              font-medium
              cursor-pointer select-all
              leading-tight
            "
            onClick={handleCopyAddress}
            title="Copy address"
          >
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </span>
          <button
            onClick={() => disconnect()}
            className="
              ml-1 p-1 rounded-full transition-colors
              flex items-center justify-center
              hover:bg-[#f3eaea]
            "
            title="Disconnect wallet"
          >
            <img
              src={LogoutIcon}
              alt="Logout"
              className="w-5 h-5 sm:w-6 sm:h-6"
              style={{ color: "#E9A6A6" }}
            />
          </button>
        </div>
      )}
    </>
  );
}

export default WalletConnect;
