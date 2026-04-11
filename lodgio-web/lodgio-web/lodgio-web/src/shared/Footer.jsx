import React from "react";

export default function Footer() {
  return (
    <footer style={{
      background: "#0f172a",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "16px 24px",
      marginTop: "auto"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <span style={{
          fontSize: "13px",
          fontWeight: 900,
          background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.3px"
        }}>LODGIO</span>

        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
          © {new Date().getFullYear()} LODGIO, Inc. All rights reserved.
        </span>

        <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
          {["Privacy", "Terms", "Sitemap"].map(item => (
            <span key={item} style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#0ea5e9"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
            >{item}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}