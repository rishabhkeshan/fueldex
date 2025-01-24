// TradingViewWidget.jsx
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ColorType, UTCTimestamp } from 'lightweight-charts';

interface Trade {
  price: number;
  quantity: number;
  time: string;
  type?: 'buy' | 'sell';
  timestamp?: number;
}

interface UserTrade extends Trade {
  type: 'buy' | 'sell';
  timestamp: number;
}

interface TradingViewWidgetProps {
  trades: Trade[];
  userTrades?: UserTrade[];
}

type TimeframeOption = {
  label: string;
  minutes: number;
};

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '1h', minutes: 60 },
  { label: '4h', minutes: 240 },
  { label: '1d', minutes: 1440 },
];

// Helper function to generate sample data for the past 30 days
const generateHistoricalData = (timeframeMinutes: number) => {
  const now = new Date();
  const data = [];
  const periods = timeframeMinutes === 1440 ? 30 : 100; // 30 days for daily, 100 periods for others
  const msPerPeriod = timeframeMinutes * 60 * 1000;
  
  for (let i = periods; i >= 0; i--) {
    const timestamp = now.getTime() - (i * msPerPeriod);
    const basePrice = 0.04500;
    const volatility = 0.0005;
    
    // Generate random price movements
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = (low + high) / 2 + (Math.random() - 0.5) * volatility;
    const volume = Math.random() * 100000 + 50000;

    data.push({
      time: (Math.floor(timestamp / 1000)) as UTCTimestamp,
      open,
      high,
      low,
      close,
      volume
    });
  }
  return data;
};

