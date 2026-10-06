import { createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../api";

// category thunks

export const fetchCategories = createAsyncThunk(
  "jobMeta/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/job-categories/all");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch categories."));
    }
  },
);

export const createCategory = createAsyncThunk(
  "jobMeta/createCategory",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/job-categories/create", payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create category."));
    }
  },
);

export const updateCategory = createAsyncThunk(
  "jobMeta/updateCategory",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/job-categories/update/${id}`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update category."));
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "jobMeta/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/job-categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete category."));
    }
  },
);

// skill thunks

export const fetchSkills = createAsyncThunk(
  "jobMeta/fetchSkills",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/job-skills/all");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch skills."));
    }
  },
);

export const createSkill = createAsyncThunk(
  "jobMeta/createSkill",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/job-skills/create", payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create skill."));
    }
  },
);

export const updateSkill = createAsyncThunk(
  "jobMeta/updateSkill",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/job-skills/update/${id}`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update skill."));
    }
  },
);

export const deleteSkill = createAsyncThunk(
  "jobMeta/deleteSkill",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/job-skills/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete skill."));
    }
  },
);

// tag thunks

export const fetchTags = createAsyncThunk(
  "jobMeta/fetchTags",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/job-tags/all");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch tags."));
    }
  },
);

export const createTag = createAsyncThunk(
  "jobMeta/createTag",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/job-tags/create", payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create tag."));
    }
  },
);

export const updateTag = createAsyncThunk(
  "jobMeta/updateTag",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/job-tags/update/${id}`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update tag."));
    }
  },
);

export const deleteTag = createAsyncThunk(
  "jobMeta/deleteTag",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/job-tags/delete/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete tag."));
    }
  },
);
