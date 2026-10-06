import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { formatEnum } from "../../../lib/constants";


const JobInfoCard = ({ job }) => {
  
  if(!job){
    return <div className="py-6 text-slate-500">Loading job...</div>
  }
  return (
    <Card>
      <CardContent className={"p-5"}>
        <div className="flex items-start gap-4">
          {/* company logo */}
          <div className="h-16 w-16 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
            {job.company?.logoUrl ? (
              <img
                className="h-full w-full object-cover rounded-xl"
                src={job.company.logoUrl}
                alt={job.company?.name}
              />
            ) : (
              <span className="text-xl font-bold text-primary">{job.company?.name?.charAt(0) ?? "J"}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title Row + Bookmmar */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-1">
                  {job.title}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="text-slate-700 font-medium text-sm">
                    {job.company?.name}
                  </span>
                  <CheckCircle2 className="h-4 w-4 fill-primary text-white shrink-0" />

                  <span className="text-slate-400 text-sm">
                    · {formatEnum(job.company?.industryType)}
                  </span>
                  <span className="text-slate-400 text-sm">
                    · {formatEnum(job.company?.companySize)}
                  </span>
                </div>

                <p className="text-slate-400 text-xs mt-0.5 italic">
                  {job.company?.tagline}
                </p>
              </div>
              
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobInfoCard;
