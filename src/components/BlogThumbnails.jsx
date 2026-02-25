import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { cloudinaryUrl } from "../lib/cloudinary";
import "../css/BlogThumbnails.css";

function BlogThumbnails() {
  const [posts, setPosts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [imagesPerLoad, setImagesPerLoad] = useState(9);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const perLoad = isMobile ? 3 : 9;
    setImagesPerLoad(perLoad);
    setVisibleCount(perLoad);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setImagesPerLoad(window.innerWidth < 768 ? 3 : 9);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + imagesPerLoad, posts.length));
  };

  const visiblePosts = posts.slice(0, visibleCount);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  return (
    <section className="blog-section">
      <div className="container">

        {/* Section header */}
        <div className="blog-section-header">
          <h2 className="blog-section-title">Latest Activities</h2>
          <div className="blog-section-divider" />
          <p className="blog-section-subtitle">
            Stay updated with our community events, outreach programs, and initiatives.
          </p>
        </div>

        {loading ? (
          <div className="blog-loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="blog-loading">No posts yet.</div>
        ) : (
          <>
            <div className="blog-grid">
              {visiblePosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="blog-card-link"
                >
                  <article className="blog-card">
                    <div className="blog-card-image-wrap">
                      <img
                        src={post.featured_image
                          ? cloudinaryUrl(post.featured_image)
                          : "/mcbp-logo.png"}
                        alt={post.title}
                        loading="lazy"
                        className="blog-card-image"
                      />
                      {post.activity_start_date && (
                        <span className="blog-card-date">
                          {formatDate(post.activity_start_date)}
                        </span>
                      )}
                    </div>
                    <div className="blog-card-body">
                      <h3 className="blog-card-title">{post.title}</h3>
                      <p className="blog-card-desc">{post.description}</p>
                      <span className="blog-card-readmore">Read more →</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {visibleCount < posts.length && (
              <div className="blog-load-more-wrap">
                <button className="blog-load-more-btn" onClick={loadMore}>
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default BlogThumbnails;
