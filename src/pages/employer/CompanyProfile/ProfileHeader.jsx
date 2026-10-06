import React from "react";
import { useSelector } from "react-redux";
import { Shield, Building2, Clock, ExternalLink } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { formatEnum } from "../../../lib/constants";

const STATUS_STYLE = {
  ACTIVE: "bg-green-100 text-green-800",
  PENDING_VERIFICATION: "bg-amber-100 text-amber-800",
  SUSPENDED: "bg-red-100 text-red-800",
  REJECTED: "bg-red-100 text-red-800",
};

const ProfileHeader = () => {
  const { myCompany } = useSelector((state) => state.company);
  if (!myCompany) return null;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      <div
        className={`h-36 w-full bg-center ${myCompany.coverImageUrl ? "bg-cover" : "bg-primary"}`}
        style={
          myCompany.coverImageUrl ? { backgroundImage: `url(${myCompany.coverImageUrl})` } : undefined
        }
      ></div>

      <div className="px-6 pb-5">
        <div className="flex items-end gap-4 -mt-8 mb-4">
          {myCompany.logoUrl ? (
            <img
              src={myCompany.logoUrl}
              alt={myCompany.name}
              className="h-20 w-20 rounded-xl object-cover border-4 border-white shadow-md shrink-0 bg-white"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-white shadow-md bg-linear-to-br from-slate-100 to-slate-200 shrink-0">
              <Building2 className="h-9 w-9 text-slate-400" />
            </div>
          )}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className={STATUS_STYLE[myCompany.status] ?? "bg-slate-100"}>
              {myCompany.status === "PENDING_VERIFICATION" ? <Clock /> : <Shield />}
              {formatEnum(myCompany.status)}
            </Badge>
            {myCompany.verifiedAt && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Shield /> Verified {myCompany.verifiedAt.split("T")[0]}
              </Badge>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">{myCompany.name}</h2>
          {myCompany.tagline && <p className="text-sm text-slate-500">{myCompany.tagline}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
            <span>{formatEnum(myCompany.industryType)}</span>
            <span>{formatEnum(myCompany.companyType)}</span>
            <span>{formatEnum(myCompany.companySize)}</span>
            {myCompany.foundedYear && <span>Founded {myCompany.foundedYear}</span>}
            {myCompany.website && (
              <a
                href={myCompany.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Website
              </a>
            )}
          </div>
          {myCompany.status === "PENDING_VERIFICATION" && (
            <p className="text-xs text-amber-700 mt-3">
              Your company is awaiting admin verification. You can still post jobs in the meantime.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
