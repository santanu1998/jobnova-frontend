import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Bookmark,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CompanyLogo from "../../../components/CompanyLogo";
import api from "../../../reduxt-store/api";
import { unsaveJob } from "../../../reduxt-store/saveJobs/saveJobThunk";
import { formatEnum } from "../../../lib/constants";

// SavedJobResponse only carries the jobId, so each card loads its own job.
// (Fetched directly so it doesn't overwrite the shared `currentJob` in the store.)
const SavedJobCard = ({ savedJob }) => {
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState("loading");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api
      .get(`/api/jobs/${savedJob.jobId}`)
      .then(({ data }) => {
        if (!cancelled) {
          setJob(data);
          setStatus("ready");
        }
      })
      .catch(() => !cancelled && setStatus("missing"));
    return () => {
      cancelled = true;
    };
  }, [savedJob.jobId]);

  const handleUnsaved = () => dispatch(unsaveJob(savedJob.id));

  if (status !== "ready") {
    return (
      <Card>
        <CardContent className="p-5 flex items-center justify-between text-sm text-slate-500">
          {status === "loading" ? "Loading saved job..." : "This job is no longer available."}
          {status === "missing" && (
            <Button variant="outline" size="sm" onClick={handleUnsaved}>
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const location = [job.city, job.state, job.country].filter(Boolean).join(", ");

  return (
    <Card>
      <CardContent className={"p-5"}>
        <div className="flex items-start gap-4">
          <CompanyLogo company={job.company} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-1">
                  {job.title}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="text-slate-700 font-medium text-sm">{job.company?.name}</span>
                  {job.company?.status === "ACTIVE" && (
                    <CheckCircle2 className="h-4 w-4 fill-primary text-white shrink-0" />
                  )}
                  {job.company?.industryType && (
                    <span className="text-slate-400 text-sm">
                      · {formatEnum(job.company.industryType)}
                    </span>
                  )}
                </div>
                {job.company?.tagline && (
                  <p className="text-slate-400  text-xs mt-0.5 italic">{job.company.tagline}</p>
                )}
              </div>
              <Button onClick={handleUnsaved} variant="ghost" title="Remove from saved jobs">
                <Bookmark className="text-primary fill-primary" />
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
              {(job.minSalary || job.maxSalary) && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  {Number(job.minSalary ?? 0).toLocaleString()} -{" "}
                  {Number(job.maxSalary ?? 0).toLocaleString()}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 shrink-0" />
                Saved {savedJob.savedAt?.split("T")[0]}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {job.status !== "OPEN" && (
                <Badge className="bg-amber-100 text-amber-700">{formatEnum(job.status)}</Badge>
              )}
              {job.workMode && <Badge className={"bg-primary"}>{formatEnum(job.workMode)}</Badge>}
              {job.experienceLevel && (
                <Badge variant="outline">{formatEnum(job.experienceLevel)}</Badge>
              )}
              {job.category?.name && <Badge variant="secondary">{job.category.name}</Badge>}
              {(job.skills ?? []).map((skill) => (
                <Badge key={skill.id} variant="outline">
                  {skill.name}
                </Badge>
              ))}
            </div>

            <Separator className={"mt-4 mb-3"} />
            <div className="flex items-center gap-3">
              <Button className="h-8" onClick={() => navigate(`/jobs/${job.id}`)}>
                <ExternalLink className="h-3.5 w-3.5" />
                View Job
              </Button>
              <Button
                onClick={handleUnsaved}
                variant="outline"
                className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedJobCard;
