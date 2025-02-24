export type TradingPair = 'ETH/USDC' | 'ETH/USDT' | 'USDC/USDT';

export interface Order {
  id: string;
  price: number;
  amount: number;
  total: number;
  fillType: 'FULL' | 'PARTIAL';
  type: 'buy' | 'sell';
  pair: string;
}

export interface Trade {
  timestamp: string;
  type: 'buy' | 'sell';
  pair: string;
  price: number;
  amount: number;
  total: number;
}

export interface UserOrder extends Order {
  status: 'open' | 'filled' | 'partial';
  filled?: number;
  timestamp: number;
}

export interface PairStats {
  lastPrice: number;
  priceChange: number;
  volume24h: number;
  volumeChange: number;
  totalVolume: number;
} 