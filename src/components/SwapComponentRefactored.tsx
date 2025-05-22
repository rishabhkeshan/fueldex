// import React, { useState, useRef, useEffect } from 'react';
// import { ArrowDownUp, Info, Loader2, Plus } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { useWallet, useIsConnected } from '@fuels/react';

// // Import new hooks and utilities
// import useTokenBalance from '../hooks/useTokenBalance';
// import useTokenSwap from '../hooks/useTokenSwap';
// import useFaucet from '../hooks/useFaucet';
// import { executeSwap } from '../utils/swap.tsx';
// import { AVAILABLE_TOKENS, TokenData } from '../utils/constants';

// function SwapComponentRefactored() {
//   const { wallet } = useWallet();
//   const { isConnected } = useIsConnected();
//   const hasInitialMintRef = useRef(false);
//   const [isFromTokenOpen, setIsFromTokenOpen] = useState(false);
//   const [isToTokenOpen, setIsToTokenOpen] = useState(false);
  
//   // Use our custom hooks - TypeScript will complain about wallet type, but it works at runtime
//   const {
//     fromToken,
//     toToken,
//     fromAmount,
//     toAmount,
//     fromTokenPrice,
//     toTokenPrice,
//     arePricesLoading,
//     priceFetchError,
//     isSwapping,
//     setFromToken,
//     setToToken,
//     setFromAmount,
//     setToAmount,
//     setIsSwapping,
//     handleSwapTokens,
//     handlePriceRefresh,
//   } = useTokenSwap();
  
//   const {
//     tokenBalances,
//     fetchTokenBalance,
//     fetchAllBalances,
//   } = useTokenBalance(wallet);
  
//   const {
//     isMinting,
//     mintSingleToken,
//     mintAllAvailableTokens,
//     transferBaseETH
//   } = useFaucet(wallet, () => fetchAllBalances(AVAILABLE_TOKENS));

//   // Fetch token balances when wallet changes
//   useEffect(() => {
//     if (wallet) {
//       fetchAllBalances(AVAILABLE_TOKENS);
//     }
//   }, [wallet, fetchAllBalances]);

//   // Update balance when fromToken changes
//   useEffect(() => {
//     if (wallet) {
//       fetchTokenBalance(fromToken);
//     }
//   }, [fromToken.symbol, wallet, fetchTokenBalance]);

//   // Mint tokens on initial wallet connection
//   useEffect(() => {
//     if (wallet && !hasInitialMintRef.current) {
//       hasInitialMintRef.current = true;
//       mintAllAvailableTokens();
//     }
//   }, [isConnected, wallet, mintAllAvailableTokens]);

//   // Reset initial mint flag when wallet disconnects
//   useEffect(() => {
//     if (!isConnected) {
//       hasInitialMintRef.current = false;
//     }
//   }, [isConnected]);

//   // Monitor and maintain base ETH for gas
//   useEffect(() => {
//     if (!wallet) return;

//     let timeoutId: number;

//     const checkBalanceAndTransfer = async () => {
//       await transferBaseETH();
//       // Schedule next check
//       timeoutId = window.setTimeout(checkBalanceAndTransfer, 30000);
//     };

//     // Initial check
//     checkBalanceAndTransfer();

//     return () => {
//       if (timeoutId) {
//         clearTimeout(timeoutId);
//       }
//     };
//   }, [transferBaseETH, wallet]);

//   // Update document title with price info
//   useEffect(() => {
//     const updateTitle = () => {
//       let title = "SwaySwap"; // Default title

//       if (fromToken && toToken) {
//         const pair = `${fromToken.symbol}/${toToken.symbol}`;
//         if (arePricesLoading) {
//           title = `SwaySwap | ${pair}`;
//         } else if (fromTokenPrice && toTokenPrice && toTokenPrice > 0) {
//           const relativePrice = (fromTokenPrice / toTokenPrice).toLocaleString("en-US", {
//             minimumFractionDigits: 3,
//             maximumFractionDigits: 3,
//           });
//           title = `SwaySwap | ${relativePrice} | ${pair}`;
//         } else {
//            title = `SwaySwap`; // Price not available state
//         }
//       }
      
