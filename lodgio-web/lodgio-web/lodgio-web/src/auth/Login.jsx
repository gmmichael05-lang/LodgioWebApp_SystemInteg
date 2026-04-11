import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "../supabase";
import { loginGetUser } from "./authApi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!email || !password) { setError("Please fill in all fields."); setLoading(false); return; }
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      const response = await loginGetUser(email);
      if (!response.ok) throw new Error("Could not find user profile in backend.");
      const userData = await response.json();
      window.localStorage.setItem("lodgio_user", JSON.stringify({ email: userData.email, fullname: userData.fullname, role: userData.role }));
      window.dispatchEvent(new Event("lodgio-auth"));
      if (userData.role === "HOST") navigate("/host-dashboard");
      else if (userData.role === "ADMIN") navigate("/admin-dashboard");
      else navigate("/guest-dashboard");
    } catch (err) {
      setError(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Left: Visual Panel ── */}
      <div style={{ flex: 1, position: "relative", background: "#0f172a", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "60px", overflow: "hidden" }}
           className="login-panel">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop"
          alt="Login Cover"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }}
        />
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0f172a 40%, rgba(15,23,42,0.2) 100%)" }} />
        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, animation: "fadeIn 0.6s ease both" }}>
          {/* Brand */}
          <div style={{ fontSize: "28px", fontWeight: 900, background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "32px", letterSpacing: "-0.5px" }}>LODGIO</div>
          <h1 style={{ fontSize: "3.25rem", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "20px", letterSpacing: "-1px" }}>
            Find your perfect<br />
            <span style={{ background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>escape.</span>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: "380px" }}>
            Sign in to access your bookings, saved properties, and manage your listings.
          </p>
          {/* Feature pills */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "32px" }}>
            {["🏡 Handpicked Stays", "🔒 Secure Payments", "⭐ Verified Hosts"].map(f => (
              <span key={f} style={{ padding: "6px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)", fontSize: "13px", backdropFilter: "blur(8px)" }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div style={{ width: "100%", maxWidth: "520px", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 40px", background: "#fff", overflowY: "auto" }}>
        <div style={{ maxWidth: "380px", margin: "0 auto", width: "100%", animation: "slideUp 0.5s ease both" }}>

          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px", letterSpacing: "-0.5px" }}>Welcome back</h2>
          <p style={{ color: "#64748b", marginBottom: "36px", fontSize: "15px" }}>
            Don't have an account? <Link to="/register" style={{ color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}>Sign up free</Link>
          </p>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "12px", border: "1px solid #fecaca", marginBottom: "24px", fontSize: "14px" }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label className="form-label">Email address</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: "44px" }} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input className="form-input" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: "44px", paddingRight: "44px" }} placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", background: loading ? "#bae6fd" : "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "white", border: "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, letterSpacing: "0.2px", transition: "all 0.2s", boxShadow: loading ? "none" : "0 4px 14px rgba(14,165,233,0.3)" }}>
              {loading ? "Signing in…" : <><span>Continue</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: "32px", padding: "16px", background: "#f8fafc", borderRadius: "12px", fontSize: "13px", color: "#64748b", border: "1px solid #e2e8f0" }}>
            🔒 Your connection is secure. We use Supabase Auth + TLS encryption.
          </div>
        </div>
      </div>
    </div>
  );
}