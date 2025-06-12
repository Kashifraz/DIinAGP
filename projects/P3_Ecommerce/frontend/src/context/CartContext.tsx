import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { CartItem, CartSummary, CartContextType } from '../types/cart';
import cartService from '../services/cartAPI';

// Cart state interface
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

// Cart action types
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART_SUMMARY'; payload: CartSummary }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'CLEAR_CART' }
  | { type: 'REFRESH_CART'; payload: CartSummary };

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalQuantity: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CART_SUMMARY':
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalQuantity: action.payload.totalQuantity,
        totalPrice: action.payload.totalPrice,
        isLoading: false,
        error: null,
      };
    
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(item => item.productId === action.payload.productId);
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = action.payload;
        return {
          ...state,
          items: updatedItems,
          totalPrice: state.totalPrice + (action.payload.totalPrice - state.items[existingItemIndex].totalPrice),
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
          totalItems: state.totalItems + 1,
          totalQuantity: state.totalQuantity + action.payload.quantity,
          totalPrice: state.totalPrice + action.payload.totalPrice,
        };
      }
    }
    
    case 'UPDATE_ITEM': {
      const updateIndex = state.items.findIndex(item => item.productId === action.payload.productId);
      if (updateIndex >= 0) {
        const updatedItems = [...state.items];
        const oldItem = updatedItems[updateIndex];
        updatedItems[updateIndex] = action.payload;
        return {
          ...state,
          items: updatedItems,
          totalQuantity: state.totalQuantity - oldItem.quantity + action.payload.quantity,
          totalPrice: state.totalPrice - oldItem.totalPrice + action.payload.totalPrice,
        };
      }
      return state;
    }
    
    case 'REMOVE_ITEM': {
      const removeIndex = state.items.findIndex(item => item.productId === action.payload);
      if (removeIndex >= 0) {
        const removedItem = state.items[removeIndex];
        const updatedItems = state.items.filter((_, index) => index !== removeIndex);
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems - 1,
          totalQuantity: state.totalQuantity - removedItem.quantity,
          totalPrice: state.totalPrice - removedItem.totalPrice,
        };
      }
      return state;
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalQuantity: 0,
        totalPrice: 0,
      };
    
    case 'REFRESH_CART':
      // Same as SET_CART_SUMMARY - both update cart with new data
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalQuantity: action.payload.totalQuantity,
        totalPrice: action.payload.totalPrice,
        isLoading: false,
        error: null,
      };
    
    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Refresh cart from server
  const refreshCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const summary = await cartService.getCartSummary();
      dispatch({ type: 'REFRESH_CART', payload: summary });
    } catch (error) {
      console.error('Error refreshing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  }, []); // Empty dependency array - function is stable

  // Load cart on mount and when user changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshCart();
    } else {
      // Clear cart if no token
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [refreshCart]); // Include refreshCart in dependencies

  // Add item to cart
  const addToCart = useCallback(async (productId: number, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newItem = await cartService.addToCart({ productId, quantity });
      dispatch({ type: 'ADD_ITEM', payload: newItem });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedItem = await cartService.updateQuantity(productId, quantity);
      dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error updating quantity:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update quantity' });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartService.removeFromCart(productId);
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  // Check if product is in cart
  const isInCart = useCallback((productId: number): boolean => {
    return state.items.some(item => item.productId === productId);
  }, [state.items]);

  // Get cart item quantity
  const getCartItemQuantity = useCallback((productId: number): number => {
    const item = state.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }, [state.items]);

  const contextValue: CartContextType = useMemo(() => ({
    items: state.items,
    totalItems: state.totalItems,
    totalQuantity: state.totalQuantity,
    totalPrice: state.totalPrice,
    isLoading: state.isLoading,
    error: state.error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    isInCart,
    getCartItemQuantity,
  }), [
    state.items,
    state.totalItems,
    state.totalQuantity,
    state.totalPrice,
    state.isLoading,
    state.error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    isInCart,
    getCartItemQuantity,
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