//       document.title = title;
//     };

//     updateTitle();
//   }, [fromToken, toToken, fromTokenPrice, toTokenPrice, arePricesLoading]);

//   // Handle swap button click
//   const handleSwap = async () => {
//     if (!wallet || !fromAmount) {
//       toast.error('Please connect wallet and enter amount');
//       return;
//     }

//     setIsSwapping(true);
    
//     try {
//       const tx = await executeSwap({
//         wallet,
//         fromToken,
//         toToken,
//         fromAmount
//       });

//       if (tx) {
//         tx.waitForResult().then(async () => {
//           await fetchAllBalances(AVAILABLE_TOKENS);
//         });
//       }
//     } finally {
//       setIsSwapping(false);
//     }
//   };

//   const fromTokenTriggerRef = useRef<HTMLButtonElement>(null);
//   const toTokenTriggerRef = useRef<HTMLButtonElement>(null);

//   function TokenDropdown({ 
//     isOpen, 
//     onClose, 
//     onSelect, 
//     selectedToken,
//     excludeToken,
//     triggerRef
//   }: { 
//     isOpen: boolean; 
//     onClose: () => void; 
//     onSelect: (token: TokenData) => void;
//     selectedToken: TokenData;
//     excludeToken?: string; 
//     triggerRef: React.RefObject<HTMLButtonElement>;
//   }) {
//     const dropdownRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//       if (!isOpen) return;

//       const handleClickOutside = (event: MouseEvent) => {
//         if (
//           dropdownRef.current &&
//           !dropdownRef.current.contains(event.target as Node) &&
//           triggerRef.current &&
//           !triggerRef.current.contains(event.target as Node)
//         ) {
//           onClose();
//         }
//       };

//       document.addEventListener('mousedown', handleClickOutside);
//       return () => {
//         document.removeEventListener('mousedown', handleClickOutside);
//       };
//     }, [isOpen, onClose, triggerRef]);

//     if (!isOpen) return null;

//     const availableTokens = AVAILABLE_TOKENS.filter(
//       (token) => token.symbol !== excludeToken
//     );

//     return (
//       <div
//         ref={dropdownRef}
//         className="absolute top-full left-0 mt-2 w-[240px] bg-dex-sand rounded-xl shadow-lg border border-dex-aqua z-50"
//       >
//         <div className="p-3">
//           <div className="text-sm text-dex-dark mb-2">Select Token</div>
//           <div className="space-y-1">
//             {availableTokens.map((token) => (
//               <button
//                 key={token.symbol}
//                 className={`w-full flex items-center space-x-3 p-2.5 rounded-lg transition-colors
//                   hover:bg-dex-aqua/30
//                   ${selectedToken.symbol === token.symbol ? 'bg-dex-aqua/50' : ''}`}
//                 onClick={() => {
//                   onSelect(token);
//                   onClose();
//                 }}
//               >
//                 <div className="flex items-center justify-center">
//                   <img src={token.icon} alt={token.symbol} className="w-5 h-5 sm:w-6 sm:h-6" />
//                 </div>
//                 <div className="flex flex-col items-start flex-1 min-w-0">
//                   <span className="text-sm font-medium text-dex-dark">{token.symbol}</span>
//                   <span className="text-xs text-dex-dark whitespace-nowrap">
//                     Balance: <span className="inline-block max-w-[100px] overflow-hidden text-ellipsis align-bottom">{tokenBalances[token.symbol] || "0.000000"}</span>
//                   </span>
//                 </div>
//                 {selectedToken.symbol === token.symbol && (
//                   <div className="w-2 h-2 rounded-full bg-dex-coral"></div>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full py-1 sm:py-16 overflow-y-auto relative">
//       {isMinting && (
//         <div className="fixed inset-0 bg-dex-sand/80 backdrop-blur-sm z-50 flex items-center justify-center">
//           <div className="bg-dex-sand rounded-xl p-6 max-w-sm mx-4 text-center">
//             <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-dex-coral" />
//             <h3 className="text-lg font-medium mb-2">
//               Initializing Your Wallet
//             </h3>
//             <p className="text-sm text-dex-dark">
//               Please wait while we mint your test tokens. This may take a few
//               moments...
//             </p>
//           </div>
//         </div>
//       )}

