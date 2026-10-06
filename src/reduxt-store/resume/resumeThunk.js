import { createAsyncThunk } from "@reduxjs/toolkit";
import api, { getErrorMessage } from "../api";

export const fetchMyResumes = createAsyncThunk(
  "resume/fetchMyResumes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/resumes/all");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch resumes."));
    }
  },
);

export const fetchResumeById = createAsyncThunk(
  "resume/fetchResumeById",
  async (resumeId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/resumes/${resumeId}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch resume."));
    }
  },
);

// payload: { title, template, visibility, isDefault, summary? }
export const createResume = createAsyncThunk(
  "resume/createResume",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/resumes/create", payload);
      return data;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e, "Failed to create resume"));
    }
  },
);

export const setDefaultResume = createAsyncThunk(
  "resume/setDefaultResume",
  async (resumeId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/resumes/${resumeId}/set-default`);
      return data;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e, "Failed to set default resume"));
    }
  },
);

export const updateResumeSummary = createAsyncThunk(
  "resume/updateResumeSummary",
  async ({ resumeId, summary }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/resumes/${resumeId}/update/summary`, null, {
        params: { summary },
      });
      return data;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e, "Failed to update summary"));
    }
  },
);

// data: { firstName, lastName, headline, email, phoneNumber, city, country,
//         linkedinUrl, githubUrl, portfolioUrl, websiteUrl }
export const updatePersonalInfo = createAsyncThunk(
  "resume/updatePersonalInfo",
  async ({ resumeId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/resumes/${resumeId}/update/personal-info`, data);
      return res.data;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e, "Failed to update personal info"));
    }
  },
);

export const deleteResume = createAsyncThunk(
  "resume/deleteResume",
  async (resumeId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/resumes/${resumeId}/delete`);
      return resumeId;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e, "Failed to delete resume"));
    }
  },
);

// ── Resume sections ───────────────────────────────────────────────────────────
// Each Resume-Service section controller uses its own URL layout, so every
// section declares how to build its add / update / delete URLs.

function makeSection(name, idParam, urls) {
  const add = createAsyncThunk(
    `resume/add${name}`,
    async ({ resumeId, data }, { rejectWithValue }) => {
      try {
        const res = await api.post(urls.add(resumeId), data);
        return res.data;
      } catch (error) {
        return rejectWithValue(getErrorMessage(error, `Failed to add ${name}`));
      }
    },
  );

  const update = createAsyncThunk(
    `resume/update${name}`,
    async ({ resumeId, [idParam]: itemId, data }, { rejectWithValue }) => {
      try {
        const res = await api.put(urls.update(resumeId, itemId), data);
        return res.data;
      } catch (error) {
        return rejectWithValue(getErrorMessage(error, `Failed to update ${name}`));
      }
    },
  );

  const del = createAsyncThunk(
    `resume/delete${name}`,
    async ({ resumeId, [idParam]: itemId }, { rejectWithValue }) => {
      try {
        await api.delete(urls.del(resumeId, itemId));
        return itemId;
      } catch (e) {
        return rejectWithValue(getErrorMessage(e, `Failed to delete ${name}`));
      }
    },
  );

  return { add, update, del };
}

const workExperienceSection = makeSection("WorkExperience", "workExperienceId", {
  add: (r) => `/api/work-experiences/${r}/add`,
  update: (r, id) => `/api/work-experiences/${r}/${id}/update`,
  del: (r, id) => `/api/work-experiences/${r}/${id}/delete`,
});
export const addWorkExperience = workExperienceSection.add;
export const updateWorkExperience = workExperienceSection.update;
export const deleteWorkExperience = workExperienceSection.del;

const educationSection = makeSection("Education", "educationId", {
  add: (r) => `/api/resumes/education/${r}/add`,
  update: (r, id) => `/api/resumes/education/${r}/update/${id}`,
  del: (r, id) => `/api/resumes/education/${r}/delete/${id}`,
});
export const addEducation = educationSection.add;
export const updateEducation = educationSection.update;
export const deleteEducation = educationSection.del;

const skillSection = makeSection("Skill", "skillId", {
  add: (r) => `/api/resume-skills/${r}/add`,
  update: (r, id) => `/api/resume-skills/${r}/${id}/update`,
  del: (r, id) => `/api/resume-skills/${r}/${id}/delete`,
});
export const addSkill = skillSection.add;
export const updateSkill = skillSection.update;
export const deleteSkill = skillSection.del;

const projectSection = makeSection("Project", "projectId", {
  add: (r) => `/api/resumes/projects/${r}/add`,
  update: (r, id) => `/api/resumes/projects/${r}/update/${id}`,
  del: (r, id) => `/api/resumes/projects/${r}/delete/${id}`,
});
export const addProject = projectSection.add;
export const updateProject = projectSection.update;
export const deleteProject = projectSection.del;

const languageSection = makeSection("Language", "languageId", {
  add: (r) => `/api/resumes/languages/${r}/add`,
  update: (r, id) => `/api/resumes/languages/${r}/update/${id}`,
  del: (r, id) => `/api/resumes/languages/${r}/delete/${id}`,
});
export const addLanguage = languageSection.add;
export const updateLanguage = languageSection.update;
export const deleteLanguage = languageSection.del;

const certificationSection = makeSection("Certification", "certificationId", {
  add: (r) => `/api/resumes/${r}/certifications/add`,
  update: (r, id) => `/api/resumes/${r}/certifications/update/${id}`,
  del: (r, id) => `/api/resumes/${r}/certifications/delete/${id}`,
});
export const addCertification = certificationSection.add;
export const updateCertification = certificationSection.update;
export const deleteCertification = certificationSection.del;

const awardSection = makeSection("Award", "awardId", {
  add: (r) => `/api/resumes/${r}/awards/add`,
  update: (r, id) => `/api/resumes/${r}/awards/update/${id}`,
  del: (r, id) => `/api/resumes/${r}/awards/delete/${id}`,
});
export const addAward = awardSection.add;
export const updateAward = awardSection.update;
export const deleteAward = awardSection.del;
