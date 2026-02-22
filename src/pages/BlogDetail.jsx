import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ImageModal from "../components/ImageModal";
import "../css/BlogDetail.css";

function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // FETCH POST FROM SUPABASE
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);

    // check if user is logged in (admin preview)
    const {
    data: { session },
    } = await supabase.auth.getSession();

    let query = supabase
    .from("posts")
    .select("*")
    .eq("slug", slug);

    if (!session) {
    // public visitors cannot see archived posts
    query = query.eq("is_archived", false);
    }

    const { data, error } = await query.single();

      if (error || !data) {
        console.error("Post not found:", error);
        setPost(null);
      } else {
        setPost(data);
      }

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

  return (
    <div className="BlogDetail-container page-background">
      <div className="container pt-5 mt-4">

        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate("/")}
        >
          Home
        </button>

        <h2 className="fw-bold mb-2">{post.title}</h2>

        <p className="text-secondary mb-3">
          {post.description}
        </p>

        {post.location && (
          <p className="text-muted">
            📍 {post.location}
          </p>
        )}

        {post.activity_start_date && (
          <p className="text-muted">
            📅 {post.activity_start_date}
          </p>
        )}

        <hr />

        <p style={{ whiteSpace: "pre-line" }}>
          {post.story}
        </p>

        {/* IMAGES */}
        {images.length > 0 && (
          <>
            <h5 className="mt-5 mb-3">Moments Captured</h5>

            <div className="row g-3">
              {images.map((img, i) => (
                <div className="col-6 col-md-4" key={i}>
                  <img
                    src={`https://res.cloudinary.com/doeovg6x9/image/upload/${img}`}
                    alt=""
                    className="img-fluid rounded"
                    onClick={() => openImage(i)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {modalOpen && (
          <ImageModal
            images={images.map(
              (img) =>
                `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/${img}`
            )}
            currentIndex={currentImageIndex}
            setCurrentIndex={setCurrentImageIndex}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default BlogDetail;