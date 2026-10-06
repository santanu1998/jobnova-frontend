import React from "react";
import ResumeListSection from "./shared/ResumeListSection";
import {
  addLanguage,
  deleteLanguage,
  updateLanguage,
} from "../../../reduxt-store/resume/resumeThunk";
import { LANGUAGE_PROFICIENCIES, formatEnum } from "../../../lib/constants";

// Mirrors AddLanguageRequest
const languageData = {
  languageName: "",
  proficiencyLevel: "PROFESSIONAL",
};

const LANG_BG = {
  BASIC: "bg-slate-100 text-slate-600",
  CONVERSATIONAL: "bg-blue-50 text-blue-700",
  PROFESSIONAL: "bg-indigo-50 text-indigo-700",
  FLUENT: "bg-purple-50 text-purple-700",
  NATIVE: "bg-green-50 text-green-700",
};

const rows = [
  [
    { name: "languageName", label: "Language Name *", required: true, placeholder: "English" },
    {
      name: "proficiencyLevel",
      label: "Proficiency *",
      type: "select",
      options: LANGUAGE_PROFICIENCIES,
      required: true,
    },
  ],
];

const LanguagesSection = ({ resumeId, resume, otherResumes }) => (
  <ResumeListSection
    resumeId={resumeId}
    resume={resume}
    otherResumes={otherResumes}
    field="languages"
    label="Language"
    emptyForm={languageData}
    rows={rows}
    idParam="languageId"
    thunks={{ add: addLanguage, update: updateLanguage, del: deleteLanguage }}
    renderItem={(item) => (
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-900">{item.languageName}</p>
        <span
          className={`text-xs rounded-full px-2.5 py-0.5 ${LANG_BG[item.proficiencyLevel] ?? LANG_BG.BASIC}`}
        >
          {formatEnum(item.proficiencyLevel)}
        </span>
      </div>
    )}
  />
);

export default LanguagesSection;
