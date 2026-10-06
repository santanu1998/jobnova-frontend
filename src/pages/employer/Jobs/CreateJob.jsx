import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Briefcase,
  Layers,
  Tag,
  MapPin,
  IndianRupee,
  Settings,
  Send,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";
import JobSection from "./JobSection";
import JobField from "./JobField";
import AiButton from "./AiButton";
import MultiSelect from "./MultiSelect";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Badge } from "../../../components/ui/badge";
import {
  createJob,
  fetchJobById,
  publishJob,
  updateJob,
} from "../../../reduxt-store/job/jobThunk";
import {
  fetchCategories,
  fetchSkills,
  fetchTags,
} from "../../../reduxt-store/jobMeta/jobMetaThunk";
import { fetchMyCompany } from "../../../reduxt-store/company/companyThunk";
import {
  generateJobBenefits,
  generateJobDescription,
  generateJobRequirements,
  generateJobResponsibilities,
  recommendJobSkills,
  recommendJobTags,
  suggestSalary,
} from "../../../reduxt-store/ai/aiThunk";
import {
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  WORK_MODES,
  formatEnum,
} from "../../../lib/constants";

const EMPTY_FORM = {
  title: "",
  description: "",
  requirements: "",
  responsibilities: "",
  benefits: "",
  skillIds: [],
  tagIds: [],
  categoryId: "",
  experienceLevel: "",
  jobType: "",
  workMode: "",
  openings: 1,
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  minSalary: "",
  maxSalary: "",
  applicationDeadline: "",
  expiresAt: "",
};

// AI returns a comma/newline separated list; match it against the library
const matchByName = (aiText, options) => {
  const names = (aiText ?? "")
    .split(/[,\n]/)
    .map((t) => t.replace(/^[-*•\d.\s]+/, "").trim().toLowerCase())
    .filter(Boolean);
  return options
    .filter((o) => {
      const name = o.name.toLowerCase();
      return names.some((n) => name === n || name.includes(n) || n.includes(name));
    })
    .map((o) => o.id);
};

const numOrNull = (v) => (v === "" || v == null ? null : Number(v));
const strOrNull = (v) => (typeof v === "string" ? v.trim() || null : v ?? null);

