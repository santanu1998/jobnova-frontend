import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, Pencil, Trash2, Sparkles, Star, StarOff } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { Button } from "../../../components/ui/button";
import DeleteConfirm from "../ResumeEdit/shared/DeleteConfirm";
import CareerFeedbackDialog from "./CareerFeedbackDialog";
import { deleteResume, setDefaultResume } from "../../../reduxt-store/resume/resumeThunk";
import { formatEnum } from "../../../lib/constants";

const ResumeCard = ({ resume }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // completionScore is computed by Resume-Service
  const completionScore = resume.completionScore ?? 0;
  const pi = resume.personalInfo ?? {};
  const displayName = [pi.firstName, pi.lastName].filter(Boolean).join(" ");

  const handleDelete = () => {
    dispatch(deleteResume(resume.id));
    setConfirmDelete(false);
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-3 mb-2">
          <div className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{resume.title}</h3>
              {(displayName || pi.headline) && (
                <p className="text-xs text-slate-500 truncate">
                  {[displayName, pi.headline].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <Badge variant="secondary">{formatEnum(resume.template)}</Badge>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Completion</span>
            <span>{completionScore}%</span>
          </div>
          <Progress value={completionScore} className={"h-1.5"} />
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <Button
            onClick={() => navigate(`/resumes/${resume.id}/edit`)}
            className={"flex-1"}
            variant="outline"
            size="sm"
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="icon"
            title="Delete resume"
            className="text-red-500 hover:bg-red-50"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-3 w-3 " />
          </Button>
        </div>

        <Button
          className="w-full text-xs text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 mb-2"
          variant="outline"
          size="sm"
          onClick={() => setShowFeedback(true)}
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          AI Career Feedback
        </Button>

        {!resume.isDefault ? (
          <Button
            className="w-full text-xs text-slate-500 hover:text-yellow-700 hover:bg-yellow-50"
            variant="ghost"
            size="sm"
            onClick={() => dispatch(setDefaultResume(resume.id))}
          >
            <StarOff className="h-3.5 w-3.5 mr-1" />
            Set As Default
          </Button>
        ) : (
          <div className="w-full flex items-center justify-center gap-1 text-xs text-yellow-600 font-medium py-1">
            <Star className="h-3.5 w-3.5 fill-current" />
            Default Resume
          </div>
        )}
      </CardContent>

      <DeleteConfirm
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        label={`"${resume.title}"`}
      />
      {showFeedback && (
        <CareerFeedbackDialog
          resume={resume}
          open={showFeedback}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </Card>
  );
};

export default ResumeCard;
