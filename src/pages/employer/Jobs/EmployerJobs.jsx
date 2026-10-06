import { Plus } from "lucide-react";
import React from "react";
import { Button } from "../../../components/ui/button";
import { useMemo } from "react";

import SatateCard from "../Applicaton/SatateCard";
import { Briefcase } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { Clock } from "lucide-react";
import { Users } from "lucide-react";
import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Eye } from "lucide-react";
import { FileText } from "lucide-react";
import { Sparkles } from "lucide-react";
import { ScrollText } from "lucide-react";
import { Star } from "lucide-react";
import { MapPin } from "lucide-react";
import { User } from "lucide-react";
import { Edit2 } from "lucide-react";
import { Delete } from "lucide-react";
import { XCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import {
  closeJob,
  deleteJob,
  fetchMyJobs,
  publishJob,
} from "../../../reduxt-store/job/jobThunk";
import { useNavigate } from "react-router-dom";
import { fetchMyCompany } from "../../../reduxt-store/company/companyThunk";
import { fetchCompanyApplications } from "../../../reduxt-store/application/applicationThunk";
import { useState } from "react";
import { Send } from "lucide-react";
import DeleteConfirm from "../../user/ResumeEdit/shared/DeleteConfirm";
import { JOB_STATUSES, formatEnum } from "../../../lib/constants";

const STATUS_STYLE = {
  OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
  CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
  EXPIRED: "bg-red-50 text-red-700 border-red-200",
  FILLED: "bg-blue-50 text-blue-700 border-blue-200",
  ARCHIVED: "bg-slate-100 text-slate-500 border-slate-200",
};

function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_FILTERS = ["ALL", ...JOB_STATUSES];
const EmployerJobs = () => {
  const navigate = useNavigate();
  const { myJobs: jobs, isLoading, actionError } = useSelector((state) => state.job);
  const { myCompany } = useSelector((state) => state.company);
  const { applications } = useSelector((state) => state.application);
  const [toDelete, setToDelete] = useState(null);

  // JobResponse has no applicant count, so derive it from the company's applications
  const appCountByJob = useMemo(() => {
    const counts = {};
    for (const a of applications) {
      const id = a.job?.id;
      if (id != null) counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, [applications]);
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [search, setSearch] = useState("");

  const stats = useMemo(
    () => ({
      total: jobs.length,
      open: jobs.filter((job) => job.status === "OPEN").length,
      draft: jobs.filter((job) => job.status === "DRAFT").length,
      closed: jobs.filter((job) => job.status === "CLOSED").length,
      appTotal: jobs.reduce((acc, job) => acc + (appCountByJob[job.id] ?? 0), 0),
    }),
    [jobs, appCountByJob],
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        job.title?.toLowerCase().includes(q) ||
        job.category?.name?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter == "ALL" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, statusFilter, search]);

  const handlePublishJob = (id) => {
    dispatch(publishJob(id));
  };
  const handleCloseJob = (id) => {
    dispatch(closeJob(id));
  };

  const handleDelete = () => {
    if (toDelete) dispatch(deleteJob(toDelete.id));
    setToDelete(null);
  };

  useEffect(() => {
    if (myCompany?.id) {
      dispatch(fetchMyJobs(myCompany.id));
      dispatch(fetchCompanyApplications({}));
    }
  }, [myCompany?.id, dispatch]);

  useEffect(() => {
    dispatch(fetchMyCompany());
  }, [dispatch]);
  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs Posting</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all your job listings in one place
          </p>
        </div>
        <Button
          onClick={() => navigate("/employer/jobs/create")}
          className="gap-2 bg-primary hover:bg-primary/90 shrink-0"
        >
          <Plus />
          Post a Job
        </Button>
      </section>

      {/* state */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SatateCard
          label="Total Jobs"
          value={stats.total}
          icon={Briefcase}
          color="bg-blue-50 text-primary"
        />
        <SatateCard
          label="Active (Open)"
          value={stats.open}
          icon={TrendingUp}
          color="bg-yellow-50 text-yellow-600"
        />
        <SatateCard
          label="Draft"
          value={stats.draft}
          icon={Clock}
          color="bg-green-50 text-green-600"
        />
        <SatateCard
          label="Total Applications"
          value={stats.appTotal}
          icon={Users}
          color="bg-purple-50 text-purple-600"
        />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-slate-200"
              placeholder="Search by job title or category..."
            />
          </div>
          <div className="flex gap-1.5 flex-wrap ">
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
        </div>
      </section>

      {actionError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className={"bg-slate-50 hover:bg-slate-50"}>
              <TableHead className="font-semibold text-slate-700">
                Job Title
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Status
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Type / Mode
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Location
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Applicants
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Posted
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-slate-500">
                  {isLoading ? "Loading jobs..." : jobs.length === 0 ? "You haven't posted any jobs yet." : "No jobs match these filters."}
                </TableCell>
              </TableRow>
            )}
            {filteredJobs.map((job) => {
              const location = [job.city, job.state, job.country].filter(Boolean).join(", ");
              return (
                <TableRow key={job.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900 text-sm">
                      {job.title}
                    </p>
                    {job.category?.name && (
                      <p className="text-xs text-slate-500">{job.category.name}</p>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={STATUS_STYLE[job.status]}>
                      {formatEnum(job.status)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge className={"text-xs"} variant="outline">
                        {formatEnum(job.jobType)}
                      </Badge>
                      <Badge>{formatEnum(job.workMode)}</Badge>
                    </div>
                  </TableCell>

                  {/* ai score */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {location || "—"}
                    </div>
                  </TableCell>

                  <TableCell className="text-left ">
                    <button
                      type="button"
                      onClick={() => navigate(`/employer/applications?jobId=${job.id}`)}
                      className="flex items-center gap-1 hover:text-primary"
                      title="View applications"
                    >
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{appCountByJob[job.id] ?? 0}</span>
                      <span className="text-slate-400">/ {job.openings ?? 0} openings</span>
                    </button>
                  </TableCell>
                  <TableCell>{fmtDate(job.publishedAt ?? job.createdAt)}</TableCell>

                  <TableCell className={"text-right"}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/employer/jobs/${job.id}/edit`)
                          }
                        >
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => navigate(`/employer/applications?jobId=${job.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" /> View Applications
                        </DropdownMenuItem>

                        {job.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => handlePublishJob(job.id)}>
                            <Send className="mr-2 h-4 w-4" /> Publish
                          </DropdownMenuItem>
                        )}
                        {job.status === "OPEN" && (
                          <DropdownMenuItem onClick={() => handleCloseJob(job.id)}>
                            <XCircle className="mr-2 h-4 w-4" /> Close
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setToDelete(job)}
                        >
                          <Delete className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      <DeleteConfirm
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        label={toDelete ? `"${toDelete.title}"` : "job"}
      />
    </div>
  );
};

export default EmployerJobs;
