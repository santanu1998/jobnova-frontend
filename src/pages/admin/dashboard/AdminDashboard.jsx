import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Briefcase, Building2, Users, ShieldAlert } from "lucide-react";
import StatsCard from "./StatsCard";
import UserTable from "../users/UserTable";
import { fetchAllUsers } from "../../../reduxt-store/adminUser/adminThunk";
import { fetchAllCompanies } from "../../../reduxt-store/company/companyThunk";
import { fetchAllJobsAdmin } from "../../../reduxt-store/job/jobThunk";
import { ROLES } from "../../../lib/constants";

const AdminDashboard = () => {
  const { users } = useSelector((state) => state.adminUser);
  const { companies } = useSelector((state) => state.company);
  const { adminJobs } = useSelector((state) => state.job);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchAllCompanies());
    dispatch(fetchAllJobsAdmin());
  }, [dispatch]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const openJobs = adminJobs.filter((j) => j.status === "OPEN").length;
  const pendingCompanies = companies.filter((c) => c.status === "PENDING_VERIFICATION").length;
  const seekers = users.filter((u) => u.role === ROLES.JOB_SEEKER).length;
  const employers = users.filter((u) => u.role === ROLES.EMPLOYER).length;

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "blue",
      description: `${seekers} job seekers · ${employers} employers`,
    },
    {
      title: "Active Jobs",
      value: openJobs,
      icon: Briefcase,
      color: "green",
      description: `${adminJobs.length} active listings in total`,
    },
    {
      title: "Companies",
      value: companies.length,
      icon: Building2,
      color: "purple",
      description: `${pendingCompanies} pending review`,
    },
    {
      title: "Pending Verification",
      value: pendingCompanies,
      icon: ShieldAlert,
      color: "orange",
      description: "Companies awaiting approval",
    },
  ];

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">{today}</p>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((state) => (
          <StatsCard key={state.title} {...state} />
        ))}
      </div>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">Newest users</h2>
        <UserTable users={recentUsers} />
      </section>
    </div>
  );
};

export default AdminDashboard;
