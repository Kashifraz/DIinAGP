export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  description?: string;
  customerId?: string;
  paymentMethodId?: string;
  orderId?: string;
}

export interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  paymentMethod?: string;
  customerId?: string;
  orderId?: string;
  created?: number;
}

export interface StripeConfig {
  publishableKey: string;
  currency: string;
}

export interface CreateCustomerRequest {
  email: string;
  name: string;
}

export interface CreateCustomerResponse {
  customerId: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  name: string;
  email: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface PaymentError {
  type: string;
  code?: string;
  message: string;
  decline_code?: string;
}

export interface PaymentStatus {
  isProcessing: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: PaymentError;
}
