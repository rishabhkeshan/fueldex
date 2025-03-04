import React, { useEffect, useRef } from "react";
import {
  LibrarySymbolInfo,
  widget,
  IChartingLibraryWidget,
} from "../charting_library_cloned_data/charting_library";
import { Trade } from '../types/trading';

interface OHLCData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const generateOHLCData = (startTime: number, days: number): OHLCData[] => {
  const data: OHLCData[] = [];
  let currentTime = Math.floor(startTime / 1000); // Convert to seconds

  for (let i = 0; i < days; i++) {
    const open = Math.random() * 100 + 100;
    const high = open + Math.random() * 10;
    const low = open - Math.random() * 10;
    const close = low + Math.random() * (high - low);
    
    data.push({
      time: currentTime,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2))
    });
    currentTime += 24 * 60 * 60; // increment by one day (in seconds)
  }

  return data;
};

const generateMinuteData = (startTime: number, minutes: number): OHLCData[] => {
  const data: OHLCData[] = [];
  let currentTime = Math.floor(startTime / 1000); // Convert to seconds

  for (let i = 0; i < minutes; i++) {
    const open = Math.random() * 100 + 100;
    const high = open + Math.random() * 5;
    const low = open - Math.random() * 5;
    const close = low + Math.random() * (high - low);
    
    data.push({
      time: currentTime,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2))
    });
    currentTime += 60; // increment by one minute (in seconds)
  }

  return data;
};

interface TradingViewAdvancedWidgetProps {
  trades: Trade[];
  selectedPair: string;
}

