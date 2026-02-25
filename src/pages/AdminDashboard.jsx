import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function AdminDashboard() {
  const isMobile = useIsMobile();

  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [role, setRole] = useState(null);

  const [activePosts, setActivePosts] = useState([]);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadProfile(user.id);
    fetchPosts();
  }, [user]);

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", userId)
      .single();
    if (error) { console.error("Profile load error:", error); return; }
    setDisplayName(data?.full_name || null);
    setRole(data?.role || "admin");
  };

  const fetchPosts = async () => {
    setLoadingPosts(true);
    const { data: active } = await supabase
      .from("posts")
      .select("id, title, slug, updated_at, created_at, is_archived, description")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    const { data: archived } = await supabase
      .from("posts")
      .select("id, title, slug, updated_at, created_at, is_archived, description")
      .eq("is_archived", true)
      .order("updated_at", { ascending: false });

    setActivePosts(active || []);
    setArchivedPosts(archived || []);
    setLoadingPosts(false);
  };

  const archivePost = async (postId) => {
    if (!window.confirm("Archive this post?")) return;
    const { error } = await supabase
      .from("posts")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq("id", postId);
    if (error) { alert("Archive failed."); return; }
    fetchPosts();
  };

  const restorePost = async (postId) => {
    if (!window.confirm("Restore this post?")) return;
    const { error } = await supabase
      .from("posts")
      .update({ is_archived: false, updated_at: new Date().toISOString() })
      .eq("id", postId);
    if (error) { alert("Restore failed."); return; }
    fetchPosts();
  };

  const deletePost = async (postId, title) => {
    if (!window.confirm(`Permanently delete "${title}"?\nThis cannot be undone.`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) { alert("Delete failed."); return; }
    fetchPosts();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  if (!user) {
    return (
      <div style={s.loadingScreen}>
        <div style={s.spinner} />
        <p style={{ color: "#94a3b8", marginTop: 16, fontSize: 14 }}>Verifying session...</p>
      </div>
    );
  }

  const initials = displayName
    ? displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  const roleLabel = role === "super_admin" ? "Super Admin" : "Admin";
  const currentPosts = activeTab === "active" ? activePosts : archivedPosts;

  const SidebarInner = () => (
    <>
      <nav style={s.nav}>
        <button
          style={{ ...s.navItem, ...(activeTab === "active" ? s.navItemActive : {}) }}
          onClick={() => { setActiveTab("active"); setMenuOpen(false); }}
        >
          <span style={s.navIcon}>◈</span>
          Active Posts
          <span style={s.navBadge}>{activePosts.length}</span>
        </button>
        <button
          style={{ ...s.navItem, ...(activeTab === "archived" ? s.navItemActive : {}) }}
          onClick={() => { setActiveTab("archived"); setMenuOpen(false); }}
        >
          <span style={s.navIcon}>◻</span>
          Archived
          <span style={{ ...s.navBadge, background: "#374151", color: "#94a3b8" }}>
            {archivedPosts.length}
          </span>
        </button>
      </nav>

      <div style={s.sidebarFooter}>
        <div style={s.avatarRow}>
          <div style={s.avatar}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={s.avatarName}>{displayName || user.email}</div>
            <div style={s.avatarRole}>{roleLabel}</div>
          </div>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>Sign out</button>
      </div>
    </>
  );

  return (
    <div style={s.shell}>
      <style>{`@keyframes mcbp-spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <aside style={s.sidebar}>
          <div style={s.sidebarLogo}>
            <div style={s.logoMark}>M</div>
            <span style={s.logoText}>
              MCBP<br />
              <span style={{ color: "#64748b", fontWeight: 400, fontSize: 12 }}>Admin</span>
            </span>
          </div>
          <SidebarInner />
        </aside>
      )}

      {/* ── MOBILE TOP BAR ── */}
      {isMobile && (
        <header style={s.mobileTopBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={s.logoMark}>M</div>
            <span style={s.logoText}>
              MCBP <span style={{ color: "#64748b", fontWeight: 400, fontSize: 13 }}>Admin</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={s.avatar}>{initials}</div>
            <button
              style={s.hamburger}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span style={{
                ...s.hamLine,
                transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
                transition: "transform 0.2s",
              }} />
              <span style={{
                ...s.hamLine,
                opacity: menuOpen ? 0 : 1,
                transition: "opacity 0.2s",
              }} />
              <span style={{
                ...s.hamLine,
                transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
                transition: "transform 0.2s",
              }} />
            </button>
          </div>
        </header>
      )}

      {/* ── MOBILE DRAWER + BACKDROP ── */}
      {isMobile && menuOpen && (
        <>
          <div style={s.backdrop} onClick={() => setMenuOpen(false)} />
          <div style={s.drawer}>
            <div style={s.sidebarLogo}>
              <div style={s.logoMark}>M</div>
              <span style={s.logoText}>
                MCBP<br />
                <span style={{ color: "#64748b", fontWeight: 400, fontSize: 12 }}>Admin</span>
              </span>
            </div>
            <SidebarInner />
          </div>
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{
        ...s.main,
        marginLeft: isMobile ? 0 : 240,
        paddingTop: isMobile ? 80 : 32,
      }}>
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>
              {activeTab === "active" ? "Active Posts" : "Archived Posts"}
            </h1>
            <p style={s.pageSubtitle}>
              {currentPosts.length} post{currentPosts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link to="/admin/new-post" style={{ textDecoration: "none" }}>
            <button style={s.createBtn}>+ New Post</button>
          </Link>
        </div>

        <div style={s.postList}>
          {loadingPosts ? (
            <div style={s.centerState}>
              <div style={{ ...s.spinner, animation: "mcbp-spin 0.8s linear infinite" }} />
              <p style={{ color: "#64748b", marginTop: 12 }}>Loading posts...</p>
            </div>
          ) : currentPosts.length === 0 ? (
            <div style={s.centerState}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>
                {activeTab === "active" ? "📝" : "🗂️"}
              </div>
              <p style={{ color: "#475569", margin: 0 }}>
                {activeTab === "active" ? "No active posts yet." : "No archived posts."}
              </p>
              {activeTab === "active" && (
                <Link to="/admin/new-post" style={{ textDecoration: "none" }}>
                  <button style={{ ...s.createBtn, marginTop: 16 }}>Create your first post</button>
                </Link>
              )}
            </div>
          ) : (
            currentPosts.map((post) => (
              <div key={post.id} style={s.card}>
                <div style={s.cardMeta}>
                  <span style={activeTab === "active" ? s.badgeActive : s.badgeArchived}>
                    {activeTab === "active" ? "● Live" : "◌ Archived"}
                  </span>
                  <span style={s.cardDate}>Published {formatDate(post.created_at)}</span>
                  {post.updated_at && post.updated_at !== post.created_at && (
                    <span style={s.cardEdited}>· Edited {formatDateTime(post.updated_at)}</span>
                  )}
                </div>

                <h3 style={s.cardTitle}>{post.title}</h3>
                {post.description && <p style={s.cardDesc}>{post.description}</p>}

                <div style={{ ...s.cardActions, flexWrap: "wrap" }}>
                  {activeTab === "active" ? (
                    <>
                      <Link to={`/admin/edit-post/${post.id}`} style={{ textDecoration: "none" }}>
                        <button style={s.btnPrimary}>Edit</button>
                      </Link>
                      <Link to={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                        <button style={s.btnGhost}>View ↗</button>
                      </Link>
                      <button style={s.btnWarn} onClick={() => archivePost(post.id)}>
                        Archive
                      </button>
                    </>
                  ) : (
                    <>
                      <button style={s.btnPrimary} onClick={() => restorePost(post.id)}>Restore</button>
                      <Link to={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                        <button style={s.btnGhost}>Preview ↗</button>
                      </Link>
                      {role === "super_admin" && (
                        <button style={s.btnDestructive} onClick={() => deletePost(post.id, post.title)}>
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const s = {
  shell: {
    display: "flex",
    minHeight: "100vh",
    background: "#0f172a",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
  },
  sidebar: {
    width: 240,
    background: "#0f172a",
    borderRight: "1px solid #1e293b",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    zIndex: 50,
  },
  sidebarLogo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "24px 20px 20px",
    borderBottom: "1px solid #1e293b",
  },
  logoMark: {
    width: 34,
    height: 34,
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 800,
    fontSize: 17,
    flexShrink: 0,
    boxShadow: "0 4px 10px rgba(99,102,241,0.35)",
  },
  logoText: {
    color: "#f1f5f9",
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1.3,
  },
  nav: {
    padding: "16px 12px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  navItemActive: {
    background: "#1e293b",
    color: "#f1f5f9",
  },
  navIcon: { fontSize: 13, opacity: 0.7 },
  navBadge: {
    marginLeft: "auto",
    background: "#1e3a5f",
    color: "#60a5fa",
    borderRadius: 20,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 600,
  },
  sidebarFooter: {
    padding: "16px",
    borderTop: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 12,
    flexShrink: 0,
  },
  avatarName: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  avatarRole: { color: "#475569", fontSize: 11, marginTop: 1 },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #1e293b",
    color: "#64748b",
    borderRadius: 6,
    padding: "7px 12px",
    fontSize: 13,
    cursor: "pointer",
    width: "100%",
  },
  mobileTopBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    background: "#0f172a",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    zIndex: 100,
  },
  hamburger: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 6,
  },
  hamLine: {
    display: "block",
    width: 22,
    height: 2,
    background: "#94a3b8",
    borderRadius: 2,
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 150,
  },
  drawer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: 260,
    height: "100vh",
    background: "#0f172a",
    borderRight: "1px solid #1e293b",
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
  },
  main: {
    flex: 1,
    padding: "32px 24px 60px",
    minHeight: "100vh",
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  pageTitle: {
    color: "#f1f5f9",
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
  },
  pageSubtitle: {
    color: "#475569",
    fontSize: 13,
    marginTop: 3,
    marginBottom: 0,
  },
  createBtn: {
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  postList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    background: "#131f33",
    border: "1px solid #1e293b",
    borderRadius: 12,
    padding: "16px 18px",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  badgeActive: {
    background: "#052e16",
    color: "#4ade80",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 600,
  },
  badgeArchived: {
    background: "#1c1917",
    color: "#78716c",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 600,
  },
  cardDate: { color: "#475569", fontSize: 12 },
  cardEdited: { color: "#334155", fontSize: 12 },
  cardTitle: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: 600,
    margin: "4px 0 6px",
    lineHeight: 1.4,
  },
  cardDesc: {
    color: "#475569",
    fontSize: 13,
    margin: "0 0 14px",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardActions: {
    display: "flex",
    gap: 8,
  },
  btnPrimary: {
    background: "#1e3a5f",
    color: "#60a5fa",
    border: "1px solid #1d4ed8",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  btnGhost: {
    background: "#0d3d4a",
    color: "#22d3ee",
    border: "1px solid #0e7490",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  btnWarn: {
    background: "transparent",
    color: "#f59e0b",
    border: "1px solid #78350f",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  btnDestructive: {
    background: "#450a0a",
    color: "#f87171",
    border: "1px solid #7f1d1d",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  centerState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 20px",
    gap: 8,
  },
  loadingScreen: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  spinner: {
    width: 30,
    height: 30,
    border: "3px solid #1e293b",
    borderTop: "3px solid #3b82f6",
    borderRadius: "50%",
  },
};
