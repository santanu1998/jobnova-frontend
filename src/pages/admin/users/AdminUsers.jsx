import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UsersIcon, UserCheck, Briefcase, UserX } from "lucide-react";
import SatateCard from "../../employer/Applicaton/SatateCard";
import UserFilter from "./UserFilter";
import UserTable from "./UserTable";
import { fetchAllUsers } from "../../../reduxt-store/adminUser/adminThunk";
import { ROLES } from "../../../lib/constants";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state) => state.adminUser);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(
      (user) =>
        (roleFilter === "all" || user.role === roleFilter) &&
        (statusFilter === "all" || user.status === statusFilter) &&
        (!q ||
          user.fullName?.toLowerCase().includes(q) ||
          user.email?.toLowerCase().includes(q)),
    );
  }, [users, roleFilter, statusFilter, search]);

  const stats = useMemo(
    () => ({
      total: users.length,
      seekers: users.filter((u) => u.role === ROLES.JOB_SEEKER).length,
      employers: users.filter((u) => u.role === ROLES.EMPLOYER).length,
      suspended: users.filter((u) => u.status === "SUSPENDED").length,
    }),
    [users],
  );

  const summaryCards = [
    { label: "Total Users", value: stats.total, icon: UsersIcon, color: "text-primary bg-blue-50" },
    { label: "Job Seekers", value: stats.seekers, icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
    { label: "Employers", value: stats.employers, icon: Briefcase, color: "text-purple-600 bg-purple-50" },
    { label: "Suspended", value: stats.suspended, icon: UserX, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and monitor all platform users</p>
      </section>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <SatateCard key={card.label} {...card} />
        ))}
      </section>
      <UserFilter onRoleFilter={setRoleFilter} onStatusFilter={setStatusFilter} onSearch={setSearch} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && users.length === 0 ? (
        <p className="text-sm text-slate-500">Loading users...</p>
      ) : (
        <UserTable users={filtered} showActions />
      )}
    </div>
  );
};

export default AdminUsers;
