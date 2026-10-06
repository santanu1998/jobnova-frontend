// Flattens a ResumeResponse into plain text for the AI endpoints
// (career feedback, improvement tips, candidate screening).
export function resumeToText(resume) {
  if (!resume) return "";
  const pi = resume.personalInfo ?? {};
  const lines = [];

  const name = [pi.firstName, pi.lastName].filter(Boolean).join(" ");
  if (name) lines.push(name);
  if (pi.headline) lines.push(pi.headline);
  if (pi.city || pi.country) lines.push([pi.city, pi.country].filter(Boolean).join(", "));

  if (resume.summary) lines.push("", "SUMMARY", resume.summary);

  if (resume.workExperiences?.length) {
    lines.push("", "EXPERIENCE");
    for (const e of resume.workExperiences) {
      lines.push(
        `${e.jobTitle} at ${e.companyName} (${e.startDate ?? "?"} - ${e.isCurrentlyWorking ? "Present" : e.endDate ?? "?"})`,
      );
      if (e.jobDescription) lines.push(e.jobDescription);
      if (e.technologies?.length) lines.push(`Technologies: ${e.technologies.join(", ")}`);
    }
  }

  if (resume.educations?.length) {
    lines.push("", "EDUCATION");
    for (const e of resume.educations) {
      lines.push(
        `${e.degree}${e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ""}, ${e.institutionName}${e.grade ? ` (${e.grade})` : ""}`,
      );
    }
  }

  if (resume.skills?.length) {
    lines.push("", "SKILLS");
    lines.push(
      resume.skills
        .map((s) => `${s.skillName} (${s.proficiencyLevel}${s.yearsOfExperience != null ? `, ${s.yearsOfExperience}y` : ""})`)
        .join(", "),
    );
  }

  if (resume.projects?.length) {
    lines.push("", "PROJECTS");
    for (const p of resume.projects) {
      lines.push(`${p.title}${p.description ? `: ${p.description}` : ""}`);
    }
  }

  if (resume.certifications?.length) {
    lines.push("", "CERTIFICATIONS");
    for (const c of resume.certifications) lines.push(`${c.certificationName} - ${c.issuingOrganization}`);
  }

  if (resume.awards?.length) {
    lines.push("", "AWARDS");
    for (const a of resume.awards) lines.push(`${a.title} - ${a.issuer}`);
  }

  if (resume.languages?.length) {
    lines.push("", "LANGUAGES");
    lines.push(resume.languages.map((l) => `${l.languageName} (${l.proficiencyLevel})`).join(", "));
  }

  return lines.join("\n").trim();
}

export const resumeSkills = (resume) =>
  (resume?.skills ?? []).map((s) => s.skillName).filter(Boolean);

export const resumeExperience = (resume) =>
  (resume?.workExperiences ?? []).map(
    (e) => `${e.jobTitle} at ${e.companyName}${e.isCurrentlyWorking ? " (current)" : ""}`,
  );
