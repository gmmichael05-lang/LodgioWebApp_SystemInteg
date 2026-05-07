const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Phone, BarChart2, Image as ImageIcon, Upload, X, LoaderCircle } from "lucide-react";
import { supabase } from "../supabase";

const PROPERTY_TYPES = ["Apartment", "Villa", "House", "Condo", "Studio", "Loft", "Other"];

export default function CreateListing() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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
  const [amenities, setAmenities] = useState("");

  // Image upload state
  const [imageFiles, setImageFiles] = useState([]); // { file, preview, uploading, url }
  const [imageError, setImageError] = useState("");

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

  // ─── Image handling ───
  const handleSelectFiles = (e) => {
    const files = Array.from(e.target.files);
    setImageError("");
    const newImages = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setImageError("Only image files (JPEG, PNG) are allowed.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Each image must be less than 5MB.");
        continue;
      }
      if (imageFiles.length + newImages.length >= 10) {
        setImageError("Maximum 10 images allowed.");
        break;
      }
      newImages.push({
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        url: null
      });
    }
    setImageFiles(prev => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id) => {
    setImageFiles(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const uploadAllImages = async () => {
    const uploaded = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const img = imageFiles[i];
      if (img.url) { uploaded.push(img.url); continue; }

      setImageFiles(prev => prev.map(im =>
        im.id === img.id ? { ...im, uploading: true } : im
      ));

      const fileExt = img.file.name.split(".").pop();
      const filePath = `listing-images/${userId}/${Date.now()}_${i}.${fileExt}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, img.file, { upsert: true });

      if (error) throw new Error(`Failed to upload image ${i + 1}`);

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      uploaded.push(publicUrlData.publicUrl);

      setImageFiles(prev => prev.map(im =>
        im.id === img.id ? { ...im, uploading: false, url: publicUrlData.publicUrl } : im
      ));
    }
    return uploaded;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    // Validate images are provided
    if (imageFiles.length === 0) {
      setImageError("Please upload at least one image of your property before publishing.");
      return;
    }

    setIsSubmitting(true);
    setImageError("");

    try {
      // Upload images to Supabase storage
      const uploadedUrls = await uploadAllImages();
      const imageUrlsStr = uploadedUrls.join(",");

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
        imageUrls: imageUrlsStr,
        amenities,
        host: { id: userId }
      };

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
      setImageError(e.message || "Upload failed.");
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
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
              💡 You can add more contacts from your <span style={{ color: "#0ea5e9", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/profile")}>Profile page</span>.
            </p>
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

        {/* Section 4: Media - FILE UPLOAD */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionIconStyle}><ImageIcon size={18} color="#3b82f6" /></div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Property Photos <span style={{ color: "#ef4444", fontSize: "14px" }}>*</span></h2>
          </div>

          <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleSelectFiles} style={{ display: "none" }} />

          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "32px",
              textAlign: "center", cursor: "pointer", marginBottom: "16px",
              background: "linear-gradient(135deg, #f8fafc, #f0f9ff)",
              transition: "border-color 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#0ea5e9"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#cbd5e1"}
          >
            <Upload size={32} color="#0ea5e9" style={{ marginBottom: "8px" }} />
            <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Click to upload photos</p>
            <p style={{ fontSize: "13px", color: "#94a3b8" }}>JPEG, PNG or WebP • Max 5MB each • Up to 10 photos</p>
          </div>

          {imageError && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", color: "#991b1b", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" }}>
              ⚠️ {imageError}
            </div>
          )}

          {/* Image previews */}
          {imageFiles.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
              {imageFiles.map((img, idx) => (
                <div key={img.id} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "1", border: "1px solid #e2e8f0" }}>
                  <img src={img.preview} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {img.uploading && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LoaderCircle size={24} color="#0ea5e9" style={{ animation: "spin 1s linear infinite" }} />
                    </div>
                  )}
                  {idx === 0 && (
                    <span style={{ position: "absolute", bottom: "6px", left: "6px", background: "#0ea5e9", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700 }}>COVER</span>
                  )}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <label style={labelStyle}>Amenities (comma separated)</label>
            <input value={amenities} onChange={e => setAmenities(e.target.value)} placeholder="Wifi, Pool, Gym" style={inputStyle} />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "18px", backgroundColor: "#0ea5e9", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? "Uploading & Publishing..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
