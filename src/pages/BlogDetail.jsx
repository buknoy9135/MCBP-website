import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ImageModal from "../components/ImageModal";
import { cloudinaryUrl } from "../lib/cloudinary";
import "../css/BlogDetail.css";

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

  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);

      // --- get session (admins can preview archived)
      const { data: { session } } = await supabase.auth.getSession();

      let query = supabase
        .from("posts")
        .select("*")
        .eq("slug", slug);

      if (!session) query = query.eq("is_archived", false);

      const { data: currentPost } = await query.single();
      if (!currentPost) {
        setPost(null);
        setLoading(false);
        return;
      }

      setPost(currentPost);

      // ---------- PREVIOUS POST ----------
      const { data: prev } = await supabase
        .from("posts")
        .select("slug, title")
        .lt("created_at", currentPost.created_at)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setPreviousPost(prev);

      // ---------- NEXT POST ----------
      const { data: next } = await supabase
        .from("posts")
        .select("slug, title")
        .gt("created_at", currentPost.created_at)
        .eq("is_archived", false)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      setNextPost(next);

      setLoading(false);
      window.scrollTo(0, 0);
    };

    fetchPost();
  }, [slug]);

  if (loading) return <div className="container mt-5">Loading post...</div>;
  if (!post) return <div className="container mt-5">Post not found.</div>;

  const images = post.images || [];

  const openImage = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  // format dates
  const publishedDate = new Date(post.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const activityDate = post.activity_start_date
    ? new Date(post.activity_start_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : null;

  return (
    <div className="BlogDetail-container page-background">
      <div className="container pt-5 mt-4">

        <button className="btn btn-secondary mb-3" onClick={() => navigate("/")}>
          Home
        </button>

        <h2 className="fw-bold mb-2">{post.title}</h2>
        <p className="text-secondary mb-3">{post.description}</p>

        {/* LOCATION + EVENT DATE */}
        <div className="d-flex flex-column flex-md-row text-muted mb-3 small">
          {post.location && (
            <span className="mb-1 mb-md-0 me-md-4">
              📍 {post.location}
            </span>
          )}

          {activityDate && (
            <span>
              📅 {activityDate}
            </span>
          )}
        </div>

        {/* PUBLISHED DATE */}
        <p className="text-muted small">
            Published on <strong>{publishedDate}</strong> by <strong>{post.author_name || "MCBP Admin"}</strong>
        </p>

        <hr />
        <p style={{ whiteSpace: "pre-line" }}>{post.story}</p>

        {images.length > 0 && (
          <>
            <h5 className="mt-5 mb-3">Moments Captured</h5>

            <div className="row g-3">
              {images.map((img, i) => (
                <div className="col-6 col-md-4" key={i}>
                  <ImageWrapper
                    src={cloudinaryUrl(img)}
                    index={i}
                    onOpen={openImage}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* PREV / NEXT PAGINATION */}
        <div className="d-flex justify-content-between align-items-center mt-5 pt-3 pb-4 border-top">

          {previousPost ? (
            <Link
              to={`/blog/${previousPost.slug}`}
              className="text-decoration-none text-start me-auto"
              style={{ maxWidth: "45%" }}
            >
              <small className="text-muted d-block">« Previous</small>
              <strong>{previousPost.title}</strong>
            </Link>
          ) : <div />}

          {nextPost ? (
            <Link
              to={`/blog/${nextPost.slug}`}
              className="text-decoration-none text-end ms-auto"
              style={{ maxWidth: "45%" }}
            >
              <small className="text-muted d-block text-end">Next »</small>
              <strong>{nextPost.title}</strong>
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