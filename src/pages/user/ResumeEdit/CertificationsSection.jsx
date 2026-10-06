import React from "react";
import ResumeListSection from "./shared/ResumeListSection";
import {
  addCertification,
  deleteCertification,
  updateCertification,
} from "../../../reduxt-store/resume/resumeThunk";

// Mirrors AddCertificationRequest
const certificationData = {
  certificationName: "",
  issuingOrganization: "",
  issueDate: "",
  expirationDate: "",
  credentialId: "",
  credentialUrl: "",
};

const rows = [
  [
    {
      name: "certificationName",
      label: "Certification Name *",
      required: true,
      placeholder: "AWS Certified Developer",
    },
  ],
  [
    {
      name: "issuingOrganization",
      label: "Issuing Organization *",
      required: true,
      placeholder: "Amazon Web Services",
    },
  ],
  [
    { name: "issueDate", label: "Issue Date *", type: "date", required: true },
    { name: "expirationDate", label: "Expiry Date", type: "date" },
  ],
  [
    { name: "credentialId", label: "Credential ID", placeholder: "ABC-123" },
    { name: "credentialUrl", label: "Credential URL", type: "url", placeholder: "https://…" },
  ],
];

const validate = (f) =>
  f.expirationDate && f.issueDate && f.expirationDate < f.issueDate
    ? "Expiry date cannot be before the issue date."
    : "";

export const CertificationsSection = ({ resumeId, resume, otherResumes }) => (
  <ResumeListSection
    resumeId={resumeId}
    resume={resume}
    otherResumes={otherResumes}
    field="certifications"
    label="Certification"
    emptyForm={certificationData}
    rows={rows}
    idParam="certificationId"
    thunks={{ add: addCertification, update: updateCertification, del: deleteCertification }}
    validate={validate}
    renderItem={(item) => (
      <>
        <p className="font-semibold text-slate-900">{item.certificationName}</p>
        <p className="text-xs text-slate-600">{item.issuingOrganization}</p>
        <p className="text-xs text-slate-600">
          Issued {item.issueDate}
          {item.expirationDate ? ` · Expires ${item.expirationDate}` : " · No expiry"}
        </p>
        {item.credentialUrl && (
          <a
            className="text-xs text-primary hover:underline"
            href={item.credentialUrl}
            target="_blank"
            rel="noreferrer"
          >
            View credential{item.credentialId ? ` (${item.credentialId})` : ""}
          </a>
        )}
      </>
    )}
  />
);

export default CertificationsSection;
