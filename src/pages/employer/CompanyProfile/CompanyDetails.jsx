import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Save, Plus, X, Loader2, Upload } from "lucide-react";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { updateCompany } from "../../../reduxt-store/company/companyThunk";
import {
  COMPANY_SIZES,
  COMPANY_TYPES,
  INDUSTRY_TYPES,
  SOCIAL_PLATFORMS,
  formatEnum,
} from "../../../lib/constants";
import { isCloudinaryConfigured, uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import { companyToForm, formToCompanyRequest, validateCompany, EMPTY_COMPANY } from "./companyForm";

const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold text-slate-600">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
  </div>
);

// Radix Select inside a <form> can emit "" when its value is set after mount; ignore that
const EnumSelect = ({ value, onChange, options }) => (
  <Select value={value} onValueChange={(v) => v && onChange(v)}>
    <SelectTrigger className="border-slate-200 text-sm w-full">
      <SelectValue placeholder="Select" />
    </SelectTrigger>
    <SelectContent className="max-h-60">
      {options.map((o) => (
        <SelectItem key={o} value={o}>
          {formatEnum(o)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const CompanyDetails = () => {
  const { myCompany, isLoading } = useSelector((state) => state.company);
  const dispatch = useDispatch();
  const [form, setForm] = useState(EMPTY_COMPANY);
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(null);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const setVal = (field) => (v) => setForm((prev) => ({ ...prev, [field]: v }));

  useEffect(() => {
    if (myCompany) setForm(companyToForm(myCompany));
  }, [myCompany]);

  const handleUpload = (field) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = null;
    if (!file) return;
    setUploading(field);
    try {
      const url = await uploadToCloudinary(file, "jobnova/companies");
      setForm((prev) => ({ ...prev, [field]: url }));
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploading(null);
    }
  };

  const updateLink = (i, patch) =>
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateCompany(form);
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }
    const result = await dispatch(updateCompany({ id: myCompany.id, ...formToCompanyRequest(form) }));
    setMessage(
      result.error
        ? { type: "error", text: result.payload || "Failed to update company" }
        : { type: "success", text: "Company profile saved." },
    );
  };

  const ImageField = ({ label, field, placeholder }) => (
    <Field label={label}>
      <div className="flex gap-2">
        <Input
          value={form[field]}
          onChange={set(field)}
          placeholder={placeholder}
          className="border-slate-200"
        />
        {isCloudinaryConfigured && (
          <label className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 text-xs text-slate-600 cursor-pointer hover:bg-slate-50">
            {uploading === field ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload(field)} />
          </label>
        )}
      </div>
    </Field>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
            Identity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            <Field label="Company Name" required>
              <Input value={form.name} onChange={set("name")} placeholder="Enter company name" className="border-slate-200" />
            </Field>
            <Field label="Tagline">
              <Input value={form.tagline} onChange={set("tagline")} placeholder="Enter company tagline" className="border-slate-200" />
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={set("description")}
              placeholder="What does your company do? What's the culture like?"
              className="border-slate-200"
              rows={4}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Company Size" required>
              <EnumSelect value={form.companySize} onChange={setVal("companySize")} options={COMPANY_SIZES} />
            </Field>
            <Field label="Company Type" required>
              <EnumSelect value={form.companyType} onChange={setVal("companyType")} options={COMPANY_TYPES} />
            </Field>
            <Field label="Industry" required>
              <EnumSelect value={form.industryType} onChange={setVal("industryType")} options={INDUSTRY_TYPES} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Founded Year">
              <Input type="number" min={1800} max={2100} value={form.foundedYear} onChange={set("foundedYear")} placeholder="e.g. 2015" className="border-slate-200" />
            </Field>
            <Field label="Registration Number">
              <Input value={form.registrationNumber} onChange={set("registrationNumber")} placeholder="CIN / registration no." className="border-slate-200" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            {ImageField({ label: "Logo URL", field: "logoUrl", placeholder: "https://…/logo.png" })}
            {ImageField({ label: "Cover Image URL", field: "coverImageUrl", placeholder: "https://…/cover.jpg" })}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
            Contact &amp; Web
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
            <Field label="Company Website">
              <Input value={form.website} onChange={set("website")} placeholder="https://company.com" className="border-slate-200" />
            </Field>
            <Field label="Company Email" required>
              <Input type="email" value={form.email} onChange={set("email")} placeholder="hr@company.com" className="border-slate-200" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={set("phone")} placeholder="Enter company phone" className="border-slate-200" />
            </Field>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-600">Social Links</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    socialLinks: [...prev.socialLinks, { platform: "LINKEDIN", url: "" }],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" /> Add link
              </Button>
            </div>
            {form.socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-40">
                  <EnumSelect
                    value={link.platform}
                    onChange={(v) => updateLink(i, { platform: v })}
                    options={SOCIAL_PLATFORMS}
                  />
                </div>
                <Input
                  value={link.url ?? ""}
                  onChange={(e) => updateLink(i, { url: e.target.value })}
                  placeholder="https://…"
                  className="border-slate-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      socialLinks: prev.socialLinks.filter((_, idx) => idx !== i),
                    }))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between pt-2">
          <p className={`text-sm ${message?.type === "error" ? "text-red-600" : "text-green-600"}`}>
            {message?.text}
          </p>
          <Button className="gap-2 bg-primary hover:bg-primary/90" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyDetails;
