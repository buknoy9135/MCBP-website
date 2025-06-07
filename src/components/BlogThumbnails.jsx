import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import blogPosts from "../../src/database/BlogData.js";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

function BlogThumbnails() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [imagesPerLoad, setImagesPerLoad] = useState(9); // default for md+

  // Set initial count and listen to screen resize
  useEffect(() => {
    // Set initial counts on mount
    const isMobile = window.innerWidth < 768;
    const perLoad = isMobile ? 3 : 9;
    setImagesPerLoad(perLoad);
    setVisibleCount(perLoad);
  }, []);

  useEffect(() => {
    // Update only imagesPerLoad on resize (don't reset visibleCount!)
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setImagesPerLoad(isMobile ? 3 : 9);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + imagesPerLoad, blogPosts.length));
  };

  const visiblePosts = blogPosts.slice(0, visibleCount);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 8px" }}>
      <Row xs={1} md={2} lg={3} className="gx-3 gy-3">
        {visiblePosts.map((post) => (
          <Col key={post.id}>
            <Card style={{ width: "100%" }}>
              <Link to={`/blog/${post.slug}`}>
  <div style={{ position: "relative" }}>
    <Card.Img
      variant="top"
      src={post.image[post.image.length - 1]}
      style={{
        objectFit: "cover",
        height: "250px",
        width: "100%",
      }}
      loading="lazy"
    />

    {/* Date label */}
    <div
      style={{
        position: "absolute",
        top: "8px",
        left: "8px",
        backgroundColor: "rgba(0,0,0,0.6)",
        color: "#fff",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: "600",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {post.date}
    </div>

    {/* Only the Click to read More overlay */}
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        right: "10px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: "12px",
        color: "white",
        fontSize: "0.8rem",
        fontWeight: "600",
        cursor: "pointer",
        userSelect: "none",
        filter: "drop-shadow(0 0 2px white)",
      }}
    >
      Click to read More
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: "rotate(45deg)" }}
        viewBox="0 0 24 24"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </div>
  </div>
</Link>


              <Card.Body
                className="py-2" // KEEP original padding/margin classes exactly as before
                style={{
                  backgroundColor: "#e7f1ff", // light blue background only
                  color: "#1a3d7c", // dark blue text color only
                }}
              >
                <Card.Title className="fs-6" style={{ color: "#204a8c" }}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-decoration-none"
                    style={{ color: "inherit" }}
                  >
                    {post.title}
                  </Link>
                </Card.Title>

                <Card.Text
                  className="small text-muted truncate-text"
                  style={{
                    color: "#3a5a9a", // medium blue text
                    fontWeight: "400",
                    lineHeight: "1.4",
                  }}
                >
                  {post.description}
                </Card.Text>

                

              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Load More Button */}
      {visibleCount < blogPosts.length && (
        <div className="text-center mt-4">
          <Button
            onClick={loadMore}
            className="px-4"
            style={{
              fontSize: "0.9rem",
              padding: "0.375rem 1rem",
            }}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Smaller button only on mobile */}
      <style>
        {`
          @media (max-width: 767.98px) {
            button.btn {
              font-size: 0.8rem !important;
              padding: 0.25rem 0.75rem !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default BlogThumbnails;
