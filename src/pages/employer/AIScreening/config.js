// appliedAt is a server LocalDateTime ("yyyy-MM-ddTHH:mm:ss"), compare with the local date
export function isToday(dtStr){
    if (!dtStr) return false;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const prefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    return dtStr.startsWith(prefix);
}

export const STATUS_ORDER = [
  "AUTO_SHORTLISTED",
  "REVIEW_RECOMMENDED",
  "PENDING_REVIEW",
  "LOW_MATCH",
  "NOT_SCREENED",
]


export const STATUS_CFG = {
  AUTO_SHORTLISTED:   { label: "Auto Shortlisted",   color: "#10b981", dot: "bg-emerald-500" },
  REVIEW_RECOMMENDED: { label: "Review Recommended",  color: "#3b82f6", dot: "bg-blue-500" },
  PENDING_REVIEW:     { label: "Pending Review",      color: "#fbbf24", dot: "bg-amber-400" },
  LOW_MATCH:          { label: "Low Match",           color: "#f87171", dot: "bg-red-400" },
  NOT_SCREENED:       { label: "Not Screened",        color: "#cbd5e1", dot: "bg-slate-300" },
}