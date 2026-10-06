// Shared helpers for the company create / edit forms (CompanyRequest in common-lib)

export const EMPTY_COMPANY = {
  name: "",
  tagline: "",
  description: "",
  logoUrl: "",
  coverImageUrl: "",
  website: "",
  email: "",
  phone: "",
  foundedYear: "",
  companySize: "",
  companyType: "",
  industryType: "",
  registrationNumber: "",
  socialLinks: [],
};

const URL_RE = /^https?:\/\/.+/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const companyToForm = (c) =>
  Object.fromEntries(
    Object.keys(EMPTY_COMPANY).map((k) => [
      k,
      k === "socialLinks" ? c?.socialLinks ?? [] : c?.[k] != null ? String(c[k]) : "",
    ]),
  );

export function validateCompany(form) {
  if (!form.name.trim()) return "Company name is required.";
  if (!form.email.trim()) return "Company email is required.";
  if (!EMAIL_RE.test(form.email.trim())) return "Please enter a valid company email.";
  if (!form.companySize) return "Please select a company size.";
  if (!form.companyType) return "Please select a company type.";
  if (!form.industryType) return "Please select an industry.";
  if (form.website && !URL_RE.test(form.website.trim()))
    return "Website must start with http:// or https://";
  if (form.foundedYear) {
    const y = Number(form.foundedYear);
    if (!Number.isInteger(y) || y < 1800 || y > 2100) return "Founded year must be between 1800 and 2100.";
  }
  const badLink = (form.socialLinks ?? []).find((l) => l.url && !URL_RE.test(l.url));
  if (badLink) return `${badLink.platform} link must start with http:// or https://`;
  return "";
}

// Empty strings -> null so optional @Pattern / @Min fields pass validation
export const formToCompanyRequest = (form) => {
  const out = {};
  for (const [k, v] of Object.entries(form)) {
    if (k === "socialLinks") out[k] = (v ?? []).filter((l) => l.platform && l.url?.trim());
    else if (k === "foundedYear") out[k] = v === "" ? null : Number(v);
    else out[k] = typeof v === "string" ? v.trim() || null : v;
  }
  return out;
};
