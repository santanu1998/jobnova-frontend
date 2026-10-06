import { createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../api";

// SavedJobResponse: { id, candidateId, jobId, savedAt }
export const fetchMySavedJobs = createAsyncThunk(
  "savedJob/fetchMySavedJobs",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/saved-jobs/get-all");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch saved jobs."));
    }
  },
);

export const saveJob = createAsyncThunk(
  "savedJob/save",
  async ({ jobId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/saved-jobs/save", { jobId });
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to save job"));
    }
  },
);

export const unsaveJob = createAsyncThunk(
  "savedJob/unsave",
  async (savedJobId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/saved-jobs/unsave/${savedJobId}`);
      return savedJobId;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to remove saved job"));
    }
  },
);
