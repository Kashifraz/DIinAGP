import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderAPI';
import { Order, OrderStatus, PaymentStatus } from '../types/order';
import PaymentCompletion from '../components/payment/PaymentCompletion';
import { 
  ArrowLeftIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  CreditCardIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const OrderDetails: React.FC = () => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
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
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="mt-2 text-gray-600">
            Order #{order.orderNumber}
          </p>
        </div>

        <div className="space-y-8">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Order Status</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{order.status}</span>
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-2">
                  {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Completion - Show if payment is pending */}
          {order.paymentStatus === PaymentStatus.PENDING && (
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
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
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
                        <HomeIcon className="h-8 w-8 text-gray-400" />
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
                    <div className="flex items-center space-x-4 mt-2">
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Unit Price: {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-900">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({order.totalItems} items)</span>
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
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
              Shipping Address
            </h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">
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
                <p className="mt-2 flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  {order.shippingAddress.phoneNumber}
                </p>
              )}
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
              Billing Address
            </h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {order.billingAddress.firstName} {order.billingAddress.lastName}
              </p>
              <p>{order.billingAddress.addressLine1}</p>
              {order.billingAddress.addressLine2 && (
                <p>{order.billingAddress.addressLine2}</p>
              )}
              <p>
                {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
              </p>
              <p>{order.billingAddress.country}</p>
              {order.billingAddress.phoneNumber && (
                <p className="mt-2 flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  {order.billingAddress.phoneNumber}
                </p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Payment Method</p>
                <p className="font-medium text-gray-900 capitalize">
                  {order.paymentMethod?.replace('_', ' ') || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Payment Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentIntentId && (
                <div className="md:col-span-2">
                  <p className="text-gray-600">Payment Intent ID</p>
                  <p className="font-mono text-sm text-gray-900">{order.paymentIntentId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Notes</h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">Need Help?</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Email: support@ecommerce.com
              </p>
              <p className="flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Phone: 1-800-ECOMMERCE
              </p>
              <p className="mt-3">
                If you have any questions about this order, please contact us with your order number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
