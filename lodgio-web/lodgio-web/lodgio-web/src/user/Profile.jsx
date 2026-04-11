const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Trash2, Plus,
  PenSquare, Image, LoaderCircle, MapPin, Calendar, Check, X, Edit2, Save
} from "lucide-react";
import { supabase } from "../supabase";

export default function Profile() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [user] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem("lodgio_user")) || null; }
    catch { return null; }
  });

  const [backendUser, setBackendUser] = useState(null);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [bookingHistory, setBookingHistory] = useState([]);
  const [listingHistory, setListingHistory] = useState([]);

  // Photo upload
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // Editable profile fields
  const [editMode, setEditMode] = useState(false);
  const [editFullname, setEditFullname] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveMsg, setProfileSaveMsg] = useState("");

  // Contact numbers
  const [contactNumbers, setContactNumbers] = useState([]);
  const [newContact, setNewContact] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Add Card modal
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [cardError, setCardError] = useState("");
  const [cardSaving, setCardSaving] = useState(false);

  const isHost = user?.role === "HOST";

  const fetchAll = async () => {
    if (!user?.email) { navigate("/login"); return; }
    try {
      const resp = await fetch(`${API}/users/${user.email}`);
      if (!resp.ok) throw new Error("Could not load profile.");
      const data = await resp.json();
      setBackendUser(data);
      setEditFullname(data.fullname || "");
      setEditMobile(data.mobileNumber || "");
      if (data.contactNumbers) {
        setContactNumbers(data.contactNumbers.split(",").map(c => c.trim()).filter(Boolean));
      } else if (data.mobileNumber) {
        setContactNumbers([data.mobileNumber]);
      }
      if (isHost) {
        const listRes = await fetch(`${API}/listings/host/${user.email}`);
        if (listRes.ok) setListingHistory(await listRes.json());
      } else {
        const bkRes = await fetch(`${API}/bookings/guest/${user.email}`);
        if (bkRes.ok) setBookingHistory(await bkRes.json());
      }
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setFetchingUser(false);
    }
  };

  useEffect(() => { fetchAll(); }, [user, navigate, isHost]);

  // ─── Photo Upload ───
  const handlePhotoClick = () => fileInputRef.current.click();
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setPhotoError("File size must be less than 2MB.");
    if (!file.type.startsWith("image/")) return setPhotoError("File must be an image.");
    setPhotoUploading(true); setPhotoError("");
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${backendUser.id}/${backendUser.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const response = await fetch(`${API}/users/${backendUser.id}/profile-picture`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publicUrlData.publicUrl)
      });
      if (!response.ok) throw new Error("Failed to update profile picture.");
      setBackendUser(await response.json());
    } catch (err) {
      setPhotoError(err.message || "An error occurred.");
    } finally { setPhotoUploading(false); }
  };

  // ─── Save Profile (name + mobile) ───
  const handleSaveProfile = async () => {
    setSavingProfile(true); setProfileSaveMsg("");
    try {
      const resp = await fetch(`${API}/users/${backendUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...backendUser, fullname: editFullname, mobileNumber: editMobile })
      });
      if (!resp.ok) throw new Error("Failed to save profile.");
      const updated = await resp.json();
      setBackendUser(updated);
      // Update localStorage fullname
      const stored = JSON.parse(window.localStorage.getItem("lodgio_user") || "{}");
      window.localStorage.setItem("lodgio_user", JSON.stringify({ ...stored, fullname: editFullname }));
      window.dispatchEvent(new Event("lodgio-auth"));
      setProfileSaveMsg("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      setProfileSaveMsg("Error: " + err.message);
    } finally { setSavingProfile(false); }
  };

  // ─── Contact Numbers ───
  const handleAddContact = () => {
    if (!newContact.trim()) return;
    setContactNumbers(prev => [...prev, newContact.trim()]);
    setNewContact(""); setShowAddContact(false);
  };
  const handleRemoveContact = (idx) => setContactNumbers(prev => prev.filter((_, i) => i !== idx));

  // ─── Password Change ───
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(""); setPasswordSuccess("");
    if (newPassword.length < 6) return setPasswordError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setPasswordError("Passwords do not match.");
    setLoadingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess("Password updated successfully!");
      setNewPassword(""); setConfirmPassword("");
      setTimeout(() => { setShowPasswordModal(false); setPasswordSuccess(""); }, 2000);
    } catch (err) {
      setPasswordError(err.message || "Could not update password.");
    } finally { setLoadingPassword(false); }
  };

  // ─── Add Card ───
  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.match(/.{1,4}/g)?.join(" ") || digits;
  };
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };
  const handleSaveCard = (e) => {
    e.preventDefault();
    setCardError("");
    const raw = cardNumber.replace(/\s/g, "");
    if (!cardHolder.trim()) return setCardError("Cardholder name is required.");
    if (raw.length < 13) return setCardError("Invalid card number.");
    if (!cardExpiry.includes("/")) return setCardError("Invalid expiry format (MM/YY).");
    if (cardCVC.length < 3) return setCardError("Invalid CVC.");
    setCardSaving(true);
    setTimeout(() => {
      const brand = raw.startsWith("4") ? "VISA" : raw.startsWith("5") ? "Mastercard" : raw.startsWith("3") ? "Amex" : "Card";
      const last4 = raw.slice(-4);
      setSavedCards(prev => [...prev, { id: Date.now(), brand, last4, holder: cardHolder, expiry: cardExpiry }]);
      setCardHolder(""); setCardNumber(""); setCardExpiry(""); setCardCVC("");
      setCardSaving(false); setShowAddCardModal(false);
    }, 600);
  };
  const removeCard = (id) => setSavedCards(prev => prev.filter(c => c.id !== id));

  const getStatusStyle = (status) => {
    if (status === "ACCEPTED" || status === "PAID") return { bg: "#dcfce7", color: "#166534" };
    if (status === "REJECTED") return { bg: "#fee2e2", color: "#991b1b" };
    return { bg: "#fef08a", color: "#854d0e" };
  };

  if (!user) return null;

  const cardStyle = {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px",
    padding: "32px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  };
  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px",
    fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none"
  };
  const labelStyle = { fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "80px" }}>

      {/* ─── Password Change Modal ─── */}
      {showPasswordModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "36px", width: "100%", maxWidth: "420px", boxShadow: "0 25px 50px rgba(0,0,0,0.2)", animation: "slideUp 0.3s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>Change Password</h3>
              <button onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordSuccess(""); }}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            {passwordError && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", color: "#991b1b", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" }}>
                <AlertCircle size={16} />{passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" }}>
                <Check size={16} />{passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showNewPwd ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: "44px" }} placeholder="Min. 6 characters" required />
                  <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                    {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showConfirmPwd ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: "44px" }} placeholder="Repeat new password" required />
                  <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                    {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loadingPassword}
                style={{ padding: "14px", background: loadingPassword ? "#bae6fd" : "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "15px", cursor: loadingPassword ? "not-allowed" : "pointer", boxShadow: "0 4px 12px rgba(14,165,233,0.25)" }}>
                {loadingPassword ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "48px 0 32px", background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)", marginBottom: "32px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>Account</h1>
          <p style={{ color: "rgba(255,255,255,0.55)" }}>Manage your profile, security, and {isHost ? "listing history" : "payment methods & booking history"}.</p>
        </div>
      </div>

      {/* ─── Add Card Modal ─── */}
      {showAddCardModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddCardModal(false); }}>
          <div className="modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>💳 Add Payment Card</h3>
              <button onClick={() => setShowAddCardModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color="#64748b" /></button>
            </div>
            {cardError && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", color: "#991b1b", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" }}>
                <AlertCircle size={16} />{cardError}
              </div>
            )}
            <form onSubmit={handleSaveCard} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Cardholder Name</label>
                <input value={cardHolder} onChange={e => setCardHolder(e.target.value)} style={inputStyle} placeholder="Name on card" required
                  onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
              </div>
              <div>
                <label style={labelStyle}>Card Number</label>
                <input value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} style={inputStyle} placeholder="1234 5678 9012 3456" maxLength={19} required
                  onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Expiry (MM/YY)</label>
                  <input value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} style={inputStyle} placeholder="MM/YY" maxLength={5} required
                    onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
                </div>
                <div>
                  <label style={labelStyle}>CVC</label>
                  <input value={cardCVC} onChange={e => setCardCVC(e.target.value.replace(/\D/g, "").slice(0, 4))} style={inputStyle} placeholder="123" maxLength={4} required
                    onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
                </div>
              </div>
              <button type="submit" disabled={cardSaving}
                style={{ padding: "14px", background: cardSaving ? "#bae6fd" : "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "15px", cursor: cardSaving ? "not-allowed" : "pointer", boxShadow: "0 4px 12px rgba(14,165,233,0.25)" }}>
                {cardSaving ? "Saving…" : "Save Card"}
              </button>
            </form>
          </div>
        </div>
      )}


      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px" }}>
        {fetchingUser ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}>Loading profile…</div>
        ) : fetchError ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", color: "#991b1b", padding: "16px", borderRadius: "12px", marginBottom: "24px" }}>
            <AlertCircle size={18} />{fetchError}
          </div>
        ) : (
          <>
            {/* ──────── Profile Card ──────── */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Profile</h2>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>Your registered details.</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  {!editMode ? (
                    <button onClick={() => setEditMode(true)}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#0f172a", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                      <Edit2 size={14} /> Edit Profile
                    </button>
                  ) : (
                    <button onClick={() => { setEditMode(false); setEditFullname(backendUser.fullname); setEditMobile(backendUser.mobileNumber || ""); }}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                      <X size={14} /> Cancel
                    </button>
                  )}
                  <button onClick={() => { setShowPasswordModal(true); setPasswordError(""); setPasswordSuccess(""); }}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#0f172a", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                    <Lock size={14} /> Change Password
                  </button>
                </div>
              </div>

              {/* Avatar */}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} accept="image/*" />
              <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "50%", marginBottom: "24px", cursor: "pointer" }} onClick={handlePhotoClick} title="Update Photo">
                {photoUploading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <LoaderCircle size={24} color="#0ea5e9" style={{ animation: "spin 1s linear infinite" }} />
                  </div>
                )}
                {backendUser?.profilePictureUrl ? (
                  <img src={backendUser.profilePictureUrl} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", fontWeight: 800 }}>
                    {backendUser?.fullname?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div style={{ position: "absolute", bottom: 0, right: 0, background: "#0ea5e9", color: "#fff", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                  <PenSquare size={12} />
                </div>
              </div>
              {photoError && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "16px" }}>{photoError}</div>}

              {/* Profile Fields */}
              {editMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input value={editFullname} onChange={e => setEditFullname(e.target.value)} style={inputStyle} placeholder="Your full name"
                      onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; }}
                      onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email <span style={{ fontWeight: 400, color: "#94a3b8" }}>(cannot be changed)</span></label>
                    <input value={backendUser?.email} disabled style={{ ...inputStyle, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Mobile Number</label>
                    <input value={editMobile} onChange={e => setEditMobile(e.target.value)} style={inputStyle} placeholder="+63 9xx xxx xxxx"
                      onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; }}
                      onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
                  </div>
                  {profileSaveMsg && (
                    <div style={{ color: profileSaveMsg.startsWith("Error") ? "#ef4444" : "#166534", fontSize: "13px" }}>{profileSaveMsg}</div>
                  )}
                  <button onClick={handleSaveProfile} disabled={savingProfile}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px 24px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "14px", alignSelf: "flex-start", boxShadow: "0 4px 12px rgba(14,165,233,0.25)" }}>
                    <Save size={15} /> {savingProfile ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { icon: <UserRound size={16} color="#94a3b8" />, label: "Full Name", value: backendUser?.fullname },
                    { icon: <Mail size={16} color="#94a3b8" />, label: "Email", value: backendUser?.email },
                    { icon: <Phone size={16} color="#94a3b8" />, label: "Mobile Number", value: backendUser?.mobileNumber },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                      {item.icon}
                      <div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontWeight: 500, color: "#0f172a" }}>{item.value || "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact Numbers (additional) */}
              {!editMode && (
                <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px", marginTop: "12px", border: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone size={15} color="#94a3b8" />
                      <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Additional Contacts</span>
                    </div>
                    <button onClick={() => setShowAddContact(true)} style={{ fontSize: "12px", color: "#0ea5e9", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>+ Add</button>
                  </div>
                  {contactNumbers.length === 0 && <p style={{ color: "#94a3b8", fontSize: "13px", fontStyle: "italic" }}>No additional contacts added.</p>}
                  {contactNumbers.map((num, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "14px" }}>
                      <span style={{ fontWeight: 500, color: "#0f172a" }}>{num}</span>
                      <button onClick={() => handleRemoveContact(idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Remove</button>
                    </div>
                  ))}
                  {showAddContact && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <input type="text" value={newContact} onChange={e => setNewContact(e.target.value)} placeholder="+63 9xx xxx xxxx"
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", outline: "none", fontFamily: "Inter, sans-serif" }} />
                      <button onClick={handleAddContact} style={{ padding: "8px 16px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Save</button>
                      <button onClick={() => setShowAddContact(false)} style={{ padding: "8px 12px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "8px", cursor: "pointer" }}>✕</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ──────── GUEST: Saved Payment Cards ──────── */}
            {!isHost && (
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Saved Payment Cards</h2>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>Manage your saved payment methods.</p>
                  </div>
                  <button onClick={() => { setCardError(""); setShowAddCardModal(true); }}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", border: "none", borderRadius: "10px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 700, boxShadow: "0 4px 10px rgba(14,165,233,0.25)" }}>
                    <Plus size={14} /> Add Card
                  </button>
                </div>
                {savedCards.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8", background: "linear-gradient(135deg, #f8fafc, #f0f9ff)", borderRadius: "12px", border: "2px dashed #e2e8f0" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>💳</div>
                    <p style={{ fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>No saved cards yet</p>
                    <p style={{ fontSize: "13px" }}>Click "Add Card" above to add one.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {savedCards.map(card => (
                      <div key={card.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "linear-gradient(135deg, #f8fafc, #f0f9ff)", borderRadius: "12px", border: "1px solid #e0f2fe" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div style={{ width: "44px", height: "28px", background: card.brand === "VISA" ? "#1a1f71" : card.brand === "Mastercard" ? "#eb001b" : "#007bc7", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#fff", fontSize: "9px", fontWeight: 900, letterSpacing: "0.5px" }}>{card.brand.toUpperCase()}</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>•••• •••• •••• {card.last4}</div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>{card.holder} · Expires {card.expiry}</div>
                          </div>
                        </div>
                        <button onClick={() => removeCard(card.id)} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600 }}>
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ──────── GUEST: Booking History ──────── */}
            {!isHost && (
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ background: "#eff6ff", padding: "10px", borderRadius: "10px" }}><Calendar size={20} color="#3b82f6" /></div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Booking History</h2>
                </div>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>Your past and upcoming reservations.</p>
                {bookingHistory.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8", background: "#f8fafc", borderRadius: "12px", border: "2px dashed #e2e8f0" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏡</div>
                    <p style={{ fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>No bookings yet</p>
                    <p style={{ fontSize: "13px" }}>Browse listings to make your first reservation.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                          {["REF", "PLACE", "DATES", "TOTAL", "STATUS"].map(h => (
                            <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bookingHistory.map((b, idx) => {
                          const s = getStatusStyle(b.status);
                          return (
                            <tr key={b.id} style={{ borderBottom: "1px solid #f8fafc", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                              <td style={{ padding: "14px 16px", color: "#0ea5e9", fontWeight: 700, fontSize: "12px" }}>#{String(idx + 1).padStart(4, "0")}</td>
                              <td style={{ padding: "14px 16px" }}>
                                <div style={{ fontWeight: 600, color: "#0f172a" }}>{b.listing?.title}</div>
                                <div style={{ color: "#94a3b8", fontSize: "12px" }}>{b.listing?.city} {b.listing?.type ? `• ${b.listing.type}` : ""}</div>
                              </td>
                              <td style={{ padding: "14px 16px", color: "#475569", fontSize: "13px" }}>{b.checkInDate}<br />{b.checkOutDate}</td>
                              <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a" }}>₱{b.totalPrice?.toLocaleString()}</td>
                              <td style={{ padding: "14px 16px" }}>
                                <span style={{ padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: s.bg, color: s.color }}>{b.status}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ──────── HOST: Listing History ──────── */}
            {isHost && (
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ background: "#eff6ff", padding: "10px", borderRadius: "10px" }}><MapPin size={20} color="#3b82f6" /></div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Listing History</h2>
                </div>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>Overview of your listed properties.</p>
                {listingHistory.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8", background: "#f8fafc", borderRadius: "12px", border: "2px dashed #e2e8f0" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏠</div>
                    <p style={{ fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>No listings yet</p>
                    <p style={{ fontSize: "13px" }}>Create your first listing from the Host Dashboard.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
                    {listingHistory.map(lst => (
                      <div key={lst.id} style={{ borderRadius: "12px", overflow: "hidden", position: "relative", cursor: "pointer" }}>
                        {lst.imageUrls ? (
                          <img src={lst.imageUrls.split(",")[0].trim()} alt={lst.title}
                            style={{ width: "100%", height: "130px", objectFit: "cover", display: "block" }} />
                        ) : (
                          <div style={{ width: "100%", height: "130px", background: "linear-gradient(135deg, #e2e8f0, #f1f5f9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Image size={32} color="#94a3b8" />
                          </div>
                        )}
                        <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.7)", color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                          ₱{lst.pricePerNight?.toLocaleString()}/night
                        </div>
                        <div style={{ padding: "10px 4px 0" }}>
                          <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>{lst.type || "Property"}</div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lst.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}