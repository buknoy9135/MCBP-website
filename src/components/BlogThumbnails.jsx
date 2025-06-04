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
    const updateImagesPerLoad = () => {
      const isMobile = window.innerWidth < 768;
      const perLoad = isMobile ? 3 : 9;
      setImagesPerLoad(perLoad);
      setVisibleCount(perLoad);
    };

    updateImagesPerLoad();
    window.addEventListener("resize", updateImagesPerLoad);
    return () => window.removeEventListener("resize", updateImagesPerLoad);
  }, []);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + imagesPerLoad, blogPosts.length));
  };

  const visiblePosts = blogPosts.slice(0, visibleCount);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 8px" }}>
      <Row xs={1} md={2} lg={3} className="gx-3 gy-3">
        {visiblePosts.map((post) => (
          <Col key={post.id}>
            <Card style={{ width: "100%" }}>
              <Link to={`/blog/${post.slug}`}>
                <Card.Img
                  variant="top"
                  src={post.image[0]}
                  style={{ objectFit: "cover", height: "250px", width: "100%" }}
                  loading="lazy"
                />
              </Link>
              <Card.Body className="py-2">
                <Card.Title className="fs-6">{post.title}</Card.Title>
                <Card.Text className="small text-muted truncate-text">
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
