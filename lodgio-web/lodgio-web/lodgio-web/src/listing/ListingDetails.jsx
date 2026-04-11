const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Wifi, Wind, Droplet, Dumbbell, Car, Check, Users, Bed, Bath, Star, Shield } from "lucide-react";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    fetch(`${API}/listings/${id}`)
      .then(res => res.json())
      .then(data => { setListing(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleCheckAvailability = () => {
    if (!checkIn || !checkOut) { alert("Please select check-in and check-out dates."); return; }
    if (new Date(checkOut) <= new Date(checkIn)) { alert("Check-out must be after check-in."); return; }
    navigate(`/booking/${id}/confirm?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px", color: "#64748b" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTop: "3px solid #0ea5e9", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      Loading listing…
    </div>
  );
  if (!listing) return <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Listing not found.</div>;

  const images = listing.imageUrls ? listing.imageUrls.split(",").map(s => s.trim()) : [];
  const [main, img2, img3] = [
    images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
    images[1] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    images[2] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  ];
  const amenitiesList = listing.amenities ? listing.amenities.split(",").map(a => a.trim()) : [];

  const getAmenityIcon = (name) => {
    const l = name.toLowerCase();
    if (l.includes("wifi")) return <Wifi size={17} color="#0ea5e9" />;
    if (l.includes("air") || l.includes("ac")) return <Wind size={17} color="#0ea5e9" />;
    if (l.includes("pool")) return <Droplet size={17} color="#0ea5e9" />;
    if (l.includes("gym")) return <Dumbbell size={17} color="#0ea5e9" />;
    if (l.includes("park")) return <Car size={17} color="#0ea5e9" />;
    return <Check size={17} color="#0ea5e9" />;
  };

  // Calculate preview price
  const nights = (checkIn && checkOut) ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 1;

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Title & Location */}
        <div style={{ marginBottom: "24px", animation: "fadeIn 0.4s ease both" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px", marginBottom: "8px" }}>{listing.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "14px" }}>
              <MapPin size={15} color="#0ea5e9" />{listing.city} {listing.location ? `• ${listing.location}` : ""}
            </div>
            {listing.type && <span style={{ padding: "3px 10px", background: "#f0f9ff", color: "#0284c7", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>{listing.type}</span>}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#0f172a", fontSize: "13px", fontWeight: 700 }}><Star size={14} fill="#fbbf24" color="#fbbf24" />4.9 <span style={{ color: "#94a3b8", fontWeight: 400 }}>(24 reviews)</span></div>
          </div>
        </div>

        {/* Photo Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", height: "440px", borderRadius: "20px", overflow: "hidden", marginBottom: "40px", animation: "fadeIn 0.4s ease 0.1s both" }}>
          <div style={{ overflow: "hidden" }}>
            <img src={main} alt="main" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
              onMouseEnter={e => e.target.style.transform = "scale(1.03)"}
              onMouseLeave={e => e.target.style.transform = "scale(1)"} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <img src={img2} alt="img2" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                onMouseLeave={e => e.target.style.transform = "scale(1)"} />
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <img src={img3} alt="img3" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                onMouseLeave={e => e.target.style.transform = "scale(1)"} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "60px", flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Left Column */}
          <div style={{ flex: "1 1 55%", animation: "slideUp 0.4s ease 0.15s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "28px", borderBottom: "1px solid #e2e8f0", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
                  Hosted by <span style={{ color: "#0ea5e9" }}>{listing.host?.fullname || "Unknown"}</span>
                </h2>
                <div style={{ display: "flex", gap: "16px", color: "#64748b", fontSize: "14px" }}>
                  {[
                    { icon: <Users size={15} />, text: `${listing.guestCapacity} guests` },
                    { icon: <Bed size={15} />, text: `${listing.beds || 1} bed${listing.beds !== 1 ? "s" : ""}` },
                    { icon: <Bath size={15} />, text: `${listing.baths || 1} bath${listing.baths !== 1 ? "s" : ""}` },
                  ].map(f => (
                    <span key={f.text} style={{ display: "flex", alignItems: "center", gap: "5px" }}>{f.icon}{f.text}</span>
                  ))}
                </div>
              </div>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "18px" }}>
                {listing.host?.fullname?.charAt(0) || "?"}
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
              {[["🏠", "Entire place"], ["✨", "New listing"], ["🔑", "Self check-in"], ["⭐", "Superhost"]].map(([e, t]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <span>{e}</span><span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{t}</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>About this place</h3>
            <p style={{ lineHeight: 1.75, color: "#475569", marginBottom: "32px", fontSize: "15px" }}>{listing.description || "A wonderful place to stay."}</p>

            <div style={{ height: "1px", background: "#e2e8f0", marginBottom: "28px" }} />

            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>What this place offers</h3>
            {amenitiesList.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {amenitiesList.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "#f0f9ff", borderRadius: "10px", border: "1px solid #bae6fd" }}>
                    {getAmenityIcon(a)}
                    <span style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500 }}>{a}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "14px" }}>No specific amenities listed.</p>}
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div style={{ flex: "1 1 35%", minWidth: "320px", position: "sticky", top: "80px", animation: "slideUp 0.4s ease 0.2s both" }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "32px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
              <div style={{ marginBottom: "24px" }}>
                <span style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a" }}>₱{listing.pricePerNight?.toLocaleString()}</span>
                <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}> / night</span>
              </div>

              <div style={{ border: "1.5px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", marginBottom: "16px" }}>
                <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ flex: 1, padding: "14px 16px", borderRight: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>CHECK-IN</div>
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} style={{ border: "none", fontSize: "14px", outline: "none", background: "transparent", width: "100%", fontFamily: "Inter, sans-serif", color: "#0f172a", fontWeight: 500 }} />
                  </div>
                  <div style={{ flex: 1, padding: "14px 16px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>CHECK-OUT</div>
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{ border: "none", fontSize: "14px", outline: "none", background: "transparent", width: "100%", fontFamily: "Inter, sans-serif", color: "#0f172a", fontWeight: 500 }} />
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>GUESTS</div>
                  <input type="number" min="1" max={listing.guestCapacity} value={guests} onChange={e => setGuests(parseInt(e.target.value))} style={{ border: "none", fontSize: "14px", outline: "none", background: "transparent", width: "100%", fontFamily: "Inter, sans-serif", color: "#0f172a", fontWeight: 500 }} />
                </div>
              </div>

              {checkIn && checkOut && new Date(checkOut) > new Date(checkIn) && (
                <div style={{ background: "#f0f9ff", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", marginBottom: "6px" }}>
                    <span>₱{listing.pricePerNight?.toLocaleString()} × {nights} night{nights !== 1 ? "s" : ""}</span>
                    <span style={{ fontWeight: 600 }}>₱{(listing.pricePerNight * nights)?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#0f172a", fontWeight: 700, borderTop: "1px solid #bae6fd", paddingTop: "8px", marginTop: "4px" }}>
                    <span>Est. Total</span>
                    <span>₱{(listing.pricePerNight * nights + 3080)?.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button onClick={handleCheckAvailability}
                style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer", marginBottom: "14px", boxShadow: "0 4px 14px rgba(14,165,233,0.3)", transition: "all 0.2s" }}
                onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
                Check availability
              </button>
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", marginBottom: "20px" }}>You won't be charged yet</p>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <Shield size={16} color="#22c55e" />
                <span style={{ fontSize: "12px", color: "#64748b" }}>Protected by Lodgio's secure booking guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
