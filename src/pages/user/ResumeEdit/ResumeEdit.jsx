import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Briefcase,
  Code2,
  BadgeCheck,
  Languages,
  Settings,
  Award,
  FolderGit2,
  GraduationCap,
  User,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import PersonalInfoSection from "./PersonalInfoSection";
import SummarySection from "./SummarySection";
import WorkExperienceSection from "./WorkExperienceSection";
import EducationSection from "./EducationSection";
import SkillsSection from "./SkillsSection";
import ProjectSection from "./ProjectSection";
import { CertificationsSection } from "./CertificationsSection";
import AwardsSection from "./AwardsSection";
import LanguagesSection from "./LanguagesSection";
import ResumeSettingsSection from "./ResumeSettingsSection";
import { fetchMyResumes, fetchResumeById } from "../../../reduxt-store/resume/resumeThunk";

const SECTIONS = [
  { key: "personal", label: "Personal Info", icon: User, Component: PersonalInfoSection },
  { key: "summary", label: "Summary", icon: FileText, field: "summary", Component: SummarySection },
  {
    key: "experience",
    label: "Work Experience",
    icon: Briefcase,
    field: "workExperiences",
    Component: WorkExperienceSection,
  },
  {
    key: "education",
    label: "Education",
    icon: GraduationCap,
    field: "educations",
    Component: EducationSection,
  },
  { key: "skills", label: "Skills", icon: Code2, field: "skills", Component: SkillsSection },
  { key: "projects", label: "Projects", icon: FolderGit2, field: "projects", Component: ProjectSection },
  {
    key: "certifications",
    label: "Certifications",
    icon: BadgeCheck,
    field: "certifications",
    Component: CertificationsSection,
  },
  { key: "awards", label: "Awards", icon: Award, field: "awards", Component: AwardsSection },
  { key: "languages", label: "Languages", icon: Languages, field: "languages", Component: LanguagesSection },
  { key: "settings", label: "Settings", icon: Settings, Component: ResumeSettingsSection },
];

const countOf = (resume, field) => {
  const v = resume?.[field];
  if (Array.isArray(v)) return v.length;
  return v ? 1 : 0;
};

const ResumeEdit = () => {
  const [activeKey, setActiveKey] = useState(SECTIONS[0].key);
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentResume, resumes, loading, error } = useSelector((store) => store.resume);

  useEffect(() => {
    if (id) dispatch(fetchResumeById(id));
    dispatch(fetchMyResumes());
  }, [id, dispatch]);

  const resume = String(currentResume?.id) === String(id) ? currentResume : null;
  const otherResumes = resumes.filter((r) => String(r.id) !== String(id));
  const active = SECTIONS.find((s) => s.key === activeKey);
  const ActiveIcon = active.icon;
  const ActiveComponent = active.Component;

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        {loading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" /> Loading resume...
          </>
        ) : (
          <>
            <p className="font-medium text-slate-700">Resume not found</p>
            {error && <p className="text-sm">{error}</p>}
            <Button onClick={() => navigate("/resumes")}>Back to my resumes</Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full">
      <div className="flex flex-1 overflow-hidden">
        {/* SideBar */}
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-slate-100 space-y-2">
            <button
              onClick={() => navigate("/resumes")}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> My resumes
            </button>
            <p className="font-semibold text-slate-900 truncate">{resume.title}</p>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Completion</span>
                <span>{resume.completionScore ?? 0}%</span>
              </div>
              <Progress value={resume.completionScore ?? 0} className="h-1.5" />
            </div>
          </div>
          <div className="p-3 space-y-0.5 flex-1">
            {SECTIONS.map((item) => {
              const Icon = item.icon;
              const count = item.field ? countOf(resume, item.field) : null;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveKey(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    activeKey === item.key
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {count != null && count > 0 && item.field !== "summary" && (
                    <span className="text-xs opacity-70">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ActiveIcon className="h-5 w-5 text-primary" />
                {active.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActiveComponent
                key={active.key}
                resumeId={id}
                resume={resume}
                otherResumes={otherResumes}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ResumeEdit;
