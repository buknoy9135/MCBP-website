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
    setVisibleImageCount(6);
  }, [slug]);

  if (!post) return <div>Post not found.</div>;

  const previousPost = blogPosts[currentIndex - 1];
  const nextPost = blogPosts[currentIndex + 1];

  const handleLoadMore = () => {
    setVisibleImageCount((prev) => Math.min(prev + 6, post.image.length));
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

        <h3>{post.title}</h3>
        <h5>{post.description}</h5>
        <p className="text-muted">{post.location}</p>
        <p className="text-muted">{post.date}</p>
        <p className="text-justify">{post.story}</p>

        {post.image && post.image.length > 0 && (
          <>
            <div className="row g-3">
              {visibleImages.map((imgPath, i) => (
                <div className="col-6 col-md-4" key={i}>
                  <img
                    src={`${process.env.PUBLIC_URL}${imgPath}`}
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
            images={post.image.map((img) => `${process.env.PUBLIC_URL}${img}`)}
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
