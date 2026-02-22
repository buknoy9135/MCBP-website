const CLOUD_NAME = "doeovg6x9";

export function cloudinaryUrl(publicId) {
  if (!publicId) return "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}.webp`;
}