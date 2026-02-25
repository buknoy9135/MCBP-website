import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ImageModal from "../components/ImageModal";
import { cloudinaryUrl } from "../lib/cloudinary";
import "../css/BlogDetail.css";

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const videoId = u.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
  } catch {
    return null;
  }
  return null;
}

function ImageWrapper({ src, index, onOpen }) {
  const [isPortrait, setIsPortrait] = useState(false);
  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalHeight > naturalWidth) setIsPortrait(true);
  };
  return (
    <div
      className={`image-box ${isPortrait ? "portrait" : ""}`}
      onClick={() => onOpen(index)}
    >
      <img src={src} loading="lazy" onLoad={handleLoad} alt="" />
    </div>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [previousPost, setPreviousPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);

      let query = supabase.from("posts").select("*").eq("slug", slug);
      if (!session) query = query.eq("is_archived", false);

      const { data: currentPost } = await query.single();
      if (!currentPost) { setPost(null); setLoading(false); return; }

      setPost(currentPost);

      const { data: prev } = await supabase
        .from("posts").select("slug, title")
        .lt("created_at", currentPost.created_at)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(1).maybeSingle();
      setPreviousPost(prev);

      const { data: next } = await supabase
        .from("posts").select("slug, title")
        .gt("created_at", currentPost.created_at)
        .eq("is_archived", false)
        .order("created_at", { ascending: true })
        .limit(1).maybeSingle();
      setNextPost(next);

      setLoading(false);
      window.scrollTo(0, 0);
    };

    fetchPost();
  }, [slug]);

  if (loading) return <div className="container mt-5">Loading post...</div>;
  if (!post) return <div className="container mt-5">Post not found.</div>;

  const images = post.images || [];
  const videos = (post.videos || []).map(getYouTubeEmbedUrl).filter(Boolean);

  const openImage = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const publishedDate = new Date(post.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric"
  });

  const activityDate = post.activity_start_date
    ? new Date(post.activity_start_date).toLocaleDateString(undefined, {
        year: "numeric", month: "long", day: "numeric"
      })
    : null;

  const activityEndDate = post.activity_end_date
    ? new Date(post.activity_end_date).toLocaleDateString(undefined, {
        year: "numeric", month: "long", day: "numeric"
      })
    : null;

  return (
    <div className="BlogDetail-container page-background">
      <style>{`
        .blog-pagination-link strong {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-size: 14px;
          line-height: 1.4;
        }
        .admin-toolbar {
          position: sticky;
          top: 0;
          z-index: 90;
          background: #1e1b4b;
          border-bottom: 2px solid #4f46e5;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 2px 12px rgba(79,70,229,0.25);
        }
        .admin-toolbar-label { display: none; }
        .admin-toolbar-divider { display: none; }
        .btn-admin-dashboard {
          background: transparent;
          border: 1px solid #4f46e5;
          color: #a5b4fc;
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: background 0.15s;
        }
        .btn-admin-dashboard:hover {
          background: #312e81;
          color: #c7d2fe;
        }
        .btn-admin-edit {
          background: #4f46e5;
          border: 1px solid #6366f1;
          color: white;
          border-radius: 6px;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(79,70,229,0.4);
          transition: opacity 0.15s;
        }
        .btn-admin-edit:hover {
          opacity: 0.88;
          color: white;
        }
        .archived-banner {
          background: #451a03;
          border-left: 4px solid #f59e0b;
          color: #fcd34d;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
        }
      `}</style>

      {/* ── ADMIN STICKY TOOLBAR ── */}
      {isAdmin && (
        <div className="admin-toolbar">
          <div className="container" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link to="/admin/dashboard" className="btn-admin-dashboard">
              ← Dashboard
            </Link>
            <Link to={`/admin/edit-post/${post.id}`} className="btn-admin-edit">
              ✏️ Edit Post
            </Link>
            {post.is_archived && (
              <span style={{
                marginLeft: "auto",
                background: "#78350f",
                color: "#fcd34d",
                borderRadius: 20,
                padding: "3px 12px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}>
                ⚠ ARCHIVED
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── ARCHIVED BANNER ── */}
      {isAdmin && post.is_archived && (
        <div className="archived-banner">
          <div className="container">
            ⚠️ This post is currently <strong style={{ margin: "0 4px" }}>archived</strong>
            — it is not visible to the public.
          </div>
        </div>
      )}

      <div className="container" style={{ paddingTop: isAdmin ? 24 : 80, paddingBottom: 60 }}>

        {/* Public home button — only for non-admins */}
        {!isAdmin && (
          <div style={{ marginBottom: 20 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/")}>
              ← Home
            </button>
          </div>
        )}

        <h2 className="fw-bold mb-2" style={{ lineHeight: 1.3 }}>{post.title}</h2>
        <p className="text-secondary mb-3">{post.description}</p>

        {/* Location + date */}
        <div
          className="d-flex flex-column flex-sm-row flex-wrap text-muted mb-3 small"
          style={{ gap: "6px 20px" }}
        >
          {post.location && <span>📍 {post.location}</span>}
          {activityDate && (
            <span>📅 {activityDate}{activityEndDate && ` – ${activityEndDate}`}</span>
          )}
        </div>

        <p className="text-muted small">
          Published on <strong>{publishedDate}</strong> by{" "}
          <strong>{post.author_name || "MCBP Admin"}</strong>
        </p>

        <hr />

        <p style={{ whiteSpace: "pre-line", lineHeight: 1.8, fontSize: 15 }}>{post.story}</p>

        {/* ── IMAGES ── */}
        {images.length > 0 && (
          <>
            <h5 className="mt-5 mb-3">Moments Captured</h5>
            <div className="row g-2 g-md-3">
              {images.map((img, i) => (
                <div className="col-6 col-md-4" key={i}>
                  <ImageWrapper src={cloudinaryUrl(img)} index={i} onOpen={openImage} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── VIDEOS ── */}
        {videos.length > 0 && (
          <>
            <h5 className="mt-5 mb-3">Videos</h5>
            <div className="row g-3">
              {videos.map((embedUrl, i) => (
                <div key={i} className={videos.length === 1 ? "col-12" : "col-12 col-md-6"}>
                  <div style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    overflow: "hidden",
                    borderRadius: 10,
                    background: "#000",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  }}>
                    <iframe
                      src={embedUrl}
                      title={`Video ${i + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: "100%", height: "100%",
                        border: "none",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── PREV / NEXT ── */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 48,
          paddingTop: 20,
          borderTop: "1px solid #dee2e6",
          gap: 12,
        }}>
          {previousPost ? (
            <Link
              to={`/blog/${previousPost.slug}`}
              className="blog-pagination-link text-decoration-none"
              style={{ maxWidth: "48%" }}
            >
              <small className="text-muted d-block mb-1">« Previous</small>
              <strong className="text-dark">{previousPost.title}</strong>
            </Link>
          ) : <div />}

          {nextPost ? (
            <Link
              to={`/blog/${nextPost.slug}`}
              className="blog-pagination-link text-decoration-none text-end ms-auto"
              style={{ maxWidth: "48%" }}
            >
              <small className="text-muted d-block mb-1 text-end">Next »</small>
              <strong className="text-dark">{nextPost.title}</strong>
            </Link>
          ) : <div />}
        </div>

        {modalOpen && (
          <ImageModal
            images={images.map(cloudinaryUrl)}
            currentIndex={currentImageIndex}
            setCurrentIndex={setCurrentImageIndex}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
