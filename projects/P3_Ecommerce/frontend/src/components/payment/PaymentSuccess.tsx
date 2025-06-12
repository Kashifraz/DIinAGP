import React from 'react';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface PaymentSuccessProps {
  paymentIntentId: string;
  orderNumber?: string;
  amount: number;
  currency: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  paymentIntentId,
  orderNumber,
  amount,
  currency
}) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mb-6">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600">
          Your payment has been processed successfully.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-mono text-gray-900">{paymentIntentId}</span>
          </div>
          {orderNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-mono text-gray-900">{orderNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-gray-900">
              {currency.toUpperCase()} {amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {orderNumber && (
          <Link
            to={`/order-confirmation/${orderNumber}`}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
          >
            View Order Details
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Link>
        )}
        
        <Link
          to="/orders"
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center"
        >
          View All Orders
        </Link>

        <Link
          to="/"
          className="w-full text-blue-600 py-2 px-4 rounded-md font-medium hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