// Helper function to convert trades to OHLC candlestick data
const convertToOHLC = (trades: Trade[], timeframeMinutes: number = 5) => {
  if (!trades.length) {
    return generateHistoricalData(timeframeMinutes);
  }
  
  const candlesticks: {
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[] = [];

  // Group trades by timeframe
  const groupedTrades = trades.reduce((acc, trade) => {
    const timestamp = trade.timestamp || new Date(trade.time).getTime();
    const timeGroup = Math.floor(timestamp / (timeframeMinutes * 60 * 1000)) * timeframeMinutes * 60;
    
    if (!acc[timeGroup]) {
      acc[timeGroup] = [];
    }
    acc[timeGroup].push(trade);
    return acc;
  }, {} as Record<number, Trade[]>);

  // Convert grouped trades to OHLC
  Object.entries(groupedTrades).forEach(([time, periodTrades]) => {
    if (periodTrades.length === 0) return;

    const prices = periodTrades.map(t => t.price);
    const volume = periodTrades.reduce((sum, t) => sum + t.quantity, 0);

    candlesticks.push({
      time: (parseInt(time)) as UTCTimestamp,
      open: prices[0],
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: prices[prices.length - 1],
      volume: volume
    });
  });

  // Merge with historical data
  const historicalData = generateHistoricalData(timeframeMinutes);
  const mergedData = [...historicalData, ...candlesticks]
    .sort((a, b) => (a.time as number) - (b.time as number));

  // Remove duplicates based on timestamp
  const uniqueData = mergedData.filter((item, index, self) =>
    index === self.findIndex((t) => t.time === item.time)
  );

  return uniqueData;
};

function TradingViewWidget({ trades, userTrades = [] }: TradingViewWidgetProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(TIMEFRAME_OPTIONS[0]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: '#111111' },
          textColor: '#DDD',
        },
        grid: {
          vertLines: { color: '#1e222d' },
          horzLines: { color: '#1e222d' },
        },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        timeScale: {
          timeVisible: selectedTimeframe.minutes < 1440, // Show time for intraday timeframes
          secondsVisible: false,
          tickMarkFormatter: (time: number) => {
            const date = new Date(time * 1000);
            if (selectedTimeframe.minutes >= 1440) {
              // For daily timeframes, show date
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              });
            } else {
              // For intraday timeframes, show time
              return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              });
            }
          },
        },
      });

      // Create candlestick series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      
      // Store reference to candlestick series
      candlestickSeriesRef.current = candlestickSeries;

      // Create volume series
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '', // Set as an overlay
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      // Convert and set initial data
      const candleData = convertToOHLC(trades, selectedTimeframe.minutes);
      if (candleData.length > 0) {
        candlestickSeries.setData(candleData);

        // Set volume data
        const volumeData = candleData.map(candle => ({
          time: candle.time,
          value: candle.volume,
          color: candle.close >= candle.open ? '#26a69a55' : '#ef535055'
        }));
        volumeSeries.setData(volumeData);

        // Fit content
        chart.timeScale().fitContent();
      }

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight
          });
        }
      };

      window.addEventListener('resize', handleResize);
      chartRef.current = chart;

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }, [selectedTimeframe]);

  // Update data when trades change or timeframe changes
  useEffect(() => {
    if (!chartRef.current) return;

    try {
      const candleData = convertToOHLC(trades, selectedTimeframe.minutes);
      if (candleData.length === 0) return;

      const series = chartRef.current.getAllSeries();
      
      if (series[0]) { // Candlestick series
        series[0].setData(candleData);
      }
      
      if (series[1]) { // Volume series
        const volumeData = candleData.map(candle => ({
          time: candle.time,
          value: candle.volume,
          color: candle.close >= candle.open ? '#26a69a55' : '#ef535055'
        }));
        series[1].setData(volumeData);
      }
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }, [trades, selectedTimeframe]);

  // Also update the chart options when timeframe changes
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      timeScale: {
        timeVisible: selectedTimeframe.minutes < 1440,
        secondsVisible: false,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          if (selectedTimeframe.minutes >= 1440) {
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
          } else {
            return date.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });
          }
        },
      },
    });
  }, [selectedTimeframe]);

  // Update the trade markers effect
  useEffect(() => {
    if (!candlestickSeriesRef.current || !userTrades.length) return;

    // Remove existing markers
    candlestickSeriesRef.current.setMarkers([]);

    // Create markers for user trades
    const markers = userTrades.map(trade => ({
      time: (Math.floor(trade.timestamp / 1000)) as UTCTimestamp,
      position: trade.type === 'buy' ? 'belowBar' : 'aboveBar',
      color: trade.type === 'buy' ? '#26a69a' : '#ef5350',
      shape: trade.type === 'buy' ? 'arrowUp' : 'arrowDown',
      text: `${trade.type.toUpperCase()} @ ${trade.price.toFixed(5)}`,
      size: 1,
      borderColor: trade.type === 'buy' ? '#26a69a' : '#ef5350',
      backgroundColor: trade.type === 'buy' ? '#26a69a' : '#ef5350',
      fontFamily: 'monospace',
      fontSize: 11,
      fontWeight: '500',
      textColor: trade.type === 'buy' ? '#26a69a' : '#ef5350',
      yAnchor: trade.type === 'buy' ? 1 : 0,
      offsetY: trade.type === 'buy' ? 8 : -8
    }));

    // Set new markers
    candlestickSeriesRef.current.setMarkers(markers);
  }, [userTrades, selectedTimeframe]);

  return (
    <div className="flex flex-col h-full">
      {/* Timeframe selector */}
      <div className="flex space-x-2 p-2 bg-fuel-dark-800 border-b border-fuel-dark-600">
        {TIMEFRAME_OPTIONS.map((timeframe) => (
          <button
            key={timeframe.label}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              selectedTimeframe.label === timeframe.label
                ? 'bg-fuel-green text-fuel-dark-900'
                : 'bg-fuel-dark-700 text-gray-400 hover:bg-fuel-dark-600'
            }`}
            onClick={() => setSelectedTimeframe(timeframe)}
          >
            {timeframe.label}
          </button>
        ))}
      </div>
      <div ref={chartContainerRef} className="flex-1" />
    </div>
  );
}

export default TradingViewWidget;
