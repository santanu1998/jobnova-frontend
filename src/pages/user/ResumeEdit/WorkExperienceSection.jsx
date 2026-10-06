import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles, Loader2 } from "lucide-react";
import ResumeListSection from "./shared/ResumeListSection";
import { Button } from "../../../components/ui/button";
import {
  addWorkExperience,
  deleteWorkExperience,
  updateWorkExperience,
} from "../../../reduxt-store/resume/resumeThunk";
import { generateExperienceBullets } from "../../../reduxt-store/ai/aiThunk";
import { JOB_TYPES, formatEnum } from "../../../lib/constants";

// Mirrors AddWorkExperienceRequest
const experienceData = {
  companyName: "",
  companyLogoUrl: "",
  jobTitle: "",
  employmentType: "FULL_TIME",
  location: "",
  startDate: "",
  endDate: "",
  isCurrentlyWorking: false,
  jobDescription: "",
  technologies: [],
};

const rows = [
  [
    { name: "companyName", label: "Company *", required: true, placeholder: "JobNova Pvt. Ltd." },
    { name: "jobTitle", label: "Job Title *", required: true, placeholder: "Full Stack Developer" },
  ],
  [
    { name: "employmentType", label: "Employment Type", type: "select", options: JOB_TYPES },
    { name: "location", label: "Location", placeholder: "City / Remote" },
  ],
  [
    { name: "startDate", label: "Start Date *", type: "date", required: true },
    {
      name: "endDate",
      label: "End Date",
      type: "date",
      disabledWhen: (f) => f.isCurrentlyWorking,
    },
  ],
  [{ name: "isCurrentlyWorking", label: "Currently working here", type: "checkbox" }],
  [
    {
      name: "jobDescription",
      label: "Description",
      type: "textarea",
      placeholder: "Key achievements and responsibilities…",
    },
  ],
  [{ name: "technologies", label: "Technologies", type: "tags", placeholder: "e.g. React" }],
  [{ name: "companyLogoUrl", label: "Company Logo URL", type: "url", placeholder: "https://…" }],
];

const validate = (f) =>
  !f.isCurrentlyWorking && f.endDate && f.startDate && f.endDate < f.startDate
    ? "End date cannot be before the start date."
    : "";

// "Generate Bullets" — turns the raw description into polished bullet points
const BulletGenerator = ({ form, setForm }) => {
  const dispatch = useDispatch();
  const { isGeneratingBullets } = useSelector((s) => s.ai);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!form.jobTitle?.trim() || !form.jobDescription?.trim()) {
      setError("Enter a job title and a short description first.");
      return;
    }
    setError("");
    const result = await dispatch(
      generateExperienceBullets({
        jobTitle: form.jobTitle,
        company: form.companyName,
        rawDescription: form.jobDescription,
      }),
    );
    if (result.error) {
      setError(result.payload || "Failed to generate bullet points");
      return;
    }
    const bullets = result.payload?.bullets ?? [];
    if (bullets.length)
      setForm((prev) => ({ ...prev, jobDescription: bullets.map((b) => `• ${b}`).join("\n") }));
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs text-red-600">{error}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isGeneratingBullets}
        onClick={generate}
        className="border-blue-200 text-primary"
      >
        {isGeneratingBullets ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        Generate Bullets with AI
      </Button>
    </div>
  );
};

const WorkExperienceSection = ({ resumeId, resume, otherResumes }) => (
  <ResumeListSection
    resumeId={resumeId}
    resume={resume}
    otherResumes={otherResumes}
    field="workExperiences"
    label="Experience"
    emptyForm={experienceData}
    rows={rows}
    idParam="workExperienceId"
    thunks={{ add: addWorkExperience, update: updateWorkExperience, del: deleteWorkExperience }}
    validate={validate}
    extra={(form, setForm) => <BulletGenerator form={form} setForm={setForm} />}
    renderItem={(item) => (
      <>
        <p className="font-semibold text-slate-900">{item.jobTitle}</p>
        <p className="text-xs text-slate-600">
          {item.companyName}
          {item.location && ` · ${item.location}`}
          {item.employmentType && ` · ${formatEnum(item.employmentType)}`}
        </p>
        <p className="text-xs text-slate-600">
          {item.startDate} - {item.isCurrentlyWorking ? "Present" : item.endDate || "—"}
        </p>
        {item.jobDescription && (
          <p className="text-xs text-slate-500 mt-1 whitespace-pre-line line-clamp-3">
            {item.jobDescription}
          </p>
        )}
        {item.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.technologies.map((t) => (
              <span key={t} className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">
                {t}
              </span>
            ))}
          </div>
        )}
      </>
    )}
  />
);

export default WorkExperienceSection;
