import { generateMockData } from "./mockDataGenerator";

const configurationData = {
  supported_resolutions: ["1", "5", "15", "30", "60", "240", "D"],
  exchanges: [
    {
      value: "DEX",
      name: "DEX",
      desc: "Decentralized Exchange",
    },
  ],
  symbols_types: [
    {
      name: "crypto",
      value: "crypto",
    },
  ],
};

const pairs = {
  "RISH/USDC": {
    name: "RISH/USDC",
    description: "RISH/USDC Pair",
    type: "crypto",
    exchange: "DEX",
    timezone: "Etc/UTC",
    minmov: 1,
    pricescale: 100000,
    has_intraday: true,
    supported_resolutions: configurationData.supported_resolutions,
  },
  "HEM/USDT": {
    name: "HEM/USDT",
    description: "HEM/USDT Pair",
    type: "crypto",
    exchange: "DEX",
    timezone: "Etc/UTC",
    minmov: 1,
    pricescale: 100000,
    has_intraday: true,
    supported_resolutions: configurationData.supported_resolutions,
  },
};

export const Datafeed = {
  onReady: (callback: (config: any) => void) => {
    setTimeout(() => callback(configurationData), 0);
  },

  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: (result: any[]) => void
  ) => {
    const symbols = Object.values(pairs).filter((pair) =>
      pair.name.toLowerCase().includes(userInput.toLowerCase())
    );
    onResultReadyCallback(symbols);
  },

  resolveSymbol: (
    symbolName: string,
    onSymbolResolvedCallback: (symbol: any) => void,
    onResolveErrorCallback: (error: any) => void
  ) => {
    const symbol = pairs[symbolName];
    if (!symbol) {
      onResolveErrorCallback("Symbol not found");
      return;
    }
    onSymbolResolvedCallback(symbol);
  },

  getBars: (
    symbolInfo: any,
    resolution: string,
    periodParams: any,
    onHistoryCallback: (bars: any[], meta: { noData: boolean }) => void,
    onErrorCallback: (error: any) => void
  ) => {
    const { from, to, firstDataRequest } = periodParams;

    try {
      const bars = generateMockData(symbolInfo.name, from, to, resolution);
      onHistoryCallback(bars, { noData: bars.length === 0 });
    } catch (error) {
      onErrorCallback(error);
    }
  },

  subscribeBars: (
    symbolInfo: any,
    resolution: string,
    onRealtimeCallback: (bar: any) => void,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void
  ) => {
    // Simulate real-time updates
    setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const bars = generateMockData(
        symbolInfo.name,
        currentTime - 60,
        currentTime,
        resolution
      );
      if (bars.length > 0) {
        onRealtimeCallback(bars[bars.length - 1]);
      }
    }, 1000);
  },

  unsubscribeBars: (subscriberUID: string) => {
    // Cleanup subscription
  },
};
