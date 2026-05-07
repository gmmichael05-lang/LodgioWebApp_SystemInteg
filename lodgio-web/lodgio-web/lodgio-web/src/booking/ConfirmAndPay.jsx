const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Phone, ArrowLeft, ArrowRight, Calendar, Users, Shield, MapPin, AlertCircle } from "lucide-react";

export default function ConfirmAndPay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [listing, setListing] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "1");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageToHost, setMessageToHost] = useState("");
  const [contactOptions, setContactOptions] = useState([]);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const userStr = window.localStorage.getItem("lodgio_user");
    if (!userStr) { navigate("/login"); return; }
    const u = JSON.parse(userStr);
    Promise.all([
      fetch(`${API}/listings/${id}`).then(r => r.json()),
      fetch(`${API}/users/${u.email}`).then(r => r.json())
    ]).then(([listingData, userData]) => {
      setListing(listingData);
      setUser(userData);
      setFullName(userData.fullname || "");
      // Build contact options from mobile + additional contacts
      const contacts = [];
      if (userData.mobileNumber) contacts.push(userData.mobileNumber);
      if (userData.contactNumbers) {
        userData.contactNumbers.split(",").map(c => c.trim()).filter(Boolean).forEach(c => {
          if (!contacts.includes(c)) contacts.push(c);
        });
      }
      setContactOptions(contacts);
      setPhoneNumber(contacts.length > 0 ? contacts[0] : "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, navigate]);

  const handleContinue = (e) => {
    e.preventDefault();
    setValidationError("");
    if (!checkIn || !checkOut) { setValidationError("Please select check-in and check-out dates."); return; }
    if (new Date(checkOut) <= new Date(checkIn)) { setValidationError("Check-out must be after check-in."); return; }
    if (new Date(checkIn) < new Date(new Date().toDateString())) { setValidationError("Check-in date cannot be in the past."); return; }
    if (!fullName.trim()) { setValidationError("Full name is required."); return; }
    if (!phoneNumber.trim()) { setValidationError("Phone number is required."); return; }
    if (parseInt(guests) > listing.guestCapacity) { setValidationError(`Maximum ${listing.guestCapacity} guests allowed for this listing.`); return; }
    const msgParam = messageToHost ? `&msg=${encodeURIComponent(messageToHost)}` : "";
    navigate(`/booking/${id}/checkout?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}${msgParam}`);
  };

  if (loading || !listing) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px", color: "#64748b" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTop: "3px solid #0ea5e9", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      Loading details…
    </div>
  );

  const nights = (checkIn && checkOut) ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 1;
  const basePrice = listing.pricePerNight * nights;
  const cleaningFee = 1320;
  const serviceFee = 1760;
  const totalPrice = basePrice + cleaningFee + serviceFee;
  const mainImage = listing.imageUrls ? listing.imageUrls.split(",")[0].trim() : null;

  const inputStyle = { width: "100%", padding: "12px 16px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif", transition: "border-color 0.2s, box-shadow 0.2s" };
  const onFocus = (e) => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; };
  const onBlur = (e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };
  const labelStyle = { display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px", animation: "fadeIn 0.4s ease both" }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px", fontWeight: 600, padding: "8px 0", marginBottom: "20px" }}>
            <ArrowLeft size={16} /> Back
          </button>
          {/* Progress indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            {["Trip Details", "Payment"].map((step, i) => (
              <React.Fragment key={step}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: i === 0 ? "#0ea5e9" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: i === 0 ? "#fff" : "#94a3b8" }}>{i + 1}</div>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: i === 0 ? "#0f172a" : "#94a3b8" }}>{step}</span>
                </div>
                {i < 1 && <div style={{ flex: 1, height: "2px", background: "#e2e8f0", maxWidth: "60px" }} />}
              </React.Fragment>
            ))}
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>Confirm your trip</h1>
          <p style={{ color: "#64748b", marginTop: "6px" }}>Review your details before proceeding to payment.</p>
        </div>

        {validationError && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "12px", marginBottom: "20px", fontSize: "14px", fontWeight: 500 }}>
            <AlertCircle size={18} /> {validationError}
          </div>
        )}

        <div style={{ display: "flex", gap: "48px", flexWrap: "wrap", alignItems: "flex-start", animation: "slideUp 0.4s ease 0.1s both" }}>

          {/* Left: Form */}
          <div style={{ flex: "1 1 55%" }}>
            <form onSubmit={handleContinue}>
              {/* Your Trip */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ background: "#eff6ff", padding: "8px", borderRadius: "10px" }}><Calendar size={18} color="#3b82f6" /></div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Your trip</h2>
                </div>
                <div style={{ display: "flex", gap: "14px", marginBottom: "14px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Check-in</label>
                    <input type="date" required value={checkIn} onChange={e => setCheckIn(e.target.value)} min={new Date().toISOString().split("T")[0]} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Check-out</label>
                    <input type="date" required value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split("T")[0]} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Guests</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px" }}>
                    <Users size={16} color="#94a3b8" />
                    <input type="number" required min="1" max={listing.guestCapacity} value={guests} onChange={e => setGuests(e.target.value)} style={{ border: "none", outline: "none", fontSize: "14px", fontFamily: "Inter, sans-serif", width: "60px", fontWeight: 500 }} />
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>guests (max {listing.guestCapacity})</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ background: "#f0fdf4", padding: "8px", borderRadius: "10px" }}><Phone size={18} color="#16a34a" /></div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Contact info</h2>
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Phone Number <span style={{ color: "#ef4444" }}>*</span></label>
                  {contactOptions.length > 0 ? (
                    <select value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} style={inputStyle}>
                      {contactOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input type="text" required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+63 9xx xxx xxxx" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                  )}
                  {contactOptions.length > 0 && (
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
                      📱 Showing your saved contacts. Add more from your <span style={{ color: "#0ea5e9", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/profile")}>Profile</span>.
                    </p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Message to Host <span style={{ fontWeight: 400, color: "#94a3b8", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                  <textarea value={messageToHost} onChange={e => setMessageToHost(e.target.value)} placeholder="Tell the host about your trip plans…" rows={3}
                    style={{ ...inputStyle, resize: "vertical" }} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              <button type="submit"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "16px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(14,165,233,0.3)", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                Continue to Payment <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Right: Price Card */}
          <div style={{ flex: "1 1 35%", minWidth: "300px", position: "sticky", top: "80px" }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "28px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
                {mainImage ? (
                  <img src={mainImage} alt={listing.title} style={{ width: "90px", height: "70px", objectFit: "cover", borderRadius: "12px" }} />
                ) : (
                  <div style={{ width: "90px", height: "70px", borderRadius: "12px", background: "linear-gradient(135deg, #dbeafe, #bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>🏡</div>
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "12px", marginBottom: "4px" }}><MapPin size={12} color="#94a3b8" />{listing.city}</div>
                  <div style={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>{listing.title}</div>
                  {listing.type && <span style={{ display: "inline-block", marginTop: "4px", padding: "2px 8px", background: "#f0f9ff", color: "#0284c7", borderRadius: "999px", fontSize: "11px", fontWeight: 700 }}>{listing.type}</span>}
                </div>
              </div>

              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", marginBottom: "14px" }}>Price details</h3>
              {[
                { label: `₱${listing.pricePerNight?.toLocaleString()} × ${nights} night${nights !== 1 ? "s" : ""}`, value: `₱${basePrice.toLocaleString()}` },
                { label: "Cleaning fee", value: `₱${cleaningFee.toLocaleString()}` },
                { label: "Service fee", value: `₱${serviceFee.toLocaleString()}` },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", color: "#475569", marginBottom: "10px", fontSize: "14px" }}>
                  <span>{row.label}</span><span>{row.value}</span>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", color: "#0f172a", fontWeight: 800, fontSize: "1.05rem", borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginTop: "4px" }}>
                <span>Total (PHP)</span><span>₱{totalPrice.toLocaleString()}</span>
              </div>

              <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "10px", padding: "14px", background: "#f0f9ff", borderRadius: "12px", border: "1px solid #bae6fd" }}>
                <Shield size={18} color="#0ea5e9" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "#0369a1", lineHeight: 1.5 }}>Protected by Lodgio's secure booking guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
