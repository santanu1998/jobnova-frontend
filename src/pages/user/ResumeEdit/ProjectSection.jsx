import React from "react";
import ResumeListSection from "./shared/ResumeListSection";
import {
  addProject,
  deleteProject,
  updateProject,
} from "../../../reduxt-store/resume/resumeThunk";

// Mirrors AddProjectRequest
const projectData = {
  title: "",
  description: "",
  technologies: [],
  projectUrl: "",
  sourceCodeUrl: "",
  startDate: "",
  endDate: "",
  isOngoing: false,
};

const rows = [
  [{ name: "title", label: "Title *", required: true, placeholder: "JobNova job board" }],
  [{ name: "description", label: "Description", type: "textarea", placeholder: "What it does…" }],
  [{ name: "technologies", label: "Technologies", type: "tags", placeholder: "e.g. React" }],
  [
    { name: "startDate", label: "Start Date", type: "date" },
    { name: "endDate", label: "End Date", type: "date", disabledWhen: (f) => f.isOngoing },
  ],
  [{ name: "isOngoing", label: "Ongoing project", type: "checkbox" }],
  [
    { name: "projectUrl", label: "Live URL", type: "url", placeholder: "https://…" },
    { name: "sourceCodeUrl", label: "Source Code URL", type: "url", placeholder: "https://github.com/…" },
  ],
];

const validate = (f) =>
  !f.isOngoing && f.endDate && f.startDate && f.endDate < f.startDate
    ? "End date cannot be before the start date."
    : "";

const ProjectSection = ({ resumeId, resume, otherResumes }) => (
  <ResumeListSection
    resumeId={resumeId}
    resume={resume}
    otherResumes={otherResumes}
    field="projects"
    label="Project"
    emptyForm={projectData}
    rows={rows}
    idParam="projectId"
    thunks={{ add: addProject, update: updateProject, del: deleteProject }}
    validate={validate}
    renderItem={(item) => (
      <>
        <p className="font-semibold text-slate-900">{item.title}</p>
        {(item.startDate || item.endDate || item.isOngoing) && (
          <p className="text-xs text-slate-600">
            {item.startDate ?? "—"} - {item.isOngoing ? "Present" : item.endDate || "—"}
          </p>
        )}
        {item.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
        )}
        <div className="flex flex-wrap gap-3 mt-1 text-xs">
          {item.projectUrl && (
            <a className="text-primary hover:underline" href={item.projectUrl} target="_blank" rel="noreferrer">
              Live
            </a>
          )}
          {item.sourceCodeUrl && (
            <a className="text-primary hover:underline" href={item.sourceCodeUrl} target="_blank" rel="noreferrer">
              Source
            </a>
          )}
        </div>
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

export default ProjectSection;
