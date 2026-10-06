import React from "react";

import { isToday, STATUS_CFG, STATUS_ORDER } from "./config";
import { BrainCircuit } from "lucide-react";
import { useMemo } from "react";
import StateCard from "./StateCard";
import { Users } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import BreakdownPieChart from "./BreakdownPieChart";
import CoverageDonut from "./CoverageDonut";
import { Sparkle } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Eye } from "lucide-react";
import CandidateRow from "./CandidateRow";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchMyJobs } from "../../../reduxt-store/job/jobThunk";
import { fetchMyCompany } from "../../../reduxt-store/company/companyThunk";
import { fetchCompanyApplications } from "../../../reduxt-store/application/applicationThunk";
import { screenApplication } from "../../../reduxt-store/application/applicationThunk";
import { Button } from "../../../components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Batch size for one "Screen pending" click, to keep AI usage predictable
const SCREEN_BATCH = 10;

const AIScreening = () => {
  const { applications } = useSelector((store) => store.application);
  const { myCompany } = useSelector((state) => state.company);
  const dispatch = useDispatch();
  const [screening, setScreening] = useState(null); // { done, total }
  const [screenError, setScreenError] = useState("");

  const stats = useMemo(() => {
    const total = applications.length;
    const screened = (a) => a.screening != null;
    const statusof = (a) => a.screening?.shortlistStatus ?? "NOT_SCREENED";

    const todayApps = applications.filter((a) => isToday(a.appliedAt));
    const todayScreened = todayApps.filter(screened);
    const allScreened = applications.filter(screened);

    const dist = {};

    STATUS_ORDER.forEach((s) => {
      dist[s] = 0;
    });

    applications.forEach((a) => {
      const key =
        screened(a) && STATUS_ORDER.includes(statusof(a))
          ? statusof(a)
          : "NOT_SCREENED";

      dist[key] = (dist[key] || 0) + 1;
    });

    const topAutoShortlisted = applications
      .filter((a) => statusof(a) === "AUTO_SHORTLISTED")
      .sort(
        (a, b) =>
          (b.screening?.overallScore ?? 0) - (a.screening?.overallScore ?? 0),
      )
      .slice(0, 5);

    const topNeedsReview = applications
      .filter((a) => statusof(a) === "REVIEW_RECOMMENDED")
      .sort(
        (a, b) =>
          (b.screening?.overallScore ?? 0) - (a.screening?.overallScore ?? 0),
      )
      .slice(0, 5);

    return {
      total,
      todayCount: todayApps.length,
      todayScreenedCount: todayScreened.length,
      allScreenedCount: allScreened.length,
      autoShortlistedCount: dist["AUTO_SHORTLISTED"],
      needsReviewCount: dist["REVIEW_RECOMMENDED"],
      dist,
      topAutoShortlisted,
      topNeedsReview,
    };
  }, [applications]);

  useEffect(() => {
    dispatch(fetchMyCompany());
  }, [dispatch]);

  useEffect(() => {
    if (myCompany?.id) {
      dispatch(fetchMyJobs(myCompany.id));
      dispatch(fetchCompanyApplications({}));
    }
  }, [myCompany?.id, dispatch]);

  const pendingApps = applications.filter(
    (a) => !a.screening && a.status !== "WITHDRAWN",
  );

  // New applications are screened automatically; this (re)screens any that are
  // still unscored, e.g. ones submitted while AI-Service was unavailable.
  const handleScreenPending = async () => {
    const batch = pendingApps.slice(0, SCREEN_BATCH);
    setScreenError("");
    setScreening({ done: 0, total: batch.length });
    for (const [i, app] of batch.entries()) {
      const result = await dispatch(screenApplication(app.id));
      if (result.error) {
        setScreenError(result.payload || "AI screening failed");
        break;
      }
      setScreening({ done: i + 1, total: batch.length });
    }
    setScreening(null);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" /> AI Screening
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time insights into your AI-driven candidate screening process
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleScreenPending}
            disabled={!!screening || pendingApps.length === 0}
          >
            {screening ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Screening {screening.done}/{screening.total}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Screen pending ({Math.min(pendingApps.length, SCREEN_BATCH)})
              </>
            )}
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-primary">AI Active</span>
          </div>
        </div>
      </header>

      {screenError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {screenError}
        </div>
      )}
      <p className="text-xs text-slate-400">
        Every new application is scored automatically against the job using the candidate's resume and cover
        letter.
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StateCard
          label="Today's Applications"
          value={stats.todayCount}
          sub="Total applications received today"
          icon={Users}
          iconClass="bg-blue-50 text-primary"
        />
        <StateCard
          label="Today's Screened"
          value={stats.todayScreenedCount}
          sub="Applications screened today"
          icon={BrainCircuit}
          iconClass="bg-violet-50 text-violet-600"
        />
        <StateCard
          label="Auto Shortlisted"
          value={stats.autoShortlistedCount}
          sub="Candidates automatically shortlisted"
          icon={Sparkles}
          iconClass="bg-emerald-50 text-emerald-600"
        />
        <StateCard
          label="Needs Review"
          value={stats.needsReviewCount}
          sub="Candidates requiring review"
          icon={Target}
          iconClass="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className={"pb-2"}>
            <CardTitle className="text-base font-semibold text-slate-800">
              Screening Breakdown
            </CardTitle>
            <p className="text-xs text-slate-400">
              Distribution across all {stats.total} applications
            </p>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-8">
              <BreakdownPieChart dist={stats.dist} total={stats.total} />

              <div className="flex-1 space-y-3">
                {STATUS_ORDER.map((status) => {
                  const count = stats.dist[status];
                  const pct =
                    stats.total === 0
                      ? 0
                      : Math.round((count / stats.total) * 100);

                  const cfg = STATUS_CFG[status];

                  return (
                    <div key={status} className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-sm"
                        style={{ backgroundColor: cfg.color }}
                      ></span>

                      <span className="text-xs text-slate-600 flex-1">
                        {cfg.label}
                      </span>
                      <span className="text-xs font-bold text-slate-800 w-6 text-right">
                        {count}
                      </span>
                      <span className="text-xs text-slate-400 w-9 text-right">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800">
              Screening Coverage
            </CardTitle>
            <p className="text-xs text-slate-400">
              Percentage of applications AI-screened
            </p>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-5 pt-3">
            <CoverageDonut
              screened={stats.allScreenedCount}
              total={stats.total}
            />

            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Screened
                </span>
                <span>{stats.allScreenedCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                  Pending
                </span>
                <span>{stats.dist["NOT_SCREENED"] ?? 0}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs text-slate-500">Total</span>
                <span className="text-xs font-bold text-slate-800">
                  {stats.total}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Auto-Shortlisted Candidates
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold"
              >
                {stats.autoShortlistedCount} total
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Top candidates scoring 80%+ against the job requirements
            </p>
          </CardHeader>

          <CardContent>
            <div className="space-y-1">
              {stats.topAutoShortlisted.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">No auto-shortlisted candidates yet.</p>
              )}
              {stats.topAutoShortlisted.map((app) => (
                <CandidateRow key={app.id} app={app} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600" />
                Needs Your Review
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold"
              >
                {stats.needsReviewCount} total
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Strong candidates flagged for a closer look
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {stats.topNeedsReview.length === 0 && (
                <p className="text-sm text-slate-400 py-4 text-center">Nothing flagged for review.</p>
              )}
              {stats.topNeedsReview.map((app) => (
                <CandidateRow key={app.id} app={app} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIScreening;
