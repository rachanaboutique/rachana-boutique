import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
};

// Fetch all filtered products
export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams }, { rejectWithValue }) => {
    // Log the thunk function for debugging purposes
    console.log("fetchAllFilteredProducts thunk invoked");
    
    const query = new URLSearchParams({
      ...filterParams,
      sortBy: sortParams,
    }).toString();

    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/products/get?${query}`;
    console.log("Fetching all filtered products from URL:", url);
    
    try {
      const result = await axios.get(url);
      console.log("Response from fetchAllFilteredProducts:", result);
      return result.data;
    } catch (error) {
      console.error("Error fetching all filtered products from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch product details
export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/shop/products/get/${id}`;
    console.log("Fetching product details from URL:", url);
    
    try {
      const result = await axios.get(url);
      console.log("Response from fetchProductDetails:", result);
      return result.data;
    } catch (error) {
      console.error("Error fetching product details from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllFilteredProducts
      .addCase(fetchAllFilteredProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state) => {
        state.isLoading = false;
        state.productList = [];
      })
      // Handle fetchProductDetails
      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state) => {
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});

export const { setProductDetails } = shoppingProductSlice.actions;
export default shoppingProductSlice.reducer;