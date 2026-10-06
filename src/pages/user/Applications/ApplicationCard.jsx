import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, MapPin, Briefcase, DollarSign, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Textarea } from "../../../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import CompanyLogo from "../../../components/CompanyLogo";
import { withdrawApplication } from "../../../reduxt-store/application/applicationThunk";
import { formatEnum } from "../../../lib/constants";

export const PIPELINE = ["PENDING", "REVIEWING", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED"];

const STATUS_STYLE = {
  PENDING: "bg-slate-100 text-slate-700",
  REVIEWING: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-purple-100 text-purple-700",
  INTERVIEW_SCHEDULED: "bg-indigo-100 text-indigo-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-amber-100 text-amber-700",
};

const ApplicationCard = ({ app }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");

  const pipelineIndex = PIPELINE.indexOf(app.status);
  const job = app.job ?? {};
  const company = app.company ?? job.company;
  const location = [job.city, job.state, job.country].filter(Boolean).join(", ");
  const canWithdraw = !["WITHDRAWN", "REJECTED", "HIRED"].includes(app.status);

  const handleWithdraw = () => {
    dispatch(withdrawApplication({ id: app.id, reason: reason.trim() || null }));
    setConfirmOpen(false);
  };

  return (
    <Card>
      <CardContent className={"p-5"}>
        <div className="flex items-start gap-4">
          <CompanyLogo company={company} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-1">
                  {job.title ?? "Job no longer available"}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="text-slate-700 font-medium text-sm">{company?.name}</span>
                  {company?.status === "ACTIVE" && (
                    <CheckCircle2 className="h-4 w-4 fill-primary text-white shrink-0" />
                  )}
                  {company?.industryType && (
                    <span className="text-slate-400 text-sm">
                      · {formatEnum(company.industryType)}
                    </span>
                  )}
                </div>
              </div>
              <Badge className={STATUS_STYLE[app.status] ?? "bg-slate-100 text-slate-700"}>
                {formatEnum(app.status)}
              </Badge>
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
                Applied {app.appliedAt?.split("T")[0]}
              </div>
            </div>

            {pipelineIndex >= 0 && (
              <div className="flex flex-wrap gap-2">
                {PIPELINE.map((item, i) => (
                  <div
                    key={item}
                    title={formatEnum(item)}
                    className={`h-1.5 rounded-full flex-1 transition-colors ${
                      pipelineIndex >= i ? "bg-primary" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            )}

            {app.status === "WITHDRAWN" && app.withdrawnReason && (
              <p className="text-xs text-amber-700 mt-2">Withdrawn: {app.withdrawnReason}</p>
            )}

            <Separator className={"mt-4 mb-3"} />

            <div className="flex items-center justify-end gap-1">
              {job.id && (
                <Button variant="ghost" onClick={() => navigate(`/jobs/${job.id}`)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Job
                </Button>
              )}
              <Button
                onClick={() => setConfirmOpen(true)}
                className={"text-red-500"}
                variant="ghost"
                disabled={!canWithdraw}
              >
                {app.status === "WITHDRAWN" ? "Withdrawn" : "Withdraw"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw this application?</AlertDialogTitle>
            <AlertDialogDescription>
              The employer will no longer be able to move your application forward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleWithdraw} className="bg-red-600 hover:bg-red-700">
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ApplicationCard;