const TradingViewAdvancedWidget = ({ trades, selectedPair }: TradingViewAdvancedWidgetProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<IChartingLibraryWidget | null>(null);
  const lastTradeRef = useRef<Trade | null>(null);
  const dataFeedRef = useRef<any>(null);
  const currentBarRef = useRef<any>(null);
  const realtimeCallbackRef = useRef<((bar: any) => void) | null>(null);

  // Process trades into OHLCV format
  const processTradesData = (trades: Trade[]) => {
    const ohlcvMap = new Map();
    
    trades.forEach(trade => {
      const timestamp = Math.floor(trade.timestamp / 1000);
      // Round down to nearest minute for 1-minute bars
      const barTimestamp = Math.floor(timestamp / 60) * 60;
      const price = trade.price || trade.close || 0;
      const volume = trade.quantity || 0;

      if (!ohlcvMap.has(barTimestamp)) {
        ohlcvMap.set(barTimestamp, {
          time: barTimestamp,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: volume
        });
      } else {
        const candle = ohlcvMap.get(barTimestamp);
        candle.high = Math.max(candle.high, price);
        candle.low = Math.min(candle.low, price);
        candle.close = price;
        candle.volume += volume;
      }
    });

    return Array.from(ohlcvMap.values()).sort((a, b) => a.time - b.time);
  };

  // Handle real-time updates
  useEffect(() => {
    if (!realtimeCallbackRef.current || !trades.length) return;

    const lastTrade = trades[trades.length - 1];
    if (!lastTrade || lastTrade === lastTradeRef.current) return;

    const timestamp = Math.floor(lastTrade.timestamp / 1000);
    const barTimestamp = Math.floor(timestamp / 60) * 60;
    const price = lastTrade.price || lastTrade.close || 0;
    const volume = lastTrade.quantity || 0;

    if (currentBarRef.current && currentBarRef.current.time === barTimestamp) {
      // Update current bar
      currentBarRef.current.high = Math.max(currentBarRef.current.high, price);
      currentBarRef.current.low = Math.min(currentBarRef.current.low, price);
      currentBarRef.current.close = price;
      currentBarRef.current.volume += volume;
      realtimeCallbackRef.current(currentBarRef.current);
    } else {
      // Create new bar
      const newBar = {
        time: barTimestamp,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: volume
      };
      currentBarRef.current = newBar;
      realtimeCallbackRef.current(newBar);
    }

    lastTradeRef.current = lastTrade;
  }, [trades]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    dataFeedRef.current = {
      onReady: (callback: (configuration: object) => void) => {
        setTimeout(() => {
          callback({
            supported_resolutions: ["1", "5", "15", "30", "60", "1D"],
            exchanges: [],
            symbols_types: []
          });
        }, 0);
      },

      resolveSymbol: (
        symbolName: string,
        onSymbolResolvedCallback: (symbolInfo: LibrarySymbolInfo) => void,
        onResolveErrorCallback: (error: string) => void
      ) => {
        const symbolInfo = {
          ticker: selectedPair,
          name: selectedPair,
          description: selectedPair,
          type: "crypto",
          session: "24x7",
          timezone: "Etc/UTC",
          minmov: 1,
          pricescale: 100,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          supported_resolutions: ["1", "5", "15", "30", "60", "1D"],
          volume_precision: 2,
          data_status: "streaming",
          exchange: "O2",
          listed_exchange: "O2",
          format: "price"
        };

        setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);
      },

      getBars: (
        symbolInfo: LibrarySymbolInfo,
        resolution: string,
        periodParams: {
          from: number;
          to: number;
          firstDataRequest: boolean;
        },
        onHistoryCallback: (bars: any[], meta: { noData?: boolean }) => void,
        onErrorCallback: (error: string) => void
      ) => {
        try {
          const bars = processTradesData(trades).filter(bar => {
            return bar.time >= periodParams.from && bar.time <= periodParams.to;
          });

          if (bars.length > 0) {
            currentBarRef.current = bars[bars.length - 1];
            onHistoryCallback(bars, { noData: false });
          } else {
            onHistoryCallback([], { noData: true });
          }
        } catch (error) {
          console.error("Error in getBars:", error);
          onErrorCallback(error instanceof Error ? error.message : 'Unknown error occurred');
        }
      },

      subscribeBars: (
        symbolInfo: LibrarySymbolInfo,
        resolution: string,
        onRealtimeCallback: (bar: any) => void,
        subscriberUID: string,
        onResetCacheNeededCallback: () => void
      ) => {
        realtimeCallbackRef.current = onRealtimeCallback;
        return subscriberUID;
      },

      unsubscribeBars: (subscriberUID: string) => {
        realtimeCallbackRef.current = null;
      },
    };

    const widgetOptions = {
      symbol: selectedPair,
      datafeed: dataFeedRef.current,
      interval: "1",
      container: chartContainerRef.current,
      library_path: "../../charting_library_cloned_data/charting_library/",
      locale: "en",
      custom_css_url: "./tradingview-chart.css",
      fullscreen: false,
      autosize: true,
      theme: "dark",
            disabled_features: [
        "volume_force_overlay",
      ],
      overrides: {
        // Background and Layout
        "paneProperties.background": "#111111",
        "paneProperties.backgroundType": "solid",
        "paneProperties.legendProperties.showBackground": false,
        "chartProperties.background": "#111111",
        "chartProperties.backgroundType": "solid",
        "mainSeriesProperties.priceAxisProperties.autoScale": true,
        
        // Toolbars and Panels
        "toolbarBg": "#111111",
        "toolbarBorderColor": "#111111",
        "paneProperties.topMargin": 8,
        "paneProperties.bottomMargin": 8,
        "symbolWatermarkProperties.color": "rgba(0, 0, 0, 0)",
        
        // Left Toolbar
        "leftAxisProperties.background": "#111111",
        "leftAxisProperties.borderColor": "#111111",
        "leftAxisProperties.gridColor": "#1c1c1c",
        
        // Bottom Toolbar
        "timeAxisProperties.background": "#111111",
        "timeAxisProperties.borderColor": "#111111",
        "timeAxisProperties.gridColor": "#1c1c1c",
        
        // Chart
        "mainSeriesProperties.style": 1,
        "mainSeriesProperties.showCountdown": false,
        "mainSeriesProperties.visible": true,
        "mainSeriesProperties.showPriceLine": true,
        "mainSeriesProperties.priceLineWidth": 1,
        "mainSeriesProperties.lockScale": false,
        "mainSeriesProperties.minTick": "default",
        
        // Candles
        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
        "mainSeriesProperties.candleStyle.drawWick": true,
        "mainSeriesProperties.candleStyle.drawBorder": true,
        "mainSeriesProperties.candleStyle.borderColor": "#378658",
        "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
        "mainSeriesProperties.candleStyle.wickColor": "#737375",
        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
        
        // Scales
        "scalesProperties.backgroundColor": "#111111",
        "scalesProperties.fontSize": 11,
        "scalesProperties.lineColor": "#1c1c1c",
        "scalesProperties.textColor": "#b2b5be",
        "scalesProperties.scaleSeriesOnly": false,
        
        // Grid
        "paneProperties.vertGridProperties.color": "#1c1c1c",
        "paneProperties.vertGridProperties.style": 0,
        "paneProperties.horzGridProperties.color": "#1c1c1c",
        "paneProperties.horzGridProperties.style": 0,
        
        // Crosshair
        "crossHairProperties.color": "#758696",
        "crossHairProperties.style": 2,
        "crossHairProperties.transparency": 0,
        "crossHairProperties.width": 1,
        
        // Navigator
        "navigatorProperties.background": "#111111",
        "navigatorProperties.opacity": 0.9,
        "navigatorProperties.visibility": true,
        
        // Volume
        "volumePaneSize": "medium",
      },
      studies_overrides: {
        "volume.volume.color.0": "#ef5350",
        "volume.volume.color.1": "#26a69a",
        "volume.volume.transparency": 70,
        "volume.volume ma.color": "#FF9800",
        "volume.volume ma.transparency": 30,
        "volume.volume ma.linewidth": 1,
        "volume.show ma": false,
        "volume.options.showStudyArguments": false,
        "volume.options.showLastValue": false,
      },
      loading_screen: { 
        backgroundColor: "#111111",
        foregroundColor: "#1c1c1c" 
      },
      custom_css_url: "./themed.css",
      toolbar_bg: "#111111",
      time_frames: [
        { text: "1D", resolution: "1", description: "1 Day" },
        { text: "5D", resolution: "5", description: "5 Days" },
        { text: "1M", resolution: "30", description: "1 Month" },
        { text: "3M", resolution: "60", description: "3 Months" },
        { text: "6M", resolution: "120", description: "6 Months" },
        { text: "1Y", resolution: "D", description: "1 Year" },
      ],
    };

    widgetRef.current = new widget(widgetOptions);

    // Apply additional styling after widget is created
    widgetRef.current.onChartReady(() => {
      if (widgetRef.current) {
        widgetRef.current.applyOverrides({
          "paneProperties.background": "#111111",
          "paneProperties.backgroundType": "solid",
          "chartProperties.background": "#111111",
          "chartProperties.backgroundType": "solid",
          "leftAxisProperties.background": "#111111",
          "leftAxisProperties.borderColor": "#111111",
          "timeAxisProperties.background": "#111111",
          "timeAxisProperties.borderColor": "#111111",
          "symbolWatermarkProperties.color": "rgba(0, 0, 0, 0)",
          "scalesProperties.backgroundColor": "#111111",
          "paneProperties.legendProperties.showBackground": false,
          "paneProperties.legendProperties.backgroundTransparency": 100,
        });
      }
    });

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
      realtimeCallbackRef.current = null;
    };
  }, [selectedPair]); // Only recreate chart when pair changes

  return (
    <div ref={chartContainerRef} className="w-full h-full" />
  );
};

export default TradingViewAdvancedWidget;
