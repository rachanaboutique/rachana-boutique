import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  isLoading: false,
};

// Add to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity, colorId }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/cart/add`;
    try {
      const response = await axios.post(url, { userId, productId, quantity, colorId });
      return response.data;
    } catch (error) {
      console.error("Error adding to cart from URL:", url, error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Cart Items
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/cart/get/${userId}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching cart items from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete Cart Item
export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId, colorId }, { rejectWithValue }) => {
    // If colorId is provided, use it in the URL
    const url = colorId
      ? `${import.meta.env.VITE_BACKEND_URL}/shop/cart/${userId}/${productId}/${colorId}`
      : `${import.meta.env.VITE_BACKEND_URL}/shop/cart/${userId}/${productId}`;

    try {
      const response = await axios.delete(url);
      return response.data;
    } catch (error) {
      console.error("Error deleting cart item from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update Cart Quantity
export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity, colorId }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/cart/update-cart`;
    try {
      const response = await axios.put(url, { userId, productId, quantity, colorId });
      return response.data;
    } catch (error) {
      console.error("Error updating cart quantity from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = Array.isArray(action.payload.data?.items)
          ? action.payload.data.items.map(item => ({
              ...item,
              colors: item.colors || [],
            }))
          : [];
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      // Fetch Cart Items
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = Array.isArray(action.payload.data?.items)
          ? action.payload.data.items.map(item => ({
              ...item,
              colors: item.colors || [],
            }))
          : [];
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      // Update Cart Quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = Array.isArray(action.payload.data?.items)
          ? action.payload.data.items.map(item => ({
              ...item,
              colors: item.colors || [],
            }))
          : [];
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      // Delete Cart Item
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = Array.isArray(action.payload.data?.items)
          ? action.payload.data.items.map(item => ({
              ...item,
              colors: item.colors || [],
            }))
          : [];
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      });
  },
});

export default shoppingCartSlice.reducer;
