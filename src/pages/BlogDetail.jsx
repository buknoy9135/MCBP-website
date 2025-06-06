import { useParams, Link, useNavigate } from "react-router-dom";
import blogPosts from "../database/BlogData";
import { useState, useEffect } from "react";
import ImageModal from "../components/ImageModal";
import { Camera, Video } from "lucide-react";
import { Helmet } from "react-helmet";  // <-- Added import
import "../css/BlogDetail.css";

function ImageWrapper({ src, alt, index, onOpen }) {
  const [isPortrait, setIsPortrait] = useState(false);

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalHeight > naturalWidth) {
      setIsPortrait(true);
    }
  };

  return (
    <div
      className={`image-box ${isPortrait ? "portrait" : ""}`}
      onClick={() => onOpen(index)}
    >
      <img src={src} alt={alt} loading="lazy" onLoad={handleLoad} />
    </div>
  );
}

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

  // Use first image or fallback image URL for OG image meta
  const ogImage = post.image && post.image.length > 0 ? post.image[0] : "https://www.mcbp-org.com/default-og-image.jpg";

  // Construct canonical URL for this post (adjust your domain accordingly)
  const canonicalUrl = `https://www.mcbp-org.com/blog/${post.slug}`;

  return (
    <div
      id="BlogDetail-container"
      className="BlogDetail-container page-background"
    >
      {/* React Helmet SEO tags */}
      <Helmet>
        <title>{post.title} | Metro Cebu Businessmen and Professionals (MCBP)</title>
        <meta name="description" content={post.description} />
        <meta name="robots" content="index, follow" />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={`${post.title} | MCBP`} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | MCBP`} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

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
            className="text-secondary mb-3"
            style={{ fontSize: "clamp(1rem, 1vw + 0.5rem, 1.1rem)" }}
          >
            {post.description}
          </p>

          <div className="d-flex flex-column flex-md-row text-muted mb-3 small">
            <span className="mb-1 mb-md-0 me-md-4">
              <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
              {post.location}
            </span>
            <span>
              <i className="bi bi-calendar-event-fill me-1 text-primary"></i>
              {post.date}
            </span>
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

          {post.date && post.author?.name && (
            <p
              className="text-muted mb-3 mt-md-5 post-meta"
              style={{ fontSize: "0.85rem" }}
            >
              <i className="bi bi-calendar-event me-1 text-primary"></i>
              Published on:{" "}
              <span className="fw-semibold">{post.published}</span>{" "}
              <i className="bi bi-person-fill ms-3 me-1 text-secondary"></i>
              by:{" "}
              {post.author.link ? (
                <a
                  href={post.author.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fw-semibold text-decoration-none"
                  style={{ color: "#555" }}
                >
                  {post.author.name}
                </a>
              ) : (
                <span className="fw-semibold">{post.author.name}</span>
              )}
            </p>
          )}

          {/* media credits */}
          {post.contributors &&
            post.contributors.some((c) => c.name && c.link) && (
              <div
                className="d-flex flex-wrap align-items-center gap-2 mt-4 media-credit"
                style={{
                  fontSize: "0.85rem",
                  lineHeight: "1.4",
                  color: "#555",
                }}
              >
                <span className="d-flex align-items-center">
                  <Camera size={18} className="me-1 text-primary" />{" "}
                  {/* change icon color */}
                  <Video size={18} className="text-danger" />{" "}
                  {/* change icon color */}
                </span>

                <span className="d-flex flex-wrap align-items-center gap-1">
                  <span style={{ color: "#777" }}>
                    Photos / Videos courtesy of
                  </span>{" "}
                  {(() => {
                    const validContributors = post.contributors.filter(
                      (c) => c.name && c.link
                    );

                    return validContributors.map((c, index) => {
                      const isLast = index === validContributors.length - 1;
                      const isSecondLast =
                        index === validContributors.length - 2;

                      return (
                        <span key={index}>
                          <a
                            href={c.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#0066cc", fontWeight: 500 }} // contributor link color
                          >
                            {c.name}
                          </a>
                          {validContributors.length > 1 && !isLast && (
                            <>{isSecondLast ? " and " : ", "}</>
                          )}
                        </span>
                      );
                    });
                  })()}
                </span>
              </div>
            )}

          <hr className="my-4" />
        </div>

        {post.image && post.image.length > 0 && (
          <>
            <div className="row g-3">
              {visibleImages.map((imgPath, i) => (
                <div className="col-6 col-md-4" key={i}>
                  <ImageWrapper
                    src={imgPath}
                    alt={`Blog image ${i + 1}`}
                    index={i}
                    onOpen={openImage}
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
