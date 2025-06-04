import { useParams, Link, useNavigate } from "react-router-dom";
import blogPosts from "../database/BlogData";
import { useState, useEffect } from "react";
import ImageModal from "../components/ImageModal";
import "../css/BlogDetail.css";

function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const currentIndex = blogPosts.findIndex((post) => post.slug === slug);
  const post = blogPosts[currentIndex];

  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [visibleImageCount, setVisibleImageCount] = useState(6);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setVisibleImageCount(12);
  }, [slug]);

  if (!post) return <div>Post not found.</div>;

  const previousPost = blogPosts[currentIndex - 1];
  const nextPost = blogPosts[currentIndex + 1];

  const handleLoadMore = () => {
    setVisibleImageCount((prev) => Math.min(prev + 12, post.image.length));
  };

  const visibleImages = post.image.slice(0, visibleImageCount);

  const openImage = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  return (
    <div id="BlogDetail-container" className="BlogDetail-container">
      <div className="container pt-5 pt-md-5 mt-4 mt-md-5">
        <div className="d-block d-md-none">
          <button
            className="btn btn-secondary mb-3"
            onClick={() => navigate("/")}
          >
            Home
          </button>
        </div>

        <div className="mb-4">
          <h2 className="fw-bold mb-2">{post.title}</h2>

          <p
            className="text-secondary fst-italic mb-3"
            style={{ fontSize: "clamp(0.85rem, 1vw + 0.5rem, 1.1rem)" }}
          >
            {post.description}
          </p>

          <div className="d-flex flex-column flex-md-row text-muted mb-3 small">
            <span className="mb-1 mb-md-0 me-md-4">{post.location}</span>
            <span>{post.date}</span>
          </div>

          <hr className="my-4" />
          <p
            className="text-justify post-story"
            style={{
              marginTop: "1rem",
              paddingTop: "0.5rem",
              color: "#333",
            }}
          >
            {post.story}
          </p>

          <hr className="my-4" />
        </div>

        {post.image && post.image.length > 0 && (
          <>
            <div className="row g-3">
              {visibleImages.map((imgPath, i) => (
                <div className="col-6 col-md-4" key={i}>
                  <img
                    src={imgPath}
                    alt={`Blog image ${i + 1}`}
                    className="img-fluid rounded shadow-sm"
                    loading="lazy"
                    style={{ cursor: "pointer" }}
                    onClick={() => openImage(i)}
                  />
                </div>
              ))}
            </div>

            {visibleImageCount < post.image.length && (
              <div className="d-flex justify-content-center mt-4">
                <button
                  className="btn btn-outline-primary px-4 py-2 d-none d-md-inline-block"
                  onClick={handleLoadMore}
                >
                  Load More
                </button>
                <button
                  className="btn btn-outline-primary btn-sm px-3 py-1 d-inline-block d-md-none"
                  onClick={handleLoadMore}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}

        <div className="d-flex justify-content-between align-items-center mt-5 pt-3 pb-4 border-top">
          {previousPost ? (
            <Link
              to={`/blog/${previousPost.slug}`}
              className="text-decoration-none text-start me-auto"
              style={{
                maxWidth: "45%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <small className="text-muted d-block">&laquo; Previous</small>
              <strong>{previousPost.title}</strong>
            </Link>
          ) : (
            <div style={{ maxWidth: "45%" }}></div>
          )}

          {nextPost ? (
            <Link
              to={`/blog/${nextPost.slug}`}
              className="text-decoration-none text-end ms-auto"
              style={{
                maxWidth: "45%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <small className="text-muted d-block text-end">
                Next &raquo;
              </small>
              <strong>{nextPost.title}</strong>
            </Link>
          ) : (
            <div style={{ maxWidth: "45%" }}></div>
          )}
        </div>

        {/* Modal with local image paths */}
        {modalOpen && (
          <ImageModal
            images={post.image}
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
