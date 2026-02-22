import imageCompression from "browser-image-compression";

const CLOUD_NAME = "doeovg6x9";
const UPLOAD_PRESET = "mcbp_unsigned";

/*
THIS IS THE MOST IMPORTANT FILE IN YOUR CMS

It converts:
12MB DSLR -> ~350KB optimized WebP
BEFORE Cloudinary ever sees the file.
*/

async function compressImage(file) {
  const options = {
    maxSizeMB: 0.45,          // target ~450KB
    maxWidthOrHeight: 1600,   // your chosen site resolution
    useWebWorker: true,
    fileType: "image/webp",   // force WebP
    initialQuality: 0.78,
  };

  const compressedFile = await imageCompression(file, options);
  return compressedFile;
}

export async function uploadToCloudinary(file, publicId) {
  try {
    // 1️⃣ COMPRESS FIRST
    const optimizedFile = await compressImage(file);

    const formData = new FormData();
    formData.append("file", optimizedFile);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("public_id", publicId);
    formData.append("folder", "mcbp/blog");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Upload failed");
    }

    // return only the public_id (IMPORTANT)
    return data.public_id;
  } catch (err) {
    console.error("Upload failed:", err);
    throw err;
  }
}