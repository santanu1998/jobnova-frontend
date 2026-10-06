import React from "react";
import ProfileHeroCard from "./ProfileHeroCard";

import Personalnformation from "./Personalnformation";
import AccountSecurityCard from "./AccountSecurityCard";
import ActivityCard from "./ActivityCard";
import { updateUser } from "../../../reduxt-store/user/userThunk";
import { useDispatch } from "react-redux";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const Profile = () => {
  const [editing, setEditing] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = React.useState(null);

  const [form, setForm] = React.useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
  });

  useEffect(() => {
    if (!editing) {
      setForm({ fullName: user?.fullName || "", phoneNumber: user?.phoneNumber || "" });
    }
  }, [user, editing]);

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setMessage({ type: "error", text: "Full name is required." });
      return;
    }
    const result = await dispatch(
      updateUser({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
      }),
    );
    if (updateUser.fulfilled.match(result)) {
      setEditing(false);
      setMessage({ type: "success", text: "Profile updated." });
    } else {
      setMessage({ type: "error", text: result.payload || "Failed to update profile." });
    }
  };

  const handleAvatarUpload = async (file) => {
    setUploading(true);
    setMessage(null);

    try {
      const url = await uploadToCloudinary(file);
      const result = await dispatch(updateUser({ profileImage: url }));
      if (updateUser.rejected.match(result)) {
        setMessage({ type: "error", text: result.payload || "Failed to save photo." });
      } else {
        setMessage({ type: "success", text: "Profile photo updated." });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <div className="w-full max-w-4xl mx-auto sm:px-4 px-8 py-8 space-y-6">
        {message && (
          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              message.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}
        <ProfileHeroCard
          user={user}
          editing={editing}
          uploading={uploading}
          onEdit={() => setEditing(true)}
          onCancel={() => {
            setEditing(false);
            setMessage(null);
          }}
          onFileSelect={handleAvatarUpload}
          onSave={handleSave}
        />
        <Personalnformation
          user={user}
          editing={editing}
          form={form}
          onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        />
        <AccountSecurityCard user={user} />
        <ActivityCard user={user} />
      </div>
    </div>
  );
};

export default Profile;
