import { useParams, Link, useNavigate } from "react-router-dom";
import blogPosts from "../database/BlogData";
import { useState } from "react";

function BlogDetail() {
    const {slug} = useParams();
    const navigate = useNavigate();
    const currentIndex = blogPosts.findIndex(post => post.slug === slug);
    const post = blogPosts[currentIndex];
    const [enlargedImage, setEnlargedImage] = useState(null);

    if (!post) return <div>Post not found.</div>;

    const previousPost = blogPosts[currentIndex -1];
    const nextPost = blogPosts[currentIndex +1];
    return (
        <div className="container mt-4">
            {/* Home Button */}
            <button className="btn btn-secondary mb-3" onClick={() => navigate('/')}>
                Home
            </button>
            
            {/* Blog Content */}
            <h2>{post.title}</h2>
            <h5>{post.description}</h5>
            <p className="text-muted">{post.location}</p>               
            <p className="text-muted">{post.date}</p>                         
            <p>{post.story}</p>

            {/* Images */}
            {post.image && post.image.length > 0 && (
                <div className="row g-3">
                    {post.image.map((imgPath, i) => (
                        <div className="col-6 col-md-4" key={i}>
                            <img 
                                src={`${process.env.PUBLIC_URL}${imgPath}`}
                                alt={`Blog image ${i + 1}`}
                                className="img-fluid rounded shadow-sm"
                                style={{cursor: "pointer"}}
                                onClick={() => setEnlargedImage(`${process.env.PUBLIC_URL}${imgPath}`)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Navigation */}            
            <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
                {previousPost ? (
                    <Link
                    to={`/blog/${previousPost.slug}`}
                    className="text-decoration-none text-start me-auto"
                    style={{ maxWidth: "45%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                    <small className="text-muted d-block">&laquo; Previous</small>
                    <strong>{previousPost.title}</strong>
                    </Link>
                ) : <div style={{ maxWidth: "45%" }}></div>}

                {nextPost ? (
                    <Link
                    to={`/blog/${nextPost.slug}`}
                    className="text-decoration-none text-end ms-auto"
                    style={{ maxWidth: "45%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                    <small className="text-muted d-block text-end">Next &raquo;</small>
                    <strong>{nextPost.title}</strong>
                    </Link>
                ) : <div style={{ maxWidth: "45%" }}></div>}
            </div>


            {/* Modal */}
            {enlargedImage && (
                <div
                    onClick={() => setEnlargedImage(null)}
                    style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1050,
                    padding: "2rem", // ✅ this adds the space on large screens
                    boxSizing: "border-box",
                    }}
                >
                    {/* Close Button */}
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setEnlargedImage(null);
                    }}
                    style={{
                        position: "absolute",
                        top: "1.5rem",
                        right: "2rem",
                        fontSize: "2rem",
                        color: "#fff",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        zIndex: 1060,
                    }}
                    >
                    &times;
                    </button>

                    {/* Centered Image with max dimensions */}
                    <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "1rem",
                        boxSizing: "border-box",
                    }}
                    >
                    <img
                        src={enlargedImage}
                        alt="Enlarged"
                        style={{
                        maxWidth: "90vw",
                        maxHeight: "90vh",
                        borderRadius: "8px",
                        boxShadow: "0 0 30px rgba(0, 0, 0, 0.6)",
                        backgroundColor: "#fff",
                        }}
                    />
                    </div>
                </div>
            )}
        </div>
    )
}

export default BlogDetail;