const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Calendar, Search, Wifi, Car, Dog, Star, ArrowRight, SlidersHorizontal, X, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function GuestDashboard() {
  const [myTrips, setMyTrips] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [activeTab, setActiveTab] = useState("explore"); // "explore" | "saved"
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [savedListings, setSavedListings] = useState([]);

  const getUser = () => { try { return JSON.parse(window.localStorage.getItem("lodgio_user")); } catch { return null; } };

  const fetchFavorites = async () => {
    const u = getUser(); if (!u?.email) return;
    try {
      const res = await fetch(`${API}/favorites/${u.email}`);
      if (res.ok) {
        const data = await res.json();
        setSavedListings(data);
        setFavoriteIds(new Set(data.map(l => l.id)));
      }
    } catch (e) { console.error(e); }
  };

  const toggleFavorite = async (e, listingId) => {
    e.preventDefault(); e.stopPropagation();
    const u = getUser(); if (!u?.email) return;
    const isFav = favoriteIds.has(listingId);
    try {
      if (isFav) {
        await fetch(`${API}/favorites/${u.email}/${listingId}`, { method: "DELETE" });
        setFavoriteIds(prev => { const s = new Set(prev); s.delete(listingId); return s; });
        setSavedListings(prev => prev.filter(l => l.id !== listingId));
      } else {
        await fetch(`${API}/favorites/${u.email}/${listingId}`, { method: "POST" });
        setFavoriteIds(prev => new Set(prev).add(listingId));
        // Add listing to saved from feed if available
        const lst = feed.find(l => l.id === listingId);
        if (lst) setSavedListings(prev => [lst, ...prev]);
      }
    } catch (e) { console.error(e); }
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [maxPrice, setMaxPrice] = useState(25000);
  const [amenities, setAmenities] = useState([]);
  const debounceRef = useRef(null);

  const toggleAmenity = (name) =>
    setAmenities(prev => prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]);

  const handleClear = () => {
    setSearchQuery(""); setCheckIn(""); setCheckOut(""); setAdults(1);
    setCity(""); setType(""); setMaxPrice(25000); setAmenities([]);
  };

  // ── Fetch listings from backend with active filters ──
  const fetchFeed = async (overrides = {}) => {
    setLoading(true);
    try {
      const q = overrides.searchQuery ?? searchQuery;
      const c = overrides.city ?? city;
      const t = overrides.type ?? type;
      const mp = overrides.maxPrice ?? maxPrice;
      const g = overrides.adults ?? adults;
      const am = overrides.amenities ?? amenities;

      let url;
      if (q.trim()) {
        // Title / city keyword search
        url = `${API}/listings?search=${encodeURIComponent(q.trim())}`;
      } else {
        // Advanced search
        const p = new URLSearchParams();
        if (c && c !== "Anywhere") p.append("city", c);
        if (t && t !== "Any type") p.append("type", t);
        p.append("maxPrice", mp);
        if (g > 1) p.append("guests", g);
        if (am.length > 0) p.append("amenities", am.join(","));
        url = `${API}/listings/search?${p.toString()}`;
      }
      const res = await fetch(url);
      if (res.ok) setFeed(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Fetch my trips separately
  const fetchTrips = async () => {
    try {
      const userStr = window.localStorage.getItem("lodgio_user");
      if (!userStr) return;
      const u = JSON.parse(userStr);
      const r = await fetch(`${API}/bookings/guest/${u.email}`);
      if (r.ok) setMyTrips(await r.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchTrips();
    fetchFeed();
    fetchFavorites();
  }, []);

  // Debounced search on searchQuery change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchFeed(), 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const handleSearch = () => fetchFeed();

  const getStatusStyle = (s) =>
    s === "ACCEPTED" ? { bg: "#dcfce7", color: "#15803d", label: "✓ Accepted" }
    : s === "REJECTED" ? { bg: "#fee2e2", color: "#b91c1c", label: "✕ Rejected" }
    : { bg: "#fef3c7", color: "#b45309", label: "⏳ Pending" };

  const PROPERTY_TYPES = ["House", "Condo", "Apartment", "Villa", "Resort", "Hotel"];

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "80px" }}>

      {/* ─── Hero + Search ─── */}
      <div style={{
        background: "linear-gradient(160deg, #0c2340 0%, #0c4a6e 50%, #0369a1 100%)",
        padding: "64px 24px 0",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "340px", height: "340px", borderRadius: "50%", background: "rgba(56,189,248,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "40px", left: "-80px", width: "260px", height: "260px", borderRadius: "50%", background: "rgba(14,165,233,0.06)", pointerEvents: "none" }} />

        <div style={{ textAlign: "center", position: "relative", zIndex: 1, animation: "fadeIn 0.5s ease both" }}>
          <div style={{ display: "inline-block", padding: "5px 16px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", color: "#7dd3fc", fontSize: "12px", fontWeight: 700, marginBottom: "20px", border: "1px solid rgba(255,255,255,0.15)", letterSpacing: "0.5px" }}>
            🏡 DISCOVER YOUR NEXT STAY
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, color: "#fff", marginBottom: "12px", letterSpacing: "-1.5px", lineHeight: 1.1 }}>
            Find your perfect<br />
            <span style={{ background: "linear-gradient(135deg, #38bdf8, #7dd3fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>escape.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.05rem", marginBottom: "40px" }}>
            Discover handpicked homes, condos, and villas.
          </p>
        </div>

        {/* ─── Big Search Bar ─── */}
        <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative", zIndex: 1, animation: "slideUp 0.4s ease 0.1s both", paddingBottom: "40px" }}>
          <div style={{ display: "flex", gap: "0", background: "#fff", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.25)", overflow: "hidden" }}>
            <div style={{ flex: 1, padding: "16px 20px", borderRight: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>Search</div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search by name or city…"
                style={{ border: "none", outline: "none", width: "100%", fontSize: "15px", fontWeight: 500, color: "#0f172a", fontFamily: "Inter, sans-serif" }}
              />
            </div>
            <button onClick={handleSearch}
              style={{ padding: "0 24px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700, transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(135deg, #0284c7, #0369a1)"}
              onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg, #0ea5e9, #0284c7)"}>
              <Search size={18} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* ─── Filter Panel ─── */}
      <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(226,232,240,0.8)", position: "sticky", top: "64px", zIndex: 50, boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 0", flexWrap: "wrap" }}>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "1.5px solid", borderColor: showFilters ? "#0ea5e9" : "#e2e8f0", borderRadius: "999px", background: showFilters ? "#f0f9ff" : "#fff", color: showFilters ? "#0ea5e9" : "#64748b", fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}>
              <SlidersHorizontal size={15} /> Filters {showFilters ? "▴" : "▾"}
            </button>

            {/* Quick filters */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1 }}>
              {/* City quick filter */}
              <input type="text" value={city} onChange={e => { setCity(e.target.value); }} onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="City"
                style={{ padding: "7px 14px", border: "1.5px solid #e2e8f0", borderRadius: "999px", fontSize: "13px", outline: "none", fontFamily: "Inter", width: "120px", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#0ea5e9"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"} />

              {/* Property type */}
              <select value={type} onChange={e => { setType(e.target.value); setTimeout(handleSearch, 0); }}
                style={{ padding: "7px 14px", border: "1.5px solid #e2e8f0", borderRadius: "999px", fontSize: "13px", outline: "none", fontFamily: "Inter", background: "#fff", cursor: "pointer" }}>
                <option value="">All Types</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {/* Amenity pills */}
              {[{ name: "Wifi", icon: <Wifi size={13} /> }, { name: "Parking", icon: <Car size={13} /> }, { name: "Pet-friendly", icon: <Dog size={13} /> }].map(({ name, icon }) => {
                const active = amenities.includes(name);
                return (
                  <button key={name} type="button" onClick={() => { toggleAmenity(name); setTimeout(handleSearch, 0); }}
                    style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "999px", border: `1.5px solid ${active ? "#0ea5e9" : "#e2e8f0"}`, background: active ? "#0ea5e9" : "#fff", color: active ? "#fff" : "#64748b", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "all 0.2s" }}>
                    {icon}{name}
                  </button>
                );
              })}

              {/* Clear all */}
              {(searchQuery || city || type || amenities.length > 0 || maxPrice < 25000) && (
                <button onClick={() => { handleClear(); setTimeout(handleSearch, 0); }}
                  style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", border: "1px solid #fca5a5", borderRadius: "999px", background: "#fef2f2", color: "#ef4444", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                  <X size={13} /> Clear all
                </button>
              )}
            </div>
          </div>

          {/* Expanded filter row */}
          {showFilters && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 2fr", gap: "16px", paddingBottom: "16px", animation: "fadeIn 0.25s ease both" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px" }}>Check-in</div>
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", outline: "none", fontFamily: "Inter" }}
                  onFocus={e => e.target.style.borderColor = "#0ea5e9"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px" }}>Check-out</div>
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", outline: "none", fontFamily: "Inter" }}
                  onFocus={e => e.target.style.borderColor = "#0ea5e9"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px" }}>Guests</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "6px 10px" }}>
                  <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b", lineHeight: 1, padding: "0 4px" }}>−</button>
                  <span style={{ fontSize: "14px", fontWeight: 700 }}>{adults}</span>
                  <button type="button" onClick={() => setAdults(adults + 1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b", lineHeight: 1, padding: "0 4px" }}>+</button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "6px" }}>
                  Max Price: <span style={{ color: "#0f172a" }}>₱{maxPrice.toLocaleString()}</span>
                </div>
                <input type="range" min="1000" max="50000" step="500" value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} onMouseUp={handleSearch} onTouchEnd={handleSearch} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 0" }}>

        {/* My Trips */}
        {myTrips.length > 0 && (
          <section style={{ marginBottom: "56px", animation: "fadeIn 0.5s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>My Trips</h2>
              <span style={{ fontSize: "13px", color: "#64748b", background: "#f1f5f9", padding: "4px 12px", borderRadius: "999px" }}>{myTrips.length} reservation{myTrips.length !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {myTrips.map(trip => {
                const s = getStatusStyle(trip.status);
                return (
                  <Link to={`/listing/${trip.listing?.id}`} key={trip.id}
                    style={{ display: "flex", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "1px solid rgba(226,232,240,0.8)", borderRadius: "18px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", textDecoration: "none", color: "inherit", transition: "box-shadow 0.2s, transform 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    <div style={{ width: "200px", height: "150px", flexShrink: 0, overflow: "hidden" }}>
                      {trip.listing?.imageUrls
                        ? <img src={trip.listing.imageUrls.split(",")[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #dbeafe, #bfdbfe)" }} />}
                    </div>
                    <div style={{ padding: "18px 22px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>{trip.listing?.title}</span>
                          <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, background: s.bg, color: s.color, flexShrink: 0, marginLeft: "12px" }}>{s.label}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "13px", marginBottom: "4px" }}><MapPin size={13} color="#94a3b8" />{trip.listing?.city}{trip.listing?.type ? ` • ${trip.listing.type}` : ""}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "13px" }}><Calendar size={13} color="#94a3b8" />{trip.checkInDate} → {trip.checkOutDate}</div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #f1f5f9", marginTop: "8px" }}>
                        <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>₱{trip.totalPrice?.toLocaleString()}</span>
                        <span style={{ fontSize: "13px", color: "#0ea5e9", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>View <ArrowRight size={14} /></span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
          {[{key:"explore",label:"Explore"},{key:"saved",label:`Saved (${savedListings.length})`}].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ padding: "10px 24px", borderRadius: "999px", border: activeTab === t.key ? "none" : "1.5px solid #e2e8f0", background: activeTab === t.key ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "#fff", color: activeTab === t.key ? "#fff" : "#64748b", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s", boxShadow: activeTab === t.key ? "0 4px 12px rgba(14,165,233,0.25)" : "none" }}>
              {t.key === "saved" && <Heart size={14} style={{ marginRight: "6px", verticalAlign: "-2px" }} fill={activeTab === t.key ? "#fff" : "#ef4444"} color={activeTab === t.key ? "#fff" : "#ef4444"} />}
              {t.label}
            </button>
          ))}
        </div>

        {/* Saved Tab */}
        {activeTab === "saved" && (
          <section style={{ animation: "fadeIn 0.4s ease both" }}>
            {savedListings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "72px 24px", background: "rgba(255,255,255,0.8)", borderRadius: "24px", border: "2px dashed #e2e8f0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>❤️</div>
                <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: "6px", fontSize: "1.1rem" }}>No saved listings yet</p>
                <p style={{ fontSize: "14px", color: "#64748b" }}>Tap the heart icon on any listing to save it here.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "24px" }}>
                {savedListings.map((lst, idx) => (
                  <Link to={`/listing/${lst.id}`} key={lst.id}
                    style={{ display: "block", background: "rgba(255,255,255,0.95)", borderRadius: "20px", overflow: "hidden", textDecoration: "none", color: "inherit", transition: "transform 0.25s, box-shadow 0.25s", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid rgba(226,232,240,0.8)" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}>
                    <div style={{ height: "210px", position: "relative", overflow: "hidden" }}>
                      {lst.imageUrls
                        ? <img src={lst.imageUrls.split(",")[0].trim()} alt={lst.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #dbeafe, #bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>🏡</div>}
                      <button onClick={(e) => toggleFavorite(e, lst.id)} style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transition: "transform 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                        <Heart size={18} fill="#ef4444" color="#ef4444" />
                      </button>
                    </div>
                    <div style={{ padding: "16px 18px 18px" }}>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a", marginBottom: "4px" }}>{lst.title}</div>
                      <div style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}><MapPin size={12} color="#94a3b8" />{lst.city}</div>
                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><span style={{ fontWeight: 800, fontSize: "17px", color: "#0f172a" }}>₱{lst.pricePerNight?.toLocaleString()}</span><span style={{ fontSize: "12px", color: "#94a3b8" }}> / night</span></div>
                        <span style={{ fontSize: "12px", color: "#0ea5e9", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>View <ArrowRight size={13} /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Listings Feed */}
        {activeTab === "explore" && <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              {searchQuery ? `Results for "${searchQuery}"` : (city || type ? "Filtered Stays" : "Available Rentals")}
            </h2>
            {!loading && feed.length > 0 && (
              <span style={{ fontSize: "13px", color: "#64748b", background: "#f1f5f9", padding: "4px 12px", borderRadius: "999px" }}>{feed.length} found</span>
            )}
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ borderRadius: "20px", overflow: "hidden", background: "#fff", border: "1px solid #e2e8f0" }}>
                  <div style={{ height: "200px", background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "400% 100%", animation: "shimmer 1.5s ease-in-out infinite" }} />
                  <div style={{ padding: "16px" }}>
                    <div style={{ height: "16px", background: "#f1f5f9", borderRadius: "6px", marginBottom: "8px" }} />
                    <div style={{ height: "12px", background: "#f8fafc", borderRadius: "6px", width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : feed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 24px", background: "rgba(255,255,255,0.8)", borderRadius: "24px", border: "2px dashed #e2e8f0" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: "6px", fontSize: "1.1rem" }}>No properties found</p>
              <p style={{ fontSize: "14px", color: "#64748b" }}>Try adjusting your filters or search terms.</p>
              <button onClick={() => { handleClear(); setTimeout(() => fetchFeed({ searchQuery: "", city: "", type: "", maxPrice: 25000, adults: 1, amenities: [] }), 0); }}
                style={{ marginTop: "20px", padding: "10px 24px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "24px" }}>
              {feed.map((lst, idx) => (
                <Link to={`/listing/${lst.id}`} key={lst.id}
                  style={{ display: "block", background: "rgba(255,255,255,0.95)", borderRadius: "20px", overflow: "hidden", textDecoration: "none", color: "inherit", transition: "transform 0.25s, box-shadow 0.25s", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid rgba(226,232,240,0.8)", animation: `fadeIn 0.4s ease ${idx * 0.04}s both` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}>
                  <div style={{ height: "210px", position: "relative", overflow: "hidden" }}>
                    {lst.imageUrls
                      ? <img src={lst.imageUrls.split(",")[0].trim()} alt={lst.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                          onMouseEnter={e => e.target.style.transform = "scale(1.07)"}
                          onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                      : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #dbeafe, #bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>🏡</div>}
                    {lst.type && (
                      <span style={{ position: "absolute", top: "12px", left: "12px", padding: "4px 10px", background: "rgba(15,23,42,0.75)", color: "#fff", borderRadius: "999px", fontSize: "11px", fontWeight: 700, backdropFilter: "blur(4px)" }}>
                        {lst.type}
                      </span>
                    )}
                    <button onClick={(e) => toggleFavorite(e, lst.id)} style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transition: "transform 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                      <Heart size={18} fill={favoriteIds.has(lst.id) ? "#ef4444" : "none"} color={favoriteIds.has(lst.id) ? "#ef4444" : "#64748b"} />
                    </button>
                  </div>
                  <div style={{ padding: "16px 18px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a", flex: 1, marginRight: "8px", lineHeight: 1.3 }}>{lst.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                        <Star size={13} fill={lst.averageRating ? "#fbbf24" : "#cbd5e1"} color={lst.averageRating ? "#fbbf24" : "#cbd5e1"} />
                        <span style={{ fontSize: "13px", fontWeight: 700, color: lst.averageRating ? "#0f172a" : "#64748b" }}>
                          {lst.averageRating ? lst.averageRating.toFixed(1) : "New"}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                      <MapPin size={12} color="#94a3b8" />{lst.city}
                    </div>
                    {(lst.beds != null || lst.baths != null) && (
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>
                        {lst.beds != null ? `${lst.beds} bed${lst.beds !== 1 ? "s" : ""}` : ""}{lst.beds != null && lst.baths != null ? " · " : ""}{lst.baths != null ? `${lst.baths} bath${lst.baths !== 1 ? "s" : ""}` : ""}
                      </div>
                    )}
                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: "17px", color: "#0f172a" }}>₱{lst.pricePerNight?.toLocaleString()}</span>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}> / night</span>
                      </div>
                      <span style={{ fontSize: "12px", color: "#0ea5e9", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>View <ArrowRight size={13} /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>}
      </div>
    </div>
  );
}