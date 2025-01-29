// TradingViewWidget.jsx
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ColorType, UTCTimestamp } from 'lightweight-charts';

interface Trade {
  price: number;
  quantity: number;
  time: string;
  timestamp: number;
  type?: 'buy' | 'sell';
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

interface UserTrade extends Trade {
  type: 'buy' | 'sell';
  timestamp: number;
}

interface TradingViewWidgetProps {
  trades: Trade[];
  userTrades?: UserTrade[];
  selectedTimeframe: TimeframeOption;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
}

type TimeframeOption = {
  label: string;
  minutes: number;
};

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: '5s', minutes: 5/60 },  // 5 seconds
  { label: '1m', minutes: 1 },     // 1 minute
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '1h', minutes: 60 },
  { label: '4h', minutes: 240 },
  { label: '1d', minutes: 1440 },
];

// Helper function to convert trades to candlestick data
const convertToOHLC = (trades: Trade[], timeframeMinutes: number = 5) => {
  if (!trades.length) return [];

  // Convert timeframe to milliseconds
  const timeframeMs = timeframeMinutes * 60 * 1000;
  const groupedTrades: { [key: number]: Trade[] } = {};

  // Group trades by timeframe
  trades.forEach(trade => {
    // For sub-minute timeframes, we need more precise grouping
    const timeGroup = Math.floor(trade.timestamp / timeframeMs) * timeframeMs;
    if (!groupedTrades[timeGroup]) {
      groupedTrades[timeGroup] = [];
    }
    groupedTrades[timeGroup].push(trade);
  });

  // Convert groups to candles
  return Object.entries(groupedTrades)
    .map(([timestamp, periodTrades]) => {
      const timestampNum = parseInt(timestamp);
      
      // Get first trade for open price
      const firstTrade = periodTrades[0];
      // Get last trade for close price
      const lastTrade = periodTrades[periodTrades.length - 1];
      
      // Calculate OHLCV
      const open = firstTrade.open || firstTrade.price;
      const close = lastTrade.close || lastTrade.price;
      const high = Math.max(...periodTrades.map(t => t.high || t.price));
      const low = Math.min(...periodTrades.map(t => t.low || t.price));
      const volume = periodTrades.reduce((sum, trade) => 
        sum + (trade.volume || (trade.quantity * (trade.price || trade.close))), 0);

      return {
        time: (Math.floor(timestampNum / 1000)) as UTCTimestamp,
        open,
        high,
        low,
        close,
        volume
      };
    })
    .sort((a, b) => (a.time as number) - (b.time as number));
};

function TradingViewWidget({ 
  trades, 
  userTrades = [], 
  selectedTimeframe,
  onTimeframeChange 
}: TradingViewWidgetProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  // Initialize chart
  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
      }
    };

    if (!chartContainerRef.current) return;

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
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#1e222d',
        // fixLeftEdge: true,
        // fixRightEdge: true,
        // rightOffset: 12,
        barSpacing: 6,
        minBarSpacing: 2
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      handleScale: {
        axisPressedMouseMove: true
      },
      handleScroll: {
        vertTouchDrag: true
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#555',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e222d',
        },
        horzLine: {
          color: '#555',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e222d',
        },
      }
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      borderColor: '#378658',
      wickVisible: true,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
        precision: 0,
      },
      priceScaleId: '',
      overlay: true,
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Configure the volume price scale
    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
      visible: true,
      autoScale: true,
    });

    window.addEventListener('resize', handleResize);

    setTimeout(() => {
      if (chartRef.current) {
        const timeScale = chartRef.current.timeScale();
        timeScale.fitContent();
        
        const visibleRange = timeScale.getVisibleRange();
        // if (visibleRange) {
        //   const newRange = {
        //     from: (visibleRange.from as number) - (24 * 60 * 60),
        //     to: (visibleRange.to as number) + (24 * 60 * 60),
        //   };
        //   timeScale.setVisibleRange(newRange);
        // }
      }
    }, 50);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update data when trades or timeframe changes
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    try {
      const candleData = convertToOHLC(trades, selectedTimeframe.minutes);
      
      if (candleData.length === 0) return;

      // Update the candlestick series
      candlestickSeriesRef.current.setData(candleData);

      // Update volume series
      const volumeData = candleData.map(candle => ({
        time: candle.time,
        value: candle.volume || 0,
        color: candle.close >= candle.open 
          ? 'rgba(38, 166, 154, 0.5)'  // Green for bullish
          : 'rgba(239, 83, 80, 0.5)'   // Red for bearish
      }));
      
      volumeSeriesRef.current.setData(volumeData);

      // Format volume numbers
      chart.priceScale('').applyOptions({
        formatPrice: (price: number) => {
          if (price >= 1000000) {
            return (price / 1000000).toFixed(2) + 'M';
          } else if (price >= 1000) {
            return (price / 1000).toFixed(2) + 'K';
          }
          return price.toFixed(0);
        },
      });

      // Adjust the visible range based on timeframe
      const timeScale = chartRef.current.timeScale();
      const lastTime = candleData[candleData.length - 1].time as number;
      
      // Calculate how many bars to show based on timeframe
      const barsToShow = selectedTimeframe.minutes < 1 ? 100 : // Show more bars for smaller timeframes
                        selectedTimeframe.minutes < 60 ? 50 :   // Show fewer bars for larger timeframes
                        24;                                     // Show even fewer for daily

      const timeToShow = barsToShow * selectedTimeframe.minutes * 60; // Convert to seconds
      
      const visibleRange = {
        from: lastTime - timeToShow,
        to: lastTime + (selectedTimeframe.minutes * 60), // Add one candle worth of space
      };

      // Update chart options for the new timeframe
      timeScale.applyOptions({
        timeVisible: selectedTimeframe.minutes <= 60, // Show time for intraday
        secondsVisible: selectedTimeframe.minutes < 1, // Show seconds for sub-minute
        barSpacing: Math.min(12, Math.max(6, timeToShow / barsToShow / 10)),
      });

      timeScale.setVisibleRange(visibleRange);

    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }, [trades, selectedTimeframe]);

  // Update markers
  useEffect(() => {
    if (!candlestickSeriesRef.current || !userTrades.length) return;

    const markers = userTrades.map(trade => ({
      time: (Math.floor(trade.timestamp / 1000)) as UTCTimestamp,
      position: trade.type === 'buy' ? 'belowBar' : 'aboveBar',
      color: trade.type === 'buy' ? '#26a69a' : '#ef5350',
      shape: trade.type === 'buy' ? 'arrowUp' : 'arrowDown',
      text: `${trade.type.toUpperCase()} @ ${trade.price.toFixed(2)}`,
      size: 1
    }));

    candlestickSeriesRef.current.setMarkers(markers);
  }, [userTrades]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex space-x-2 p-2 bg-fuel-dark-800 border-b border-fuel-dark-600">
        {TIMEFRAME_OPTIONS.map((timeframe) => (
          <button
            key={timeframe.label}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              selectedTimeframe.label === timeframe.label
                ? 'bg-fuel-green text-fuel-dark-900'
                : 'bg-fuel-dark-700 text-gray-400 hover:bg-fuel-dark-600'
            }`}
            onClick={() => onTimeframeChange(timeframe)}
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
