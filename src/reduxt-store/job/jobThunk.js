import { createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../api";

const cleanParams = (params = {}) => {
  const clean = {};
  for (const [key, val] of Object.entries(params)) {
    if (val == null || val === "") continue;
    clean[key] = Array.isArray(val) ? val.join(",") : val;
  }
  return clean;
};

// Job-Service filters on keyword (title / description / requirements / category),
// status, jobType, workMode, experienceLevel, categoryId, companyId, skillIds,
// tagIds, location and salary.
export const fetchJobs = createAsyncThunk(
  "job/fetchJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/jobs/all", {
        params: cleanParams({ status: "OPEN", ...params }),
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch jobs."));
    }
  },
);

export const fetchMyJobs = createAsyncThunk(
  "job/fetchMyJobs",
  async (companyId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/jobs/company/${companyId}`);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch jobs"));
    }
  },
);

export const fetchJobById = createAsyncThunk(
  "job/fetchJobById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/jobs/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch job"));
    }
  },
);

export const createJob = createAsyncThunk(
  "job/createJob",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/jobs/create", payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to create job"));
    }
  },
);

export const updateJob = createAsyncThunk(
  "job/updateJob",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/jobs/update/${id}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to update job"));
    }
  },
);

export const publishJob = createAsyncThunk(
  "job/publishJob",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/jobs/publish/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to publish job"));
    }
  },
);

export const closeJob = createAsyncThunk(
  "job/closeJob",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/jobs/close/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to close job"));
    }
  },
);

export const fetchAllJobsAdmin = createAsyncThunk(
  "job/fetchAllJobsAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/jobs/admin");
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch jobs"));
    }
  },
);

export const deleteJob = createAsyncThunk(
  "job/deleteJob",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/jobs/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to delete job"));
    }
  },
);
