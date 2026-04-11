import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Users, Eye, EyeOff, AlertCircle, Phone, ArrowRight } from "lucide-react";
import { supabase } from "../supabase";
import { registerUserBackend } from "./authApi";

const ROLES = [
  { value: "GUEST", label: "🏡 Book Places (Guest)", desc: "Browse and book amazing stays" },
  { value: "HOST", label: "🏠 List Places (Host)", desc: "Earn by renting your property" },
];

export default function Register() {
  const [role, setRole] = useState("GUEST");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname || !email || !mobileNumber || !password || !confirmPassword) return setError("Please fill all fields.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      const response = await registerUserBackend({ id: authData.user.id, email, fullname, role, mobileNumber });
      if (!response.ok) throw new Error("Backend save failed.");
      alert("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "0 14px 0 44px", height: "52px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif", transition: "border-color 0.2s, box-shadow 0.2s" };
  const iconStyle = { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Left: Visual Panel ── */}
      <div style={{ flex: 1, position: "relative", background: "#0f172a", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "60px", overflow: "hidden", minWidth: 0 }}>
        <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1600&auto=format&fit=crop"
          alt="Register Cover"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0f172a 50%, rgba(15,23,42,0.1) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, animation: "fadeIn 0.6s ease both" }}>
          <div style={{ fontSize: "28px", fontWeight: 900, background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "32px", letterSpacing: "-0.5px" }}>LODGIO</div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "20px", letterSpacing: "-1px" }}>
            Start your<br />
            <span style={{ background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>journey today.</span>
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: "360px" }}>
            Join thousands of guests and hosts on Lodgio. Find the perfect stay or earn income from your property.
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "40px", flexDirection: "column", maxWidth: "340px" }}>
            {[["📍", "3,000+ Properties", "Across the Philippines"], ["⭐", "4.9 avg. rating", "From verified guests"], ["🔒", "Secure & Trusted", "Supabase Auth + TLS"]].map(([icon, l1, l2]) => (
              <div key={l1} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "rgba(255,255,255,0.06)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                <span style={{ fontSize: "20px" }}>{icon}</span>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>{l1}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{l2}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div style={{ width: "100%", maxWidth: "540px", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 40px", background: "#fff", overflowY: "auto" }}>
        <div style={{ maxWidth: "400px", margin: "0 auto", width: "100%", animation: "slideUp 0.5s ease both" }}>

          <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px", letterSpacing: "-0.5px" }}>Create account</h2>
          <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "14px" }}>
            Already have an account? <Link to="/login" style={{ color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>

          {/* Role Selector */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            {ROLES.map(r => (
              <button key={r.value} type="button" onClick={() => setRole(r.value)}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `2px solid ${role === r.value ? "#0ea5e9" : "#e2e8f0"}`, background: role === r.value ? "#f0f9ff" : "#fff", color: role === r.value ? "#0f172a" : "#64748b", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                <div style={{ fontSize: "13px", fontWeight: 700 }}>{r.label}</div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{r.desc}</div>
              </button>
            ))}
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fef2f2", color: "#991b1b", padding: "12px 16px", borderRadius: "10px", border: "1px solid #fecaca", marginBottom: "20px", fontSize: "14px" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: <User size={17} />, label: "Full Name", type: "text", val: fullname, set: setFullname, ph: "e.g. Michael Abanil" },
              { icon: <Mail size={17} />, label: "Email Address", type: "email", val: email, set: setEmail, ph: "you@example.com" },
              { icon: <Phone size={17} />, label: "Mobile Number", type: "tel", val: mobileNumber, set: setMobileNumber, ph: "+63 9xx xxx xxxx" },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "7px" }}>{f.label}</label>
                <div style={{ position: "relative" }}>
                  <span style={iconStyle}>{f.icon}</span>
                  <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                    style={inputStyle} placeholder={f.ph}
                    onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "7px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={17} style={iconStyle} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "44px" }} placeholder="Min. 6 characters"
                  onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "7px" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={17} style={iconStyle} />
                <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  style={inputStyle} placeholder="Repeat password"
                  onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", background: loading ? "#bae6fd" : "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "white", border: "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, marginTop: "4px", boxShadow: loading ? "none" : "0 4px 14px rgba(14,165,233,0.3)", transition: "all 0.2s" }}>
              {loading ? "Creating Account…" : <><span>Create Account</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
            By creating an account you agree to our <span style={{ color: "#0ea5e9", cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: "#0ea5e9", cursor: "pointer" }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}