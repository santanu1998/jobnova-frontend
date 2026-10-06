import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Briefcase, TrendingUp, FileText, UserCheck, PlusCircle, Users, Building2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import StatsCard from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import RecentApplicationTable from "./RecentApplicationTable";
import { fetchMyCompany } from "../../../reduxt-store/company/companyThunk";
import { fetchMyJobs } from "../../../reduxt-store/job/jobThunk";
import { fetchCompanyApplications } from "../../../reduxt-store/application/applicationThunk";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { myJobs: jobs } = useSelector((state) => state.job);
  const { myCompany } = useSelector((state) => state.company);
  const [companyChecked, setCompanyChecked] = useState(false);
  const { applications } = useSelector((store) => store.application);

  useEffect(() => {
    dispatch(fetchMyCompany()).finally(() => setCompanyChecked(true));
  }, [dispatch]);

  useEffect(() => {
    if (myCompany?.id) {
      dispatch(fetchMyJobs(myCompany.id));
      dispatch(fetchCompanyApplications({}));
    }
  }, [myCompany?.id, dispatch]);

  const activeJobs = jobs.filter((job) => job.status === "OPEN");
  const shortListed = applications.filter(
    (app) => app.status === "SHORTLISTED" || app.status === "INTERVIEW_SCHEDULED",
  );

  const stats = [
    { title: "Total Jobs Posted", value: jobs.length, icon: Briefcase },
    { title: "Active Jobs", value: activeJobs.length, icon: TrendingUp },
    { title: "Applications Received", value: applications.length, icon: FileText },
    { title: "Shortlisted / Interview", value: shortListed.length, icon: UserCheck },
  ];

  // Insights derived from real data
  const insights = useMemo(() => {
    const list = [];
    const pending = applications.filter((a) => a.status === "PENDING").length;
    const screened = applications.filter((a) => a.screening).length;
    const strong = applications.filter((a) => (a.screening?.overallScore ?? 0) >= 80).length;
    const drafts = jobs.filter((j) => j.status === "DRAFT").length;

    if (pending > 0)
      list.push({
        dot: "bg-primary",
        title: `${pending} application${pending > 1 ? "s" : ""} waiting for review`,
        text: "Candidates hear back faster when you move them to Reviewing within a few days.",
      });
    if (screened > 0)
      list.push({
        dot: "bg-green-600",
        title: `${strong} of ${screened} AI-screened candidates scored 80%+`,
        text: "Open AI Screening to compare candidates by match score.",
      });
    if (drafts > 0)
      list.push({
        dot: "bg-amber-600",
        title: `${drafts} job${drafts > 1 ? "s are" : " is"} still in draft`,
        text: "Draft jobs are not visible to job seekers until you publish them.",
      });
    const zeroApplicants = activeJobs.filter(
      (j) => !applications.some((a) => a.job?.id === j.id),
    );
    if (zeroApplicants.length > 0)
      list.push({
        dot: "bg-amber-600",
        title: `Suggestion: "${zeroApplicants[0].title}" has no applicants yet`,
        text: "Consider refining the description, skills or salary range with the AI helpers.",
      });
    if (list.length === 0)
      list.push({
        dot: "bg-slate-400",
        title: "You're all caught up",
        text: "Post a job or check back when new applications arrive.",
      });
    return list;
  }, [applications, jobs, activeJobs]);

  if (companyChecked && !myCompany) {
    return (
      <div className="p-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-8 text-center space-y-3">
            <Building2 className="h-8 w-8 mx-auto text-amber-600" />
            <p className="font-semibold text-amber-800">Welcome to JobNova!</p>
            <p className="text-sm text-amber-700">
              Create your company profile to start posting jobs and receiving applications.
            </p>
            <Link to="/employer/company">
              <Button>Create company profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Welcome back! Here's an overview of your hiring activity
            {myCompany?.name ? ` at ${myCompany.name}` : ""}.
          </p>
        </div>
        <Link to="/employer/jobs/create">
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" /> Create Job
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Ai insights Card */}
      <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Users className="h-4 w-4" />
            </div>
            Hiring Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className={`flex-shrink-0 h-2 w-2 rounded-full mt-2 ${item.dot}`} />
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-primary/20">
            <Link to={"/employer/ai-screening"}>
              <Button className="border-primary/30 hover:bg-primary/10">View AI Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Application */}
      <RecentApplicationTable />
    </div>
  );
};

export default Dashboard;
