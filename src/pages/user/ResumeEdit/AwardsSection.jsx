import React from "react";
import ResumeListSection from "./shared/ResumeListSection";
import { addAward, deleteAward, updateAward } from "../../../reduxt-store/resume/resumeThunk";

// Mirrors AddAwardRequest
const awardData = {
  title: "",
  issuer: "",
  issuedDate: "",
  scope: "",
  description: "",
};

const rows = [
  [{ name: "title", label: "Award Title *", required: true, placeholder: "Employee of the Year" }],
  [
    { name: "issuer", label: "Issued By *", required: true, placeholder: "JobNova Inc." },
    { name: "issuedDate", label: "Award Date *", type: "date", required: true },
  ],
  [{ name: "scope", label: "Scope", placeholder: "Company / National / International" }],
  [{ name: "description", label: "Description", type: "textarea", placeholder: "What it was for…" }],
];

const validate = (f) =>
  f.description && f.description.length > 500 ? "Description cannot exceed 500 characters." : "";

const AwardsSection = ({ resumeId, resume, otherResumes }) => (
  <ResumeListSection
    resumeId={resumeId}
    resume={resume}
    otherResumes={otherResumes}
    field="awards"
    label="Award"
    emptyForm={awardData}
    rows={rows}
    idParam="awardId"
    thunks={{ add: addAward, update: updateAward, del: deleteAward }}
    validate={validate}
    renderItem={(item) => (
      <>
        <p className="font-semibold text-slate-900">{item.title}</p>
        <p className="text-xs text-slate-600">
          {item.issuer}
          {item.issuedDate && ` · ${item.issuedDate}`}
          {item.scope && ` · ${item.scope}`}
        </p>
        {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
      </>
    )}
  />
);

export default AwardsSection;
