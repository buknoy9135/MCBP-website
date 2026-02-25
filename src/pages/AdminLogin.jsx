import { useState } from "react";
import { supabase } from "../lib/supabase";
import logo from "../assets/mcbp-login_logo.png";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      window.location.href = "/admin/dashboard";
    }
  };

  return (
    <div style={s.page}>
      <style>{`
        @keyframes mcbp-spin { to { transform: rotate(360deg); } }
        .mcbp-spinner { animation: mcbp-spin 0.7s linear infinite; }
        .mcbp-input:focus {
          outline: none;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .mcbp-submit:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .mcbp-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div style={s.card}>
        {/* Logo row: blue M mark + title + actual logo on the right */}
        <div style={s.logoRow}>
          <img src={logo} alt="MCBP Logo" style={s.logoMark} />
          <div style={{ flex: 1 }}>
            <div style={s.logoTitle}>MCBP Admin</div>
            <div style={s.logoSub}>Sign in to continue</div>
          </div>
        </div>

        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Email</label>
            <input
              className="mcbp-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={s.input}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Password</label>
            <input
              className="mcbp-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={s.input}
            />
          </div>

          {error && (
            <div style={s.errorBox}>
              ⚠ {error}
            </div>
          )}

          <button
            className="mcbp-submit"
            type="submit"
            disabled={loading}
            style={s.submitBtn}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <span className="mcbp-spinner" style={s.spinner} />
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 16px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  card: {
    background: "#131f33",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: "36px 32px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 32,
  },
    logoMark: {
    width: 64,  // ← adjust size here
    height: 64,
    objectFit: "contain",
    flexShrink: 0,
    },
  logoImg: {
    width: 80,  // ← change width here
    height: 80, // ← change height here (keep equal to width)
    objectFit: "contain",
    flexShrink: 0,
  },
  logoTitle: {
    color: "#f1f5f9",
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 1.2,
  },
  logoSub: {
    color: "#475569",
    fontSize: 13,
    marginTop: 2,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 500,
  },
  input: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 8,
    padding: "11px 14px",
    color: "#f1f5f9",
    fontSize: 15,
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  errorBox: {
    background: "#450a0a",
    border: "1px solid #7f1d1d",
    color: "#fca5a5",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
  },
  submitBtn: {
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "12px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    marginTop: 4,
    transition: "opacity 0.15s, transform 0.15s",
    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    display: "inline-block",
  },
};
