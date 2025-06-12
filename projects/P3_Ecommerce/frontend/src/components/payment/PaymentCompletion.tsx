import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { paymentAPI } from '../../services/paymentAPI';

interface PaymentCompletionProps {
  orderNumber: string;
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

const PaymentCompletion: React.FC<PaymentCompletionProps> = ({
  orderNumber,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError
}) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompletePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Create payment intent for the order
      const paymentIntent = await paymentAPI.createPaymentIntentForOrder(orderNumber);
      
      // Navigate to payment form with order details
      navigate('/checkout', { 
        state: { 
          orderNumber,
          paymentIntentId: paymentIntent.id,
          amount,
          currency,
          isPaymentCompletion: true
        }
      });

    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      const errorMessage = err.response?.data?.error || 'Failed to initialize payment. Please try again.';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start">
        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Payment Required
          </h3>
          <p className="text-yellow-700 mb-4">
            Your order has been created but payment is still pending. Complete your payment to confirm your order.
          </p>
          
          <div className="bg-white rounded-md p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Order Total:</span>
              <span className="text-lg font-semibold text-gray-900">
                {currency.toUpperCase()} {amount.toFixed(2)}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-xs text-gray-500">Order #{orderNumber}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleCompletePayment}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Complete Payment
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCompletion;
