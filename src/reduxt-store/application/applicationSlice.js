import { createSlice } from "@reduxjs/toolkit";
import {
  addNote,
  deleteNote,
  fetchApplicationById,
  fetchCompanyApplications,
  fetchJobApplications,
  fetchMyApplications,
  submitApplication,
  toggleStar,
  updateApplicationStatus,
  withdrawApplication,
} from "./applicationThunk";
import { replaceInList } from "../utils/replaceInList";
import { screenApplication } from "./applicationThunk";

// The score is stored by Application-Service; the detailed breakdown (matched
// skills, summary...) from the latest screening run is kept here for display.
const withScreening = (state, app) =>
  app?.screening && state.screenings[app.id]
    ? { ...app, screening: { ...state.screenings[app.id], ...app.screening } }
    : app;

const initialState = {
  applications: [],
  myApplications: [],
  currentApplication: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
  actionError: null,
  screenings: {},
};

const applicationSlice = createSlice({
  name: "application",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyApplications.pending, (state) => {
        ((state.isLoading = true), (state.error = null));
      })
      .addCase(fetchCompanyApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload.map((a) => withScreening(state, a));
      })
      .addCase(fetchCompanyApplications.rejected, (state, action) => {
        ((state.isLoading = false), (state.error = action.payload));
      });

    // ── fetchJobApplications ──────────────────────────────────────────────────
    builder
      .addCase(fetchJobApplications.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(fetchJobApplications.fulfilled, (s, { payload }) => {
        s.isLoading = false;
        s.applications = payload.map((a) => withScreening(s, a));
      })
      .addCase(fetchJobApplications.rejected, (s, { payload }) => {
        s.isLoading = false;
        s.error = payload;
      });

    // ── fetchApplicationById ──────────────────────────────────────────────────
    builder
      .addCase(fetchApplicationById.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (s, { payload }) => {
        s.isLoading = false;
        s.currentApplication = withScreening(s, payload);
      })
      .addCase(fetchApplicationById.rejected, (s, { payload }) => {
        s.isLoading = false;
        s.error = payload;
      });

    builder
      .addCase(updateApplicationStatus.pending, (s) => {
        s.isActionLoading = true;
        s.actionError = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (s, { payload }) => {
        s.isActionLoading = false;
        const app = withScreening(s, payload);
        if (s.currentApplication?.id === app.id) s.currentApplication = app;
        replaceInList(s.applications, app);

      })
      .addCase(updateApplicationStatus.rejected, (s, { payload }) => {
        s.isActionLoading = false;
        s.actionError = payload;
      });

    // ── toggleStar ────────────────────────────────────────────────────────────
    builder
      .addCase(toggleStar.pending, (s) => {
        s.isActionLoading = true;
      })
      .addCase(toggleStar.fulfilled, (s, { payload }) => {
        s.isActionLoading = false;
        const app = withScreening(s, payload);
        replaceInList(s.applications, app);
        if (s.currentApplication?.id === app.id) s.currentApplication = app;
      })
      .addCase(toggleStar.rejected, (s) => {
        s.isActionLoading = false;
      });

    // ── addNote ───────────────────────────────────────────────────────────────
    builder
      .addCase(addNote.pending, (s) => {
        s.isActionLoading = true;
        s.actionError = null;
      })
      .addCase(addNote.fulfilled, (s, { payload }) => {
        s.isActionLoading = false;
        if (s.currentApplication) {
          s.currentApplication.notes = [
            payload,
            ...(s.currentApplication.notes || []),
          ];
        }
      })
      .addCase(addNote.rejected, (s, { payload }) => {
        s.isActionLoading = false;
        s.actionError = payload;
      });

    // ── fetchMyApplications (candidate) ──────────────────────────────────────
    builder
      .addCase(fetchMyApplications.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(fetchMyApplications.fulfilled, (s, { payload }) => {
        s.isLoading = false;
        s.myApplications = payload;
      })
      .addCase(fetchMyApplications.rejected, (s, { payload }) => {
        s.isLoading = false;
        s.error = payload;
      });

    // ── AI screening (persisted by Application-Service) ──────────────────────
    builder.addCase(screenApplication.fulfilled, (s, { payload, meta }) => {
      const id = meta.arg;
      if (id == null || !payload) return;
      const screening = payload;
      s.screenings[id] = screening;
      s.applications = s.applications.map((a) => (a.id === id ? { ...a, screening } : a));
      if (s.currentApplication?.id === id) s.currentApplication = { ...s.currentApplication, screening };
    });

    // ── withdraw / submit (candidate) ────────────────────────────────────────
    builder
      .addCase(withdrawApplication.pending, (s) => {
        s.isActionLoading = true;
        s.actionError = null;
      })
      .addCase(withdrawApplication.fulfilled, (s, { payload }) => {
        s.isActionLoading = false;
        replaceInList(s.myApplications, payload);
        if (s.currentApplication?.id === payload.id) s.currentApplication = payload;
      })
      .addCase(withdrawApplication.rejected, (s, { payload }) => {
        s.isActionLoading = false;
        s.actionError = payload;
      });

    builder
      .addCase(submitApplication.pending, (s) => {
        s.isActionLoading = true;
        s.actionError = null;
      })
      .addCase(submitApplication.fulfilled, (s, { payload }) => {
        s.isActionLoading = false;
        s.myApplications.unshift(payload);
      })
      .addCase(submitApplication.rejected, (s, { payload }) => {
        s.isActionLoading = false;
        s.actionError = payload;
      });

    builder
      .addCase(deleteNote.pending, (s) => {
        s.isActionLoading = true;
        s.actionError = null;
      })
      .addCase(deleteNote.fulfilled, (s, { payload: noteId }) => {
        s.isActionLoading = false;
        if (s.currentApplication) {
          s.currentApplication.notes = (
            s.currentApplication.notes || []
          ).filter((n) => n.id !== noteId);
        }
      })
      .addCase(deleteNote.rejected, (s, { payload }) => {
        s.isActionLoading = false;
        s.actionError = payload;
      });
  },
});

export default applicationSlice.reducer;
