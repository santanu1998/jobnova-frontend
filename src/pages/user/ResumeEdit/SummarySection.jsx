import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import CopyFromMenu from "./shared/CopyFromMenu";
import { Textarea } from "../../../components/ui/textarea";
import { updateResumeSummary } from "../../../reduxt-store/resume/resumeThunk";
import { generateResumeSummary } from "../../../reduxt-store/ai/aiThunk";

// Builds a ResumeSummaryRequest from the resume's own sections
const toSummaryRequest = (resume) => {
  const years = (resume?.workExperiences ?? []).reduce((total, e) => {
    if (!e.startDate) return total;
    const end = e.isCurrentlyWorking || !e.endDate ? new Date() : new Date(e.endDate);
    return total + Math.max(0, (end - new Date(e.startDate)) / (365.25 * 24 * 3600 * 1000));
  }, 0);
  return {
    targetJobTitle: resume?.personalInfo?.headline || resume?.workExperiences?.[0]?.jobTitle || "",
    workExperiences: (resume?.workExperiences ?? []).map((e) => ({
      jobTitle: e.jobTitle,
      company: e.companyName,
      description: e.jobDescription,
    })),
    skills: (resume?.skills ?? []).map((s) => s.skillName),
    educations: (resume?.educations ?? []).map((e) => ({
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      institutionName: e.institutionName,
    })),
    yearOfExperience: Math.round(years),
  };
};

const SummarySection = ({ resumeId, resume, otherResumes }) => {
  const [text, setText] = useState("");
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const { isGeneratingResumeSummary } = useSelector((s) => s.ai);

  useEffect(() => {
    setText(resume?.summary ?? "");
  }, [resume]);

  const handleSave = async () => {
    if (!text.trim()) {
      setMessage({ type: "error", text: "Summary cannot be empty." });
      return;
    }
    setSaving(true);
    const result = await dispatch(updateResumeSummary({ resumeId, summary: text.trim() }));
    setSaving(false);
    setMessage(
      result.error
        ? { type: "error", text: result.payload || "Failed to save summary" }
        : { type: "success", text: "Summary saved." },
    );
  };

  const handleGenerate = async () => {
    setMessage(null);
    const result = await dispatch(generateResumeSummary(toSummaryRequest(resume)));
    if (result.error) {
      setMessage({ type: "error", text: result.payload || "Failed to generate summary" });
    } else if (result.payload?.content) {
      setText(result.payload.content.trim());
      setMessage({ type: "success", text: "AI draft ready — review it, then save." });
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Write a compelling 2–4 sentence overview of your career, key skills, and career goals.
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={isGeneratingResumeSummary}
          className="gap-2 border-blue-200 text-primary "
        >
          {isGeneratingResumeSummary ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Generate With AI
        </Button>
        <CopyFromMenu
          resumes={otherResumes}
          onSelect={(source) => source?.summary && setText(source.summary)}
        />
      </div>
      <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} />
      <p className="text-xs text-slate-400">{text.length} characters</p>

      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
          {message.text}
        </p>
      )}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
        Save Summary
      </Button>
    </div>
  );
};

export default SummarySection;
