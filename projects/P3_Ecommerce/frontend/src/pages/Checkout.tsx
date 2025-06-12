import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderAPI';
import { Address, CheckoutRequest } from '../types/order';
import AddressForm from '../components/checkout/AddressForm';
import OrderSummary from '../components/checkout/OrderSummary';
import PaymentForm from '../components/payment/PaymentForm';
import PaymentSuccess from '../components/payment/PaymentSuccess';
import PaymentError from '../components/payment/PaymentError';
import { 
  CreditCardIcon, 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phoneNumber: ''
  });
  
  const [billingAddress, setBillingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phoneNumber: ''
  });
  
  const [isSameAsShipping, setIsSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressErrors, setAddressErrors] = useState<{
    shipping: Partial<Record<keyof Address, string>>;
    billing: Partial<Record<keyof Address, string>>;
  }>({ shipping: {}, billing: {} });

  // Payment-related state
  const [currentStep, setCurrentStep] = useState<'address' | 'payment' | 'success' | 'error'>('address');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Payment completion mode (for existing orders)
  const [isPaymentCompletion, setIsPaymentCompletion] = useState(false);
  const [existingOrderAmount, setExistingOrderAmount] = useState<number | null>(null);
  const [existingOrderCurrency, setExistingOrderCurrency] = useState<string>('USD');

  // Handle payment completion mode
  useEffect(() => {
    if (location.state?.isPaymentCompletion) {
      setIsPaymentCompletion(true);
      setOrderNumber(location.state.orderNumber);
      setExistingOrderAmount(location.state.amount);
      setExistingOrderCurrency(location.state.currency || 'USD');
      setCurrentStep('payment');
    }
  }, [location.state]);

  // Redirect if not authenticated or cart is empty (only for new orders)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!isPaymentCompletion && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, cartItems.length, navigate, isPaymentCompletion]);

  // Auto-fill billing address when "same as shipping" is checked
  useEffect(() => {
    if (isSameAsShipping) {
      setBillingAddress(shippingAddress);
    }
  }, [isSameAsShipping, shippingAddress]);

  const calculateTotals = () => {
    if (isPaymentCompletion && existingOrderAmount !== null) {
      // For payment completion, use the existing order amount
      return { 
        subtotal: existingOrderAmount, 
        tax: 0, 
        shipping: 0, 
        total: existingOrderAmount 
      };
    }
    
    // For new orders, calculate from cart
    const subtotal = totalPrice;
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal >= 50 ? 0 : 10; // Free shipping over $50
    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total };
  };

  const validateAddress = (address: Address, type: 'shipping' | 'billing') => {
    const errors: Partial<Record<keyof Address, string>> = {};
    
    if (!address.firstName.trim()) errors.firstName = 'First name is required';
    if (!address.lastName.trim()) errors.lastName = 'Last name is required';
    if (!address.addressLine1.trim()) errors.addressLine1 = 'Address is required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.state.trim()) errors.state = 'State/Province is required';
    if (!address.postalCode.trim()) errors.postalCode = 'Postal code is required';
    if (!address.country.trim()) errors.country = 'Country is required';
    
    setAddressErrors(prev => ({
      ...prev,
      [type]: errors
    }));
    
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = async () => {
    setError(null);
    
    // Validate addresses
    const isShippingValid = validateAddress(shippingAddress, 'shipping');
    const isBillingValid = validateAddress(billingAddress, 'billing');
    
    if (!isShippingValid || !isBillingValid) {
      setError('Please fill in all required address fields');
      return;
    }
    
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const checkoutRequest: CheckoutRequest = {
        paymentMethod,
        shippingAddress,
        billingAddress,
        notes: notes.trim() || undefined
      };
      
      const order = await orderService.createOrder(checkoutRequest);
      setOrderNumber(order.orderNumber);
      
      // Move to payment step
      setCurrentStep('payment');
      
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentIntentId(paymentIntentId);
    setCurrentStep('success');
    clearCart(); // Clear cart after successful payment
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setCurrentStep('error');
  };

  const handleRetryPayment = () => {
    setPaymentError(null);
    setCurrentStep('payment');
  };

  const handleCancelPayment = () => {
    setCurrentStep('address');
  };

  const copyShippingToBilling = () => {
    setBillingAddress(shippingAddress);
    setIsSameAsShipping(true);
  };

  const { subtotal, tax, shipping, total } = calculateTotals();

  if (!isAuthenticated || (!isPaymentCompletion && cartItems.length === 0)) {
    return null; // Will redirect
  }

  // Render success page
  if (currentStep === 'success' && paymentIntentId && orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <PaymentSuccess
          paymentIntentId={paymentIntentId}
          orderNumber={orderNumber}
          amount={total}
          currency="USD"
        />
      </div>
    );
  }

  // Render error page
  if (currentStep === 'error' && paymentError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <PaymentError
          error={paymentError}
          onRetry={handleRetryPayment}
          onCancel={handleCancelPayment}
        />
      </div>
    );
  }

  // Render payment form
  if (currentStep === 'payment' && orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={isPaymentCompletion ? () => navigate(`/orders/${orderNumber}`) : handleCancelPayment}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              {isPaymentCompletion ? 'Back to Order' : 'Back to Address'}
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isPaymentCompletion ? 'Complete Payment' : 'Payment'}
            </h1>
            <p className="mt-2 text-gray-600">
              {isPaymentCompletion 
                ? 'Complete your payment to confirm your order'
                : 'Complete your payment securely'
              }
            </p>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Payment Form */}
            <div className="lg:col-span-8">
              <PaymentForm
                amount={total}
                currency={existingOrderCurrency}
                description={`Payment for order #${orderNumber}`}
                orderId={orderNumber}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={isPaymentCompletion ? () => navigate(`/orders/${orderNumber}`) : handleCancelPayment}
              />
            </div>

            {/* Order Summary - only show for new orders */}
            {!isPaymentCompletion && (
              <div className="lg:col-span-4 mt-8 lg:mt-0">
                <OrderSummary
                  cartItems={cartItems}
                  subtotal={subtotal}
                  tax={tax}
                  shipping={shipping}
                  total={total}
                />
              </div>
            )}

            {/* Payment Summary for existing orders */}
            {isPaymentCompletion && (
              <div className="lg:col-span-4 mt-8 lg:mt-0">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium text-gray-900">#{orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-900">
                        {existingOrderCurrency.toUpperCase()} {total.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>{existingOrderCurrency.toUpperCase()} {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render address form (default step)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">
            Complete your order securely
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-8 space-y-8">
            {/* Shipping Address */}
            <AddressForm
              title="Shipping Address"
              address={shippingAddress}
              onChange={setShippingAddress}
              errors={addressErrors.shipping}
            />

            {/* Billing Address */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sameAsShipping"
                    checked={isSameAsShipping}
                    onChange={(e) => setIsSameAsShipping(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sameAsShipping" className="ml-2 text-sm text-gray-700">
                    Same as shipping address
                  </label>
                </div>
              </div>
              
              {!isSameAsShipping && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={copyShippingToBilling}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Copy from shipping address
                  </button>
                </div>
              )}
              
              <AddressForm
                title=""
                address={billingAddress}
                onChange={setBillingAddress}
                errors={addressErrors.billing}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <CreditCardIcon className="h-4 w-4 inline mr-2" />
                    Credit Card
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">PayPal</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">Bank Transfer</span>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Notes (Optional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special instructions for your order..."
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="mt-8 lg:mt-0 lg:col-span-4">
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              total={total}
            />

            {/* Place Order Button */}
            <div className="mt-6">
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