const CreateJob = ({ isEdit = false }) => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories, skills, tags } = useSelector((state) => state.jobMeta);
  const { currentJob } = useSelector((state) => state.job);
  const { myCompany } = useSelector((state) => state.company);
  const {
    isGeneratingJobDescription,
    isGeneratingJobRequirements,
    isSuggestingSalary,
    isRecommendingSkills,
    isGeneratingJobResponsibilities,
    isGeneratingJobBenefits,
    isRecommendingTags,
  } = useSelector((store) => store.ai);

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [submitting, setSubmitting] = useState(null); // "publish" | "draft" | "save"
  const [prefilled, setPrefilled] = useState(false);
  const [companyChecked, setCompanyChecked] = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const setVal = (f) => (v) => setForm((prev) => ({ ...prev, [f]: v }));

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSkills());
    dispatch(fetchTags());
    dispatch(fetchMyCompany()).finally(() => setCompanyChecked(true));
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && jobId) dispatch(fetchJobById(jobId));
  }, [isEdit, jobId, dispatch]);

  // Prefill once when the job being edited has loaded
  useEffect(() => {
    if (!isEdit || prefilled || !currentJob || String(currentJob.id) !== String(jobId)) return;
    setForm({
      title: currentJob.title ?? "",
      description: currentJob.description ?? "",
      requirements: currentJob.requirements ?? "",
      responsibilities: currentJob.responsibilities ?? "",
      benefits: currentJob.benefits ?? "",
      categoryId: currentJob.category?.id ? String(currentJob.category.id) : "",
      skillIds: (currentJob.skills ?? []).map((s) => s.id),
      tagIds: (currentJob.tags ?? []).map((t) => t.id),
      address: currentJob.address ?? "",
      city: currentJob.city ?? "",
      state: currentJob.state ?? "",
      country: currentJob.country ?? "",
      postalCode: currentJob.postalCode ?? "",
      minSalary: currentJob.minSalary != null ? String(currentJob.minSalary) : "",
      maxSalary: currentJob.maxSalary != null ? String(currentJob.maxSalary) : "",
      jobType: currentJob.jobType ?? "",
      workMode: currentJob.workMode ?? "",
      experienceLevel: currentJob.experienceLevel ?? "",
      openings: currentJob.openings ?? 1,
      applicationDeadline: currentJob.applicationDeadline ?? "",
      expiresAt: currentJob.expiresAt ?? "",
    });
    setPrefilled(true);
  }, [isEdit, prefilled, currentJob, jobId]);

  const categoryName = categories.find((c) => String(c.id) === String(form.categoryId))?.name;
  const selectedSkillNames = skills.filter((s) => form.skillIds.includes(s.id)).map((s) => s.name);

  const checklistItems = [
    ["Title", !!form.title.trim()],
    ["Description", !!form.description.trim()],
    ["Category", !!form.categoryId],
    ["Job Type", !!form.jobType],
    ["Work Mode", !!form.workMode],
    ["Experience Level", !!form.experienceLevel],
    ["Skills", form.skillIds?.length > 0],
    ["Location", !!(form.city || form.country)],
    ["Salary", !!(form.minSalary || form.maxSalary)],
  ];

  const validate = () => {
    if (!myCompany?.id) return "Create your company profile before posting a job.";
    if (!form.title.trim()) return "Job title is required.";
    if (!form.description.trim()) return "Job description is required.";
    if (!form.categoryId) return "Please select a category.";
    if (!form.experienceLevel) return "Please select an experience level.";
    if (!form.jobType) return "Please select a job type.";
    if (!form.workMode) return "Please select a work mode.";
    if (Number(form.openings) < 1) return "Openings must be at least 1.";
    if (form.minSalary && form.maxSalary && Number(form.minSalary) > Number(form.maxSalary))
      return "Minimum salary cannot be greater than maximum salary.";
    if (form.applicationDeadline && form.expiresAt && form.expiresAt < form.applicationDeadline)
      return "Posting expiry date cannot be before the application deadline.";
    return "";
  };

  // Matches JobRequest in common-lib
  const toPayload = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    requirements: strOrNull(form.requirements),
    responsibilities: strOrNull(form.responsibilities),
    benefits: strOrNull(form.benefits),
    companyId: myCompany?.id,
    categoryId: Number(form.categoryId),
    skillIds: form.skillIds,
    tagIds: form.tagIds,
    address: strOrNull(form.address),
    city: strOrNull(form.city),
    state: strOrNull(form.state),
    country: strOrNull(form.country),
    postalCode: strOrNull(form.postalCode),
    minSalary: numOrNull(form.minSalary),
    maxSalary: numOrNull(form.maxSalary),
    jobType: form.jobType,
    workMode: form.workMode,
    experienceLevel: form.experienceLevel,
    openings: Number(form.openings) || 1,
    applicationDeadline: strOrNull(form.applicationDeadline),
    expiresAt: strOrNull(form.expiresAt),
  });

  const handleSubmit = async (mode) => {
    const err = validate();
    setError(err);
    if (err) return;

    setSubmitting(mode);
    const payload = toPayload();
    const result = isEdit
      ? await dispatch(updateJob({ id: jobId, ...payload }))
      : await dispatch(createJob(payload));

    if (result.error) {
      setSubmitting(null);
      setError(result.payload || "Failed to save job");
      return;
    }

    // New jobs start as DRAFT; "Publish" opens it straight away
    if (mode === "publish" && result.payload.status !== "OPEN") {
      const published = await dispatch(publishJob(result.payload.id));
      if (published.error) {
        setSubmitting(null);
        setError(`Job saved as draft, but publishing failed: ${published.payload}`);
        return;
      }
    }
    setSubmitting(null);
    navigate("/employer/jobs");
  };

  // ── AI helpers: apply the result of each call directly ────────────────────

  const runAi = async (thunk, apply) => {
    if (!form.title.trim()) {
      setAiNote("Enter a job title first.");
      return;
    }
    setAiNote("");
    const result = await dispatch(thunk);
    if (result.error) setAiNote(result.payload || "AI request failed");
    else apply(result.payload);
  };

  const handleGenerateDescription = () =>
    runAi(
      generateJobDescription({
        title: form.title,
        skills: selectedSkillNames,
        experienceLevel: form.experienceLevel || undefined,
        jobType: form.jobType || undefined,
        workMode: form.workMode || undefined,
        category: categoryName,
      }),
      (res) => setForm((f) => ({ ...f, description: res.content ?? f.description })),
    );

  const handleAutoFillRequirements = () =>
    runAi(generateJobRequirements({ title: form.title, category: categoryName }), (res) =>
      setForm((f) => ({ ...f, requirements: res.content ?? f.requirements })),
    );

  const handleAutoFillResponsibilities = () =>
    runAi(generateJobResponsibilities({ title: form.title, category: categoryName }), (res) =>
      setForm((f) => ({ ...f, responsibilities: res.content ?? f.responsibilities })),
    );

  const handleAutoFillBenefits = () =>
    runAi(
      generateJobBenefits({
        title: form.title,
        category: categoryName,
        jobType: form.jobType || undefined,
      }),
      (res) => setForm((f) => ({ ...f, benefits: res.content ?? f.benefits })),
    );

  const handleRecommendSkills = () =>
    runAi(recommendJobSkills({ title: form.title, category: categoryName }), (res) => {
      const ids = matchByName(res.content, skills);
      if (ids.length === 0) {
        setAiNote(`AI suggested: ${res.content}. None of these exist in the skill library yet.`);
        return;
      }
      setForm((f) => ({ ...f, skillIds: [...new Set([...f.skillIds, ...ids])] }));
    });

  const handleRecommendTags = () =>
    runAi(
      recommendJobTags({ title: form.title, description: form.description || undefined }),
      (res) => {
        const ids = matchByName(res.content, tags);
        if (ids.length === 0) {
          setAiNote(`AI suggested: ${res.content}. None of these exist in the tag library yet.`);
          return;
        }
        setForm((f) => ({ ...f, tagIds: [...new Set([...f.tagIds, ...ids])] }));
      },
    );

  const handleSuggestSalary = () =>
    runAi(
      suggestSalary({
        title: form.title,
        skills: selectedSkillNames,
        experienceLevel: form.experienceLevel || undefined,
        jobType: form.jobType || undefined,
        location: form.city || form.country || undefined,
      }),
      (res) => {
        setForm((f) => ({
          ...f,
          minSalary: res.minSalary != null ? String(res.minSalary) : f.minSalary,
          maxSalary: res.maxSalary != null ? String(res.maxSalary) : f.maxSalary,
        }));
        if (res.marketInsight)
          setAiNote(
            `${res.currency ?? ""} ${res.period ? `(${res.period})` : ""} ${res.marketInsight}`.trim(),
          );
      },
    );

  if (companyChecked && !myCompany) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center space-y-3">
        <p className="font-semibold text-amber-800">Set up your company first</p>
        <p className="text-sm text-amber-700">
          Jobs are posted under your company profile. Create it, then come back to post jobs.
        </p>
        <Button onClick={() => navigate("/employer/company")}>Create company profile</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? "Edit Job" : "Post a New Job"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Fill in the details below. You can save a draft and publish later.
        </p>
      </section>

      {aiNote && (
        <div className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-800">
          {aiNote}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* left section */}
        <div className="xl:col-span-2 space-y-5">
          <JobSection icon={Briefcase} title={"Job Details"}>
            <JobField label={"Job Title"} required>
              <Input
                value={form.title}
                placeholder="e.g. Senior React Developer"
                className="border-slate-200"
                onChange={set("title")}
              />
            </JobField>

            <JobField
              label={"Job Description"}
              required
              action={
                <AiButton
                  label={"Generate with AI"}
                  disabled={!form.title.trim()}
                  onClick={handleGenerateDescription}
                  isLoading={isGeneratingJobDescription}
                />
              }
            >
              <Textarea
                rows={6}
                value={form.description}
                placeholder="Describe the role, culture, and what makes this position exciting..."
                className="border-slate-200 text-sm"
                onChange={set("description")}
              />
            </JobField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JobField
                label={"Requirements"}
                action={
                  <AiButton
                    label={"Auto-fill from title"}
                    disabled={!form.title.trim()}
                    onClick={handleAutoFillRequirements}
                    isLoading={isGeneratingJobRequirements}
                  />
                }
              >
                <Textarea
                  rows={5}
                  value={form.requirements}
                  placeholder="List the skills, experience, and qualifications needed for this role..."
                  className="border-slate-200 text-sm"
                  onChange={set("requirements")}
                />
              </JobField>

              <JobField
                label={"Responsibilities"}
                action={
                  <AiButton
                    label={"Auto-fill from title"}
                    disabled={!form.title.trim()}
                    onClick={handleAutoFillResponsibilities}
                    isLoading={isGeneratingJobResponsibilities}
                  />
                }
              >
                <Textarea
                  rows={5}
                  value={form.responsibilities}
                  placeholder="List the key responsibilities and duties for this role..."
                  className="border-slate-200 text-sm"
                  onChange={set("responsibilities")}
                />
              </JobField>
            </div>
            <JobField
              label={"Benefits"}
              action={
                <AiButton
                  label={"Auto-fill from title"}
                  disabled={!form.title.trim()}
                  onClick={handleAutoFillBenefits}
                  isLoading={isGeneratingJobBenefits}
                />
              }
            >
              <Textarea
                rows={4}
                value={form.benefits}
                placeholder="List the benefits and perks for this role..."
                className="border-slate-200 text-sm"
                onChange={set("benefits")}
              />
            </JobField>
          </JobSection>

          {/* Classification */}
          <JobSection icon={Layers} title={"Classification"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JobField label={"Category"} required>
                <Select value={String(form.categoryId)} onValueChange={setVal("categoryId")}>
                  <SelectTrigger className="border-slate-200 text-sm w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <p className="text-xs text-amber-600">
                    No categories yet — ask an admin to add them under Job Metadata.
                  </p>
                )}
              </JobField>
              <JobField label={"Experience Level"} required>
                <Select value={form.experienceLevel} onValueChange={setVal("experienceLevel")}>
                  <SelectTrigger className="border-slate-200 text-sm w-full">
                    <SelectValue placeholder="Select an experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {formatEnum(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </JobField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JobField label={"Job Type"} required>
                <Select value={form.jobType} onValueChange={setVal("jobType")}>
                  <SelectTrigger className="border-slate-200 text-sm w-full">
                    <SelectValue placeholder="Select a job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((job) => (
                      <SelectItem key={job} value={job}>
                        {formatEnum(job)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </JobField>
              <JobField label={"Work Mode"} required>
                <Select value={form.workMode} onValueChange={setVal("workMode")}>
                  <SelectTrigger className="border-slate-200 text-sm w-full">
                    <SelectValue placeholder="Select a work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {formatEnum(mode)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </JobField>
            </div>

            <JobField label={"Number Of Openings"} required>
              <Input
                value={form.openings}
                placeholder="e.g. 5"
                type={"number"}
                min={1}
                className="border-slate-200"
                onChange={set("openings")}
              />
            </JobField>
          </JobSection>

          {/* Skills and Tags */}
          <JobSection icon={Tag} title={"Skills & Tags"}>
            <JobField
              hint="Select skills from the library — candidates will be matched against these"
              label={"Skills"}
              action={
                <AiButton
                  label={"Recommend with AI"}
                  disabled={!form.title.trim()}
                  onClick={handleRecommendSkills}
                  isLoading={isRecommendingSkills}
                />
              }
            >
              <MultiSelect
                options={skills}
                selectedIds={form.skillIds}
                onChange={setVal("skillIds")}
                placeholder="Select Skills..."
              />
            </JobField>

            <JobField
              label={"Tags"}
              hint="Keywords that improve job discoverability"
              action={
                <AiButton
                  label={"Recommend with AI"}
                  disabled={!form.title.trim()}
                  onClick={handleRecommendTags}
                  isLoading={isRecommendingTags}
                />
              }
            >
              <MultiSelect
                options={tags}
                selectedIds={form.tagIds}
                onChange={setVal("tagIds")}
                placeholder="Select Tags..."
              />
            </JobField>
          </JobSection>

          <JobSection icon={MapPin} title={"Location"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JobField label={"City"}>
                <Input
                  value={form.city}
                  placeholder="e.g. Kolkata"
                  className="border-slate-200"
                  onChange={set("city")}
                />
              </JobField>

              <JobField label={"State / Province"}>
                <Input
                  value={form.state}
                  placeholder="e.g. West Bengal"
                  className="border-slate-200"
                  onChange={set("state")}
                />
              </JobField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JobField label={"Country"}>
                <Input
                  value={form.country}
                  placeholder="e.g. India"
                  className="border-slate-200"
                  onChange={set("country")}
                />
              </JobField>

              <JobField label={"Postal Code"}>
                <Input
                  value={form.postalCode}
                  placeholder="e.g. 700001"
                  className="border-slate-200"
                  onChange={set("postalCode")}
                />
              </JobField>
            </div>
            <JobField label={"Full Address"}>
              <Input
                value={form.address}
                placeholder="e.g. 123 Park Street, Kolkata, West Bengal 700001, India"
                className="border-slate-200"
                onChange={set("address")}
              />
            </JobField>
          </JobSection>

          <JobSection icon={IndianRupee} title={"Salary & Compensation"}>
            <div className="flex items-center justify-between rounded-lg bg-violet-50 border border-violet-100 px-3 py-2">
              <p className="text-xs">AI can estimate a competitive salary range for this role.</p>
              <AiButton
                label={"Suggest Salary"}
                disabled={!form.title.trim()}
                onClick={handleSuggestSalary}
                isLoading={isSuggestingSalary}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JobField label={"Min Salary (₹ / year)"}>
                <Input
                  type={"number"}
                  value={form.minSalary}
                  placeholder="e.g. 500000"
                  className="border-slate-200"
                  onChange={set("minSalary")}
                  min={0}
                />
              </JobField>

              <JobField label={"Max Salary (₹ / year)"}>
                <Input
                  type={"number"}
                  value={form.maxSalary}
                  placeholder="e.g. 1200000"
                  className="border-slate-200"
                  onChange={set("maxSalary")}
                  min={form.minSalary || 0}
                />
              </JobField>
            </div>
          </JobSection>

          {/* Posting & Settings */}
          <JobSection icon={Settings} title={"Posting & Settings"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JobField label="Application Deadline" hint="Last date to apply">
                <Input
                  type={"date"}
                  value={form.applicationDeadline}
                  className="border-slate-200"
                  onChange={set("applicationDeadline")}
                />
              </JobField>

              <JobField
                label="Posting Expires At"
                hint="Job auto-expires on this date"
              >
                <Input
                  type={"date"}
                  value={form.expiresAt}
                  className="border-slate-200"
                  onChange={set("expiresAt")}
                />
              </JobField>
            </div>
          </JobSection>
        </div>
        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">
                {isEdit ? "Save Changes" : "Publish Job"}
              </h3>
              {myCompany && (
                <p className="text-xs text-slate-500">
                  Posting as <span className="font-medium">{myCompany.name}</span>
                </p>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {isEdit ? (
                <Button
                  onClick={() => handleSubmit("save")}
                  disabled={!!submitting}
                  className="w-full gap-2 "
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => handleSubmit("publish")}
                    disabled={!!submitting}
                    className="w-full gap-2 "
                  >
                    {submitting === "publish" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Publish Job
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit("draft")}
                    disabled={!!submitting}
                    className="w-full gap-2 border-slate-200"
                  >
                    {submitting === "draft" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save as Draft
                  </Button>
                </>
              )}

              <Separator />

              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Status after save:</span>
                  <Badge
                    variant="outline"
                    className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                  >
                    {isEdit ? formatEnum(currentJob?.status ?? "DRAFT") : "Draft"}
                  </Badge>
                </div>
                {!isEdit && (
                  <div className="flex justify-between">
                    <span>Status after publish:</span>
                    <Badge
                      variant="outline"
                      className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      Open
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Completion Checklist</h3>

              <ul className="space-y-2">
                {checklistItems.map(([label, completed]) => (
                  <li key={label} className="flex items-center gap-2 text-xs">
                    <span className={completed ? "text-emerald-500" : "text-slate-300"}>
                      {completed ? "✓" : "○"}
                    </span>
                    <span className={completed ? "text-slate-700" : "text-slate-400"}>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
