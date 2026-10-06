import React from "react";
import ResumeListSection from "./shared/ResumeListSection";
import { Progress } from "../../../components/ui/progress";
import { addSkill, deleteSkill, updateSkill } from "../../../reduxt-store/resume/resumeThunk";
import { PROFICIENCY_LEVELS, formatEnum } from "../../../lib/constants";

export { PROFICIENCY_LEVELS };

// Mirrors AddResumeSkillRequest
const skillsData = {
  skillName: "",
  proficiencyLevel: "INTERMEDIATE",
  yearsOfExperience: null,
};

const rows = [
  [{ name: "skillName", label: "Skill Name *", required: true, placeholder: "e.g. Spring Boot" }],
  [
    {
      name: "proficiencyLevel",
      label: "Proficiency Level *",
      type: "select",
      options: PROFICIENCY_LEVELS,
      required: true,
    },
    { name: "yearsOfExperience", label: "Years of Experience", type: "number", placeholder: "2" },
  ],
];

const levelPct = (level) =>
  ((PROFICIENCY_LEVELS.indexOf(level) + 1) / PROFICIENCY_LEVELS.length) * 100;

const SkillsSection = ({ resumeId, resume, otherResumes }) => (
  <ResumeListSection
    resumeId={resumeId}
    resume={resume}
    otherResumes={otherResumes}
    field="skills"
    label="Skill"
    emptyForm={skillsData}
    rows={rows}
    idParam="skillId"
    thunks={{ add: addSkill, update: updateSkill, del: deleteSkill }}
    renderItem={(item) => (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-900">{item.skillName}</p>
          <span className="text-xs text-slate-500">
            {formatEnum(item.proficiencyLevel)}
            {item.yearsOfExperience != null &&
              ` · ${item.yearsOfExperience} year${item.yearsOfExperience !== 1 ? "s" : ""}`}
          </span>
        </div>
        <Progress value={levelPct(item.proficiencyLevel)} className="h-1.5" />
      </div>
    )}
  />
);

export default SkillsSection;
