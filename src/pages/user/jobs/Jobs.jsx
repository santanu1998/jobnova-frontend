import { Wand2, Sparkles, Briefcase, X, TrendingUp, Search, Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import JobFilter from "./JobFilter";
import JobCard from "./JobCard";
import { fetchJobs } from "../../../reduxt-store/job/jobThunk";
import { enhanceSearch } from "../../../reduxt-store/ai/aiThunk";
import { fetchMySavedJobs } from "../../../reduxt-store/saveJobs/saveJobThunk";
import { fetchMyApplications } from "../../../reduxt-store/application/applicationThunk";
import { EXPERIENCE_LEVELS, JOB_TYPES, WORK_MODES } from "../../../lib/constants";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "salary-high", label: "Salary: high → low" },
  { value: "salary-low", label: "Salary: low → high" },
];

const DEFAULT_FILTERS = {
  jobTypes: [],
  workModes: [],
  expLevels: [],
  minSalary: 0,
  maxSalary: 500000,
  keyword: undefined,
  location: undefined,
};

// AI search may answer with labels like "On-site" or "Senior Level"; map them to backend enum values
const toEnum = (value, allowed) => {
  if (!value) return null;
  const v = String(value).toUpperCase().replace(/[\s-]+/g, "_");
  if (allowed.includes(v)) return v;
  const loose = v.replace(/_/g, "");
  return allowed.find((a) => a.replace(/_/g, "") === loose) ?? null;
};
const toEnums = (values, allowed) => [
  ...new Set((values ?? []).map((v) => toEnum(v, allowed)).filter(Boolean)),
];

