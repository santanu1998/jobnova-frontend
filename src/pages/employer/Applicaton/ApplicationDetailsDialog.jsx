import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Sparkles, Trash2, Star, Mail, Phone, CalendarDays, IndianRupee } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Textarea } from "../../../components/ui/textarea";
import { Separator } from "../../../components/ui/separator";
import AiScoreCircle from "./AiScoreCircle";
import {
  addNote,
  deleteNote,
  fetchApplicationById,
  fetchApplicationResume,
  screenApplication,
  toggleStar,
} from "../../../reduxt-store/application/applicationThunk";
import { formatEnum } from "../../../lib/constants";

const ListBlock = ({ title, items, tone }) =>
  items?.length ? (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{title}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((s) => (
          <Badge key={s} variant="outline" className={tone}>
            {s}
          </Badge>
        ))}
      </div>
    </div>
  ) : null;

const ApplicationDetailsDialog = ({ applicationId, open, onClose, onUpdateStatus }) => {
  const dispatch = useDispatch();
  const { currentApplication: app, isActionLoading } = useSelector((s) => s.application);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [screening, setScreening] = useState(false);
  const [resume, setResume] = useState(null);
  const [resumeError, setResumeError] = useState("");

  useEffect(() => {
    if (!open || !applicationId) return;
    dispatch(fetchApplicationById(applicationId));
    setResume(null);
    setResumeError("");
    dispatch(fetchApplicationResume(applicationId)).then((r) =>
      r.error ? setResumeError(r.payload) : setResume(r.payload),
    );
  }, [open, applicationId, dispatch]);

  const loaded = app && app.id === applicationId;

  const handleAddNote = async () => {
    if (!note.trim()) return;
    const result = await dispatch(addNote({ applicationId, content: note.trim() }));
    if (result.error) setError(result.payload);
    else setNote("");
  };

  // Application-Service scores the job against the candidate's resume + cover letter and stores it
  const handleScreen = async () => {
    setError("");
    setScreening(true);
    const result = await dispatch(screenApplication(applicationId));
    setScreening(false);
    if (result.error) setError(result.payload || "AI screening failed");
  };

  const result = loaded ? app.screening : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {!loaded ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading application...
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {app.candidate?.fullName ?? "Candidate"}
                <Badge variant="outline">{formatEnum(app.status)}</Badge>
              </DialogTitle>
              <DialogDescription>
                Applied for <span className="font-medium">{app.job?.title}</span> on{" "}
                {app.appliedAt?.split("T")[0]}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" /> {app.candidate?.email ?? "—"}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" /> {app.candidate?.phoneNumber ?? "—"}
              </span>
              <span className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-slate-400" /> Expected:{" "}
                {app.expectedSalary != null ? Number(app.expectedSalary).toLocaleString() : "—"}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" /> Available from:{" "}
                {app.availableFrom ?? "—"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onUpdateStatus(app)}>
                Update Status
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => dispatch(toggleStar(app.id))}
                disabled={isActionLoading}
              >
                <Star className={`h-4 w-4 ${app.isStarred ? "fill-amber-400 text-amber-500" : ""}`} />
                {app.isStarred ? "Starred" : "Star"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-primary border-blue-200"
                onClick={handleScreen}
                disabled={screening}
              >
                {screening ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {result ? "Re-run AI Screening" : "Run AI Screening"}
              </Button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {result && (
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <AiScoreCircle score={result.overallScore} size={56} />
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p className="font-semibold text-slate-800">
                      {formatEnum(result.shortlistStatus)}
                    </p>
                    {result.skillsMatchScore != null && <p>Skills match: {result.skillsMatchScore}%</p>}
                    {result.experienceMatchScore != null && (
                      <p>Experience match: {result.experienceMatchScore}%</p>
                    )}
                  </div>
                </div>
                {result.summary && <p className="text-sm text-slate-700">{result.summary}</p>}
                <ListBlock title="Matched skills" items={result.matchedSkills} tone="bg-green-50 text-green-700" />
                <ListBlock title="Missing skills" items={result.missingSkills} tone="bg-red-50 text-red-700" />
                <ListBlock title="Strengths" items={result.strengths} />
                <ListBlock title="Concerns" items={result.concerns} />
                {!result.summary && (
                  <p className="text-[11px] text-slate-400">Re-run screening to see the detailed breakdown.</p>
                )}
              </div>
            )}

            <Separator />

            <div>
              <p className="text-sm font-semibold text-slate-900 mb-1">Cover Letter</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {app.coverLetter || "No cover letter provided."}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Resume</p>
              {resumeError ? (
                <p className="text-sm text-slate-500">{resumeError}</p>
              ) : !resume ? (
                <p className="text-sm text-slate-400">Loading resume...</p>
              ) : (
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="font-medium">
                    {resume.title}
                    {resume.personalInfo?.headline && (
                      <span className="text-slate-500 font-normal"> · {resume.personalInfo.headline}</span>
                    )}
                  </p>
                  {resume.summary && <p className="whitespace-pre-line">{resume.summary}</p>}
                  <ListBlock title="Skills" items={(resume.skills ?? []).map((s) => s.skillName)} />
                  {(resume.workExperiences ?? []).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Experience</p>
                      {resume.workExperiences.map((e) => (
                        <p key={e.id} className="text-xs">
                          {e.jobTitle} at {e.companyName} ({e.startDate} - {e.isCurrentlyWorking ? "Present" : e.endDate ?? "—"})
                        </p>
                      ))}
                    </div>
                  )}
                  {(resume.educations ?? []).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Education</p>
                      {resume.educations.map((e) => (
                        <p key={e.id} className="text-xs">
                          {e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ""}, {e.institutionName}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs">
                    {[
                      ["LinkedIn", resume.personalInfo?.linkedinUrl],
                      ["GitHub", resume.personalInfo?.githubUrl],
                      ["Portfolio", resume.personalInfo?.portfolioUrl],
                    ]
                      .filter(([, url]) => url)
                      .map(([label, url]) => (
                        <a key={label} href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          {label}
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {app.status === "WITHDRAWN" && (
              <p className="text-sm text-amber-700">
                Withdrawn{app.withdrawnReason ? `: ${app.withdrawnReason}` : ""}
              </p>
            )}

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Internal Notes</p>
              <div className="flex gap-2">
                <Textarea
                  rows={2}
                  maxLength={2000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a private note about this candidate..."
                />
                <Button onClick={handleAddNote} disabled={!note.trim() || isActionLoading}>
                  Add
                </Button>
              </div>
              {(app.notes ?? []).length === 0 ? (
                <p className="text-xs text-slate-400">No notes yet.</p>
              ) : (
                [...app.notes]
                  .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
                  .map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-slate-200 p-3"
                    >
                      <div>
                        <p className="text-sm text-slate-700 whitespace-pre-line">{n.content}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {n.createdAt?.replace("T", " ").slice(0, 16)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-600"
                        onClick={() => dispatch(deleteNote({ applicationId, noteId: n.id }))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailsDialog;
