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
  timestamp: number;
  time?: string;
  type?: 'buy' | 'sell';
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
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