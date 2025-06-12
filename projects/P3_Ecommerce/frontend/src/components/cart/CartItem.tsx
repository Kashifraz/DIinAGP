import React, { useState } from 'react';
import { CartItem as CartItemType } from '../../types/cart';
import { useCart } from '../../context/CartContext';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline';

interface CartItemProps {
  item: CartItemType;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setIsUpdating(true);
      setLocalQuantity(newQuantity);
      await updateQuantity(item.productId, newQuantity);
    } catch (error) {
      // Revert on error
      setLocalQuantity(item.quantity);
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Update local quantity when item quantity changes
  React.useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const handleIncrement = () => {
    handleQuantityChange(localQuantity + 1);
  };

  const handleDecrement = () => {
    if (localQuantity > 1) {
      handleQuantityChange(localQuantity - 1);
    }
  };

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await removeFromCart(item.productId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
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
                <PhotoIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {item.productName}
          </h3>
          <p className="text-sm text-gray-500">
            Price: {formatPrice(item.productPrice)}
          </p>
          <p className="text-sm text-gray-500">
            Total: {formatPrice(item.totalPrice)}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDecrement}
            disabled={isUpdating || isRemoving || localQuantity <= 1}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          
          <div className="flex items-center">
            <input
              type="number"
              value={localQuantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setLocalQuantity(value);
              }}
              onBlur={() => handleQuantityChange(localQuantity)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleQuantityChange(localQuantity);
                }
              }}
              min="1"
              className="w-16 text-center border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUpdating || isRemoving}
            />
          </div>
          
          <button
            onClick={handleIncrement}
            disabled={isUpdating || isRemoving}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={isUpdating || isRemoving}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove from cart"
        >
          {isRemoving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
          ) : (
            <TrashIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Loading indicator */}
      {(isUpdating || isRemoving) && (
        <div className="mt-2 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-500">
            {isUpdating ? 'Updating...' : 'Removing...'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CartItemComponent;
