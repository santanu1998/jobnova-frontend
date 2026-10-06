import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Star, Trash2 } from 'lucide-react'
import FRow from './shared/FRow'
import DeleteConfirm from './shared/DeleteConfirm'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { deleteResume, fetchResumeById, setDefaultResume } from '../../../reduxt-store/resume/resumeThunk'
import { formatEnum } from '../../../lib/constants'

// Resume-Service has no endpoint to rename a resume or change its template,
// so those are shown read-only; title/template are chosen when creating it.
const ResumeSettingsSection = ({ resumeId, resume }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSetDefault = async () => {
    const result = await dispatch(setDefaultResume(resumeId))
    if (!result.error) dispatch(fetchResumeById(resumeId))
  }

  const handleDelete = async () => {
    const result = await dispatch(deleteResume(resumeId))
    setConfirmDelete(false)
    if (!result.error) navigate('/resumes')
  }

  return (
    <div className='space-y-5'>
      <div className="grid grid-cols-2 gap-4">
        <FRow label="Resume Title">
          <p className="text-sm font-medium text-slate-800 py-2">{resume?.title}</p>
        </FRow>
        <FRow label="Template">
          <div className="py-2"><Badge variant="secondary">{formatEnum(resume?.template)}</Badge></div>
        </FRow>
        <FRow label="Visibility">
          <p className="text-sm text-slate-700 py-2">{formatEnum(resume?.visibility)}</p>
        </FRow>
        <FRow label="Completion">
          <p className="text-sm text-slate-700 py-2">{resume?.completionScore ?? 0}%</p>
        </FRow>
      </div>

      <div className="flex flex-wrap gap-3">
        {resume?.isDefault ? (
          <span className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
            <Star className="h-4 w-4 fill-current" /> This is your default resume
          </span>
        ) : (
          <Button variant="outline" onClick={handleSetDefault}>
            <Star className="h-4 w-4" /> Set as default
          </Button>
        )}
        <Button
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-4 w-4" /> Delete resume
        </Button>
      </div>

      <DeleteConfirm
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        label="resume"
      />
    </div>
  )
}

export default ResumeSettingsSection
