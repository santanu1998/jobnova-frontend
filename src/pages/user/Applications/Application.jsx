import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FileText, Briefcase, TrendingUp, CheckCircle2, Users, Loader2 } from "lucide-react";
import ApplicationStateCard from "./ApplicationStateCard";
import ApplicationCard from "./ApplicationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { fetchMyApplications } from "../../../reduxt-store/application/applicationThunk";

const ACTIVE = ["PENDING", "REVIEWING", "SHORTLISTED", "INTERVIEW_SCHEDULED"];

const TAB_FILTERS = {
  all: () => true,
  active: (a) => ACTIVE.includes(a.status),
  shortlisted: (a) => a.status === "SHORTLISTED" || a.status === "INTERVIEW_SCHEDULED",
  hired: (a) => a.status === "HIRED",
  closed: (a) => a.status === "REJECTED" || a.status === "WITHDRAWN",
};

const Application = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myApplications, isLoading, error } = useSelector((store) => store.application);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const stats = useMemo(
    () => ({
      total: myApplications.length,
      active: myApplications.filter(TAB_FILTERS.active).length,
      shortlisted: myApplications.filter(TAB_FILTERS.shortlisted).length,
      hired: myApplications.filter(TAB_FILTERS.hired).length,
    }),
    [myApplications],
  );

  const visible = useMemo(
    () =>
      [...myApplications]
        .filter(TAB_FILTERS[selectedTab])
        .sort((a, b) => new Date(b.appliedAt ?? 0) - new Date(a.appliedAt ?? 0)),
    [myApplications, selectedTab],
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          My Applications
        </h1>
        <p className="text-slate-500 text-sm mt-1">Track and manage your job applications</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <ApplicationStateCard
          label={"Total Applied"}
          value={stats.total}
          icon={Briefcase}
          color={"text-primary bg-blue-50"}
        />
        <ApplicationStateCard
          label={"Active"}
          value={stats.active}
          icon={TrendingUp}
          color={"text-indigo-600 bg-indigo-50"}
        />
        <ApplicationStateCard
          label={"Shortlisted"}
          value={stats.shortlisted}
          icon={CheckCircle2}
          color={"text-purple-600 bg-purple-50"}
        />
        <ApplicationStateCard
          label="Hired"
          value={stats.hired}
          icon={Users}
          color="text-green-600 bg-green-50"
        />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className={"space-y-4"}>
        <TabsList className={"flex-wrap h-auto"}>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
          <TabsTrigger value="hired">Hired</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        <TabsContent className={"space-y-2"} value={selectedTab}>
          {isLoading && myApplications.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-500">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading applications...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <FileText className="h-8 w-8 mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-slate-700">No applications here yet</p>
              <Button className="mt-4" onClick={() => navigate("/jobs")}>
                Browse jobs
              </Button>
            </div>
          ) : (
            visible.map((item) => <ApplicationCard key={item.id} app={item} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Application;
