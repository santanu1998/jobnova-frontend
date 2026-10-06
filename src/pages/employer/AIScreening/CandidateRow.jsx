import React from 'react'
import AiScoreCircle from '../Applicaton/AiScoreCircle'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CandidateRow = ({app}) => {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(`/employer/applications?applicationId=${app.id}`)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
            {app.candidate?.fullName?.charAt(0) ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{app.candidate?.fullName}</p>
            <p className="text-xs text-slate-400 truncate">
                {app.job?.title} - Applied on {app.appliedAt?.split("T")[0]}
            </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
            <AiScoreCircle score={app?.screening?.overallScore} size={38} stroke={3}/>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
        </div>
    </div>
  )
}

export default CandidateRow