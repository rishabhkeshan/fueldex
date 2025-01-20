export interface Order {
  id: string;
  price: number;
  size: number;
  total: number;
  type: 'buy' | 'sell';
  timestamp: number;
}

export interface Trade {
  price: number;
  quantity: number;
  time: string;
  type: 'buy' | 'sell';
  timestamp: number;
}

export interface OrderBook {
  asks: Order[];
  bids: Order[];
}

export interface ActiveOrder extends Order {
  status: 'open' | 'partial';
  filled?: number;
}

export interface HistoricalOrder extends Order {
  status: 'filled' | 'cancelled';
  filled: number;
  completedAt: number;
} 