//       <div className="w-full max-w-[420px] mx-auto px-2 mb-8 mt-4 sm:mt-0">
//         <div className="mb-4">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-dex-dark">
//               Mint assets for testing
//             </span>
//             <span className="text-xs text-dex-dark">Testnet only</span>
//           </div>
//           <div className="grid grid-cols-4 gap-1 sm:gap-2">
//             {AVAILABLE_TOKENS.map((token) => (
//               <button
//                 key={token.symbol}
//                 className="flex items-center justify-center space-x-0.5 sm:space-x-1 bg-dex-lightSand hover:bg-dex-aqua/30 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg transition-colors group"
//                 onClick={() => mintSingleToken(token)}
//               >
//                 <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-dex-coral group-hover:rotate-180 transition-transform duration-200" />
//                 <span className="text-xs sm:text-sm">{token.symbol}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="bg-dex-aqua rounded-xl p-3 sm:p-4 shadow-lg border border-dex-aqua">
//             <>
//               <div className="space-y-2 mb-3">
//                 <div className="flex justify-between text-xs">
//                   <span className="text-dex-dark font-medium">From</span>
//                   <span className="text-dex-dark">
//                     Balance:{" "}
//                     <span className="text-dex-dark inline-block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap align-bottom"> 
//                       {tokenBalances[fromToken.symbol] || "0.000000"}
//                     </span>{" "}
//                     {fromToken.symbol}
//                   </span>
//                 </div>
//                 <div className="flex items-center space-x-2 bg-dex-sand p-2 rounded-xl">
//                   <div className="relative">
//                     <button
//                       ref={fromTokenTriggerRef}
//                       className="flex items-center space-x-1.5 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg hover:bg-dex-aqua/30 min-w-[80px] sm:min-w-[90px]"
//                       onClick={() => setIsFromTokenOpen(!isFromTokenOpen)}
//                     >
//                       <div className="flex items-center justify-center">
//                         <img src={fromToken.icon} alt={fromToken.symbol} className="w-5 h-5 sm:w-6 sm:h-6" />
//                       </div>
//                       <span className="text-xs sm:text-sm">
//                         {fromToken.symbol}
//                       </span>
//                       <span className="text-dex-dark">▼</span>
//                     </button>
//                     <TokenDropdown
//                       isOpen={isFromTokenOpen}
//                       onClose={() => setIsFromTokenOpen(false)}
//                       onSelect={setFromToken}
//                       selectedToken={fromToken}
//                       excludeToken={toToken.symbol}
//                       triggerRef={fromTokenTriggerRef}
//                     />
//                   </div>
//                   <input
//                     type="text"
//                     className="flex-1 bg-transparent text-xl sm:text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis placeholder-dex-dark"
//                     placeholder="0.00"
//                     value={fromAmount}
//                     onChange={(e) => setFromAmount(e.target.value)}
//                   />
//                 </div>

//               </div>

