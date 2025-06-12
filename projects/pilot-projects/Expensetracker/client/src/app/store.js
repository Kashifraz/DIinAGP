import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import transactionReducer from '../features/transactions/transactionSlice';
import categoryReducer from '../features/categories/categorySlice';
import budgetReducer from '../features/budgets/budgetSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    categories: categoryReducer,
    budgets: budgetReducer,
  },
}); 