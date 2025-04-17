import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

// Register User
export const registerUser = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/auth/register`;
    try {
      const response = await axios.post(url, formData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Login User
export const loginUser = createAsyncThunk(
  "/auth/login",
  async (formData, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/auth/login`;
    try {
      const response = await axios.post(url, formData);
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens in localStorage
      if (accessToken && refreshToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`;
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      return rejectWithValue("No refresh token found");
    }

    try {
      const response = await axios.post(url, { refreshToken });
      const { accessToken } = response.data;

      // Store the new access token in localStorage
      localStorage.setItem("accessToken", accessToken);

      return { accessToken };
    } catch (error) {
      localStorage.removeItem("refreshToken"); // Clear refresh token if invalid
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Check Authentication
export const checkAuth = createAsyncThunk(
  "auth/checkauth",
  async (_, { rejectWithValue, dispatch }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/auth/check-auth`;
    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return rejectWithValue("No access token found");
    }

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Attempt to refresh the token on expiration
        try {
          const refreshResponse = await dispatch(refreshToken()).unwrap();

          accessToken = refreshResponse.accessToken;

          if (accessToken) {
            // Retry the check-auth request with the new access token
            const retryResponse = await axios.get(url, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            return retryResponse.data;
          }
        } catch (refreshError) {
          return rejectWithValue(refreshError.response?.data || refreshError.message);
        }
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Logout User
export const logoutUser = createAsyncThunk("/auth/logout", async () => {
  // Remove tokens from localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  return { success: true };
});


export const forgotPassword = createAsyncThunk(
  "/auth/forgot-password",
  async (formData, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`;
    try {
      const response = await axios.post(url, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "/auth/reset-password",
  async ({ token, newPassword }, { rejectWithValue }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/auth/reset-password`;
    try {
      const response = await axios.post(url, { token, newPassword });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch User Profile
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue, dispatch }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/auth/profile`;
    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      return rejectWithValue("No access token found");
    }

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Attempt to refresh the token on expiration
        try {
          const refreshResponse = await dispatch(refreshToken()).unwrap();
          accessToken = refreshResponse.accessToken;

          if (accessToken) {
            // Retry the request with the new access token
            const retryResponse = await axios.get(url, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            return retryResponse.data;
          }
        } catch (refreshError) {
          return rejectWithValue(refreshError.response?.data || refreshError.message);
        }
      }

      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })

      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })


      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
