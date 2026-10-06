import React from "react";
import { cn } from "@/lib/utils";

// Company logo with an initial-letter fallback when no logoUrl is set
const CompanyLogo = ({ company, className }) => (
  <div
    className={cn(
      "h-16 w-16 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden",
      className,
    )}
  >
    {company?.logoUrl ? (
      <img
        className="h-full w-full object-cover rounded-xl"
        src={company.logoUrl}
        alt={company?.name ?? "Company logo"}
      />
    ) : (
      <span className="text-xl font-bold text-primary">
        {company?.name?.charAt(0)?.toUpperCase() ?? "J"}
      </span>
    )}
  </div>
);

export default CompanyLogo;
