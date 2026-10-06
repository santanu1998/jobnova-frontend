import React from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import {
  COMPANY_STATUSES,
  COMPANY_TYPES,
  INDUSTRY_TYPES,
  formatEnum,
} from "../../../lib/constants";

const FilterSelect = ({ placeholder, allLabel, options, onChange }) => (
  <Select onValueChange={(value) => onChange?.(value)}>
    <SelectTrigger className="h-9 w-full sm:w-44 bg-white border-slate-200 text-sm rounded-lg">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="max-h-64">
      <SelectItem value="all">{allLabel}</SelectItem>
      {options.map((o) => (
        <SelectItem key={o} value={o}>
          {formatEnum(o)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const CompanyFilter = ({ onStatusFilter, onTypeFilter, onIndustryFilter, onSearch }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          className="h-9 pl-9 bg-white border-slate-200 text-sm"
          placeholder="Search company or email..."
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <FilterSelect placeholder="All Status" allLabel="All Status" options={COMPANY_STATUSES} onChange={onStatusFilter} />
      <FilterSelect placeholder="All Types" allLabel="All Types" options={COMPANY_TYPES} onChange={onTypeFilter} />
      <FilterSelect
        placeholder="All Industries"
        allLabel="All Industries"
        options={INDUSTRY_TYPES}
        onChange={onIndustryFilter}
      />
    </div>
  );
};

export default CompanyFilter;
