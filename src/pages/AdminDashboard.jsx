import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [role, setRole] = useState(null);

  const [activePosts, setActivePosts] = useState([]);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // ---------------------------
  // AUTH SESSION (ONLY SET USER)
  // ---------------------------
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // initial page load
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ---------------------------
  // LOAD PROFILE + POSTS AFTER USER EXISTS
  // ---------------------------
  useEffect(() => {
    if (!user) return;

    loadProfile(user.id);
    fetchPosts();
  }, [user]);

  // LOAD PROFILE (name + role)
  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Profile load error:", error);
      return;
    }

    setDisplayName(data?.full_name || null);
    setRole(data?.role || "admin");
  };

  // FETCH POSTS
  const fetchPosts = async () => {
    setLoadingPosts(true);

    const { data: active, error: activeError } = await supabase
      .from("posts")
      .select("id, title, slug, updated_at, is_archived")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (activeError) console.error(activeError);

    const { data: archived, error: archivedError } = await supabase
      .from("posts")
      .select("id, title, slug, updated_at, is_archived")
      .eq("is_archived", true)
      .order("updated_at", { ascending: false });

    if (archivedError) console.error(archivedError);

    setActivePosts(active || []);
    setArchivedPosts(archived || []);
    setLoadingPosts(false);
  };

  // ARCHIVE
  const archivePost = async (postId) => {
    const confirmArchive = window.confirm("Archive this post?");
    if (!confirmArchive) return;

    const { error } = await supabase
      .from("posts")
      .update({
        is_archived: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (error) {
      console.error("Archive failed:", error);
      alert("Archive failed. Check console.");
      return;
    }

    fetchPosts();
  };

  // RESTORE
  const restorePost = async (postId) => {
    const confirmRestore = window.confirm("Restore this post?");
    if (!confirmRestore) return;

    const { error } = await supabase
      .from("posts")
      .update({
        is_archived: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (error) {
      console.error("Restore failed:", error);
      alert("Restore failed.");
      return;
    }

    fetchPosts();
  };

  // DELETE (SUPER ADMIN ONLY)
  const deletePost = async (postId, title) => {
    const confirmDelete = window.confirm(
      `Permanently delete "${title}"?\nThis cannot be undone.`
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.error("Delete failed:", error);
      alert("Delete failed.");
      return;
    }

    fetchPosts();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/#/admin";
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        Checking login...
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>MCBP Admin Dashboard</h2>
      <p>Welcome, {displayName || user.email}</p>

      <button onClick={handleLogout}>Logout</button>

      <hr style={{ margin: "30px 0" }} />

      <Link to="/admin/new-post">
        <button style={{ marginBottom: 20 }}>Create New Post</button>
      </Link>

      {/* ACTIVE POSTS */}
      <h3>Active Posts</h3>

      {loadingPosts ? (
        <p>Loading posts...</p>
      ) : activePosts.length === 0 ? (
        <p>No active posts.</p>
      ) : (
        activePosts.map((post) => (
          <div key={post.id} style={{ border: "1px solid #ccc", padding: 15, marginBottom: 12 }}>
            <h4>{post.title}</h4>

            <div style={{ display: "flex", gap: 10 }}>
              <Link to={`/admin/edit-post/${post.id}`}>
                <button>Edit</button>
              </Link>

              <Link to={`/blog/${post.slug}`}>
                <button>View</button>
              </Link>

              <button onClick={() => archivePost(post.id)}>
                Archive
              </button>
            </div>
          </div>
        ))
      )}

      {/* ARCHIVED POSTS */}
      <hr style={{ margin: "40px 0" }} />
      <h3>Archived Posts</h3>

      {archivedPosts.length === 0 ? (
        <p>No archived posts.</p>
      ) : (
        archivedPosts.map((post) => (
          <div key={post.id} style={{ border: "1px dashed #999", padding: 15, marginBottom: 12 }}>
            <h4>{post.title}</h4>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => restorePost(post.id)}>
                Restore
              </button>

              <Link to={`/blog/${post.slug}`}>
                <button>View</button>
              </Link>

              {role === "super_admin" && (
                <button
                  style={{ background: "#c62828", color: "white" }}
                  onClick={() => deletePost(post.id, post.title)}
                >
                  Delete Permanently
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}