//               <div className="flex justify-center relative z-10 mb-1">
//                 <button
//                   className="p-2 rounded-xl bg-dex-lightSand hover:bg-dex-aqua/30 transition-all duration-200 border-4 border-dex-sand shadow-lg group"
//                   onClick={handleSwapTokens}
//                 >
//                   <ArrowDownUp className="w-4 h-4 text-dex-coral group-hover:rotate-180 transition-transform duration-200" />
//                 </button>
//               </div>
//               <div className="space-y-2 mt-3">
//                 <div className="flex justify-between text-xs">
//                   <span className="text-dex-dark font-medium">To</span>
//                   <span className="text-dex-dark">
//                     Balance: {" "}
//                     <span className="text-dex-dark inline-block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap align-bottom">
//                       {tokenBalances[toToken.symbol] || "0.000000"}
//                     </span>{" "}
//                     {toToken.symbol}
//                   </span>
//                 </div>
//                 <div className="flex items-center space-x-2 bg-dex-sand p-2 rounded-xl">
//                   <div className="relative">
//                     <button
//                       ref={toTokenTriggerRef}
//                       className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-dex-aqua/30 min-w-[100px] sm:min-w-[120px]"
//                       onClick={() => setIsToTokenOpen(!isToTokenOpen)}
//                     >
//                       <div className="flex items-center justify-center">
//                         <img src={toToken.icon} alt={toToken.symbol} className="w-5 h-5 sm:w-6 sm:h-6" />
//                       </div>
//                       <span className="text-sm sm:text-base">
//                         {toToken.symbol}
//                       </span>
//                       <span className="text-dex-dark">▼</span>
//                     </button>
//                     <TokenDropdown
//                       isOpen={isToTokenOpen}
//                       onClose={() => setIsToTokenOpen(false)}
//                       onSelect={setToToken}
//                       selectedToken={toToken}
//                       triggerRef={toTokenTriggerRef}
//                     />
//                   </div>
//                   <input
//                     type="text"
//                     className="flex-1 bg-transparent text-2xl font-medium focus:outline-none text-right min-w-0 overflow-hidden text-ellipsis placeholder-dex-dark"
//                     placeholder="0.00"
//                     value={toAmount}
//                     onChange={(e) => setToAmount(e.target.value)}
//                   />
//                 </div>
//               </div>
//             </>
          

//           <div className="mt-4 space-y-2">
//             <div className="flex items-center justify-between p-2.5 rounded-xl bg-dex-lightSand/50 backdrop-blur-sm">
//               <div className="flex items-center space-x-2">
//                 <span className="text-xs sm:text-sm text-dex-dark">
//                   1 {fromToken.symbol} ={" "}
//                   {arePricesLoading
//                     ? "..."
//                     : fromTokenPrice && toTokenPrice && toTokenPrice > 0
//                     ? (fromTokenPrice / toTokenPrice).toLocaleString("en-US", {
//                         minimumFractionDigits: 6,
//                         maximumFractionDigits: 6,
//                       })
//                     : "N/A"}{" "}
//                   {toToken.symbol}
//                   {priceFetchError && (
//                     <span className="text-dex-coral ml-2 text-xs">Error</span>
//                   )}
//                 </span>
//                 <Info className="w-4 h-4 text-dex-dark" />
//               </div>
//               <button
//                 className="flex items-center space-x-1 text-dex-coral transition-colors"
//                 onClick={handlePriceRefresh}
//                 disabled={arePricesLoading}
//               >
//                 {arePricesLoading ? (
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                 ) : (
//                   <span className="text-sm">Refresh</span>
//                 )}
//               </button>
//             </div>

//             <div className="p-2.5 rounded-xl bg-dex-lightSand/50 backdrop-blur-sm space-y-2">
//               <div className="flex justify-between text-xs sm:text-sm">
//                 <span className="text-dex-dark">Network costs (est.)</span>
//                 <span className="font-medium">
//                   0.00013 ETH <span className="text-dex-dark">(≈ $0.0038)</span>
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="mt-4">
//             <button
//               onClick={handleSwap}
//               disabled={isSwapping}
//               className="w-full py-3 sm:py-4 bg-gradient-to-r from-dex-coral to-dex-aqua text-white font-bold text-sm sm:text-base rounded-xl transition-all duration-200 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isSwapping ? (
//                 <div className="flex items-center justify-center space-x-2">
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   <span>Swapping...</span>
//                 </div>
//               ) : (
//                 "Place Order"
//               )}
//             </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SwapComponentRefactored; 