import React, { useState, useEffect } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useStripeContext } from '../../context/StripeContext';
import { paymentAPI } from '../../services/paymentAPI';
import { PaymentIntentRequest, PaymentError } from '../../types/payment';
import { 
  CreditCardIcon, 
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface PaymentFormProps {
  amount: number;
  currency: string;
  description?: string;
  orderId?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  amount,
  currency,
  description,
  orderId,
  onSuccess,
  onError,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<PaymentError | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const request: PaymentIntentRequest = {
          amount: amount,
          currency: currency,
          description: description || `Payment for ${currency.toUpperCase()} ${amount.toFixed(2)}`,
          orderId: orderId
        };

        const response = await paymentAPI.createPaymentIntent(request);
        setClientSecret(response.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        onError('Failed to initialize payment. Please try again.');
      }
    };

    createPaymentIntent();
  }, [amount, currency, description, orderId, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        const paymentError: PaymentError = {
          type: error.type || 'card_error',
          code: error.code,
          message: error.message || 'Payment failed',
          decline_code: error.decline_code
        };
        setPaymentError(paymentError);
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        onError('Payment was not successful');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError('An unexpected error occurred during payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4">
          <CreditCardIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </div>
            <div className="border border-gray-300 rounded-md p-3">
              <CardElement options={cardElementOptions} />
            </div>
            {paymentError && (
              <div className="mt-2 flex items-center text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">{paymentError.message}</span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Amount:</span>
              <span className="text-lg font-semibold text-gray-900">
                {currency.toUpperCase()} {amount.toFixed(2)}
              </span>
            </div>
            {description && (
              <div className="mt-1">
                <span className="text-xs text-gray-500">{description}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={!stripe || !clientSecret || isProcessing}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Pay {currency.toUpperCase()} {amount.toFixed(2)}
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  const { stripe, stripeConfig, isLoading, error } = useStripeContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading payment form...</span>
      </div>
    );
  }

  if (error || !stripe || !stripeConfig) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">
            {error || 'Failed to load payment system. Please refresh the page.'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripe}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm;
