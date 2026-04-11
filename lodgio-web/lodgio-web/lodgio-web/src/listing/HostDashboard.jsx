const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, X, MapPin, Calendar, UserRound, Mail, Phone, Image, BarChart2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function HostDashboard() {
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);

  const fetchHostData = async () => {
    setLoading(true);
    try {
      const userStr = window.localStorage.getItem("lodgio_user");
      if (!userStr) { navigate("/login"); return; }
      const u = JSON.parse(userStr);
      setUser(u);

      const profileRes = await fetch(`${API}/users/${u.email}`);
      if (profileRes.ok) setBackendUser(await profileRes.json());

      const listingsRes = await fetch(`${API}/listings/host/${u.email}`);
      if (listingsRes.ok) setMyListings(await listingsRes.json());

      const bookingsRes = await fetch(`${API}/bookings/host/${u.email}`);
      if (bookingsRes.ok) {
        const all = await bookingsRes.json();
        setBookingRequests(all.filter(b => b.status === "PENDING" || b.status === "ACCEPTED"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHostData(); }, []);

  const handleDeleteListing = async (id) => {
    if (window.confirm("Delete this listing?")) {
      await fetch(`${API}/listings/${id}`, { method: "DELETE" });
      fetchHostData();
    }
  };

  const updateBookingStatus = async (id, status) => {
    await fetch(`${API}/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    fetchHostData();
  };

  const getStatusColor = (status) => {
    if (status === "ACCEPTED") return { bg: "#dcfce7", color: "#166534" };
    if (status === "REJECTED") return { bg: "#fee2e2", color: "#991b1b" };
    return { bg: "#fef08a", color: "#854d0e" };
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "12px", color: "#64748b" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTop: "3px solid #0ea5e9", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      Loading dashboard…
    </div>
  );

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "80px" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)", padding: "56px 0 40px", marginBottom: "40px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 12px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", color: "#38bdf8", fontSize: "12px", fontWeight: 700, marginBottom: "12px", border: "1px solid rgba(255,255,255,0.15)" }}>🏠 Host Panel</div>
              <h1 style={{ fontSize: "2.25rem", fontWeight: 900, color: "#fff", marginBottom: "6px", letterSpacing: "-0.5px" }}>Host Dashboard</h1>
              <p style={{ color: "rgba(255,255,255,0.55)" }}>Welcome back, <strong style={{ color: "rgba(255,255,255,0.85)" }}>{user?.fullname || "Host"}</strong>. Manage your portfolio.</p>
            </div>
            <Link to="/create-listing" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", padding: "12px 24px", borderRadius: "999px", fontWeight: 700, background: "#0ea5e9", color: "#fff", fontSize: "14px", boxShadow: "0 4px 12px rgba(14,165,233,0.35)", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <Plus size={16} /> Create New
            </Link>
          </div>
          {/* Stat chips */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "My Listings", value: myListings.length, icon: <MapPin size={15} /> },
              { label: "Active Requests", value: bookingRequests.filter(b => b.status === "PENDING").length, icon: <Calendar size={15} /> },
              { label: "Accepted", value: bookingRequests.filter(b => b.status === "ACCEPTED").length, icon: <Check size={15} /> },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", backdropFilter: "blur(8px)" }}>
                <span style={{ color: "#38bdf8" }}>{s.icon}</span>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{s.value}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px" }}>


        {/* ──────── Booking Requests ──────── */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ background: "#eff6ff", padding: "10px", borderRadius: "10px" }}><Calendar size={20} color="#3b82f6" /></div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Booking Requests</h2>
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
            You have {bookingRequests.filter(b => b.status === "PENDING").length} active reservation request{bookingRequests.filter(b => b.status === "PENDING").length !== 1 ? "s" : ""}.
          </p>

          {bookingRequests.length === 0 ? (
            <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No pending booking requests.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {bookingRequests.map(br => {
                const s = getStatusColor(br.status);
                return (
                  <div key={br.id} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", borderLeft: "4px solid #22c55e" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: "#f1f5f9", color: "#64748b" }}>PAID</span>
                          <span style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: "#eff6ff", color: "#3b82f6" }}>#{br.id?.toString().slice(0, 6)}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{br.listing?.title} <span style={{ fontSize: "12px", color: "#64748b" }}>• {br.listing?.city}</span></div>
                        <div style={{ fontSize: "14px", color: "#475569", display: "flex", alignItems: "center", gap: "4px" }}>
                          <UserRound size={14} color="#94a3b8" /> {br.guest?.fullname} ({br.listing?.guestCapacity} guests max)
                          <span style={{ margin: "0 4px" }}>•</span>
                          <Calendar size={14} color="#94a3b8" /> {br.checkInDate} → {br.checkOutDate}
                        </div>
                        {br.messageToHost && (
                          <div style={{ marginTop: "8px", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px", fontSize: "13px", color: "#475569", fontStyle: "italic" }}>
                            "{br.messageToHost}"
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, marginBottom: "4px" }}>Total Payout</div>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>₱{br.totalPrice?.toLocaleString()}</div>
                        {br.status === "ACCEPTED" ? (
                          <div style={{ marginTop: "8px", fontSize: "12px", fontWeight: 700, color: "#166534" }}>✓ Successfully Booked</div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "flex-end" }}>
                            <button onClick={() => updateBookingStatus(br.id, "ACCEPTED")} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>
                              <Check size={14} /> Accept
                            </button>
                            <button onClick={() => updateBookingStatus(br.id, "REJECTED")} style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", padding: "8px 16px", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>
                              <X size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ──────── Listing History ──────── */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ background: "#eff6ff", padding: "10px", borderRadius: "10px" }}><MapPin size={20} color="#3b82f6" /></div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Listing History</h2>
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>Overview of your listed properties.</p>

          {myListings.length === 0 ? (
            <p style={{ color: "#94a3b8", fontStyle: "italic" }}>You haven't listed any properties yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
              {myListings.map(lst => (
                <div key={lst.id} style={{ borderRadius: "12px", overflow: "hidden", position: "relative", cursor: "pointer" }}>
                  {lst.imageUrls ? (
                    <img src={lst.imageUrls.split(",")[0].trim()} alt={lst.title} style={{ width: "100%", height: "130px", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ width: "100%", height: "130px", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}><Image size={32} color="#94a3b8" /></div>
                  )}
                  {/* Price tag overlay */}
                  <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.7)", color: "#fff", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                    ₱{lst.pricePerNight?.toLocaleString()}/night
                  </div>
                  {/* Delete button */}
                  <button onClick={() => handleDeleteListing(lst.id)} style={{ position: "absolute", top: "8px", right: "8px", background: "#fff", border: "none", width: "28px", height: "28px", borderRadius: "50%", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                    <Trash2 size={14} />
                  </button>
                  <div style={{ padding: "10px 0 0" }}>
                    <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>{lst.type || "Property"}</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lst.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}