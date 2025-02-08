import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  categoryList: [],
};

// Add New Category
export const addNewCategory = createAsyncThunk(
  "/categories/addNewCategory",
  async (formData, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/categories/add`;

    // Log the URL and FormData being sent
    console.log("URL for Add Category API:", url);
    console.log("FormData sent to Add Category API:", formData);

    try {
      const result = await axios.post(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Log the API response
      console.log("Response from Add Category API:", result.data);
      return result.data;
    } catch (error) {
      // Log the error details for debugging
      console.error("Error adding new category:", {
        message: error.message,
        response: error.response?.data,
        url,
      });

      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// Fetch All Categories
export const fetchAllCategories = createAsyncThunk(
  "/categories/fetchAllCategories",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/categories/get`;
    try {
      const result = await axios.get(url);
      console.log("Response from fetchAllCategories:", result.data);
      return result.data;
    } catch (error) {
      console.error("Error fetching all categories from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Edit Category
export const editCategory = createAsyncThunk(
  "/categories/editCategory",
  async ({ id, formData }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/categories/edit/${id}`;
    console.log("formData for editCategory:", formData);
    try {
      const result = await axios.put(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Response from editCategory:", result.data);
      return result.data;
    } catch (error) {
      console.error("Error editing category from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete Category
export const deleteCategory = createAsyncThunk(
  "/categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/admin/categories/delete/${id}`;
    try {
      const result = await axios.delete(url);
      return result.data;
    } catch (error) {
      console.error("Error deleting category from URL:", url, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const AdminCategoriesSlice = createSlice({
  name: "adminCategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchAllCategories lifecycle
      .addCase(fetchAllCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryList = action.payload.data;
      })
      .addCase(fetchAllCategories.rejected, (state) => {
        state.isLoading = false;
        state.categoryList = [];
      });
  },
});

export default AdminCategoriesSlice.reducer;