import FuelLogo from "./assets/Sway.svg";

import SwapComponent from './components/SwapComponent';
import WalletConnect from './components/WalletConnect';


function App() {
  return (
    <div className="h-screen flex flex-col bg-dex-sand text-dex-dark">
      {/* Header - Always visible */}
      <header className="bg-dex-sand py-4">
        <div className="flex flex-row items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <img
              src={FuelLogo}
              alt="FUEL Logo"
              className="w-7 h-7"
            />
            <span className="text-2xl font-bold text-dex-dark">SwaySwap</span>
          </div>
          <WalletConnect variant="header" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0">
        <SwapComponent />
      </main>
      {/* <div className="fixed bottom-0 left-0 right-0 h-6 bg-fuel-dark-800 border-t border-fuel-dark-600 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? "bg-fuel-green" : "bg-red-500"
              }`}
            />
            <span className="text-gray-400">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-400">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.fuel.network"
            className="hover:text-gray-300"
          >
            Docs
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.fuel.network"
            className="hover:text-gray-300"
          >
            Terms
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.fuel.network"
            className="hover:text-gray-300"
          >
            Privacy Policy
          </a>
        </div>
      </div> */}
    </div>
  );
}

export default App;