import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Share,
  Users,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { fetchJobById } from "../../../reduxt-store/job/jobThunk";
import {
  fetchMySavedJobs,
  saveJob,
  unsaveJob,
} from "../../../reduxt-store/saveJobs/saveJobThunk";
import { fetchMyApplications } from "../../../reduxt-store/application/applicationThunk";
import { formatEnum } from "../../../lib/constants";
import { cn } from "../../../lib/utils";

const Section = ({ title, text }) =>
  text ? (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 whitespace-pre-line leading-relaxed">{text}</p>
      </CardContent>
    </Card>
  ) : null;

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-500">{label}</span>
    <p className="text-slate-900 font-medium">{value || "—"}</p>
  </div>
);

const JobDetails = () => {
  const { currentJob: job, isLoading, error } = useSelector((state) => state.job);
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);

  const savedJobId = useSelector((state) => state.savedJob.savedJobMap[id]);
  const myApplication = useSelector((state) =>
    state.application.myApplications.find(
      (a) => String(a.job?.id) === String(id) && a.status !== "WITHDRAWN",
    ),
  );

  useEffect(() => {
    if (id) dispatch(fetchJobById(id));
    dispatch(fetchMySavedJobs());
    dispatch(fetchMyApplications());
  }, [id, dispatch]);

  if (isLoading && String(job?.id) !== String(id)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading job...
      </div>
    );
  }

  if (!job || String(job.id) !== String(id)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="font-bold text-2xl text-slate-800">Job not found</h1>
        {error && <p className="text-sm text-slate-500">{error}</p>}
        <Button onClick={() => navigate("/jobs")}>Browse jobs</Button>
      </div>
    );
  }

  const location = [job.city, job.state, job.country].filter(Boolean).join(", ");
  const salary =
    job.minSalary || job.maxSalary
      ? `₹${Number(job.minSalary ?? 0).toLocaleString()} - ₹${Number(job.maxSalary ?? 0).toLocaleString()}`
      : "Not disclosed";
  const isOpen = job.status === "OPEN";

  const toggleSave = () => {
    if (savedJobId) dispatch(unsaveJob(savedJobId));
    else dispatch(saveJob({ jobId: job.id }));
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-3">
      <Button onClick={() => navigate(-1)} variant="ghost">
        <ArrowLeft />
        Back To Jobs
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className={"p-5"}>
              <div className="flex items-start gap-4">
                {/* company logo */}
                <div className="h-16 w-16 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                  {job.company?.logoUrl ? (
                    <img
                      className="h-full w-full object-cover rounded-xl"
                      src={job.company.logoUrl}
                      alt={job.company?.name}
                    />
                  ) : (
                    <span className="text-xl font-bold text-primary">
                      {job.company?.name?.charAt(0) ?? "J"}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="text-slate-700 font-medium text-sm">
                          {job.company?.name}
                        </span>
                        {job.company?.status === "ACTIVE" && (
                          <CheckCircle2 className="h-4 w-4 fill-primary text-white shrink-0" />
                        )}
                        {job.company?.industryType && (
                          <span className="text-slate-400 text-sm">
                            · {formatEnum(job.company.industryType)}
                          </span>
                        )}
                        {job.company?.companySize && (
                          <span className="text-slate-400 text-sm">
                            · {formatEnum(job.company.companySize)}
                          </span>
                        )}
                      </div>
                      {job.company?.tagline && (
                        <p className="text-slate-400 text-xs mt-0.5 italic">
                          {job.company.tagline}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" onClick={toggleSave} title="Save job">
                      <Bookmark className={cn(savedJobId && "fill-primary text-primary")} />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {location || "Location not specified"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 shrink-0" />
                      {formatEnum(job.jobType)}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      {salary}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 shrink-0" />
                      Posted {job.publishedAt ?? job.createdAt}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.workMode && (
                      <Badge className={"bg-primary"}>{formatEnum(job.workMode)}</Badge>
                    )}
                    {job.experienceLevel && (
                      <Badge variant="outline">{formatEnum(job.experienceLevel)}</Badge>
                    )}
                    {job.category?.name && (
                      <Badge variant="secondary">{job.category.name}</Badge>
                    )}
                    {(job.skills ?? []).map((skill) => (
                      <Badge key={skill.id} variant="outline">
                        {skill.name}
                      </Badge>
                    ))}
                    {(job.tags ?? []).map((tag) => (
                      <Badge key={`tag-${tag.id}`} variant="secondary">
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Section title="About the role" text={job.description} />
          <Section title="Responsibilities" text={job.responsibilities} />
          <Section title="Requirements" text={job.requirements} />
          <Section title="Benefits" text={job.benefits} />
        </div>

        {/* Apply Card */}
        <div>
          <Card className="sticky top-20">
            <CardContent className={"space-y-6"}>
              {myApplication ? (
                <Button
                  variant="outline"
                  className={"w-full py-5"}
                  onClick={() => navigate("/applications")}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                  Applied · {formatEnum(myApplication.status)}
                </Button>
              ) : (
                <Button
                  disabled={!isOpen}
                  onClick={() => navigate(`/apply/${job.id}`)}
                  className={"w-full py-5"}
                >
                  {isOpen ? "Apply Now" : `This job is ${formatEnum(job.status)}`}
                </Button>
              )}
              <div className="flex gap-2 justify-between">
                <Button variant="outline" className={"flex-1"} onClick={toggleSave}>
                  <Bookmark className={cn("h-4 w-4", savedJobId && "fill-primary text-primary")} />
                  {savedJobId ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" onClick={handleShare} title="Copy link">
                  <Share />
                  {copied && <span className="text-xs">Copied</span>}
                </Button>
              </div>

              <Separator />

              <div className="text-sm text-slate-600 space-y-2">
                <DetailRow label="Job Type" value={formatEnum(job.jobType)} />
                <DetailRow label="Work Mode" value={formatEnum(job.workMode)} />
                <DetailRow label="Experience" value={formatEnum(job.experienceLevel)} />
                <DetailRow label="Salary" value={salary} />
                <DetailRow label="Openings" value={job.openings} />
                <DetailRow label="Deadline" value={job.applicationDeadline} />
              </div>

              <Separator />

              <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {job.openings ?? 1} openings
                </span>
                {job.expiresAt && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> Expires {job.expiresAt}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
