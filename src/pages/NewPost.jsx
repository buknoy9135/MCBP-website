import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

function NewPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  function createSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  // LOAD EXISTING POST (EDIT MODE)
  useEffect(() => {
    if (!isEditMode) return;

    async function loadPost() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed loading post:", error);
        alert("Failed to load post.");
        return;
      }

      setTitle(data.title || "");
      setDescription(data.description || "");
      setStory(data.story || "");
      setFeaturedImage(data.featured_image || "");
      setDate(data.activity_start_date || "");
    }

    loadPost();
  }, [id, isEditMode]);

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

    const user = session.user;
    const slug = createSlug(title);

    const payload = {
      title,
      slug,
      description,
      story,
      featured_image: featuredImage || null,
      activity_start_date: date || null,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (isEditMode) {
      // UPDATE EXISTING POST
      ({ error } = await supabase
        .from("posts")
        .update(payload)
        .eq("id", id));
    } else {
      // CREATE NEW POST
      ({ error } = await supabase.from("posts").insert([
        {
          ...payload,
          images: [],
          videos: [],
          is_archived: false,
          created_by: user.id,
        },
      ]));
    }

    setSaving(false);

    if (error) {
      console.error(error);
      alert("Failed to save post. Check console.");
    } else {
      alert(isEditMode ? "Post updated successfully!" : "Post published successfully!");
      navigate("/admin/dashboard");
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h2>{isEditMode ? "Edit Post" : "Create New Blog Post"}</h2>

      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 15 }}
        />

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          style={{ width: "100%", marginBottom: 15 }}
        />

        <label>Story</label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={12}
          style={{ width: "100%", marginBottom: 15 }}
        />

        <label>Featured Image URL</label>

        {featuredImage && (
          <img
            src={featuredImage}
            alt="current"
            style={{ width: "260px", marginBottom: 12, display: "block" }}
          />
        )}

        <input
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
          style={{ width: "100%", marginBottom: 15 }}
        />

        <label>Activity Date</label>
        <input
          type="date"
          value={date || ""}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: "100%", marginBottom: 20 }}
        />

        <button type="submit" disabled={saving}>
          {saving
            ? isEditMode ? "Updating..." : "Publishing..."
            : isEditMode ? "Update Post" : "Publish Post"}
        </button>
      </form>
    </div>
  );
}

export default NewPost;