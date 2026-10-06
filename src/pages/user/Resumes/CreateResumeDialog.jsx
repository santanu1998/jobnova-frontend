import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../../../components/ui/field";
import { Button } from "../../../components/ui/button";
import { createResume } from "../../../reduxt-store/resume/resumeThunk";
import { RESUME_TEMPLATES, RESUME_VISIBILITIES, formatEnum } from "../../../lib/constants";

const CreateResumeDialog = ({ open, onClose }) => {
  const [title, setTitle] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [template, setTemplate] = useState("PROFESSIONAL");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClose = () => {
    setTitle("");
    setIsDefault(false);
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Resume title is required.");
      return;
    }
    setSaving(true);
    const result = await dispatch(
      createResume({ title: title.trim(), isDefault, template, visibility }),
    );
    setSaving(false);
    if (result.error) {
      setError(result.payload || "Failed to create resume");
      return;
    }
    handleClose();
    navigate(`/resumes/${result.payload.id}/edit`);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={"flex items-center gap-2"}>
            <FileText />
            Create New Resume
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Resume Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Backend Engineer Resume"
              maxLength={150}
            />
            <p className="text-xs text-slate-400">{title.length} / 150</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Template</Label>
              <select
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                {RESUME_TEMPLATES.map((t) => (
                  <option key={t} value={t}>
                    {formatEnum(t)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <select
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                {RESUME_VISIBILITIES.map((v) => (
                  <option key={v} value={v}>
                    {formatEnum(v)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Field orientation="horizontal">
            <Checkbox checked={isDefault} onCheckedChange={(v) => setIsDefault(!!v)} />
            <FieldContent>
              <FieldLabel>Set as default resume</FieldLabel>
              <FieldDescription>
                Auto-selected when applying without choosing a version
              </FieldDescription>
            </FieldContent>
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Create Resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateResumeDialog;
