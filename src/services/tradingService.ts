import { Order, Trade, OrderBook } from '../types/trading';

export class TradingService {
  public generateOrderId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  matchOrder(order: Order, orderBook: OrderBook): {
    trades: Trade[],
    remainingOrder: Order | null,
    updatedOrderBook: OrderBook
  } {
    const trades: Trade[] = [];
    let remainingSize = order.size;
    const updatedOrderBook = { ...orderBook };
    
    const oppositeOrders = order.type === 'buy' ? 
      [...orderBook.asks].sort((a, b) => a.price - b.price) : 
      [...orderBook.bids].sort((a, b) => b.price - a.price);

    // For buy orders, match with asks that have price <= order price
    // For sell orders, match with bids that have price >= order price
    while (remainingSize > 0 && oppositeOrders.length > 0) {
      const matchingOrder = oppositeOrders[0];
      
      if ((order.type === 'buy' && matchingOrder.price > order.price) ||
          (order.type === 'sell' && matchingOrder.price < order.price)) {
        break;
      }

      const matchedSize = Math.min(remainingSize, matchingOrder.size);
      remainingSize -= matchedSize;

      // Create trade
      trades.push({
        price: matchingOrder.price,
        quantity: matchedSize,
        time: this.formatTime(Date.now()),
        type: order.type,
        timestamp: Date.now()
      });

      // Update matching order
      if (matchedSize === matchingOrder.size) {
        oppositeOrders.shift();
      } else {
        matchingOrder.size -= matchedSize;
        matchingOrder.total = matchingOrder.size * matchingOrder.price;
      }
    }

    // Update orderbook
    if (order.type === 'buy') {
      updatedOrderBook.asks = oppositeOrders;
    } else {
      updatedOrderBook.bids = oppositeOrders;
    }

    // If there's remaining size, create a new order
    let remainingOrder: Order | null = null;
    if (remainingSize > 0) {
      remainingOrder = {
        ...order,
        id: this.generateOrderId(),
        size: remainingSize,
        total: remainingSize * order.price,
        timestamp: Date.now()
      };

      // Add remaining order to orderbook
      if (order.type === 'buy') {
        updatedOrderBook.bids = [...updatedOrderBook.bids, remainingOrder]
          .sort((a, b) => b.price - a.price);
      } else {
        updatedOrderBook.asks = [...updatedOrderBook.asks, remainingOrder]
          .sort((a, b) => a.price - b.price);
      }
    }

    return {
      trades,
      remainingOrder,
      updatedOrderBook
    };
  }

  createOrder(
    type: 'buy' | 'sell',
    price: number,
    size: number,
    orderBook: OrderBook
  ): {
    trades: Trade[],
    updatedOrderBook: OrderBook,
    remainingOrder: Order | null
  } {
    const order: Order = {
      id: this.generateOrderId(),
      price,
      size,
      total: price * size,
      type,
      timestamp: Date.now()
    };

    const result = this.matchOrder(order, orderBook);
    
    return {
      trades: result.trades,
      updatedOrderBook: result.updatedOrderBook,
      remainingOrder: result.remainingOrder
    };
  }
} 