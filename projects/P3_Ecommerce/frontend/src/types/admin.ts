export interface AdminOrderFilters {
  status?: string;
  paymentStatus?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface AdminOrderResponse {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  userEmail: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  orderItems?: AdminOrderItem[];
  shippingAddress?: AdminAddress;
  billingAddress?: AdminAddress;
}

export interface AdminOrderItem {
  id: number;
  productName: string;
  productSku: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface AdminAddress {
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

export interface AdminOrderPageResponse {
  content: AdminOrderResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface BulkStatusUpdateRequest {
  orderIds: number[];
  status: string;
}

export interface BulkPaymentStatusUpdateRequest {
  orderIds: number[];
  paymentStatus: string;
}

export interface BulkUpdateResponse {
  updatedCount: number;
  updatedOrders: AdminOrderResponse[];
}

export interface OrderAnalytics {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidOrders: number;
  pendingPaymentOrders: number;
  failedPaymentOrders: number;
  refundedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalTax: number;
  totalShipping: number;
  ordersByStatus?: Record<string, number>;
  ordersByPaymentStatus?: Record<string, number>;
  revenueByMonth?: Record<string, number>;
  ordersByMonth?: Record<string, number>;
  periodStart?: string;
  periodEnd?: string;
}

export interface OrderStatusUpdate {
  orderId: number;
  status: string;
}

export interface PaymentStatusUpdate {
  orderId: number;
  paymentStatus: string;
}

export interface ExportOptions {
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderTableColumn {
  key: keyof AdminOrderResponse;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, order: AdminOrderResponse) => React.ReactNode;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  paidOrders: number;
}