const Jobs = () => {
  const [aiQuery, setAiQuery] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [keywordInput, setKeywordInput] = useState("");
  const dispatch = useDispatch();
  const { jobs, jobLoading, jobError } = useSelector((state) => state.job);
  const { isEnhancingSearch } = useSelector((state) => state.ai);

  useEffect(() => {
    dispatch(fetchMySavedJobs());
    dispatch(fetchMyApplications());
  }, [dispatch]);

  useEffect(() => {
    // The server filters on a single value per field; when several are ticked
    // the extra filtering happens client-side in `visibleJobs`.
    const single = (arr) => (arr.length === 1 ? arr[0] : undefined);
    dispatch(
      fetchJobs({
        keyword: filters.keyword || undefined,
        location: filters.location || undefined,
        jobType: single(filters.jobTypes),
        workMode: single(filters.workModes),
        experienceLevel: single(filters.expLevels),
        minSalary: filters.minSalary > 0 ? filters.minSalary : undefined,
        maxSalary: filters.maxSalary < 500000 ? filters.maxSalary : undefined,
      }),
    );
  }, [filters, dispatch]);

  const activeFilterCount =
    [filters.keyword, filters.location].filter(Boolean).length +
    (filters.minSalary > 0 ? 1 : 0) +
    (filters.maxSalary < 500000 ? 1 : 0) +
    filters.jobTypes.length +
    filters.workModes.length +
    filters.expLevels.length;

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setKeywordInput("");
  };

  const handleKeywordSearch = (e) => {
    e?.preventDefault();
    setFilters((prev) => ({ ...prev, keyword: keywordInput.trim() || undefined }));
  };

  const handleEnhance = async () => {
    if (!aiQuery.trim()) {
      setAiMessage("Describe the job you're looking for first.");
      return;
    }
    setAiMessage("");
    const result = await dispatch(enhanceSearch(aiQuery.trim()));

    if (result.meta.requestStatus !== "fulfilled") {
      setAiMessage(result.payload || "AI search is unavailable right now.");
      return;
    }

    const enh = result.payload ?? {};
    const newFilters = {
      ...DEFAULT_FILTERS,
      // Only the first keyword: every word of the keyword must match a job
      keyword: enh.keywords?.[0] || undefined,
      jobTypes: toEnums(enh.jobTypes, JOB_TYPES),
      workModes: toEnums(enh.workModes, WORK_MODES),
      expLevels: toEnums(enh.experienceLevels, EXPERIENCE_LEVELS),
      minSalary: enh.minSalary ? Math.min(Number(enh.minSalary), 500000) : 0,
      location: enh.locations?.[0] || undefined,
    };

    const hasResults =
      newFilters.keyword ||
      newFilters.location ||
      newFilters.minSalary ||
      newFilters.jobTypes.length ||
      newFilters.workModes.length ||
      newFilters.expLevels.length;

    if (!hasResults) {
      setAiMessage(
        "AI couldn't extract any filters from that description. Try adding a role, skill or location.",
      );
      return;
    }

    setKeywordInput(newFilters.keyword ?? "");
    setFilters(newFilters);
  };

  const visibleJobs = useMemo(() => {
    const list = jobs.filter(
      (job) =>
        (filters.jobTypes.length === 0 || filters.jobTypes.includes(job.jobType)) &&
        (filters.workModes.length === 0 || filters.workModes.includes(job.workMode)) &&
        (filters.expLevels.length === 0 || filters.expLevels.includes(job.experienceLevel)),
    );

    if (sortBy === "salary-high")
      return list.sort((a, b) => Number(b.maxSalary ?? 0) - Number(a.maxSalary ?? 0));
    if (sortBy === "salary-low")
      return list.sort((a, b) => Number(a.minSalary ?? 0) - Number(b.minSalary ?? 0));
    return list.sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.createdAt ?? 0) - new Date(a.publishedAt ?? a.createdAt ?? 0),
    );
  }, [sortBy, jobs, filters]);

  return (
    <div className="w-full">
      {/* Hero section */}

      <section className="bg-linear-to-br from-primary via-blue-950 to-indigo-950 py-12 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-white bg-white/15 rounded-full mb-4 text-sm py-1.5 px-3 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            AI-Powered Job Search
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Find Your Next Opportunity
          </h1>
          <p className="text-blue-100 mb-8 text-sm sm:text-base">
            Discover the perfect job match with JobNova's AI-powered search.
          </p>

          {/* Ai Search Card */}

          <div className="bg-white rounded-2xl shadow-xl p-4 space-y-3">
            <div className="relative">
              <Wand2 className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleEnhance();
                }}
                placeholder={
                  "Describe the job you're looking for... \nE.g. Software Engineer with 5 years experience in React and Spring boot"
                }
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className={`text-xs text-left ${aiMessage ? "text-amber-600" : "text-slate-400"}`}>
                {aiMessage || "Tip: Ctrl + Enter to search"}
              </p>
              <Button
                onClick={handleEnhance}
                disabled={isEnhancingSearch}
                className=" rounded-xl px-6 py-6 cursor-pointer"
              >
                {isEnhancingSearch ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-1.5" />
                )}
                {isEnhancingSearch ? "Searching..." : "Search With AI"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="flex flex-col items-center">
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {visibleJobs.length} Jobs Found
                </p>
                <p className="text-xs text-slate-500">
                  {filters.keyword ? `Matching "${filters.keyword}"` : "All open positions"}
                </p>
              </div>

              {activeFilterCount > 0 && (
                <Badge
                  onClick={resetFilters}
                  className="bg-blue-100 text-primary hover:bg-blue-200 cursor-pointer"
                >
                  <X className="h-3 w-3 mr-1" />
                  {activeFilterCount} filters
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <form onSubmit={handleKeywordSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Search title, skill, company..."
                  className="pl-9 w-64 bg-white"
                />
              </form>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div>
              <JobFilter
                filters={filters}
                setFilters={setFilters}
                activeCount={activeFilterCount}
                onReset={resetFilters}
              />
            </div>

            {/* Job list */}
            <div className="lg:col-span-3 space-y-5 ">
              {jobLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-500">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading jobs...
                </div>
              ) : jobError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {jobError}
                </div>
              ) : visibleJobs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <Briefcase className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                  <p className="font-medium text-slate-700">No jobs match your search</p>
                  <p className="text-sm text-slate-500 mt-1">Try removing some filters.</p>
                </div>
              ) : (
                visibleJobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Jobs;
