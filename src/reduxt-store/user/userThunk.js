import { createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../api";

// AuthResponse from User-Services: { jwt, title, message, userResponse }
const normalizeAuth = (data) => ({ ...data, user: data.userResponse });

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      if (data.jwt) {
        localStorage.setItem("accessToken", data.jwt);
      }
      return normalizeAuth(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Invalid email or password."));
    }
  },
);

// payload: { fullName, email, password, phoneNumber?, role }
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ fullName, email, password, phoneNumber, role }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/signup", {
        fullName,
        email,
        password,
        phoneNumber: phoneNumber || null,
        role,
      });
      if (data.jwt) {
        localStorage.setItem("accessToken", data.jwt);
      }
      return normalizeAuth(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to register user."));
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/users/profile");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch user profile."));
    }
  },
);

// payload: { fullName, phoneNumber, profileImage }
export const updateUser = createAsyncThunk(
  "auth/updatedUser",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/api/users/update-profile", payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update user profile."));
    }
  },
);
