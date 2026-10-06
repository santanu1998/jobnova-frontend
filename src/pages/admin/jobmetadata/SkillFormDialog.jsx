import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useState } from "react";
import { useEffect } from "react";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { useDispatch } from "react-redux";
import { createSkill, updateSkill } from "../../../reduxt-store/jobMeta/jobMetaThunk";

import { SKILL_CATEGORIES, formatEnum } from "../../../lib/constants";
const SkillFormDialog = ({
  isEdit,
  open,
  onClose,
  onSubmit,
  initialData,
  
}) => {
  const [form, setForm] = useState({
    name: "",
    category: "",
  });
  const dispatch=useDispatch()

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category) {
      setError("Name and category are required.");
      return;
    }
    const data = { name: form.name.trim(), category: form.category };
    const result = await dispatch(
      initialData ? updateSkill({ id: initialData.id, ...data }) : createSkill(data),
    );
    if (result.error) setError(result.payload || "Failed to save skill");
    else onClose();
  };

  useEffect(() => {
    if (open) {
      setError("");
      setForm({
        name: initialData?.name ?? "",
        category: initialData?.category ?? ""
   
      });
    }
  }, [open, initialData]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Skill" : "Add Skill"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Name <span>*</span>
            </Label>
            <Input
              placeholder="e.g. Spring Boot"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Category
            </Label>
            <Select
            value={form.category}
              onValueChange={(value) =>
                value && setForm((f) => ({ ...f, category: value }))
              }
            >
              <SelectTrigger className="text-sm w-full">
                <SelectValue placeholder="category" />
              </SelectTrigger>
              <SelectContent>
                {SKILL_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {formatEnum(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="button"
              className={"flex-1"}
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className={"flex-1"}>
              {isEdit ? "Save Changes" : "Create Skill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillFormDialog;
