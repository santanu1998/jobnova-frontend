import React, { useState } from "react";
import { useDispatch } from "react-redux";
import CopyFromMenu from "./CopyFromMenu";
import AddButton from "./AddButton";
import SectionCard from "./SectionCard";
import SectionDialog from "./SectionDialog";
import DeleteConfirm from "./DeleteConfirm";
import FRow from "./FRow";
import TagInput from "./TagInput";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Field } from "../../../../components/ui/field";
import { Label } from "../../../../components/ui/label";
import { formatEnum } from "../../../../lib/constants";

// Empty strings become null so optional LocalDate / @Pattern URL fields
// in Resume-Service don't reject the request.
export const toPayload = (form, keys) =>
  Object.fromEntries(
    keys.map((k) => {
      const v = form[k];
      return [k, typeof v === "string" ? v.trim() || null : v ?? null];
    }),
  );

const URL_RE = /^https?:\/\/.+/i;

// Literal class names so Tailwind can see them
const GRID_COLS = { 2: "grid gap-3 grid-cols-2", 3: "grid gap-3 grid-cols-3" };

/**
 * Generic editor for one list section of a resume (work experience, education, ...).
 *
 * rows:       array of field rows; each field is
 *             { name, label, type: text|date|number|textarea|select|checkbox|tags|url,
 *               required, options, placeholder, disabledWhen(form) }
 * thunks:     { add, update, del } created by makeSection() in resumeThunk.js
 * idParam:    id key the update/delete thunks expect (e.g. "educationId")
 * renderItem: (item) => JSX summary shown in the list
 * extra:      optional (form, setForm) => JSX rendered at the end of the dialog
 */
const ResumeListSection = ({
  resumeId,
  resume,
  otherResumes,
  field,
  label,
  emptyForm,
  rows,
  thunks,
  idParam,
  renderItem,
  validate,
  extra,
}) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [delItem, setDel] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const items = resume?.[field] ?? [];
  const allFields = rows.flat();
  const keys = Object.keys(emptyForm);

  const openAdd = () => {
    setEdit(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  };

  const openEdit = (item) => {
    setEdit(item);
    setForm({
      ...emptyForm,
      ...Object.fromEntries(keys.map((k) => [k, item[k] ?? emptyForm[k]])),
    });
    setError("");
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEdit(null);
    setError("");
  };

  const check = () => {
    for (const fdef of allFields) {
      const v = form[fdef.name];
      const disabled = fdef.disabledWhen?.(form);
      if (fdef.required && !disabled && (v == null || String(v).trim() === ""))
        return `${fdef.label.replace(" *", "")} is required.`;
      if (fdef.type === "url" && v && !URL_RE.test(v))
        return `${fdef.label.replace(" *", "")} must start with http:// or https://`;
    }
    return validate?.(form) ?? "";
  };

  const save = async () => {
    const err = check();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    const data = toPayload(form, keys);
    const result = await dispatch(
      edit
        ? thunks.update({ resumeId, [idParam]: edit.id, data })
        : thunks.add({ resumeId, data }),
    );
    setSaving(false);
    if (result.error) {
      setError(result.payload || `Failed to save ${label.toLowerCase()}`);
    } else {
      close();
    }
  };

  const handleDelete = async () => {
    if (!delItem) return;
    await dispatch(thunks.del({ resumeId, [idParam]: delItem.id }));
    setDel(null);
  };

  const handleCopy = async (source) => {
    const sourceItems = source?.[field] ?? [];
    if (sourceItems.length === 0) {
      setNotice(`"${source?.title}" has no ${label.toLowerCase()} entries to copy.`);
      return;
    }
    let copied = 0;
    for (const item of sourceItems) {
      const data = toPayload({ ...emptyForm, ...item }, keys);
      const result = await dispatch(thunks.add({ resumeId, data }));
      if (!result.error) copied += 1;
    }
    setNotice(`Copied ${copied} of ${sourceItems.length} entries from "${source.title}".`);
  };

  const set = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const renderField = (fdef) => {
    const disabled = fdef.disabledWhen?.(form) ?? false;
    const value = form[fdef.name];
    switch (fdef.type) {
      case "textarea":
        return (
          <Textarea
            rows={3}
            value={value ?? ""}
            placeholder={fdef.placeholder}
            onChange={(e) => set(fdef.name, e.target.value)}
          />
        );
      case "select":
        return (
          <select
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
            value={value ?? ""}
            onChange={(e) => set(fdef.name, e.target.value)}
          >
            {fdef.options.map((o) => (
              <option key={o} value={o}>
                {formatEnum(o)}
              </option>
            ))}
          </select>
        );
      case "tags":
        return (
          <TagInput
            tags={value ?? []}
            placeholder={fdef.placeholder}
            onChange={(tags) => set(fdef.name, tags)}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            min="0"
            value={value ?? ""}
            placeholder={fdef.placeholder}
            onChange={(e) =>
              set(fdef.name, e.target.value === "" ? null : Number(e.target.value))
            }
          />
        );
      default:
        return (
          <Input
            type={fdef.type === "date" ? "date" : fdef.type === "url" ? "url" : "text"}
            value={disabled ? "" : (value ?? "")}
            disabled={disabled}
            placeholder={fdef.placeholder}
            onChange={(e) => set(fdef.name, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CopyFromMenu resumes={otherResumes} onSelect={handleCopy} />
        <AddButton onClick={openAdd} label={`Add ${label}`} />
      </div>

      {notice && <p className="text-xs text-slate-500">{notice}</p>}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No {label.toLowerCase()} added yet.
        </div>
      ) : (
        items.map((item) => (
          <SectionCard key={item.id} item={item} onEdit={openEdit} onDelete={setDel}>
            {renderItem(item)}
          </SectionCard>
        ))
      )}

      <SectionDialog
        onSave={save}
        open={open}
        onClose={close}
        error={error}
        saving={saving}
        title={edit ? `Edit ${label}` : `Add ${label}`}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            className={GRID_COLS[row.length]}
          >
            {row.map((fdef) =>
              fdef.type === "checkbox" ? (
                <Field key={fdef.name} orientation="horizontal">
                  <Checkbox
                    checked={!!form[fdef.name]}
                    onCheckedChange={(v) => set(fdef.name, !!v)}
                  />
                  <Label>{fdef.label}</Label>
                </Field>
              ) : (
                <FRow key={fdef.name} label={fdef.label}>
                  {renderField(fdef)}
                </FRow>
              ),
            )}
          </div>
        ))}
        {extra?.(form, setForm)}
      </SectionDialog>

      <DeleteConfirm
        open={!!delItem}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        label={label.toLowerCase()}
      />
    </div>
  );
};

export default ResumeListSection;
