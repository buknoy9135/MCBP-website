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
  const [authorNameMap, setAuthorNameMap] = useState({});
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingDeletionCount, setPendingDeletionCount] = useState(0);

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

  useEffect(() => {
    if (role === "super_admin") fetchPendingCount();
  }, [role]);

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
    const { data: active, error: activeError } = await supabase
      .from("posts")
      .select("id, title, slug, updated_at, created_at, created_by, is_archived, description")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    const { data: archived, error: archivedError } = await supabase
      .from("posts")
      .select("id, title, slug, updated_at, created_at, created_by, is_archived, description")
      .eq("is_archived", true)
      .order("updated_at", { ascending: false });

    if (activeError || archivedError) {
      console.error("Post fetch error:", activeError || archivedError);
      setActivePosts([]);
      setArchivedPosts([]);
      setLoadingPosts(false);
      return;
    }

    setActivePosts(active || []);
    setArchivedPosts(archived || []);

    const allPosts = [...(active || []), ...(archived || [])];
    const authorIds = Array.from(
      new Set(allPosts.map((p) => p.created_by).filter(Boolean))
    );

    if (authorIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", authorIds);

      if (profilesError) {
        console.error("Profile name map error:", profilesError);
      }

      const mapped = {};
      (profiles || []).forEach((profile) => {
        mapped[profile.id] = profile.full_name || null;
      });
      setAuthorNameMap(mapped);
    } else {
      setAuthorNameMap({});
    }

    setLoadingPosts(false);
  };

  const fetchPendingCount = async () => {
    const { count } = await supabase
      .from("pending_image_deletions")
      .select("id", { count: "exact", head: true });
    setPendingDeletionCount(count ?? 0);
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

    const { data: postData, error: fetchError } = await supabase
      .from("posts")
      .select("images, featured_image")
      .eq("id", postId)
      .single();

    if (fetchError) { alert("Could not fetch post images before deletion."); return; }

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) { alert("Delete failed."); return; }

    const graceDays = parseInt(localStorage.getItem("mcbp_image_cleaner_grace_days") ?? "14", 10);
    const scheduledAt = new Date(Date.now() + graceDays * 24 * 60 * 60 * 1000).toISOString();
    const allImages = Array.isArray(postData.images) ? [...postData.images] : [];
    if (postData.featured_image && !allImages.includes(postData.featured_image)) {
      allImages.push(postData.featured_image);
    }
    if (allImages.length > 0) {
      const rows = allImages.map((publicId) => ({
        public_id: publicId,
        scheduled_delete_at: scheduledAt,
        source: "post_deleted",
        post_id: null,
        post_title: title,
      }));
      const { error: queueError } = await supabase
        .from("pending_image_deletions")
        .insert(rows);
      if (queueError) console.warn("Image queue insert failed (non-fatal):", queueError);
    }

    fetchPosts();
    fetchPendingCount();
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
  const totalPosts = activePosts.length + archivedPosts.length;

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
        {role === "super_admin" && (
          <Link to="/admin/image-cleaner" style={{ textDecoration: "none" }}>
            <button style={s.navItem} onClick={() => setMenuOpen(false)}>
              <span style={s.navIcon}>🗑</span>
              Image Cleaner
              {pendingDeletionCount > 0 && (
                <span style={{ ...s.navBadge, background: "rgba(127,29,29,0.45)", color: "#fda4af", marginLeft: "auto" }}>
                  {pendingDeletionCount}
                </span>
              )}
            </button>
          </Link>
        )}
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

        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Active</div>
            <div style={s.statValue}>{activePosts.length}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Archived</div>
            <div style={s.statValue}>{archivedPosts.length}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Total Posts</div>
            <div style={s.statValue}>{totalPosts}</div>
          </div>
        </div>

        <div
          style={{
            ...s.postList,
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
          }}
        >
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
                </div>

                <h3 style={s.cardTitle}>{post.title}</h3>
                {post.description && <p style={s.cardDesc}>{post.description}</p>}

                <div style={{ ...s.cardActions, flexWrap: "wrap" }}>
                  {activeTab === "active" ? (
                    <>
                      <Link to={`/admin/edit-post/${post.id}`} style={{ textDecoration: "none" }}>
                        <button style={s.btnPrimary}>Edit</button>
                      </Link>
                      <Link to={`/admin/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                        <button style={s.btnGhost}>View ↗</button>
                      </Link>
                      <button style={s.btnWarn} onClick={() => archivePost(post.id)}>
                        Archive
                      </button>
                    </>
                  ) : (
                    <>
                      <button style={s.btnPrimary} onClick={() => restorePost(post.id)}>Restore</button>
                      <Link to={`/admin/blog/${post.slug}`} style={{ textDecoration: "none" }}>
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

                <div style={s.cardUpdateInfo}>
                  Last updated on {formatDateTime(post.updated_at || post.created_at)} by{" "}
                  {authorNameMap[post.created_by] || "Unknown"}
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
    background: "radial-gradient(circle at top right, #1e293b 0%, #0b1220 55%, #070d18 100%)",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
  },
  sidebar: {
    width: 240,
    background: "linear-gradient(180deg, #0b1220 0%, #0a1324 100%)",
    borderRight: "1px solid rgba(148, 163, 184, 0.16)",
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
    borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
  },
  logoMark: {
    width: 34,
    height: 34,
    background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 800,
    fontSize: 17,
    flexShrink: 0,
    boxShadow: "0 8px 20px rgba(14, 165, 233, 0.34)",
  },
  logoText: {
    color: "#e2e8f0",
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
    padding: "11px 12px",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    color: "#93a4bb",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  navItemActive: {
    background: "linear-gradient(135deg, rgba(29, 78, 216, 0.25), rgba(14, 165, 233, 0.18))",
    color: "#f8fafc",
    boxShadow: "inset 0 0 0 1px rgba(96, 165, 250, 0.35)",
  },
  navIcon: { fontSize: 13, opacity: 0.7 },
  navBadge: {
    marginLeft: "auto",
    background: "rgba(30, 64, 175, 0.35)",
    color: "#93c5fd",
    borderRadius: 20,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 600,
  },
  sidebarFooter: {
    padding: "16px",
    borderTop: "1px solid rgba(148, 163, 184, 0.16)",
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
    background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
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
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    color: "#cbd5e1",
    borderRadius: 8,
    padding: "8px 12px",
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
    background: "rgba(11, 18, 32, 0.9)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
    backdropFilter: "blur(8px)",
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
    background: "#cbd5e1",
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
    background: "linear-gradient(180deg, #0b1220 0%, #0a1324 100%)",
    borderRight: "1px solid rgba(148, 163, 184, 0.16)",
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
  },
  main: {
    flex: 1,
    padding: "32px 24px 72px",
    minHeight: "100vh",
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 12,
    flexWrap: "wrap",
  },
  pageTitle: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    color: "#94a3b8",
    fontSize: 13.5,
    marginTop: 3,
    marginBottom: 0,
  },
  createBtn: {
    background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 8px 18px rgba(14, 165, 233, 0.34)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    background: "rgba(15, 23, 42, 0.68)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 12,
    padding: "12px 14px",
    boxShadow: "0 8px 20px rgba(2, 6, 23, 0.25)",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  statValue: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.2,
    marginTop: 4,
  },
  postList: {
    display: "grid",
    gap: 14,
    alignItems: "start",
  },
  card: {
    background: "linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(10, 18, 34, 0.92))",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: 14,
    padding: "16px 18px",
    boxShadow: "0 10px 24px rgba(2, 6, 23, 0.26)",
    display: "flex",
    flexDirection: "column",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  badgeActive: {
    background: "rgba(6, 78, 59, 0.48)",
    color: "#86efac",
    borderRadius: 20,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
  },
  badgeArchived: {
    background: "rgba(68, 64, 60, 0.45)",
    color: "#cbd5e1",
    borderRadius: 20,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
  },
  cardDate: { color: "#94a3b8", fontSize: 12.5 },
  cardEdited: { color: "#64748b", fontSize: 12.5 },
  cardTitle: {
    color: "#f1f5f9",
    fontSize: 17,
    fontWeight: 700,
    margin: "4px 0 6px",
    lineHeight: 1.4,
  },
  cardDesc: {
    color: "#9aa9bd",
    fontSize: 13.5,
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
  cardUpdateInfo: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 12.5,
    lineHeight: 1.4,
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #1d4ed8, #0284c7)",
    color: "#e0f2fe",
    border: "1px solid rgba(125, 211, 252, 0.35)",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnGhost: {
    background: "rgba(12, 74, 110, 0.35)",
    color: "#67e8f9",
    border: "1px solid rgba(14, 116, 144, 0.7)",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  btnWarn: {
    background: "rgba(120, 53, 15, 0.2)",
    color: "#fbbf24",
    border: "1px solid rgba(217, 119, 6, 0.6)",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  btnDestructive: {
    background: "rgba(127, 29, 29, 0.26)",
    color: "#fda4af",
    border: "1px solid rgba(220, 38, 38, 0.65)",
    borderRadius: 8,
    padding: "8px 14px",
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
    background: "radial-gradient(circle at top right, #1e293b 0%, #0b1220 55%, #070d18 100%)",
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

