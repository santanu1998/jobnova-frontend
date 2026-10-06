import React from "react";
import ResumeListSection from "./shared/ResumeListSection";
import {
  addEducation,
  deleteEducation,
  updateEducation,
} from "../../../reduxt-store/resume/resumeThunk";

// Mirrors AddEducationRequest
const educationData = {
  institutionName: "",
  degree: "",
  fieldOfStudy: "",
  grade: "",
  startDate: "",
  endDate: "",
  isCurrentlyStudying: false,
  description: "",
};

const rows = [
  [
    {
      name: "institutionName",
      label: "Institution *",
      required: true,
      placeholder: "University of California",
    },
  ],
  [
    { name: "degree", label: "Degree *", required: true, placeholder: "B.S. Computer Science" },
    { name: "fieldOfStudy", label: "Field of Study", placeholder: "Computer Science" },
  ],
  [
    { name: "startDate", label: "Start Date *", type: "date", required: true },
    {
      name: "endDate",
      label: "End Date",
      type: "date",
      disabledWhen: (f) => f.isCurrentlyStudying,
    },
    { name: "grade", label: "Grade / GPA", placeholder: "3.8/4.0" },
  ],
  [{ name: "isCurrentlyStudying", label: "Currently studying", type: "checkbox" }],
  [
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Thesis, honours, activities…",
    },
  ],
];

const validate = (f) =>
  !f.isCurrentlyStudying && f.endDate && f.startDate && f.endDate < f.startDate
    ? "End date cannot be before the start date."
    : "";

const EducationSection = ({ resumeId, resume, otherResumes }) => (
  <ResumeListSection
    resumeId={resumeId}
    resume={resume}
    otherResumes={otherResumes}
    field="educations"
    label="Education"
    emptyForm={educationData}
    rows={rows}
    idParam="educationId"
    thunks={{ add: addEducation, update: updateEducation, del: deleteEducation }}
    validate={validate}
    renderItem={(item) => (
      <>
        <p className="font-semibold text-slate-900">{item.degree}</p>
        <p className="text-xs text-slate-600">
          {item.institutionName}
          {item.fieldOfStudy && ` · ${item.fieldOfStudy}`}
        </p>
        <p className="text-xs text-slate-600">
          {item.startDate} - {item.isCurrentlyStudying ? "Present" : item.endDate || "—"}
          {item.grade && ` · GPA: ${item.grade}`}
        </p>
      </>
    )}
  />
);

export default EducationSection;
