interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const generateMockData = (
  symbol: string,
  from: number,
  to: number,
  resolution: string
): Bar[] => {
  const bars: Bar[] = [];
  let currentTime = from;
  const interval = resolution === "D" ? 86400 : parseInt(resolution) * 60;

  while (currentTime <= to) {
    const basePrice = symbol.includes("RISH") ? 2.5 : 15.75;
    const volatility = symbol.includes("RISH") ? 0.05 : 0.08;

    const open = basePrice + (Math.random() - 0.5) * 2 * volatility * basePrice;
    const close = open + (Math.random() - 0.5) * volatility * basePrice;
    const high = Math.max(open, close) + Math.random() * volatility * basePrice;
    const low = Math.min(open, close) - Math.random() * volatility * basePrice;
    const volume = Math.floor(Math.random() * 1000000);

    bars.push({
      time: currentTime * 1000,
      open,
      high,
      low,
      close,
      volume,
    });

    currentTime += interval;
  }

  return bars;
};
