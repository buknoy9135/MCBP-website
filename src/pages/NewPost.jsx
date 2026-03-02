import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";
import { uploadToCloudinary } from "../lib/cloudinaryUpload";
import { cloudinaryUrl } from "../lib/cloudinary";
import "../css/NewPost.css";

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
  const [contributors, setContributors] = useState([{ name: "", link: "" }]);

  const [videoLinks, setVideoLinks] = useState([""]);

  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [featuredFileIndex, setFeaturedFileIndex] = useState(0);
  const [featuredImage, setFeaturedImage] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [currentPhotoPage, setCurrentPhotoPage] = useState(1);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const photosPerPage = 60;
  function createSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function normalizeContributorLink(linkRaw) {
    const value = (linkRaw || "").trim();
    if (!value) return "";

    if (/^[a-z][a-z\d+\-.]*:\/\//i.test(value)) return value;
    if (value.startsWith("//")) return `https:${value}`;

    if (/^www\./i.test(value)) return `https://${value}`;
    return `https://www.${value}`;
  }

  function normalizeContributors(raw) {
    let parsed = raw;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        parsed = [];
      }
    }

    if (!Array.isArray(parsed)) return [{ name: "", link: "" }];

    const clean = parsed
      .map((item) => ({
        name: typeof item?.name === "string" ? item.name.trim() : "",
        link: normalizeContributorLink(typeof item?.link === "string" ? item.link : ""),
      }))
      .filter((item) => item.name && item.link);

    return clean.length ? clean : [{ name: "", link: "" }];
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
      setContributors(normalizeContributors(data.contributors));
      setExistingImages(Array.isArray(data.images) ? data.images : []);
      setFeaturedImage(data.featured_image || null);
      setVideoLinks(data.videos?.length ? data.videos : [""]);
    }

    loadPost();
  }, [id, isEditMode]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(existingImages.length / photosPerPage));
    if (currentPhotoPage > totalPages) {
      setCurrentPhotoPage(totalPages);
    }
  }, [existingImages, currentPhotoPage, photosPerPage]);

  useEffect(() => {
    if (selectedFiles.length === 0) {
      setFilePreviews([]);
      return;
    }
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setFilePreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  function handleFileSelect(e) {
    setSelectedFiles(Array.from(e.target.files));
    setFeaturedFileIndex(0);
  }

  function removeExistingImage(index) {
    if (!window.confirm("Remove this photo from the post?")) return;
    setExistingImages((prev) => {
      const removed = prev[index];
      if (removed === featuredImage) setFeaturedImage(null);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      alert("You are not logged in.");
      setSaving(false);
      return;
    }

    const slug = createSlug(title);

    let uploadedImages = [];
    let featuredPublicId = featuredImage ?? (existingImages[0] || null);

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
        } catch (err) {
          console.error("UPLOAD ERROR:", err);
          alert("An image failed to upload.");
          setSaving(false);
          setUploading(false);
          return;
        }
      }

      setUploading(false);

      if (!featuredPublicId && uploadedImages.length > 0) {
        featuredPublicId = uploadedImages[featuredFileIndex] ?? uploadedImages[0];
      }
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
      videos: JSON.parse(JSON.stringify(videoLinks.filter((v) => v.trim() !== ""))),
      contributors: JSON.parse(
        JSON.stringify(
          contributors
            .map((item) => ({
              name: item?.name?.trim() || "",
              link: normalizeContributorLink(item?.link),
            }))
            .filter((item) => item.name && item.link)
        )
      ),
      activity_start_date: startDate || null,
      activity_end_date: endDate || null,
      updated_at: new Date().toISOString(),
    };

    let response;

    if (isEditMode) {
      response = await supabase.from("posts").update(payload).eq("id", id).select();
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

  const totalPhotoPages = Math.max(1, Math.ceil(existingImages.length / photosPerPage));
  const paginatedImages = existingImages.slice(
    (currentPhotoPage - 1) * photosPerPage,
    currentPhotoPage * photosPerPage
  );

  return (
    <div className="newpost-page">
      {uploading && (
        <div className="newpost-upload-overlay">
          <div className="spinner-border text-light newpost-spinner" />
          <h4 className="newpost-upload-title">Uploading Photos</h4>
          <p>{uploadProgress}%</p>
        </div>
      )}

      <div className="newpost-shell">
        <div className="newpost-header">
          <Link to="/admin/dashboard" className="newpost-back-link">
            <button className="newpost-back-btn" type="button">
              <i className="bi bi-arrow-left-short" aria-hidden="true"></i>
              Dashboard
            </button>
          </Link>
          <h2 className="newpost-title">
            {isEditMode ? "Edit Post" : "Create New Blog Post"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="newpost-form-card">
          <div className="newpost-field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="newpost-field">
            <label>Description</label>
            <textarea
              className="newpost-description-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={1}
            />
          </div>

          <div className="newpost-grid-two">
            <div className="newpost-field">
              <label>Publisher Name (optional)</label>
              <input
                value={publisherName}
                onChange={(e) => setPublisherName(e.target.value)}
              />
            </div>
            <div className="newpost-field">
              <label>Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>

          <div className="newpost-grid-two">
            <div className="newpost-field">
              <label>Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="newpost-field">
              <label>End Date (optional)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="newpost-field">
            <label>Story</label>
            <textarea
              className="newpost-story-textarea"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={18}
            />
          </div>

          <div className="newpost-section">
            <label className="newpost-section-label">YouTube Video Links</label>
            {videoLinks.map((link, i) => (
              <div key={i} className="newpost-video-row">
                <input
                  type="url"
                  value={link}
                  placeholder="https://youtube.com/watch?v=..."
                  onChange={(e) => {
                    const updated = [...videoLinks];
                    updated[i] = e.target.value;
                    setVideoLinks(updated);
                  }}
                />
                {videoLinks.length > 1 && (
                  <button
                    type="button"
                    className="newpost-remove-btn"
                    onClick={() => setVideoLinks((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label="Remove video link"
                  >
                    <i className="bi bi-x-lg" aria-hidden="true"></i>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="newpost-add-video-btn"
              onClick={() => setVideoLinks((prev) => [...prev, ""])}
            >
              <i className="bi bi-plus-circle" aria-hidden="true"></i>
              Add another video
            </button>
          </div>
          <div className="newpost-section">
            <label className="newpost-section-label">Photos / Videos Courtesy Of</label>
            {contributors.map((person, i) => (
              <div className="newpost-contrib-row" key={`contrib-${i}`}>
                <input
                  type="text"
                  className="newpost-contrib-name"
                  placeholder="Contributor name"
                  value={person.name}
                  onChange={(e) => {
                    const updated = [...contributors];
                    updated[i] = { ...updated[i], name: e.target.value };
                    setContributors(updated);
                  }}
                />
                <input
                  type="text"
                  inputMode="url"
                  className="newpost-contrib-link"
                  placeholder="jalilanthony.com or https://facebook.com/..."
                  value={person.link}
                  onChange={(e) => {
                    const updated = [...contributors];
                    updated[i] = { ...updated[i], link: e.target.value };
                    setContributors(updated);
                  }}
                  onBlur={() => {
                    const updated = [...contributors];
                    updated[i] = {
                      ...updated[i],
                      link: normalizeContributorLink(updated[i]?.link),
                    };
                    setContributors(updated);
                  }}
                />
                {contributors.length > 1 && (
                  <button
                    type="button"
                    className="newpost-remove-btn"
                    onClick={() =>
                      setContributors((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    aria-label="Remove contributor"
                  >
                    <i className="bi bi-x-lg" aria-hidden="true"></i>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="newpost-add-video-btn"
              onClick={() => setContributors((prev) => [...prev, { name: "", link: "" }])}
            >
              <i className="bi bi-plus-circle" aria-hidden="true"></i>
              Add another person
            </button>
          </div>
          {existingImages.length > 0 && (
            <div className="newpost-section">
              <h4>
                Current Photos
                <span className="newpost-photo-count">
                  {existingImages.length} total
                </span>
              </h4>
              <p className="newpost-thumbnail-hint">
                <i className="bi bi-star-fill" aria-hidden="true"></i> Click the star on any photo to set it as the thumbnail shown in Community Updates.
              </p>
              <div className="newpost-photo-scroll">
                <div className="newpost-photo-grid">
                  {paginatedImages.map((img, i) => {
                    const absoluteIndex = (currentPhotoPage - 1) * photosPerPage + i;
                    const isFeatured = img === featuredImage;
                    return (
                      <div
                        key={absoluteIndex}
                        className={`newpost-photo-item${isFeatured ? " newpost-photo-featured" : ""}`}
                      >
                        <img
                          src={cloudinaryUrl(img)}
                          alt=""
                          onClick={() => setPreviewImage(cloudinaryUrl(img))}
                        />
                        <button
                          type="button"
                          className="newpost-photo-star"
                          onClick={() => setFeaturedImage(isFeatured ? null : img)}
                          aria-label={isFeatured ? "Remove as thumbnail" : "Set as thumbnail"}
                          title={isFeatured ? "Remove as thumbnail" : "Set as thumbnail"}
                        >
                          <i className={`bi ${isFeatured ? "bi-star-fill" : "bi-star"}`} aria-hidden="true"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(absoluteIndex)}
                          className="newpost-photo-remove"
                          aria-label="Remove image"
                        >
                          <i className="bi bi-x-lg" aria-hidden="true"></i>
                        </button>
                        {isFeatured && (
                          <span className="newpost-featured-badge">Thumbnail</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {totalPhotoPages > 1 && (
                <div className="newpost-photo-pagination">
                  <button
                    type="button"
                    className="newpost-page-btn"
                    onClick={() => setCurrentPhotoPage((p) => Math.max(1, p - 1))}
                    disabled={currentPhotoPage === 1}
                  >
                    <i className="bi bi-chevron-left" aria-hidden="true"></i>
                    Prev
                  </button>
                  <span className="newpost-page-indicator">
                    Page {currentPhotoPage} of {totalPhotoPages}
                  </span>
                  <button
                    type="button"
                    className="newpost-page-btn"
                    onClick={() => setCurrentPhotoPage((p) => Math.min(totalPhotoPages, p + 1))}
                    disabled={currentPhotoPage === totalPhotoPages}
                  >
                    Next
                    <i className="bi bi-chevron-right" aria-hidden="true"></i>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="newpost-section">
            <label className="newpost-section-label">
              {isEditMode ? "Add More Photos" : "Photos"}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="newpost-file-input"
            />
            {filePreviews.length > 0 && (
              <div className="newpost-new-previews">
                <p className="newpost-thumbnail-hint">
                  <i className="bi bi-star-fill" aria-hidden="true"></i>{" "}
                  Click the star to choose which photo appears as the thumbnail in Community Updates.
                  {featuredImage && " (An existing photo is already set as thumbnail â€” this selection is ignored.)"}
                </p>
                <div className="newpost-photo-scroll">
                <div className="newpost-photo-grid">
                  {filePreviews.map((url, i) => {
                    const isNewFeatured = i === featuredFileIndex && !featuredImage;
                    return (
                      <div
                        key={i}
                        className={`newpost-photo-item${isNewFeatured ? " newpost-photo-featured" : ""}`}
                      >
                        <img
                          src={url}
                          alt=""
                          onClick={() => setPreviewImage(url)}
                        />
                        <button
                          type="button"
                          className="newpost-photo-star"
                          onClick={() => setFeaturedFileIndex(i)}
                          aria-label="Set as thumbnail"
                          title="Set as thumbnail"
                        >
                          <i className={`bi ${isNewFeatured ? "bi-star-fill" : "bi-star"}`} aria-hidden="true"></i>
                        </button>
                        {isNewFeatured && (
                          <span className="newpost-featured-badge">Thumbnail</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>
            )}
          </div>

          <div className="newpost-actions">
            <button type="submit" disabled={saving} className="newpost-submit-btn">
              {saving ? "Saving..." : isEditMode ? "Save Changes" : "Publish"}
            </button>

            <Link to="/admin/dashboard" className="newpost-cancel-link">
              <button type="button" className="newpost-cancel-btn">
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>

      {previewImage && (
        <div onClick={() => setPreviewImage(null)} className="newpost-preview-overlay">
          <img src={previewImage} alt="" className="newpost-preview-image" />
        </div>
      )}
    </div>
  );
}




