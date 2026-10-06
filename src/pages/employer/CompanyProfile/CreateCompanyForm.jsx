import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Building2, Plus, Loader2 } from "lucide-react";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { createCompany } from "../../../reduxt-store/company/companyThunk";
import {
  COMPANY_SIZES,
  COMPANY_TYPES,
  INDUSTRY_TYPES,
  formatEnum,
} from "../../../lib/constants";
import { EMPTY_COMPANY, formToCompanyRequest, validateCompany } from "./companyForm";

const SelectField = ({ label, value, onChange, options }) => (
  <div className="space-y-1.5 text-left">
    <Label className="text-xs font-semibold text-slate-600">
      {label} <span className="text-red-500">*</span>
    </Label>
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
  </div>
);

const CreateCompanyForm = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState(EMPTY_COMPANY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const setFormValue = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const setSelect = (key) => (value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateCompany(form);
    setError(err);
    if (err) return;
    setSaving(true);
    const result = await dispatch(createCompany(formToCompanyRequest(form)));
    setSaving(false);
    if (result.error) setError(result.payload || "Failed to create company");
  };

  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div className="w-full max-w-xl border bg-white p-10 rounded-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
            <Building2 className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Set up your company</h2>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            Create your company profile to start posting jobs and attracting top talent.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-slate-700">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input placeholder="Company name" value={form.name} onChange={setFormValue("name")} />
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-slate-700">
                Company Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="hr@company.com"
                value={form.email}
                onChange={setFormValue("email")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectField
              label="Size"
              value={form.companySize}
              onChange={setSelect("companySize")}
              options={COMPANY_SIZES}
            />
            <SelectField
              label="Type"
              value={form.companyType}
              onChange={setSelect("companyType")}
              options={COMPANY_TYPES}
            />
            <SelectField
              label="Industry"
              value={form.industryType}
              onChange={setSelect("industryType")}
              options={INDUSTRY_TYPES}
            />
          </div>

          {error && <p className="text-sm text-red-600 text-left">{error}</p>}

          <Button type="submit" disabled={saving} className={"w-full gap-2"}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Company
          </Button>
          <p className="text-xs text-slate-400">
            You can add a logo, description and links after creating it. New companies start as
            "Pending verification" until an admin verifies them.
          </p>
        </form>
      </div>
    </div>
  );
};

export default CreateCompanyForm;
