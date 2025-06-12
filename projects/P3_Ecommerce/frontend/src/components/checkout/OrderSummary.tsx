import React from 'react';
import { CartItem } from '../../types/cart';
import { ShoppingCartIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  cartItems, 
  subtotal, 
  tax, 
  shipping, 
  total 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const isFreeShipping = shipping === 0;
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
      
      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
              {item.productImageUrl ? (
                <img
                  src={item.productImageUrl.startsWith('http') ? item.productImageUrl : `http://localhost:8080${item.productImageUrl}`}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.productName}
              </h4>
              <p className="text-sm text-gray-500">
                Quantity: {item.quantity}
              </p>
            </div>
            
            <div className="text-sm font-medium text-gray-900">
              {formatPrice(item.totalPrice)}
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (8%)</span>
          <span className="font-medium">{formatPrice(tax)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {isFreeShipping ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        
        {!isFreeShipping && remainingForFreeShipping > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              Add {formatPrice(remainingForFreeShipping)} more for free shipping!
            </p>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-base font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <ShieldCheckIcon className="h-4 w-4 mr-2 text-green-600" />
          <span>Secure checkout with SSL encryption</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <TruckIcon className="h-4 w-4 mr-2 text-blue-600" />
          <span>Free shipping on orders over {formatPrice(freeShippingThreshold)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
