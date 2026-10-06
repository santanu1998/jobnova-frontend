import { createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../api";

export const fetchAllUsers = createAsyncThunk(
  "adminUser/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/users/all");
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch users."));
    }
  },
);

export const suspendUser = createAsyncThunk(
  "adminUser/suspendUser",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/users/${id}/suspend`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to suspend user."));
    }
  },
);

export const activateUser = createAsyncThunk(
  "adminUser/activateUser",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/users/${id}/activate`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to activate user."));
    }
  },
);

// Backend soft-deletes: returns the UserResponse with status DELETED
export const deleteUser = createAsyncThunk(
  "adminUser/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/api/users/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete user."));
    }
  },
);
