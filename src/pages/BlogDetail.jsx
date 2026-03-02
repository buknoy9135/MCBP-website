import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
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
      <div className="image-overlay">
        <i className="bi bi-zoom-in" aria-hidden="true"></i>
      </div>
    </div>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPreviewRoute = location.pathname.startsWith("/admin/blog/");

  const [post, setPost] = useState(null);
  const [previousPost, setPreviousPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [visibleImages, setVisibleImages] = useState(6);
  const [imagesPerLoad, setImagesPerLoad] = useState(6);

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

  useEffect(() => {
    const perLoad = window.innerWidth < 768 ? 4 : 6;
    setImagesPerLoad(perLoad);
    setVisibleImages(perLoad);
  }, [slug, post?.id]);

  if (loading) return (
    <div className="blog-loading-screen">
      <div className="blog-loading-spinner"></div>
      <p>Loading post...</p>
    </div>
  );

  if (!post) return (
    <div className="blog-not-found">
      <i className="bi bi-file-earmark-x" aria-hidden="true"></i>
      <h3>Post not found</h3>
      <button className="blog-back-btn" onClick={() => navigate("/")}>
        <i className="bi bi-arrow-left" aria-hidden="true"></i>
        Back to Home
      </button>
    </div>
  );

  const images = post.images || post.image || [];
  const videos = (post.videos || post.video || []).map(getYouTubeEmbedUrl).filter(Boolean);
  const contributorsRaw = post.contributors;
  const contributorsParsed = typeof contributorsRaw === "string"
    ? (() => {
        try {
          return JSON.parse(contributorsRaw);
        } catch {
          return [];
        }
      })()
    : contributorsRaw;
  const contributors = Array.isArray(contributorsParsed)
    ? contributorsParsed
        .map((person) => ({
          name: typeof person?.name === "string" ? person.name.trim() : "",
          link: typeof person?.link === "string" ? person.link.trim() : "",
        }))
        .filter((person) => person.name && person.link)
    : [];

  const openImage = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const loadMoreImages = () => {
    setVisibleImages((prev) => Math.min(prev + imagesPerLoad, images.length));
  };

  const publishedDate = new Date(post.created_at).toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric"
  });

  const activityDate = (post.activity_start_date || post.date)
    ? new Date(post.activity_start_date || post.date).toLocaleDateString(undefined, {
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
        .btn-admin-dashboard:hover { background: #312e81; color: #c7d2fe; }
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
        .btn-admin-edit:hover { opacity: 0.88; color: white; }
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

      {/* â”€â”€ ADMIN STICKY TOOLBAR â”€â”€ */}
      {isAdmin && (
        <div className="admin-toolbar">
          <div className="container" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link to="/admin/dashboard" className="btn-admin-dashboard">
              â† Dashboard
            </Link>
            <Link to={`/admin/edit-post/${post.id}`} className="btn-admin-edit">
              âœï¸ Edit Post
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
                âš  ARCHIVED
              </span>
            )}
          </div>
        </div>
      )}

      {/* â”€â”€ ARCHIVED BANNER â”€â”€ */}
      {isAdmin && post.is_archived && (
        <div className="archived-banner">
          <div className="container">
            âš ï¸ This post is currently <strong style={{ margin: "0 4px" }}>archived</strong>
            â€” it is not visible to the public.
          </div>
        </div>
      )}

      <div className="blog-detail-content" style={{ paddingTop: isAdmin || isAdminPreviewRoute ? 24 : 80, paddingBottom: 80 }}>

        {/* â”€â”€ BACK BUTTON (public only) â”€â”€ */}
        {!isAdmin && (
          <button className="blog-back-btn" onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
            Back to Home
          </button>
        )}

        {/* â”€â”€ POST HEADER â”€â”€ */}
        <div className="blog-post-header">
          <div className="blog-header-accent"></div>
          <h1 className="blog-detail-title">{post.title}</h1>
          <p className="blog-detail-subtitle">{post.description}</p>

          {(post.location || activityDate) && (
            <div className="blog-meta-chips">
              {post.location && (
                <span className="blog-meta-chip chip-location">
                  <i className="bi bi-geo-alt-fill" aria-hidden="true"></i>
                  {post.location}
                </span>
              )}
              {activityDate && (
                <span className="blog-meta-chip chip-date">
                  <i className="bi bi-calendar-event-fill" aria-hidden="true"></i>
                  {activityDate}{activityEndDate && ` â€“ ${activityEndDate}`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* â”€â”€ STORY â”€â”€ */}
        <div className="blog-story-section">
          <p className="post-story">{post.story}</p>
        </div>

        {/* â”€â”€ AUTHOR â”€â”€ */}
        <div className="blog-author-row">
          <div className="blog-author-avatar">
            <i className="bi bi-person-fill" aria-hidden="true"></i>
          </div>
          <div className="blog-author-info">
            <span className="blog-author-name">{post.author_name || "MCBP Admin"}</span>
            <span className="blog-author-date">
              <i className="bi bi-clock" aria-hidden="true"></i>
              Published {publishedDate}
            </span>
          </div>
        </div>

        {contributors.length > 0 && (
          <div className="blog-courtesy-row">
            <span className="blog-courtesy-label">
              <i className="bi bi-camera-reels-fill" aria-hidden="true"></i>
              Photos / Videos courtesy of:
            </span>{" "}
            <span className="blog-courtesy-pills">
              {contributors.map((person, index) => (
                <a
                  key={`${person.name}-${index}`}
                  href={person.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blog-courtesy-link"
                >
                  {person.name}
                </a>
              ))}
            </span>
          </div>
        )}
        {/* â”€â”€ IMAGES â”€â”€ */}
        {images.length > 0 && (
          <div className="blog-media-section">
            <div className="blog-section-heading">
              <span className="blog-section-icon">
                <i className="bi bi-camera-fill" aria-hidden="true"></i>
              </span>
              <h5 className="blog-section-title">Moments Captured</h5>
              <span className="blog-section-count">{images.length} photos</span>
            </div>
            <div className="row g-2 g-md-3">
              {images.slice(0, visibleImages).map((img, i) => (
                <div className="col-6 col-md-4" key={i}>
                  <ImageWrapper src={cloudinaryUrl(img)} index={i} onOpen={openImage} />
                </div>
              ))}
            </div>
            {visibleImages < images.length && (
              <div className="blog-load-more-wrap">
                <button className="blog-load-more-btn" onClick={loadMoreImages}>
                  <i className="bi bi-images" aria-hidden="true"></i>
                  Load {Math.min(imagesPerLoad, images.length - visibleImages)} More Photos
                </button>
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ VIDEOS â”€â”€ */}
        {videos.length > 0 && (
          <div className="blog-media-section">
            <div className="blog-section-heading">
              <span className="blog-section-icon video-icon">
                <i className="bi bi-play-circle-fill" aria-hidden="true"></i>
              </span>
              <h5 className="blog-section-title">Videos</h5>
            </div>
            <div className="row g-3 video-grid">
              {videos.map((embedUrl, i) => (
                <div key={i} className={videos.length === 1 ? "col-12" : "col-12 col-md-6"}>
                  <div className="video-responsive-wrapper">
                    <iframe
                      src={`${embedUrl}?rel=0&modestbranding=1`}
                      title={`Video ${i + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* â”€â”€ PREV / NEXT â”€â”€ */}
        <div className="blog-pagination-wrap">
          {previousPost ? (
            <Link
              to={`/blog/${previousPost.slug}`}
              className="blog-pagination-card prev-card"
            >
              <span className="pagination-direction">
                <i className="bi bi-arrow-left" aria-hidden="true"></i>
                Previous Post
              </span>
              <strong className="pagination-title">{previousPost.title}</strong>
            </Link>
          ) : <div />}

          {nextPost ? (
            <Link
              to={`/blog/${nextPost.slug}`}
              className="blog-pagination-card next-card"
            >
              <span className="pagination-direction">
                Next Post
                <i className="bi bi-arrow-right" aria-hidden="true"></i>
              </span>
              <strong className="pagination-title">{nextPost.title}</strong>
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





