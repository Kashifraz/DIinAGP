import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const CartIcon: React.FC = () => {
  const { totalQuantity, isLoading } = useCart();

  return (
    <Link
      to="/cart"
      className="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
    >
      <ShoppingCartIcon className="h-6 w-6" />
      
      {/* Cart Badge - only show if not loading and has items */}
      {!isLoading && totalQuantity > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[20px] h-5">
          {totalQuantity > 99 ? '99+' : totalQuantity}
        </span>
      )}
      
      {/* Loading indicator - only show briefly during operations */}
      {isLoading && totalQuantity === 0 && (
        <div className="absolute -top-1 -right-1">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </Link>
  );
};

export default CartIcon;
