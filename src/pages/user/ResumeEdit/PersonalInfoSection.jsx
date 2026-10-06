import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Globe, Check, Loader2, User } from "lucide-react";
import CopyFromMenu from "./shared/CopyFromMenu";
import FRow from "./shared/FRow";
import { Input } from "../../../components/ui/input";
import { Separator } from "../../../components/ui/separator";
import { Button } from "../../../components/ui/button";
import { updatePersonalInfo } from "../../../reduxt-store/resume/resumeThunk";
import { toPayload } from "./shared/ResumeListSection";

// Mirrors PersonalInfoResponse (used as the request body by Resume-Service)
const EMPTY = {
  firstName: "",
  lastName: "",
  headline: "",
  email: "",
  phoneNumber: "",
  city: "",
  country: "",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
  websiteUrl: "",
};
const KEYS = Object.keys(EMPTY);
const URL_FIELDS = ["linkedinUrl", "githubUrl", "portfolioUrl", "websiteUrl"];

const fromInfo = (pi = {}) => Object.fromEntries(KEYS.map((k) => [k, pi?.[k] ?? ""]));

const PersonalInfoSection = ({ resumeId, resume, otherResumes }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const pi = resume?.personalInfo;
    if (pi && Object.values(pi).some(Boolean)) {
      setForm(fromInfo(pi));
    } else {
      // Pre-fill a brand-new resume from the account profile
      const [firstName = "", ...rest] = (user?.fullName ?? "").split(" ");
      setForm({
        ...EMPTY,
        firstName,
        lastName: rest.join(" "),
        email: user?.email ?? "",
        phoneNumber: user?.phoneNumber ?? "",
      });
    }
  }, [resume, user]);

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async () => {
    const badUrl = URL_FIELDS.find((k) => form[k] && !/^https?:\/\//i.test(form[k]));
    if (badUrl) {
      setMessage({ type: "error", text: "Links must start with http:// or https://" });
      return;
    }
    setSaving(true);
    const result = await dispatch(updatePersonalInfo({ resumeId, data: toPayload(form, KEYS) }));
    setSaving(false);
    setMessage(
      result.error
        ? { type: "error", text: result.payload || "Failed to save personal info" }
        : { type: "success", text: "Personal info saved." },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CopyFromMenu
          resumes={otherResumes}
          onSelect={(source) => setForm(fromInfo(source?.personalInfo))}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="h-20 w-20 rounded-full border-2 border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <User className="h-8 w-8 text-slate-400" />
          )}
        </div>
        <p className="text-xs text-slate-400">Your profile photo is managed from the Profile page</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FRow label={"First Name"}>
          <Input value={form.firstName} onChange={f("firstName")} placeholder="John" />
        </FRow>
        <FRow label={"Last Name"}>
          <Input value={form.lastName} onChange={f("lastName")} placeholder="Doe" />
        </FRow>
      </div>

      <FRow label="Professional Headline">
        <Input
          value={form.headline}
          onChange={f("headline")}
          placeholder="Senior Software Engineer"
        />
      </FRow>

      <div className="grid grid-cols-2 gap-3">
        <FRow label="Email">
          <Input type="email" value={form.email} onChange={f("email")} />
        </FRow>
        <FRow label="Phone">
          <Input value={form.phoneNumber} onChange={f("phoneNumber")} placeholder="+91 98765 43210" />
        </FRow>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FRow label="City">
          <Input value={form.city} onChange={f("city")} />
        </FRow>
        <FRow label="Country">
          <Input value={form.country} onChange={f("country")} />
        </FRow>
      </div>

      <Separator />

      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Online Presence
      </p>

      <FRow label="LinkedIn URL">
        <Input
          value={form.linkedinUrl}
          onChange={f("linkedinUrl")}
          placeholder="https://linkedin.com/in/…"
        />
      </FRow>

      <FRow label="GitHub URL">
        <Input value={form.githubUrl} onChange={f("githubUrl")} placeholder="https://github.com/…" />
      </FRow>

      <FRow label="Portfolio URL">
        <div className="relative">
          <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={form.portfolioUrl}
            onChange={f("portfolioUrl")}
            className="pl-9"
            placeholder="https://mysite.com"
          />
        </div>
      </FRow>

      <FRow label="Website URL">
        <div className="relative">
          <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input value={form.websiteUrl} onChange={f("websiteUrl")} className="pl-9" />
        </div>
      </FRow>

      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
          {message.text}
        </p>
      )}

      <Button onClick={handleSave} disabled={saving} className={"w-full"}>
        {saving ? <Loader2 className="animate-spin" /> : <Check />} Save Personal Info
      </Button>
    </div>
  );
};

export default PersonalInfoSection;
