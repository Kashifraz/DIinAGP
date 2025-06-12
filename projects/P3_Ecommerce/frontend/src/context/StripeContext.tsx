import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { paymentAPI } from '../services/paymentAPI';
import { StripeConfig } from '../types/payment';

interface StripeContextType {
  stripe: Stripe | null;
  stripeConfig: StripeConfig | null;
  isLoading: boolean;
  error: string | null;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const useStripeContext = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripeContext must be used within a StripeProvider');
  }
  return context;
};

interface StripeProviderProps {
  children: ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get Stripe configuration from backend
        const config = await paymentAPI.getStripeConfig();
        setStripeConfig(config);

        // Initialize Stripe with publishable key
        const stripeInstance = await loadStripe(config.publishableKey);
        setStripe(stripeInstance);

      } catch (err) {
        console.error('Error initializing Stripe:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Stripe');
      } finally {
        setIsLoading(false);
      }
    };

    initializeStripe();
  }, []);

  const value: StripeContextType = {
    stripe,
    stripeConfig,
    isLoading,
    error,
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};
