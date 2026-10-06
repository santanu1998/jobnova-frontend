import { createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../api";

// Application-Service returns flat AI fields (aiScore, aishortListStatus), filled
// in by background AI screening. The UI reads them from `app.screening`.
export const deriveShortlistStatus = (score) => {
  if (score == null) return "NOT_SCREENED";
  if (score >= 80) return "AUTO_SHORTLISTED";
  if (score >= 60) return "REVIEW_RECOMMENDED";
  if (score >= 40) return "PENDING_REVIEW";
  return "LOW_MATCH";
};

export const normalizeApplication = (app) => {
  if (!app) return app;
  const score = app.aiScore ?? null;
  const shortlistStatus =
    app.aishortListStatus ?? (score != null ? deriveShortlistStatus(score) : null);
  return {
    ...app,
    notes: app.notes ?? [],
    screening:
      score != null || (shortlistStatus && shortlistStatus !== "NOT_SCREENED")
        ? { overallScore: score ?? 0, shortlistStatus }
        : null,
  };
};

const normalizeList = (list) => (list ?? []).map(normalizeApplication);

export const fetchCompanyApplications = createAsyncThunk(
  "application/fetchCompanyApplications",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (filters.jobId && filters.jobId !== "all") params.jobId = filters.jobId;
      if (filters.status) params.status = filters.status;
      if (filters.isStarred) params.isStarred = true;
      if (filters.minAiScore != null) params.minAiScore = filters.minAiScore;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      // unscreened applications have no status stored, so that filter stays client-side
      const notScreened = filters.aiShortlistStatus === "NOT_SCREENED";
      if (filters.aiShortlistStatus && !notScreened)
        params.aiShortListStatus = filters.aiShortlistStatus;

      const { data } = await api.get("/api/applications/company", { params });
      const list = normalizeList(data);
      return notScreened ? list.filter((a) => !a.screening) : list;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch applications."));
    }
  },
);

export const fetchJobApplications = createAsyncThunk(
  "application/fetchJobApplications",
  async (jobId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/applications/job/${jobId}`);
      return normalizeList(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch applications."));
    }
  },
);

export const fetchApplicationById = createAsyncThunk(
  "application/fetchApplicationById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/applications/${id}`);
      return normalizeApplication(data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch application"));
    }
  },
);

// ── Update application status ─────────────────────────────────────────────────

export const updateApplicationStatus = createAsyncThunk(
  "application/updateApplicationStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/applications/${id}/status`, { status });
      return normalizeApplication(data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to update status"));
    }
  },
);

// ── Toggle star ───────────────────────────────────────────────────────────────

export const toggleStar = createAsyncThunk(
  "application/toggleStar",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/applications/${id}/star`);
      return normalizeApplication(data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to toggle star"));
    }
  },
);

// ── Candidate: fetch own applications ─────────────────────────────────────────

export const fetchMyApplications = createAsyncThunk(
  "application/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/applications/all");
      return normalizeList(data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch applications"));
    }
  },
);

// ── Candidate: withdraw application ──────────────────────────────────────────

export const withdrawApplication = createAsyncThunk(
  "application/withdraw",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/applications/${id}/withdraw`, { reason });
      return normalizeApplication(data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to withdraw application"));
    }
  },
);

// ── Candidate: submit application ─────────────────────────────────────────────
// payload: { jobId, resumeId, coverLetter?, expectedSalary?, availableFrom? (yyyy-MM-dd) }

export const submitApplication = createAsyncThunk(
  "application/submit",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/applications/create", payload);
      return normalizeApplication(data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to submit application"));
    }
  },
);

// ── Employer: AI screening + resume of an application ────────────────────────

// Re-runs AI screening; returns ApplicationScreeningResponse (score, matched skills, summary...)
export const screenApplication = createAsyncThunk(
  "application/screen",
  async (applicationId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/applications/${applicationId}/screen`);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "AI screening failed"));
    }
  },
);

export const fetchApplicationResume = createAsyncThunk(
  "application/fetchResume",
  async (applicationId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/applications/${applicationId}/resume`);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to load resume"));
    }
  },
);

// ── Notes ─────────────────────────────────────────────────────────────────────

export const addNote = createAsyncThunk(
  "application/addNote",
  async ({ applicationId, content }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/application-notes/${applicationId}/add`, {
        content,
      });
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to add note"));
    }
  },
);

export const deleteNote = createAsyncThunk(
  "application/deleteNote",
  async ({ applicationId, noteId }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/application-notes/${applicationId}/delete/${noteId}`);
      return noteId;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to delete note"));
    }
  },
);
