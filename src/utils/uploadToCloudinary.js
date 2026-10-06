// Image uploads (avatars, company logos) go straight to Cloudinary; the backend
// only stores the resulting URL. Configure your own account in .env:
//   VITE_CLOUDINARY_CLOUD_NAME=...
//   VITE_CLOUDINARY_UPLOAD_PRESET=...   (an *unsigned* upload preset)
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export async function uploadToCloudinary(file, folder = "jobnova/avatars") {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Image upload is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in the frontend .env file.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload image to Cloudinary");
  }

  const data = await res.json();
  return data.secure_url;
}
