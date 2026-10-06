import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { updateApplicationStatus } from "../../../reduxt-store/application/applicationThunk";

const STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { value: "REJECTED", label: "Rejected" },
  { value: "HIRED", label: "Hired" },
];

const UpdateStatusDialog = ({ open, onClose, applicationId, currentStatus }) => {
  const [status, setStatus] = useState(currentStatus || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const isWithdrawn = currentStatus === "WITHDRAWN";

  const handleSubmit = async () => {
    if (!status || status === currentStatus) {
      onClose();
      return;
    }
    setSaving(true);
    const result = await dispatch(updateApplicationStatus({ id: applicationId, status }));
    setSaving(false);
    if (result.error) setError(result.payload || "Failed to update status");
    else onClose();
  };

  return (
    <Dialog open={!!open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
        </DialogHeader>

        {isWithdrawn ? (
          <p className="text-sm text-amber-700">
            The candidate has withdrawn this application, so its status can no longer be changed.
          </p>
        ) : (
          <div className="space-y-2">
            <Label>New Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="text-sm w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          {!isWithdrawn && (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Update
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusDialog;
