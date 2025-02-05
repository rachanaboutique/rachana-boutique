import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
};

export const getFeatureImages = createAsyncThunk(
  "order/getFeatureImages",
  async (_, { rejectWithValue }) => {
    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/common/feature/get`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching feature images from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addFeatureImage = createAsyncThunk(
  "order/addFeatureImage",
  async (image, { rejectWithValue }) => {
    // Construct the URL using Vite's environment variable
    const url = `${import.meta.env.VITE_BACKEND_URL}/common/feature/add`;

    try {
      const response = await axios.post(url, { image });
      return response.data;
    } catch (error) {
      console.error("Error adding feature image from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      });
  },
});

export default commonSlice.reducer;