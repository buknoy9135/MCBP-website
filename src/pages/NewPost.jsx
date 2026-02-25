import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";
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
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 60px" }}>

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

      {/* ── HEADER ROW ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
        flexWrap: "wrap",
      }}>
        <Link to="/admin/dashboard" style={{ textDecoration: "none" }}>
          <button style={{
            background: "transparent",
            border: "1px solid #dee2e6",
            borderRadius: 6,
            padding: "7px 14px",
            fontSize: 13,
            cursor: "pointer",
            color: "#6c757d",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            ← Dashboard
          </button>
        </Link>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
          {isEditMode ? "Edit Post" : "Create New Blog Post"}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>

        <label>Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 15, padding: "8px 10px", boxSizing: "border-box" }}
        />

        <label>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          style={{ width: "100%", marginBottom: 15, padding: "8px 10px", boxSizing: "border-box" }}
        />

        <label>Publisher Name (optional)</label>
        <input
          value={publisherName}
          onChange={e => setPublisherName(e.target.value)}
          style={{ width: "100%", marginBottom: 15, padding: "8px 10px", boxSizing: "border-box" }}
        />

        <label>Location</label>
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
          style={{ width: "100%", marginBottom: 15, padding: "8px 10px", boxSizing: "border-box" }}
        />

        <div style={{ display: "flex", gap: 12, marginBottom: 15, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>End Date (optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <label>Story</label>
        <textarea
          value={story}
          onChange={e => setStory(e.target.value)}
          rows={10}
          style={{ width: "100%", marginBottom: 20, padding: "8px 10px", boxSizing: "border-box" }}
        />

        {/* VIDEO LINKS */}
        <label>YouTube Video Links</label>
        {videoLinks.map((link, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="url"
              value={link}
              placeholder="https://youtube.com/watch?v=..."
              onChange={e => {
                const updated = [...videoLinks];
                updated[i] = e.target.value;
                setVideoLinks(updated);
              }}
              style={{ flex: 1, padding: "8px 10px", boxSizing: "border-box" }}
            />
            {videoLinks.length > 1 && (
              <button
                type="button"
                onClick={() => setVideoLinks(prev => prev.filter((_, idx) => idx !== i))}
                style={{ padding: "8px 12px", cursor: "pointer" }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setVideoLinks(prev => [...prev, ""])}
          style={{ marginBottom: 20, fontSize: 13, cursor: "pointer", padding: "6px 12px" }}
        >
          + Add another video
        </button>

        {/* EXISTING IMAGES */}
        {existingImages.length > 0 && (
          <>
            <h4>Current Photos</h4>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 10,
              marginBottom: 20
            }}>
              {existingImages.map((img, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img
                    src={cloudinaryUrl(img)}
                    alt=""
                    onClick={() => setPreviewImage(cloudinaryUrl(img))}
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 8,
                      cursor: "zoom-in",
                      display: "block"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: 26,
                      height: 26,
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "block", marginBottom: 24 }}
        />

        {/* SUBMIT */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "#0d6efd",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "10px 24px",
              fontSize: 15,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : isEditMode ? "Save Changes" : "Publish"}
          </button>

          <Link to="/admin/dashboard" style={{ textDecoration: "none" }}>
            <button
              type="button"
              style={{
                background: "transparent",
                border: "1px solid #dee2e6",
                borderRadius: 6,
                padding: "10px 20px",
                fontSize: 15,
                cursor: "pointer",
                color: "#6c757d",
              }}
            >
              Cancel
            </button>
          </Link>
        </div>

      </form>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <img
            src={previewImage}
            alt=""
            style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 8 }}
          />
        </div>
      )}
    </div>
  );
}
