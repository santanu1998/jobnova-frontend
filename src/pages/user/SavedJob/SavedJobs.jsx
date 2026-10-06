import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BookMarked, Briefcase, Loader2 } from "lucide-react";
import SavedJobCard from "./SavedJobCard";
import { Button } from "../../../components/ui/button";
import { fetchMySavedJobs } from "../../../reduxt-store/saveJobs/saveJobThunk";

const SavedJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { savedJobs, isLoading, error } = useSelector((store) => store.savedJob);

  useEffect(() => {
    dispatch(fetchMySavedJobs());
  }, [dispatch]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" />
            Saved Jobs
          </h1>
          {savedJobs.length > 0 && (
            <p className="text-slate-500 text-sm mt-1">
              {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"} saved
            </p>
          )}
        </div>
        <Button variant="outline" className={"py-5"} onClick={() => navigate("/jobs")}>
          <Briefcase />
          Browse Jobs
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading && savedJobs.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading saved jobs...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookMarked className="h-8 w-8 mx-auto text-slate-300 mb-3" />
            <p className="font-medium text-slate-700">No saved jobs yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Tap the bookmark on any job to save it for later.
            </p>
          </div>
        ) : (
          savedJobs.map((sj) => <SavedJobCard key={sj.id} savedJob={sj} />)
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
