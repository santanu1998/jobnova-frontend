import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles, Loader2, AlertCircle, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import api from "../../../reduxt-store/api";
import { getCareerFeedback } from "../../../reduxt-store/ai/aiThunk";
import { resumeToText } from "../../../lib/resumeText";

const PRIORITY_STYLE = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-700",
};

const CareerFeedbackDialog = ({ resume, open, onClose }) => {
  const dispatch = useDispatch();
  const { isGettingCareerFeedback } = useSelector((s) => s.ai);
  const [target, setTarget] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");

  const run = async () => {
    setError("");
    setFeedback(null);
    // the list entry may be partial — load the full resume first
    let full = resume;
    try {
      full = (await api.get(`/api/resumes/${resume.id}`)).data;
    } catch {
      // fall back to what we have
    }
    const resumeContent = resumeToText(full);
    if (!resumeContent) {
      setError("This resume is empty. Add some details before asking for feedback.");
      return;
    }
    const result = await dispatch(
      getCareerFeedback({ resumeContent, targetJobTitle: target.trim() || null }),
    );
    if (result.error) setError(result.payload || "Failed to get career feedback");
    else setFeedback(result.payload);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" /> AI Career Feedback
          </DialogTitle>
          <DialogDescription>
            JobNova AI reviews "{resume.title}" and suggests how to get shortlisted more often.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target role (optional), e.g. Backend Engineer"
          />
          <Button onClick={run} disabled={isGettingCareerFeedback}>
            {isGettingCareerFeedback ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Analyze
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {feedback && (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Profile strength</span>
                <span className="font-bold text-primary">{feedback.profileStrength}%</span>
              </div>
              <Progress value={feedback.profileStrength} className="h-2" />
            </div>

            {feedback.overallSummary && (
              <p className="text-sm text-slate-700">{feedback.overallSummary}</p>
            )}

            {feedback.shortlistingIssues?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">What's holding you back</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                  {feedback.shortlistingIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.improvements?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Improvements</h4>
                <div className="space-y-2">
                  {feedback.improvements.map((imp, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-800">{imp.area}</span>
                        {imp.priority && (
                          <Badge className={PRIORITY_STYLE[imp.priority?.toUpperCase()] ?? PRIORITY_STYLE.LOW}>
                            {imp.priority}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{imp.issue}</p>
                      <p className="text-sm text-slate-700 mt-1">{imp.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {feedback.targetJobs?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Roles that fit you</h4>
                <div className="space-y-2">
                  {feedback.targetJobs.map((job, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">
                          {job.jobTitle}
                          {job.skillMatch && (
                            <span className="text-xs text-slate-500"> · {job.skillMatch} match</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">{job.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CareerFeedbackDialog;
