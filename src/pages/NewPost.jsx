import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../lib/cloudinaryUpload";
import { cloudinaryUrl } from "../lib/cloudinary";

export default function NewPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");

  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [publisherName, setPublisherName] = useState("");

  const [videoLinks, setVideoLinks] = useState([""]);

  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [previewImage, setPreviewImage] = useState(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function createSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  // ========================= LOAD POST (EDIT MODE)
  useEffect(() => {
    if (!isEditMode) return;

    async function loadPost() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Failed to load post");
        return;
      }

      setTitle(data.title || "");
      setDescription(data.description || "");
      setStory(data.story || "");
      setLocation(data.location || "");
      setStartDate(data.activity_start_date || "");
      setEndDate(data.activity_end_date || "");
      setPublisherName(data.author_name || "");

      // CRITICAL FIX (handles null jsonb)
      setExistingImages(Array.isArray(data.images) ? data.images : []);
      setVideoLinks(data.videos?.length ? data.videos : [""]);
    }

    loadPost();
  }, [id, isEditMode]);

  function handleFileSelect(e) {
    setSelectedFiles(Array.from(e.target.files));
  }

  function removeExistingImage(index) {
    if (!window.confirm("Remove this photo from the post?")) return;
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  }

  // ========================= SUBMIT
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("You are not logged in.");
      setSaving(false);
      return;
    }

    const slug = createSlug(title);

    let uploadedImages = [];
    let featuredPublicId = existingImages[0] || null;

    // ---------- CLOUDINARY UPLOAD ----------
    if (selectedFiles.length > 0) {
      setUploading(true);

      const startingIndex = existingImages.length;

      for (let i = 0; i < selectedFiles.length; i++) {
        const percent = Math.round(((i + 1) / selectedFiles.length) * 100);
        setUploadProgress(percent);

        const publicId =
          `mcbp/blog/${slug}/${String(startingIndex + i + 1).padStart(3, "0")}`;

        try {
          const uploaded = await uploadToCloudinary(selectedFiles[i], publicId);
          uploadedImages.push(uploaded);

          if (!featuredPublicId) featuredPublicId = uploaded;
        } catch (err) {
          console.error("UPLOAD ERROR:", err);
          alert("An image failed to upload.");
          setSaving(false);
          setUploading(false);
          return;
        }
      }

      setUploading(false);
    }

    const finalImages = [...existingImages, ...uploadedImages];

    // ---------- IMPORTANT: JSONB SAFE PAYLOAD ----------
    const payload = {
      title,
      slug,
      description,
      story,
      location,
      author_name: publisherName?.trim() || null,
      featured_image: featuredPublicId,

      images: JSON.parse(JSON.stringify(finalImages)),
      videos: JSON.parse(JSON.stringify(videoLinks.filter(v => v.trim() !== ""))),

      activity_start_date: startDate || null,
      activity_end_date: endDate || null,
      updated_at: new Date().toISOString()
    };

    let response;

    if (isEditMode) {
      response = await supabase
        .from("posts")
        .update(payload)
        .eq("id", id)
        .select();
    } else {
      response = await supabase
        .from("posts")
        .insert([{ ...payload, created_by: session.user.id }])
        .select();
    }

    if (response.error) {
      console.error("SUPABASE ERROR:", response.error);
      alert(response.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    navigate("/admin/dashboard");
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>

      {/* UPLOAD OVERLAY */}
      {uploading && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          zIndex: 9999
        }}>
          <div className="spinner-border text-light" style={{ width: "4rem", height: "4rem" }} />
          <h4 style={{ marginTop: 20 }}>Uploading Photos</h4>
          <p>{uploadProgress}%</p>
        </div>
      )}

      <h2>{isEditMode ? "Edit Post" : "Create New Blog Post"}</h2>

      <form onSubmit={handleSubmit}>

        <label>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required style={{ width: "100%", marginBottom: 15 }} />

        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: "100%", marginBottom: 15 }} />

        <label>Publisher Name (optional)</label>
        <input value={publisherName} onChange={e => setPublisherName(e.target.value)} style={{ width: "100%", marginBottom: 15 }} />

        <label>Location</label>
        <input value={location} onChange={e => setLocation(e.target.value)} style={{ width: "100%", marginBottom: 15 }} />

        <label>Story</label>
        <textarea value={story} onChange={e => setStory(e.target.value)} rows={10} style={{ width: "100%", marginBottom: 20 }} />

        {/* EXISTING IMAGES */}
        {existingImages.length > 0 && (
          <>
            <h4>Current Photos</h4>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12,
              marginBottom: 20
            }}>
              {existingImages.map((img, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img
                    src={cloudinaryUrl(img)}
                    alt=""
                    onClick={() => setPreviewImage(cloudinaryUrl(img))}
                    style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "zoom-in" }}
                  />

                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: 26,
                      height: 26,
                      fontWeight: "bold"
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <label>Add More Photos</label>
        <input type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ marginBottom: 20 }} />

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Publish"}
        </button>

      </form>

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>
          <img src={previewImage} alt="" style={{ maxWidth: "95%", maxHeight: "95%" }} />
        </div>
      )}
    </div>
  );
}