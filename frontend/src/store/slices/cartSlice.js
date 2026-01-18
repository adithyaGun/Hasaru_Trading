import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../api';
import toast from 'react-hot-toast';

const initialState = {
  items: [],
  summary: {
    subtotal: 0,
    discount_amount: 0,
    total: 0,
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.get();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product_id, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.add({ product_id, quantity });
      toast.success('Added to cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ product_id, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.update({ product_id, quantity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await cartAPI.remove(productId);
      toast.success('Removed from cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.summary = {
        subtotal: 0,
        discount_amount: 0,
        total: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.summary = action.payload.summary;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to cart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.summary = action.payload.summary;
      })
      // Update cart
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.summary = action.payload.summary;
      })
      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.summary = action.payload.summary;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
