import React from 'react';
import { XCircleIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface PaymentErrorProps {
  error: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

const PaymentError: React.FC<PaymentErrorProps> = ({
  error,
  onRetry,
  onCancel
}) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mb-6">
        <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-4">
          We encountered an issue processing your payment.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>

      <div className="space-y-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Try Again
          </button>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Go Back
          </button>
        )}

        <Link
          to="/cart"
          className="w-full text-blue-600 py-2 px-4 rounded-md font-medium hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Return to Cart
        </Link>

        <Link
          to="/"
          className="w-full text-gray-600 py-2 px-4 rounded-md font-medium hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default PaymentError;
