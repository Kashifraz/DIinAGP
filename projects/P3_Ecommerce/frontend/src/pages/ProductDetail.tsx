import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  ShareIcon, 
  StarIcon,
  ArrowLeftIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { productAPI, ProductResponse } from '../services/productAPI';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart, getCartItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  const loadProduct = useCallback(async (productId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productAPI.getById(productId);
      setProduct(response.data);
    } catch (err) {
      setError('Failed to load product');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id));
    }
  }, [id, loadProduct]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStockStatus = () => {
    if (!product) return { text: '', color: '' };
    
    if (product.outOfStock) {
      return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    } else if (product.lowStock) {
      return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, quantity);
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const isProductInCart = product ? isInCart(product.id) : false;
  const cartQuantity = product ? getCartItemQuantity(product.id) : 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:8080${product.imageUrl}`}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/api/placeholder/600/400';
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <ShoppingCartIcon className="h-24 w-24 text-white opacity-80" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <button
                    onClick={() => navigate('/products')}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Products
                  </button>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-500">{product.categoryName}</span>
                  </div>
                </li>
              </ol>
            </nav>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {product.brand && (
                <p className="mt-2 text-lg text-gray-600">by {product.brand}</p>
              )}
            </div>

            {/* Price and Stock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.price > 100 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Sale
                  </span>
                )}
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((star) => (
                  <StarIcon
                    key={star}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.5 (128 reviews)</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.sku && (
                <div>
                  <span className="font-medium text-gray-900">SKU:</span>
                  <span className="ml-2 text-gray-600">{product.sku}</span>
                </div>
              )}
              {product.weight && (
                <div>
                  <span className="font-medium text-gray-900">Weight:</span>
                  <span className="ml-2 text-gray-600">{product.weight} lbs</span>
                </div>
              )}
              {product.dimensions && (
                <div>
                  <span className="font-medium text-gray-900">Dimensions:</span>
                  <span className="ml-2 text-gray-600">{product.dimensions}</span>
                </div>
              )}
              {product.model && (
                <div>
                  <span className="font-medium text-gray-900">Model:</span>
                  <span className="ml-2 text-gray-600">{product.model}</span>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity-input" className="text-sm font-medium text-gray-900">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    -
                  </button>
                  <input
                    id="quantity-input"
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    min="1"
                    max={product.stockQuantity}
                    className="w-16 px-2 py-2 text-center border-0 focus:ring-0 focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stockQuantity}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stockQuantity} available
                </span>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.outOfStock || isAddingToCart}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center ${
                    product.outOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : showAdded
                      ? 'bg-green-600 text-white'
                      : isProductInCart
                      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {isAddingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : showAdded ? (
                    <CheckIcon className="h-5 w-5 mr-2" />
                  ) : (
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  )}
                  {product.outOfStock
                    ? 'Out of Stock'
                    : showAdded
                    ? 'Added to Cart!'
                    : isProductInCart
                    ? `In Cart (${cartQuantity})`
                    : 'Add to Cart'}
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <HeartIcon className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <ShareIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <TruckIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">Free Shipping</span>
                </div>
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">2 Year Warranty</span>
                </div>
                <div className="flex items-center">
                  <ArrowPathIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">30 Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section (Placeholder) */}
        <div className="mt-16 border-t border-gray-200 pt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
          <div className="text-center py-12">
            <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to review this product.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
