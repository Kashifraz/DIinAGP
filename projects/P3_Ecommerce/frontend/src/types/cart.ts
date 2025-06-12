export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
  subtotal: number;
  tax: number;
  shipping: number;
  grandTotal: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartContextType {
  // Cart state
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  
  // Cart actions
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  
  // Cart status
  isInCart: (productId: number) => boolean;
  getCartItemQuantity: (productId: number) => number;
}
