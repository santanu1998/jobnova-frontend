import { createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../api";

export const generateCoerLetter = createAsyncThunk(
  "ai/generateCoerLetter",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/ai/application/cover-letter",
        payload,
      );
      return data;
    } catch (e) {
      return rejectWithValue(
        getErrorMessage(e, "Failed to generate cover letter"),
      );
    }
  },
);

// arg: { applicationId?, ...ScreeningScoreRequest } — applicationId is only used
// client-side to attach the result to that application.
export const scoreCandidate = createAsyncThunk(
  "ai/scoreCandidate",
  async ({ applicationId: _applicationId, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/ai/application/screening-core",
        payload,
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to score candidate"),
      );
    }
  },
);

export const analyzeSkillsGap = createAsyncThunk(
  "ai/analyzeSkillsGap",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/ai/application/skills-gap",
        payload,
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to analyze skills gap"),
      );
    }
  },
);

// ── Resume AI ──────────────────────────────────────────────────────────────────

// POST /api/ai/resume/summary
// ResumeSummaryRequest → ApiResponse<AiTextResponse>
export const generateResumeSummary = createAsyncThunk(
  "ai/generateResumeSummary",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/ai/resume/summary", payload);
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to generate resume summary"),
      );
    }
  },
);

// POST /api/ai/resume/experience-bullets
// WorkExperienceBulletRequest → ApiResponse<WorkExperienceBulletsResponse>
export const generateExperienceBullets = createAsyncThunk(
  "ai/generateExperienceBullets",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/ai/resume/experience-bullets",
        payload,
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to generate bullet points"),
      );
    }
  },
);

// POST /api/ai/resume/improvements
// ResumeImprovementRequest → ApiResponse<ResumeImprovementResponse>
export const getResumeImprovements = createAsyncThunk(
  "ai/getResumeImprovements",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/ai/resume/improvements", payload);
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to get improvement suggestions"),
      );
    }
  },
);

export const getCareerFeedback = createAsyncThunk(
  "ai/getCareerFeedback",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/ai/resume/career-feedback",
        payload,
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to get career feedback"),
      );
    }
  },
);

// ── Job AI ─────────────────────────────────────────────────────────────────────

// POST /api/ai/job/describe
// JobDescriptionRequest { title, skills, experienceLevel, jobType, workMode, category, additionalContext }
// → ApiResponse<AiTextResponse> { content, generatedAt }

export const generateJobDescription = createAsyncThunk(
  "ai/generateJobDescription",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/ai/job/describe", payload);
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to generate job description"),
      );
    }
  },
);

export const generateJobRequirements = createAsyncThunk(
  "ai/generateJobRequirements",
  async ({ title, category }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/ai/job/requirements", {
        params: { title, category },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to generate job requirements"),
      );
    }
  },
);

export const suggestSalary = createAsyncThunk(
  "ai/suggestSalary",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/ai/job/salary-suggestion", payload);
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to suggest salary"),
      );
    }
  },
);

export const recommendJobSkills = createAsyncThunk(
  "ai/recommendJobSkills",
  async ({ title, category }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/ai/job/skills-recommendation", {
        params: { title, category },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to recommend skills"),
      );
    }
  },
);

export const generateJobResponsibilities = createAsyncThunk(
  "ai/generateJobResponsibilities",
  async ({ title, category }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/ai/job/responsibilities", {
        params: { title, category },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to generate responsibilities"),
      );
    }
  },
);

export const generateJobBenefits = createAsyncThunk(
  "ai/generateJobBenefits",
  async ({ title, category, jobType }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/ai/job/benefits", {
        params: { title, category, jobType },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to generate benefits"),
      );
    }
  },
);

export const recommendJobTags = createAsyncThunk(
  "ai/recommendJobTags",
  async ({ title, description }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/ai/job/tags-recommendation", {
        params: { title, description },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to recommend tags"),
      );
    }
  },
);

export const enhanceSearch = createAsyncThunk(
  "ai/enhanceSearch",
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/ai/search/enhance", { query });
      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, "Failed to enhance search"),
      );
    }
  },
);
