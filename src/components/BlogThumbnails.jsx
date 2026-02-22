import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

function BlogThumbnails() {
  const [posts, setPosts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [imagesPerLoad, setImagesPerLoad] = useState(9);
  const [loading, setLoading] = useState(true);

  // LOAD POSTS FROM SUPABASE
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("posts")
        .select("id, slug, title, description, featured_image, activity_start_date")
        .eq("is_archived", false)
        .order("activity_start_date", { ascending: false });

      if (error) {
        console.error("Failed to load posts:", error);
        setPosts([]);
      } else {
        setPosts(data || []);
      }

      setLoading(false);
    };

    fetchPosts();
  }, []);

  // responsive loading
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const perLoad = isMobile ? 3 : 9;
    setImagesPerLoad(perLoad);
    setVisibleCount(perLoad);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setImagesPerLoad(isMobile ? 3 : 9);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + imagesPerLoad, posts.length));
  };

  const visiblePosts = posts.slice(0, visibleCount);

  if (loading) {
    return <div className="text-center mt-5">Loading posts...</div>;
  }

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
                    src={
                      post.featured_image
                        ? `https://res.cloudinary.com/doeovg6x9/image/upload/${post.featured_image}`
                        : "/mcbp-logo.png"
                    }
                    style={{
                      objectFit: "cover",
                      height: "250px",
                      width: "100%",
                    }}
                    loading="lazy"
                  />

                  {/* Date label */}
                  {post.activity_start_date && (
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
                      {post.activity_start_date}
                    </div>
                  )}

                  {/* overlay */}
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
                  </div>
                </div>
              </Link>

              <Card.Body
                className="py-2"
                style={{
                  backgroundColor: "#e7f1ff",
                  color: "#1a3d7c",
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
                    color: "#3a5a9a",
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

      {visibleCount < posts.length && (
        <div className="text-center mt-4">
          <Button onClick={loadMore} className="px-4">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

export default BlogThumbnails;