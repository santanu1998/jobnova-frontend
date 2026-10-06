import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Users, Search, Filter, Sparkles, Star, Clock, CheckCircle2, BrainCircuit } from "lucide-react";
import SatateCard from "./SatateCard";
import ApplicationTable from "./ApplicationTable";
import UpdateStatusDialog from "./UpdateStatusDialog";
import ApplicationDetailsDialog from "./ApplicationDetailsDialog";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { cn } from "../../../lib/utils";
import { fetchCompanyApplications } from "../../../reduxt-store/application/applicationThunk";
import { fetchMyJobs } from "../../../reduxt-store/job/jobThunk";
import { fetchMyCompany } from "../../../reduxt-store/company/companyThunk";
import { APPLICATION_STATUSES, formatEnum } from "../../../lib/constants";

const AI_SHORTLIST_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "AUTO_SHORTLISTED", label: "Auto Shortlisted" },
  { value: "REVIEW_RECOMMENDED", label: "Review Recommended" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "LOW_MATCH", label: "Low Match" },
  { value: "NOT_SCREENED", label: "Not Screened" },
];

const STATUS_FILTERS = ["ALL", ...APPLICATION_STATUSES];

const EmployerApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobFilter, setJobFilter] = useState(searchParams.get("jobId") ?? "all");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [starredOnly, setStarredOnly] = useState(false);
  const [aiFilter, setAiFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DEFAULT");
  const [search, setSearch] = useState("");
  const [statusDialog, setStatusDialog] = useState(null);
  const [detailsId, setDetailsId] = useState(
    searchParams.get("applicationId") ? Number(searchParams.get("applicationId")) : null,
  );
  const dispatch = useDispatch();
  const { applications, isLoading, error } = useSelector((state) => state.application);
  const { myJobs: jobs } = useSelector((state) => state.job);
  const { myCompany } = useSelector((state) => state.company);

  useEffect(() => {
    dispatch(fetchMyCompany());
  }, [dispatch]);

  useEffect(() => {
    if (myCompany?.id) dispatch(fetchMyJobs(myCompany.id));
  }, [myCompany?.id, dispatch]);

  useEffect(() => {
    if (!myCompany?.id) return;
    const filters = { jobId: jobFilter };
    if (statusFilter !== "ALL") filters.status = statusFilter;
    if (starredOnly) filters.isStarred = true;
    if (aiFilter !== "ALL") filters.aiShortlistStatus = aiFilter;
    if (sortBy !== "DEFAULT") filters.sortBy = sortBy;
    dispatch(fetchCompanyApplications(filters));
  }, [myCompany?.id, jobFilter, statusFilter, starredOnly, aiFilter, sortBy, dispatch]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = !q
      ? applications
      : applications.filter(
          (a) =>
            a.candidate?.fullName?.toLowerCase().includes(q) ||
            a.candidate?.email?.toLowerCase().includes(q) ||
            a.job?.title?.toLowerCase().includes(q),
        );
    // AI scores computed in this session aren't known to the server sort
    if (sortBy === "AI_SCORE_DESC" || sortBy === "AI_SCORE_ASC") {
      const dir = sortBy === "AI_SCORE_DESC" ? -1 : 1;
      list = [...list].sort((a, b) => {
        const sa = a.screening?.overallScore;
        const sb = b.screening?.overallScore;
        if (sa == null && sb == null) return 0;
        if (sa == null) return 1;
        if (sb == null) return -1;
        return (sa - sb) * dir;
      });
    }
    return list;
  }, [applications, search, sortBy]);

  const stats = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((app) => app.status === "PENDING").length,
      shortlisted: applications.filter((app) => app.status === "SHORTLISTED").length,
      starred: applications.filter((app) => app.isStarred).length,
      autoShortlisted: applications.filter(
        (app) => app.screening?.shortlistStatus === "AUTO_SHORTLISTED",
      ).length,
    }),
    [applications],
  );

  const handleJobFilter = (value) => {
    setJobFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("jobId");
    else next.set("jobId", value);
    setSearchParams(next, { replace: true });
  };

  const closeDetails = () => {
    setDetailsId(null);
    if (searchParams.get("applicationId")) {
      const next = new URLSearchParams(searchParams);
      next.delete("applicationId");
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <main className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
        <p className="text-sm text-slate-500 mt-1">Review and manage all candidate applications</p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SatateCard label="Total" value={stats.total} icon={Users} color="bg-blue-50 text-primary" />
        <SatateCard label="Pending" value={stats.pending} icon={Clock} color="bg-yellow-50 text-yellow-600" />
        <SatateCard
          label="Shortlisted"
          value={stats.shortlisted}
          icon={CheckCircle2}
          color="bg-green-50 text-green-600"
        />
        <SatateCard label="Starred" value={stats.starred} icon={Star} color="bg-amber-50 text-amber-600" />
        <SatateCard
          label="Auto-Shortlisted"
          value={stats.autoShortlisted}
          icon={BrainCircuit}
          color="bg-indigo-50 text-primary"
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-slate-200"
              placeholder="Search by candidate name, email or job title..."
            />
          </div>
          <Select value={String(jobFilter)} onValueChange={handleJobFilter}>
            <SelectTrigger className="border-slate-200 text-sm w-full sm:w-48">
              <Filter />
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={String(job.id)}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={aiFilter} onValueChange={setAiFilter}>
            <SelectTrigger className="border-slate-200 text-sm w-full sm:w-48">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
              <SelectValue placeholder="AI Shortlist" />
            </SelectTrigger>
            <SelectContent>
              {AI_SHORTLIST_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-slate-200 text-sm w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DEFAULT">Newest First</SelectItem>
              <SelectItem value="AI_SCORE_DESC">AI Score: High to Low</SelectItem>
              <SelectItem value="AI_SCORE_ASC">AI Score: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex gap-1.5 flex-wrap flex-1">
            {STATUS_FILTERS.map((status) => (
              <button
                onClick={() => setStatusFilter(status)}
                key={status}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "ALL" ? "All" : formatEnum(status)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStarredOnly(!starredOnly)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors",
              starredOnly
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200",
            )}
          >
            <Star className="h-3.5 w-3.5" /> Starred
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading && applications.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">Loading applications...</p>
        ) : (
          <ApplicationTable
            onUpdateStatus={(app) => setStatusDialog({ id: app.id, currentStatus: app.status })}
            onViewDetails={(app) => setDetailsId(app.id)}
            applications={visible}
            isFullMode={true}
          />
        )}
      </section>

      {statusDialog && (
        <UpdateStatusDialog
          open={!!statusDialog}
          onClose={() => setStatusDialog(null)}
          applicationId={statusDialog.id}
          currentStatus={statusDialog.currentStatus}
        />
      )}

      {detailsId && (
        <ApplicationDetailsDialog
          applicationId={detailsId}
          open={!!detailsId}
          onClose={closeDetails}
          onUpdateStatus={(app) => setStatusDialog({ id: app.id, currentStatus: app.status })}
        />
      )}
    </main>
  );
};

export default EmployerApplications;
