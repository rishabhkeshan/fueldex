import React, { useState, useMemo, useCallback, useEffect } from 'react';
import FuelLogo from "./assets/Fuel.svg";

import SwapComponent from './components/SwapComponent';
import DepositModal from './components/DepositModal';
import WalletConnect from './components/WalletConnect';




function App() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);



  return (
    <div className="h-screen flex flex-col bg-fuel-dark-900 text-gray-100">
      {/* Header - Always visible */}
      <header className="border-b border-fuel-dark-600 bg-fuel-dark-800 py-2">
        <div className="flex flex-row sm:items-center justify-between px-4 space-y-2 sm:space-y-0">
          <div className="flex items-center justify-between sm:justify-start">
            <div className="flex items-center space-x-1 mr-5">
              <img
                src={FuelLogo}
                alt="FUEL Logo"
                className="w-5 h-5 sm:w-7 sm:h-7 mt-1.5"
              />
              <span className="text-base sm:text-lg font-bold">O2</span>
            </div>
            {/* <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                className={`px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm transition-colors outline-none
                  ${
                    activeScreen === "terminal"
                      ? "bg-inherit text-fuel-green"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                onClick={() => setActiveScreen("terminal")}
              >
                Trade
              </button>
              <button
                className={`px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm transition-colors outline-none
                  ${
                    activeScreen === "swap"
                      ? "bg-inherit text-fuel-green"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                onClick={() => setActiveScreen("swap")}
              >
                Swap
              </button>
              <button
                className={`px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm transition-colors outline-none
                  ${
                    activeScreen === "p2p"
                      ? "bg-inherit text-fuel-green"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                onClick={() => setActiveScreen("p2p")}
              >
                P2P
              </button>
            </div> */}
          </div>
          <WalletConnect variant="header" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0">
        <SwapComponent />
      </main>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />

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