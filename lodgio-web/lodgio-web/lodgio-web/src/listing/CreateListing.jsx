const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Phone, BarChart2, Image as ImageIcon } from "lucide-react";

const PROPERTY_TYPES = ["Apartment", "Villa", "House", "Condo", "Studio", "Loft", "Other"];

export default function CreateListing() {
  const navigate = useNavigate();

  // Form fields
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("Apartment");
  const [description, setDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [guestCapacity, setGuestCapacity] = useState("2");
  const [beds, setBeds] = useState("1");
  const [baths, setBaths] = useState("1");
  const [imageUrls, setImageUrls] = useState("");
  const [amenities, setAmenities] = useState("");

  const [userId, setUserId] = useState(null);
  const [contactOptions, setContactOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userStr = window.localStorage.getItem("lodgio_user");
    if (!userStr) { navigate("/login"); return; }
    const u = JSON.parse(userStr);
    if (u.role !== "HOST") { navigate("/"); return; }

    fetch(`${API}/users/${u.email}`)
      .then(r => r.json())
      .then(d => {
        setUserId(d.id);
        // Gather all contact numbers stored on the user
        const contacts = [];
        if (d.mobileNumber) contacts.push(d.mobileNumber);
        if (d.contactNumbers) {
          d.contactNumbers.split(",").map(c => c.trim()).filter(Boolean).forEach(c => {
            if (!contacts.includes(c)) contacts.push(c);
          });
        }
        setContactOptions(contacts);
        if (contacts.length > 0) setContactNumber(contacts[0]);
      });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);

    const payload = {
      title,
      description,
      pricePerNight: parseFloat(pricePerNight),
      guestCapacity: parseInt(guestCapacity),
      beds: parseInt(beds),
      baths: parseInt(baths),
      city,
      type,
      location: city,
      imageUrls,
      amenities,
      host: { id: userId }
    };

    try {
      const res = await fetch(`${API}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        navigate("/host-dashboard");
      } else {
        alert("Failed to create listing. Please try again.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
  const sectionHeaderStyle = { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" };
  const sectionIconStyle = { background: "#eff6ff", padding: "8px", borderRadius: "10px" };
  const inputStyle = { width: "100%", padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", background: "#fff" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" };
  const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px 80px" }}>
      {/* Page header inside a card-like top */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Host Dashboard</h1>
        <p style={{ color: "#64748b" }}>Welcome back. Manage your portfolio.</p>
        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <button onClick={() => navigate("/host-dashboard")} style={{ padding: "8px 20px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>My Listings</button>
          <button style={{ padding: "8px 20px", border: "none", borderRadius: "8px", background: "#0ea5e9", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>+ Create New</button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Details */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionIconStyle}><Info size={18} color="#3b82f6" /></div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Basic Details</h2>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sunny Loft in Cebu" style={inputStyle} />
          </div>
          <div style={{ ...gridStyle, marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>City</label>
              <input required value={city} onChange={e => setCity(e.target.value)} placeholder="Cebu" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select required value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionIconStyle}><Phone size={18} color="#3b82f6" /></div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Contact Details</h2>
          </div>
          <div>
            <label style={labelStyle}>Select Contact Number for Guest</label>
            {contactOptions.length > 0 ? (
              <select value={contactNumber} onChange={e => setContactNumber(e.target.value)} style={inputStyle}>
                {contactOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            ) : (
              <input value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="e.g. 09123456789" style={inputStyle} />
            )}
          </div>
        </div>

        {/* Section 3: Stats */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionIconStyle}><BarChart2 size={18} color="#3b82f6" /></div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Stats</h2>
          </div>
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Price (₱)</label>
              <input required type="number" min="0" value={pricePerNight} onChange={e => setPricePerNight(e.target.value)} placeholder="1500" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Guests</label>
              <input required type="number" min="1" value={guestCapacity} onChange={e => setGuestCapacity(e.target.value)} placeholder="2" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Beds</label>
              <input type="number" min="1" value={beds} onChange={e => setBeds(e.target.value)} placeholder="1" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Baths</label>
              <input type="number" min="1" value={baths} onChange={e => setBaths(e.target.value)} placeholder="1" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Section 4: Media */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionIconStyle}><ImageIcon size={18} color="#3b82f6" /></div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Media</h2>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Image URLs (comma separated)</label>
            <input value={imageUrls} onChange={e => setImageUrls(e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Amenities (comma separated)</label>
            <input value={amenities} onChange={e => setAmenities(e.target.value)} placeholder="Wifi, Pool, Gym" style={inputStyle} />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "18px", backgroundColor: "#0ea5e9", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? "Publishing..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
