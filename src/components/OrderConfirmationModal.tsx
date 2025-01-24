import React from 'react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderDetails: {
    action: 'buy' | 'sell';
    size: string;
    price: string;
    type: 'limit' | 'market';
    estimatedPrice?: string;
  };
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderDetails
}) => {
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideOrderConfirmation', 'true');
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-fuel-dark-800 rounded-lg w-full max-w-sm mx-4">
        <div className="flex justify-between items-center p-4 border-b border-fuel-dark-600">
          <h2 className="text-lg font-medium">Confirm Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Action</span>
            <span className={orderDetails.action === 'buy' ? 'text-fuel-green' : 'text-red-500'}>
              {orderDetails.action.toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Size</span>
            <span>{orderDetails.size} ETH</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Price</span>
            <span>{orderDetails.type === 'market' ? 'Market' : orderDetails.price}</span>
          </div>

          {orderDetails.type === 'market' && orderDetails.estimatedPrice && (
            <div className="flex justify-between">
              <span className="text-gray-400">Est. Liquidation Price</span>
              <span>N/A</span>
            </div>
          )}

          <label className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded bg-fuel-dark-700 border-fuel-dark-600 text-fuel-green focus:ring-fuel-green"
            />
            <span className="text-sm text-gray-400">Don't show this again</span>
          </label>
        </div>

        <div className="p-4 border-t border-fuel-dark-600">
          <button
            onClick={handleConfirm}
            className={`w-full py-2 text-sm font-medium rounded transition-colors
              ${orderDetails.action === 'buy' 
                ? 'bg-fuel-green text-fuel-dark-900 hover:bg-opacity-90'
                : 'bg-red-500 text-white hover:bg-opacity-90'}`}
          >
            {orderDetails.action === 'buy' ? 'Buy' : 'Sell'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal; 