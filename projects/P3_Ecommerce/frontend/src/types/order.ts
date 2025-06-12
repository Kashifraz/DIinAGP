export interface Address {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

export interface CheckoutRequest {
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku?: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentIntentId?: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  userId: number;
  userEmail: string;
  userName: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface OrderPageResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface CheckoutContextType {
  // Checkout state
  shippingAddress: Address | null;
  billingAddress: Address | null;
  paymentMethod: string;
  notes: string;
  isProcessing: boolean;
  error: string | null;
  
  // Checkout actions
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address) => void;
  setPaymentMethod: (method: string) => void;
  setNotes: (notes: string) => void;
  processCheckout: () => Promise<Order | null>;
  clearCheckout: () => void;
  
  // Address utilities
  isSameAsShipping: boolean;
  setIsSameAsShipping: (same: boolean) => void;
  copyShippingToBilling: () => void;
}
