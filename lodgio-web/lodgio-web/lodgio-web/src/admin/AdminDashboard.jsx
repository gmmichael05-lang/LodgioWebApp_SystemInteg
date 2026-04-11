const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

import React, { useState, useEffect } from "react";
import { Users, Home, Trash2, BarChart2, TrendingUp, Shield } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [usersRes, listingsRes] = await Promise.all([
        fetch(`${API}/users/all`),
        fetch(`${API}/listings/all`)
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (listingsRes.ok) setListings(await listingsRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdminData(); }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm("Delete this user permanently?")) {
      await fetch(`${API}/users/${id}`, { method: "DELETE" });
      fetchAdminData();
    }
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm("Delete this listing permanently?")) {
      await fetch(`${API}/listings/${id}`, { method: "DELETE" });
      fetchAdminData();
    }
  };

  const roleColor = (role) => role === "HOST" ? { bg: "#eff6ff", color: "#1d4ed8" } : role === "ADMIN" ? { bg: "#faf5ff", color: "#7c3aed" } : { bg: "#f0fdf4", color: "#15803d" };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "12px", color: "#64748b" }}>
    <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTop: "3px solid #0ea5e9", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    Loading admin data…
  </div>;

  const guests = users.filter(u => u.role === "GUEST").length;
  const hosts = users.filter(u => u.role === "HOST").length;

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "80px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)", padding: "56px 0 40px", marginBottom: "40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", color: "#38bdf8", fontSize: "12px", fontWeight: 700, marginBottom: "16px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Shield size={14} /> Admin Panel
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff", marginBottom: "8px", letterSpacing: "-1px" }}>System Overview</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px" }}>Moderation and oversight for the entire Lodgio platform.</p>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "32px" }}>
            {[
              { icon: <Users size={20} />, label: "Total Users", value: users.length, color: "#38bdf8" },
              { icon: <TrendingUp size={20} />, label: "Guests", value: guests, color: "#34d399" },
              { icon: <BarChart2 size={20} />, label: "Hosts", value: hosts, color: "#a78bfa" },
              { icon: <Home size={20} />, label: "Listings", value: listings.length, color: "#fbbf24" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px", backdropFilter: "blur(8px)" }}>
                <div style={{ color: s.color, marginBottom: "12px" }}>{s.icon}</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "4px", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* Users Section */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 24px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "#eff6ff", padding: "10px", borderRadius: "10px" }}><Users size={20} color="#3b82f6" /></div>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Users</h2>
                <p style={{ fontSize: "12px", color: "#64748b" }}>{users.length} registered accounts</p>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", maxHeight: "500px", overflowY: "auto" }}>
            {users.map((u, idx) => {
              const rc = roleColor(u.role);
              return (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #f8fafc", background: idx % 2 === 0 ? "#fff" : "#fafafa", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa"}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "13px", flexShrink: 0 }}>
                      {u.fullname?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "#0f172a" }}>{u.fullname}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: rc.bg, color: rc.color }}>{u.role}</span>
                    <button onClick={() => handleDeleteUser(u.id)}
                      style={{ padding: "6px", color: "#ef4444", background: "#fef2f2", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Listings Section */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 24px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "#fef3c7", padding: "10px", borderRadius: "10px" }}><Home size={20} color="#d97706" /></div>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Listings</h2>
                <p style={{ fontSize: "12px", color: "#64748b" }}>{listings.length} active properties</p>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", maxHeight: "500px", overflowY: "auto" }}>
            {listings.map((l, idx) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #f8fafc", background: idx % 2 === 0 ? "#fff" : "#fafafa", gap: "12px", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fffbeb"}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa"}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                  {l.imageUrls ? (
                    <img src={l.imageUrls.split(",")[0].trim()} alt="" style={{ width: "44px", height: "36px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                  ) : <div style={{ width: "44px", height: "36px", background: "#f1f5f9", borderRadius: "8px", flexShrink: 0 }} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>by {l.host?.fullname || l.host?.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>₱{l.pricePerNight?.toLocaleString()}</span>
                  <button onClick={() => handleDeleteListing(l.id)}
                    style={{ padding: "6px", color: "#ef4444", background: "#fef2f2", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
