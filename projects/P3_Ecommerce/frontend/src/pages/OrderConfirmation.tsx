import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderAPI';
import { Order, OrderStatus, PaymentStatus } from '../types/order';
import PaymentCompletion from '../components/payment/PaymentCompletion';
import { 
  CheckCircleIcon, 
  ClockIcon,
  TruckIcon,
  HomeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await orderService.getOrderByOrderNumber(orderNumber!);
      setOrder(orderData);
    } catch (err: any) {
      console.error('Error loading order:', err);
      setError(err.response?.data?.error || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    if (orderNumber) {
      loadOrder();
    }
  }, [orderNumber, loadOrder]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case OrderStatus.PROCESSING:
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case OrderStatus.SHIPPED:
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case OrderStatus.DELIVERED:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case OrderStatus.CANCELLED:
        return <ClockIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'text-yellow-600 bg-yellow-100';
      case OrderStatus.PROCESSING:
        return 'text-blue-600 bg-blue-100';
      case OrderStatus.SHIPPED:
        return 'text-blue-600 bg-blue-100';
      case OrderStatus.DELIVERED:
        return 'text-green-600 bg-green-100';
      case OrderStatus.CANCELLED:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'text-green-600 bg-green-100';
      case PaymentStatus.PENDING:
        return 'text-yellow-600 bg-yellow-100';
      case PaymentStatus.FAILED:
        return 'text-red-600 bg-red-100';
      case PaymentStatus.REFUNDED:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <ClockIcon className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We've received your order and will process it shortly.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Order Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Order #{order.orderNumber}
                </h2>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(order.totalAmount)}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Completion - Show if payment is pending */}
          {order.paymentStatus === PaymentStatus.PENDING && (
            <div className="px-6 py-4">
              <PaymentCompletion
                orderNumber={order.orderNumber}
                amount={order.totalAmount}
                currency="USD"
                onPaymentSuccess={(paymentIntentId) => {
                  // Reload order to get updated status
                  loadOrder();
                }}
                onPaymentError={(error) => {
                  console.error('Payment error:', error);
                  // Could show a toast notification here
                }}
              />
            </div>
          )}

          {/* Order Items */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
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
                        <HomeIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">
                      {item.productName}
                    </h4>
                    {item.productSku && (
                      <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                    )}
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
          </div>

          {/* Order Summary */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {order.shippingAmount === 0 ? 'Free' : formatPrice(order.shippingAmount)}
                </span>
              </div>
              <div className="flex justify-between text-base font-medium border-t border-gray-300 pt-2">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
          <div className="text-sm text-gray-600">
            <p className="font-medium">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            {order.shippingAddress.phoneNumber && (
              <p className="mt-2">Phone: {order.shippingAddress.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">What's Next?</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <p>You will receive an email confirmation shortly</p>
            </div>
            <div className="flex items-start">
              <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <p>We'll process your order within 1-2 business days</p>
            </div>
            <div className="flex items-start">
              <TruckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <p>You'll receive tracking information once your order ships</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
          >
            View All Orders
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
          >
            Continue Shopping
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
