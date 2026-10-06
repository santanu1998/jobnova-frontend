import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Clock, ShieldCheck, Ban } from "lucide-react";
import SatateCard from "../../employer/Applicaton/SatateCard";
import CompanyFilter from "./CompanyFilter";
import CompanyTable from "./CompanyTable";
import { fetchAllCompanies } from "../../../reduxt-store/company/companyThunk";

const Companies = () => {
  const dispatch = useDispatch();
  const { companies, isLoading, error } = useSelector((state) => state.company);
  const [filters, setFilters] = useState({ status: "all", companyType: "all", industryType: "all" });
  const [search, setSearch] = useState("");

  // Company-Services filters by status / type / industry on the server
  useEffect(() => {
    const params = {};
    for (const [k, v] of Object.entries(filters)) if (v !== "all") params[k] = v;
    dispatch(fetchAllCompanies(params));
  }, [filters, dispatch]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return !q
      ? companies
      : companies.filter(
          (c) => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q),
        );
  }, [companies, search]);

  const stats = useMemo(
    () => ({
      total: companies.length,
      pending: companies.filter((c) => c.status === "PENDING_VERIFICATION").length,
      active: companies.filter((c) => c.status === "ACTIVE").length,
      suspended: companies.filter((c) => c.status === "SUSPENDED").length,
    }),
    [companies],
  );

  const summaryCards = [
    { label: "Total Companies", value: stats.total, icon: Building2, color: "text-primary bg-blue-50" },
    { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Active & Verified", value: stats.active, icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
    { label: "Suspended", value: stats.suspended, icon: Ban, color: "text-red-600 bg-red-50" },
  ];

  const setFilter = (key) => (value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Company Management</h1>
        <p className="text-sm text-slate-500 mt-1">Review, verify, and manage all registered companies</p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <SatateCard key={card.label} {...card} />
        ))}
      </section>
      <CompanyFilter
        onStatusFilter={setFilter("status")}
        onTypeFilter={setFilter("companyType")}
        onIndustryFilter={setFilter("industryType")}
        onSearch={setSearch}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && companies.length === 0 ? (
        <p className="text-sm text-slate-500">Loading companies...</p>
      ) : (
        <CompanyTable companies={visible} />
      )}
    </div>
  );
};

export default Companies;
