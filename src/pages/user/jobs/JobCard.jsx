import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Bookmark } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { MapPin } from "lucide-react";
import { Briefcase } from "lucide-react";
import { DollarSign } from "lucide-react";
import { Clock } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { saveJob, unsaveJob } from "../../../reduxt-store/saveJobs/saveJobThunk";
import { formatEnum } from "../../../lib/constants";
import { cn } from "../../../lib/utils";

const JobCard = ({ job }) => {
  const navigate=useNavigate()

  const location = [job.city, job.state, job.country]
    .filter(Boolean)
    .join(", ");


  const dispatch = useDispatch();
  const savedJobId = useSelector((state) => state.savedJob.savedJobMap[job.id]);
  const hasApplied = useSelector((state) =>
    state.application.myApplications.some(
      (a) => a.job?.id === job.id && a.status !== "WITHDRAWN",
    ),
  );

  const handleSavedJob = () => {
    if (savedJobId) dispatch(unsaveJob(savedJobId));
    else dispatch(saveJob({ jobId: job.id }));
  };

  const salary =
    job.minSalary || job.maxSalary
      ? `${Number(job.minSalary ?? 0).toLocaleString()} - ${Number(job.maxSalary ?? 0).toLocaleString()}`
      : "Not disclosed";
  return (
  
    <Card >
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
            {/* Title Row + Bookmmar */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-1">
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
              <Button
                onClick={handleSavedJob}
                variant="ghost"
                title={savedJobId ? "Remove from saved jobs" : "Save job"}
              >
                <Bookmark className={cn(savedJobId && "fill-primary text-primary")} />
              </Button>
            </div>

            {/* job details */}

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
                Posted {(job.publishedAt ?? job.createdAt)?.split("T")[0]}
              </div>
            </div>

            {/* Badges - job details */}

            <div className="flex flex-wrap gap-2">
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

            <>
              <Separator className={"mt-4 mb-3"} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {job.openings ?? 1} openings
                  </span>
                  {job.applicationDeadline && (
                    <span>Apply by {job.applicationDeadline}</span>
                  )}
                </div>

                {hasApplied ? (
                  <Button size="sm" variant="outline" disabled>
                    Applied
                  </Button>
                ) : (
                  <Button onClick={() => navigate(`/jobs/${job.id}`)} size="sm">View &amp; Apply</Button>
                )}
              </div>
            </>
          </div>
        </div>
      </CardContent>
    </Card>
    
  );
};

export default JobCard;
