import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/budgets';

// Get all budgets
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get budget overview
export const fetchBudgetOverview = createAsyncThunk(
  'budgets/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/overview`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create budget
export const createBudget = createAsyncThunk(
  'budgets/create',
  async (budgetData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, budgetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update budget
export const updateBudget = createAsyncThunk(
  'budgets/update',
  async ({ id, budgetData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, budgetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete budget
export const deleteBudget = createAsyncThunk(
  'budgets/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  budgets: [],
  overview: null,
  isLoading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch budgets';
      })
      // Fetch budget overview
      .addCase(fetchBudgetOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgetOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload;
      })
      .addCase(fetchBudgetOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch budget overview';
      })
      // Create budget
      .addCase(createBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets.push(action.payload);
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create budget';
      })
      // Update budget
      .addCase(updateBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.budgets.findIndex(
          (b) => b._id === action.payload._id
        );
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update budget';
      })
      // Delete budget
      .addCase(deleteBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = state.budgets.filter(
          (b) => b._id !== action.payload
        );
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete budget';
      });
  },
});

export const { clearError } = budgetSlice.actions;

export default budgetSlice.reducer; 