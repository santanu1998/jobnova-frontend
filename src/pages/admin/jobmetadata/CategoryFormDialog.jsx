import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { useState } from "react";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  createCategory,
  updateCategory,
} from "../../../reduxt-store/jobMeta/jobMetaThunk";

const CategoryFormDialog = ({
  isEdit,
  open,
  onClose,
  onSubmit,
  initialData,
  rootCategories,
}) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "",
    description: "",
    iconUrl: "",
    parentId: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }
    // JobCategoryRequest: empty optional values must be null, not ""
    const data = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      iconUrl: form.iconUrl.trim() || null,
      parentId: form.parentId && form.parentId !== "none" ? Number(form.parentId) : null,
    };
    const result = await dispatch(
      initialData ? updateCategory({ id: initialData.id, ...data }) : createCategory(data),
    );
    if (result.error) setError(result.payload || "Failed to save category");
    else onClose();
  };

  useEffect(() => {
    if (open) {
      setError("");
      setForm({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        iconUrl: initialData?.iconUrl ?? "",
        parentId: initialData?.parentId ? String(initialData.parentId) : "",
      });
    }
  }, [open, initialData]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Name <span>*</span>
            </Label>
            <Input
              placeholder="e.g Software Engineering"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Description
            </Label>
            <Textarea
              placeholder="provide the description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Icon Url
            </Label>
            <Input
              placeholder="provide icon url"
              value={form.iconUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, iconUrl: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Parent Category
            </Label>
            <Select
              value={form.parentId}
              onValueChange={(value) =>
                value && setForm((f) => ({ ...f, parentId: value }))
              }
            >
              <SelectTrigger className="text-sm w-full">
                <SelectValue placeholder="Root Level (No Parent)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Root Level (No Parent)</SelectItem>
                {(rootCategories ?? [])
                  .filter((item) => item.id !== initialData?.id)
                  .map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;
