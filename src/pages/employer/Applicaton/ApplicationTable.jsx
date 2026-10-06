import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Star, MoreHorizontal, Eye, FileText, Sparkles, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { AvatarFallback, AvatarImage, Avatar } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import AiScoreCircle from "./AiScoreCircle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { toggleStar } from "../../../reduxt-store/application/applicationThunk";
import { formatEnum } from "../../../lib/constants";

const STATUS_STYLE = {
  PENDING: "bg-slate-50 text-slate-700",
  REVIEWING: "bg-blue-50 text-blue-700",
  SHORTLISTED: "bg-purple-50 text-purple-700",
  INTERVIEW_SCHEDULED: "bg-indigo-50 text-indigo-700",
  HIRED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  WITHDRAWN: "bg-amber-50 text-amber-700",
};

const ApplicationTable = ({ applications, isFullMode, onUpdateStatus, onViewDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleStar = (id) => {
    dispatch(toggleStar(id));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className={"bg-slate-50 hover:bg-slate-50"}>
          {isFullMode && <TableHead className={"w-8"} />}
          <TableHead className="font-semibold text-slate-700">Candidate</TableHead>
          <TableHead className="font-semibold text-slate-700">Job Position</TableHead>
          <TableHead className="font-semibold text-slate-700">Status</TableHead>
          <TableHead className="font-semibold text-slate-700">AI Score</TableHead>
          <TableHead className="font-semibold text-slate-700">Applied</TableHead>
          <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.length === 0 && (
          <TableRow>
            <TableCell colSpan={isFullMode ? 7 : 6} className="py-10 text-center text-sm text-slate-500">
              No applications yet.
            </TableCell>
          </TableRow>
        )}
        {applications.map((app) => {
          const job = app.job ?? {};
          const location = [job.city, job.state, job.country].filter(Boolean).join(", ");
          return (
            <TableRow key={app.id}>
              {isFullMode && (
                <TableCell>
                  <Button onClick={() => handleStar(app.id)} variant="ghost" size="icon">
                    <Star className={app.isStarred ? "fill-amber-400 text-amber-500" : ""} />
                  </Button>
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar>
                    <AvatarImage src={app.candidate?.profileImage ?? ""} alt={app.candidate?.fullName ?? ""} />
                    <AvatarFallback className={"bg-primary text-white"}>
                      {app.candidate?.fullName?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{app.candidate?.fullName}</p>
                    <p className="text-xs text-slate-400">{app.candidate?.email}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <p className="text-sm text-slate-700 font-medium truncate max-w-[200px]">{job.title}</p>
                <p className="text-xs text-slate-400">{location}</p>
              </TableCell>

              <TableCell>
                <Badge className={`text-xs ${STATUS_STYLE[app.status] ?? ""}`} variant="outline">
                  {formatEnum(app.status)}
                </Badge>
              </TableCell>

              <TableCell>
                <AiScoreCircle score={app.screening?.overallScore} />
              </TableCell>

              <TableCell className="text-xs text-slate-400">{app.appliedAt?.split("T")[0]}</TableCell>

              <TableCell className={"text-right"}>
                {isFullMode ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onClick={() => onViewDetails?.(app)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateStatus?.(app)}>
                        <FileText className="mr-2 h-4 w-4" /> Update Status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewDetails?.(app)}>
                        <Sparkles className="mr-2 h-4 w-4" /> AI Screening &amp; Notes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStar(app.id)}>
                        <Star className="mr-2 h-4 w-4" /> {app.isStarred ? "Unstar" : "Star"} Candidate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/employer/applications?applicationId=${app.id}`)}
                  >
                    Review <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ApplicationTable;
