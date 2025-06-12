import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, EyeIcon, StarIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ProductResponse } from '../../services/productAPI';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface ProductCardProps {
  product: ProductResponse;
  onViewDetails: (product: ProductResponse) => void;
  onAddToCart: (product: ProductResponse) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onAddToCart }) => {
  const navigate = useNavigate();
  const { addToCart, isInCart, getCartItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStockStatus = () => {
    if (product.outOfStock) {
      return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    } else if (product.lowStock) {
      return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, 1);
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const isProductInCart = isInCart(product.id);
  const cartQuantity = getCartItemQuantity(product.id);

  const stockStatus = getStockStatus();

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105">
      {/* Product Image */}
      <div className="aspect-w-16 aspect-h-12 bg-gray-200 group-hover:bg-gray-100 transition-colors duration-200">
        {product.imageUrl ? (
          <img
            src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:8080${product.imageUrl}`}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/300/200';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <ShoppingCartIcon className="h-16 w-16 text-white opacity-80" />
          </div>
        )}
      </div>

      {/* Action Buttons Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/products/${product.id}`)}
            className="bg-white text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            title="View Details"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.outOfStock || isAddingToCart}
            className={`p-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
              product.outOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : showAdded
                ? 'bg-green-600 text-white'
                : isProductInCart
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
            title={
              product.outOfStock
                ? 'Out of Stock'
                : showAdded
                ? 'Added to Cart!'
                : isProductInCart
                ? `In Cart (${cartQuantity})`
                : 'Add to Cart'
            }
          >
            {isAddingToCart ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : showAdded ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              <ShoppingCartIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {product.categoryName}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.brand && (
            <span className="text-sm text-gray-500">by {product.brand}</span>
          )}
        </div>
      </div>

      {/* Rating (placeholder for future implementation) */}
      <div className="absolute top-3 left-3">
        <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
          <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
          <span className="text-xs font-medium text-gray-700 ml-1">4.5</span>
        </div>
      </div>

      {/* Sale Badge (placeholder for future implementation) */}
      {product.price > 100 && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Sale
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
