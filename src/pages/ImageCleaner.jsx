import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { cloudinaryUrl } from "../lib/cloudinary";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

const GRACE_KEY = "mcbp_image_cleaner_grace_days";
const DEFAULT_GRACE_DAYS = 14;

export default function ImageCleaner() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [role, setRole] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [pendingImages, setPendingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [graceDays, setGraceDays] = useState(
    () => parseInt(localStorage.getItem(GRACE_KEY) ?? String(DEFAULT_GRACE_DAYS), 10)
  );
  const [graceDaysInput, setGraceDaysInput] = useState(
    () => localStorage.getItem(GRACE_KEY) ?? String(DEFAULT_GRACE_DAYS)
  );

  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", sessionUser.id)
          .single();
        setDisplayName(profile?.full_name ?? null);
        setRole(profile?.role ?? "admin");
      }
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!user) { navigate("/admin"); return; }
    if (role && role !== "super_admin") { navigate("/admin/dashboard"); }
  }, [authChecked, user, role, navigate]);

  // ── Fetch queue ───────────────────────────────────────────────────────────
  const fetchPending = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pending_image_deletions")
      .select("*")
      .order("scheduled_delete_at", { ascending: true });
    if (error) {
      console.error("Fetch pending error:", error);
      setPendingImages([]);
    } else {
      setPendingImages(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (role === "super_admin") fetchPending();
  }, [role, fetchPending]);

  // ── Grace period ──────────────────────────────────────────────────────────
  const saveGraceDays = () => {
    const parsed = parseInt(graceDaysInput, 10);
    if (isNaN(parsed) || parsed < 0) {
      alert("Please enter a valid number of days (0 or more).");
      return;
    }
    setGraceDays(parsed);
    localStorage.setItem(GRACE_KEY, String(parsed));
    alert(`Grace period updated to ${parsed} day(s). Applies to images queued from now on.`);
  };

  // ── Call Edge Function ────────────────────────────────────────────────────
  const callEdgeFunction = async (publicIds) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/delete-cloudinary-images`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": process.env.REACT_APP_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ public_ids: publicIds }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
  };

  // ── Run Cleanup (past grace period only) ──────────────────────────────────
  const runCleanup = async () => {
    const due = pendingImages.filter(
      (img) => new Date(img.scheduled_delete_at) <= new Date()
    );
    if (due.length === 0) {
      alert("No images are due for deletion yet.");
      return;
    }
    if (!window.confirm(`Delete ${due.length} image(s) that have passed the grace period?`)) return;
    setRunning(true);
    setLastResult(null);
    try {
      const result = await callEdgeFunction(due.map((img) => img.public_id));
      setLastResult(result);
      await fetchPending();
    } catch (err) {
      alert(`Cleanup failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  // ── Delete All Now (override grace period) ────────────────────────────────
  const deleteAllNow = async () => {
    if (pendingImages.length === 0) { alert("Queue is empty."); return; }
    if (!window.confirm(
      `Force-delete ALL ${pendingImages.length} queued image(s) right now, ignoring the grace period?`
    )) return;
    setRunning(true);
    setLastResult(null);
    try {
      const result = await callEdgeFunction(pendingImages.map((img) => img.public_id));
      setLastResult(result);
      await fetchPending();
    } catch (err) {
      alert(`Force delete failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  // ── Delete one now ────────────────────────────────────────────────────────
  const deleteOneNow = async (publicId) => {
    if (!window.confirm("Delete this image from Cloudinary immediately?")) return;
    setRunning(true);
    try {
      const result = await callEdgeFunction([publicId]);
      setLastResult(result);
      await fetchPending();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  // ── Cancel (remove from queue, keep in Cloudinary) ────────────────────────
  const cancelImage = async (id) => {
    if (!window.confirm("Remove from queue? The image will remain in Cloudinary.")) return;
    const { error } = await supabase
      .from("pending_image_deletions")
      .delete()
      .eq("id", id);
    if (error) { alert("Failed to cancel."); return; }
    await fetchPending();
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isPastDue = (scheduledAt) => new Date(scheduledAt) <= new Date();

  const formatDate = (str) => {
    if (!str) return "—";
    return new Date(str).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const dueCount = pendingImages.filter((img) => isPastDue(img.scheduled_delete_at)).length;

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!authChecked || !role) {
    return (
      <div style={s.loadingScreen}>
        <style>{`@keyframes mcbp-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ ...s.spinner, animation: "mcbp-spin 0.8s linear infinite" }} />
        <p style={{ color: "#94a3b8", marginTop: 16, fontSize: 14 }}>Verifying session...</p>
      </div>
    );
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const SidebarInner = () => (
    <>
      <nav style={s.nav}>
        <Link to="/admin/dashboard" style={{ textDecoration: "none" }}>
          <button style={s.navItem} onClick={() => setMenuOpen(false)}>
            <span style={s.navIcon}>◈</span>
            Posts
          </button>
        </Link>
        <button style={{ ...s.navItem, ...s.navItemActive }}>
          <span style={s.navIcon}>🗑</span>
          Image Cleaner
          {pendingImages.length > 0 && (
            <span style={{ ...s.navBadge, background: "rgba(127,29,29,0.45)", color: "#fda4af", marginLeft: "auto" }}>
              {pendingImages.length}
            </span>
          )}
        </button>
      </nav>
      <div style={s.sidebarFooter}>
        <div style={s.avatarRow}>
          <div style={s.avatar}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={s.avatarName}>{displayName || user?.email}</div>
            <div style={s.avatarRole}>Super Admin</div>
          </div>
        </div>
        <button style={s.logoutBtn} onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/admin";
        }}>Sign out</button>
      </div>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.shell}>
      <style>{`@keyframes mcbp-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside style={s.sidebar}>
          <div style={s.sidebarLogo}>
            <div style={s.logoMark}>M</div>
            <span style={s.logoText}>MCBP<br /><span style={{ color: "#64748b", fontWeight: 400, fontSize: 12 }}>Admin</span></span>
          </div>
          <SidebarInner />
        </aside>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <header style={s.mobileTopBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={s.logoMark}>M</div>
            <span style={s.logoText}>MCBP <span style={{ color: "#64748b", fontWeight: 400, fontSize: 13 }}>Admin</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={s.avatar}>{initials}</div>
            <button style={s.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
              <span style={{ ...s.hamLine, transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none", transition: "transform 0.2s" }} />
              <span style={{ ...s.hamLine, opacity: menuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
              <span style={{ ...s.hamLine, transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none", transition: "transform 0.2s" }} />
            </button>
          </div>
        </header>
      )}

      {/* Mobile drawer */}
      {isMobile && menuOpen && (
        <>
          <div style={s.backdrop} onClick={() => setMenuOpen(false)} />
          <div style={s.drawer}>
            <div style={s.sidebarLogo}>
              <div style={s.logoMark}>M</div>
              <span style={s.logoText}>MCBP<br /><span style={{ color: "#64748b", fontWeight: 400, fontSize: 12 }}>Admin</span></span>
            </div>
            <SidebarInner />
          </div>
        </>
      )}

      {/* Main content */}
      <main style={{ ...s.main, marginLeft: isMobile ? 0 : 240, paddingTop: isMobile ? 80 : 32 }}>

        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>Image Cleaner</h1>
            <p style={s.pageSubtitle}>
              {pendingImages.length} image{pendingImages.length !== 1 ? "s" : ""} queued for deletion
              {dueCount > 0 && (
                <span style={{ color: "#fda4af", marginLeft: 8 }}>· {dueCount} past grace period</span>
              )}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Queued</div>
            <div style={s.statValue}>{pendingImages.length}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Past Due</div>
            <div style={{ ...s.statValue, color: dueCount > 0 ? "#fda4af" : "#e2e8f0" }}>{dueCount}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Grace Period</div>
            <div style={s.statValue}>{graceDays}d</div>
          </div>
        </div>

        {/* Grace period config */}
        <div style={s.configCard}>
          <h3 style={s.configTitle}>Grace Period</h3>
          <p style={s.configDesc}>
            How many days after an image is queued before it becomes eligible for cleanup.
            Changing this only affects images queued from now on.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              type="number"
              min="0"
              max="365"
              value={graceDaysInput}
              onChange={(e) => setGraceDaysInput(e.target.value)}
              style={s.graceInput}
            />
            <span style={{ color: "#94a3b8", fontSize: 13 }}>days</span>
            <button style={s.btnPrimary} onClick={saveGraceDays}>Save</button>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <button
            style={{ ...s.btnPrimary, opacity: running ? 0.6 : 1 }}
            onClick={runCleanup}
            disabled={running}
          >
            {running ? "Running..." : `Run Cleanup (${dueCount} due)`}
          </button>
          <button
            style={{ ...s.btnDestructive, opacity: running ? 0.6 : 1 }}
            onClick={deleteAllNow}
            disabled={running}
          >
            Delete All Now ({pendingImages.length})
          </button>
        </div>

        {/* Last result */}
        {lastResult && (
          <div style={s.resultCard}>
            <span style={{ color: "#86efac" }}>✓ Deleted: {lastResult.deleted.length}</span>
            {lastResult.failed.length > 0 && (
              <>
                <span style={{ color: "#fda4af", marginLeft: 16 }}>✗ Failed: {lastResult.failed.length}</span>
                <div style={{ marginTop: 6, color: "#fda4af", fontSize: 12 }}>
                  Failed IDs: {lastResult.failed.join(", ")}
                </div>
              </>
            )}
          </div>
        )}

        {/* Queue list */}
        {loading ? (
          <div style={s.centerState}>
            <div style={{ ...s.spinner, animation: "mcbp-spin 0.8s linear infinite" }} />
            <p style={{ color: "#64748b", marginTop: 12 }}>Loading queue...</p>
          </div>
        ) : pendingImages.length === 0 ? (
          <div style={s.centerState}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✓</div>
            <p style={{ color: "#475569", margin: 0 }}>Queue is empty — no orphaned images.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingImages.map((img) => {
              const due = isPastDue(img.scheduled_delete_at);
              return (
                <div
                  key={img.id}
                  style={{
                    ...s.imageRow,
                    borderLeft: `3px solid ${due ? "#f87171" : "#334155"}`,
                  }}
                >
                  {/* Thumbnail */}
                  <div style={s.thumbWrap}>
                    <img
                      src={cloudinaryUrl(img.public_id)}
                      alt=""
                      style={s.thumb}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>

                  {/* Info */}
                  <div style={s.imageInfo}>
                    <div style={s.imagePublicId}>{img.public_id}</div>
                    {img.post_title && (
                      <div style={s.imageMeta}>
                        From: <span style={{ color: "#94a3b8" }}>{img.post_title}</span>
                      </div>
                    )}
                    <div style={s.imageMeta}>
                      Source: <span style={{ color: "#94a3b8" }}>
                        {img.source === "post_deleted" ? "Post deleted" : "Removed from post"}
                      </span>
                    </div>
                    <div style={s.imageMeta}>
                      Queued: <span style={{ color: "#94a3b8" }}>{formatDate(img.queued_at)}</span>
                    </div>
                    <div style={s.imageMeta}>
                      Delete after:{" "}
                      <span style={{ color: due ? "#fda4af" : "#94a3b8" }}>
                        {formatDate(img.scheduled_delete_at)}{due && " — PAST DUE"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={s.imageActions}>
                    <button
                      style={{ ...s.btnDestructive, fontSize: 12, padding: "6px 10px" }}
                      onClick={() => deleteOneNow(img.public_id)}
                      disabled={running}
                    >
                      Delete Now
                    </button>
                    <button
                      style={{ ...s.btnGhost, fontSize: 12, padding: "6px 10px" }}
                      onClick={() => cancelImage(img.id)}
                      disabled={running}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
    top: 0, left: 0,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    zIndex: 50,
  },
  sidebarLogo: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "24px 20px 20px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
  },
  logoMark: {
    width: 34, height: 34,
    background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
    borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: 800, fontSize: 17, flexShrink: 0,
    boxShadow: "0 8px 20px rgba(14, 165, 233, 0.34)",
  },
  logoText: { color: "#e2e8f0", fontWeight: 700, fontSize: 14, lineHeight: 1.3 },
  nav: {
    padding: "16px 12px", flex: 1,
    display: "flex", flexDirection: "column", gap: 4,
  },
  navItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "11px 12px", borderRadius: 10,
    border: "none", background: "transparent",
    color: "#93a4bb", fontSize: 14, fontWeight: 600,
    cursor: "pointer", textAlign: "left", width: "100%",
  },
  navItemActive: {
    background: "linear-gradient(135deg, rgba(29,78,216,0.25), rgba(14,165,233,0.18))",
    color: "#f8fafc",
    boxShadow: "inset 0 0 0 1px rgba(96,165,250,0.35)",
  },
  navIcon: { fontSize: 13, opacity: 0.7 },
  navBadge: {
    marginLeft: "auto",
    background: "rgba(30, 64, 175, 0.35)",
    color: "#93c5fd",
    borderRadius: 20, padding: "2px 8px",
    fontSize: 11, fontWeight: 600,
  },
  sidebarFooter: {
    padding: "16px",
    borderTop: "1px solid rgba(148, 163, 184, 0.16)",
    display: "flex", flexDirection: "column", gap: 12,
  },
  avatarRow: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 12, flexShrink: 0,
  },
  avatarName: {
    color: "#e2e8f0", fontSize: 13, fontWeight: 600,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  avatarRole: { color: "#475569", fontSize: 11, marginTop: 1 },
  logoutBtn: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    color: "#cbd5e1", borderRadius: 8,
    padding: "8px 12px", fontSize: 13, cursor: "pointer", width: "100%",
  },
  mobileTopBar: {
    position: "fixed", top: 0, left: 0, right: 0, height: 56,
    background: "rgba(11, 18, 32, 0.9)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
    backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 16px", zIndex: 100,
  },
  hamburger: {
    display: "flex", flexDirection: "column", gap: 5,
    background: "transparent", border: "none", cursor: "pointer", padding: 6,
  },
  hamLine: {
    display: "block", width: 22, height: 2,
    background: "#cbd5e1", borderRadius: 2,
  },
  backdrop: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.55)", zIndex: 150,
  },
  drawer: {
    position: "fixed", top: 0, left: 0,
    width: 260, height: "100vh",
    background: "linear-gradient(180deg, #0b1220 0%, #0a1324 100%)",
    borderRight: "1px solid rgba(148, 163, 184, 0.16)",
    zIndex: 200, display: "flex", flexDirection: "column",
    boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
  },
  main: {
    flex: 1, padding: "32px 24px 72px", minHeight: "100vh",
  },
  pageHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    marginBottom: 18, gap: 12, flexWrap: "wrap",
  },
  pageTitle: { color: "#f8fafc", fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: 0.2 },
  pageSubtitle: { color: "#94a3b8", fontSize: 13.5, marginTop: 3, marginBottom: 0 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12, marginBottom: 18,
  },
  statCard: {
    background: "rgba(15, 23, 42, 0.68)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 12, padding: "12px 14px",
    boxShadow: "0 8px 20px rgba(2, 6, 23, 0.25)",
  },
  statLabel: {
    color: "#94a3b8", fontSize: 12, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: 0.7,
  },
  statValue: { color: "#e2e8f0", fontSize: 24, fontWeight: 800, lineHeight: 1.2, marginTop: 4 },
  configCard: {
    background: "rgba(15, 23, 42, 0.68)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 12, padding: "16px 18px", marginBottom: 18,
  },
  configTitle: { color: "#e2e8f0", fontSize: 16, fontWeight: 700, margin: "0 0 6px" },
  configDesc: { color: "#64748b", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 },
  graceInput: {
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid #334155",
    color: "#e2e8f0", borderRadius: 8,
    padding: "8px 12px", fontSize: 14, width: 80, outline: "none",
  },
  resultCard: {
    background: "rgba(6, 78, 59, 0.2)",
    border: "1px solid rgba(134, 239, 172, 0.3)",
    borderRadius: 10, padding: "12px 16px",
    marginBottom: 16, fontSize: 13, fontWeight: 600,
  },
  imageRow: {
    background: "linear-gradient(180deg, rgba(15,23,42,0.88), rgba(10,18,34,0.92))",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: 12, padding: "12px 16px",
    display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
  },
  thumbWrap: {
    width: 64, height: 64, borderRadius: 8,
    background: "#0f172a", overflow: "hidden", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  thumb: { width: "100%", height: "100%", objectFit: "cover" },
  imageInfo: { flex: 1, minWidth: 200 },
  imagePublicId: {
    color: "#e2e8f0", fontSize: 12, fontFamily: "monospace",
    wordBreak: "break-all", marginBottom: 4, fontWeight: 600,
  },
  imageMeta: { color: "#64748b", fontSize: 12, lineHeight: 1.5 },
  imageActions: { display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 },
  btnPrimary: {
    background: "linear-gradient(135deg, #1d4ed8, #0284c7)",
    color: "#e0f2fe",
    border: "1px solid rgba(125, 211, 252, 0.35)",
    borderRadius: 8, padding: "8px 14px",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  btnGhost: {
    background: "rgba(12, 74, 110, 0.35)",
    color: "#67e8f9",
    border: "1px solid rgba(14, 116, 144, 0.7)",
    borderRadius: 8, padding: "8px 14px",
    fontSize: 13, cursor: "pointer",
  },
  btnDestructive: {
    background: "rgba(127, 29, 29, 0.26)",
    color: "#fda4af",
    border: "1px solid rgba(220, 38, 38, 0.65)",
    borderRadius: 8, padding: "8px 14px",
    fontSize: 13, cursor: "pointer",
  },
  centerState: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "60px 20px", gap: 8,
  },
  loadingScreen: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top right, #1e293b 0%, #0b1220 55%, #070d18 100%)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  spinner: {
    width: 30, height: 30,
    border: "3px solid #1e293b",
    borderTop: "3px solid #3b82f6",
    borderRadius: "50%",
  },
};
