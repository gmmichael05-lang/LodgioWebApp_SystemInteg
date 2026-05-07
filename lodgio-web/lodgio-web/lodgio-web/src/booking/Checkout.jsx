const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Lock, CreditCard, Shield, Check, AlertCircle } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "JCB", label: "JCB", color: "#1e3a8a", bg: "#1e3a8a" },
  { id: "Mastercard", label: "Mastercard", color: "#dc2626", bg: "#fff" },
  { id: "AMEX", label: "AMEX", color: "#1d4ed8", bg: "#1d4ed8" },
  { id: "Diners Club", label: "Diners Club", color: "#1e40af", bg: "#fff" },
];

// Card brand logo components
const CardBrandLogo = ({ brand, size = "normal" }) => {
  const s = size === "small" ? { w: 38, h: 24, fs: 8 } : { w: 52, h: 32, fs: 10 };
  const styles = {
    VISA: { background: "linear-gradient(135deg, #1a1f71, #2d3ab5)", color: "#fff", fontStyle: "italic", fontWeight: 900, letterSpacing: "1px" },
    Mastercard: { background: "linear-gradient(135deg, #eb001b, #f79e1b)", color: "#fff", fontWeight: 800, letterSpacing: "0.3px" },
    JCB: { background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#fff", fontWeight: 800, fontStyle: "italic" },
    AMEX: { background: "linear-gradient(135deg, #006fcf, #00aaff)", color: "#fff", fontWeight: 900, letterSpacing: "0.5px" },
    "Diners Club": { background: "linear-gradient(135deg, #0066b2, #0088e0)", color: "#fff", fontWeight: 700 },
    Card: { background: "#64748b", color: "#fff", fontWeight: 700 },
  };
  const st = styles[brand] || styles.Card;
  return (
    <div style={{
      width: `${s.w}px`, height: `${s.h}px`, borderRadius: "6px",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: `${s.fs}px`, ...st, flexShrink: 0
    }}>
      {brand === "Mastercard" ? "●●" : brand?.toUpperCase() || "CARD"}
    </div>
  );
};

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const messageToHost = searchParams.get("msg") || "";

  const [listing, setListing] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("Mastercard");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState(null);
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
      setCardName(userData.fullname || "");
      // Load saved cards from backend
      if (userData.savedCards) {
        try {
          const cards = JSON.parse(userData.savedCards);
          setSavedCards(cards);
        } catch { setSavedCards([]); }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, navigate]);

  const formatCardNum = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.match(/.{1,4}/g)?.join(" ") || digits;
  };
  const formatExp = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const nights = (checkIn && checkOut) ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 1;

  const handleSelectSavedCard = (card) => {
    if (selectedSavedCard?.id === card.id) {
      setSelectedSavedCard(null); // deselect
    } else {
      setSelectedSavedCard(card);
      setCardName(card.holder);
      setCardNumber(""); setExpiry(""); setCvc(""); // Clear manual entry
    }
  };

  const handleConfirmPayment = async () => {
    setValidationError("");

    // Validate card details if no saved card selected
    if (!selectedSavedCard) {
      if (!cardName.trim()) { setValidationError("Cardholder name is required."); return; }
      const rawNum = cardNumber.replace(/\s/g, "");
      if (rawNum.length < 13) { setValidationError("Please enter a valid card number."); return; }
      if (!expiry.includes("/") || expiry.length < 5) { setValidationError("Please enter a valid expiry date (MM/YY)."); return; }
      if (cvc.length < 3) { setValidationError("Please enter a valid CVC code."); return; }
    }

    setIsProcessing(true);
    const basePrice = listing.pricePerNight * nights;
    const totalPrice = basePrice + 1320 + 1760;

    // If saving card, persist to backend
    if (saveCard && !selectedSavedCard && user) {
      const rawNum = cardNumber.replace(/\s/g, "");
      const brand = rawNum.startsWith("4") ? "VISA" : rawNum.startsWith("5") ? "Mastercard" : rawNum.startsWith("3528") || rawNum.startsWith("3589") ? "JCB" : rawNum.startsWith("3") ? "AMEX" : rawNum.startsWith("36") || rawNum.startsWith("38") ? "Diners Club" : "Card";
      const newCard = { id: Date.now(), brand, last4: rawNum.slice(-4), holder: cardName, expiry };
      const updatedCards = [...savedCards, newCard];
      try {
        await fetch(`${API}/users/${user.id}/cards`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCards)
        });
      } catch (e) { console.error(e); }
    }

    const bookingPayload = {
      guest: { id: user.id },
      listing: { id: listing.id },
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice,
      messageToHost,
      paymentMethod: selectedSavedCard ? selectedSavedCard.brand : paymentMethod,
      status: "PENDING"
    };
    try {
      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload)
      });
      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => navigate("/profile"), 2500);
      } else {
        const errText = await res.text().catch(() => "");
        if (errText.includes("conflict") || res.status === 400) {
          setValidationError("These dates are already booked. Please choose different dates.");
        } else {
          setValidationError("Payment failed. Please try again.");
        }
      }
    } catch (e) {
      setValidationError("Network error. Please check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !listing) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px", color: "#64748b" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTop: "3px solid #0ea5e9", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      Loading checkout…
    </div>
  );

  const totalPrice = (listing.pricePerNight * nights) + 1320 + 1760;
  const inputStyle = { width: "100%", padding: "12px 16px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" };
  const onFocus = (e) => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; };
  const onBlur = (e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

  // Success overlay
  if (isSuccess) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", animation: "fadeIn 0.4s ease both" }}>
      <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #4ade80)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", boxShadow: "0 8px 24px rgba(34,197,94,0.35)" }}>
        <Check size={36} color="#fff" strokeWidth={3} />
      </div>
      <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Payment Successful!</h2>
      <p style={{ color: "#64748b", fontSize: "15px", marginBottom: "8px" }}>Your booking request has been sent to the host.</p>
      <p style={{ color: "#94a3b8", fontSize: "13px" }}>Redirecting to your profile…</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px", animation: "fadeIn 0.4s ease both" }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px", fontWeight: 600, padding: "8px 0", marginBottom: "16px" }}>
            <ArrowLeft size={16} /> Back
          </button>
          {/* Progress: Step 2 */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            {["Trip Details", "Payment"].map((step, i) => (
              <React.Fragment key={step}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: i === 1 ? "#0ea5e9" : "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff" }}>
                    {i === 0 ? <Check size={14} /> : "2"}
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{step}</span>
                </div>
                {i < 1 && <div style={{ flex: 1, height: "2px", background: "#22c55e", maxWidth: "60px" }} />}
              </React.Fragment>
            ))}
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>Complete Payment</h1>
        </div>

        {/* Amount Banner */}
        <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: "20px", padding: "28px 32px", marginBottom: "24px", animation: "slideUp 0.4s ease 0.1s both" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.8px", marginBottom: "6px" }}>Total Amount Due</div>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>₱{totalPrice.toLocaleString()}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginTop: "4px" }}>{listing.title} · {nights} night{nights !== 1 ? "s" : ""}</div>
        </div>

        {validationError && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", color: "#991b1b", padding: "14px 16px", borderRadius: "12px", marginBottom: "16px", fontSize: "14px", fontWeight: 500 }}>
            <AlertCircle size={18} /> {validationError}
          </div>
        )}

        {/* Saved Cards Section */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", marginBottom: "16px", animation: "slideUp 0.4s ease 0.15s both" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CreditCard size={18} color="#0ea5e9" /> Saved Cards
          </h3>
          {savedCards.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>No saved cards. You can save a card after entering details below.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {savedCards.map(card => {
                const isActive = selectedSavedCard?.id === card.id;
                return (
                  <div key={card.id} onClick={() => handleSelectSavedCard(card)}
                    style={{
                      display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px",
                      background: isActive ? "#f0f9ff" : "#f8fafc", borderRadius: "12px",
                      border: isActive ? "2px solid #0ea5e9" : "1px solid #e2e8f0",
                      cursor: "pointer", transition: "all 0.2s", position: "relative"
                    }}>
                    {isActive && (
                      <div style={{ position: "absolute", top: "8px", right: "8px", background: "#0ea5e9", borderRadius: "50%", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={10} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                    <CardBrandLogo brand={card.brand} size="small" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>•••• •••• •••• {card.last4}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{card.holder} · Expires {card.expiry}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Method */}
        {!selectedSavedCard && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", marginBottom: "16px", animation: "slideUp 0.4s ease 0.2s both" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "14px" }}>Payment Method</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {PAYMENT_METHODS.map(pm => {
                const active = paymentMethod === pm.id;
                return (
                  <button key={pm.id} type="button" onClick={() => setPaymentMethod(pm.id)}
                    style={{ padding: "14px", borderRadius: "12px", border: active ? "2px solid #0ea5e9" : "1.5px solid #e2e8f0", background: active ? "#f0f9ff" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s", position: "relative" }}>
                    {active && <div style={{ position: "absolute", top: "6px", right: "6px", background: "#0ea5e9", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={10} color="#fff" strokeWidth={3} /></div>}
                    <CardBrandLogo brand={pm.id} size="small" />
                    <span style={{ fontWeight: 700, color: pm.color, fontSize: "14px" }}>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Card Details */}
        {!selectedSavedCard && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", marginBottom: "16px", animation: "slideUp 0.4s ease 0.25s both" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Lock size={18} color="#0ea5e9" /> Card Details <span style={{ color: "#ef4444", fontSize: "14px" }}>*</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name on card" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNum(e.target.value))} placeholder="1234 5678 9012 3456" style={inputStyle} onFocus={onFocus} onBlur={onBlur} maxLength={19} />
              <div style={{ display: "flex", gap: "12px" }}>
                <input type="text" value={expiry} onChange={e => setExpiry(formatExp(e.target.value))} placeholder="MM/YY" style={{ ...inputStyle, flex: 1 }} onFocus={onFocus} onBlur={onBlur} maxLength={5} />
                <input type="text" value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="CVC" style={{ ...inputStyle, flex: 1 }} onFocus={onFocus} onBlur={onBlur} maxLength={4} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", color: "#475569", padding: "4px 0" }}>
                <input type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} style={{ accentColor: "#0ea5e9", width: "16px", height: "16px" }} />
                Save this card for future bookings
              </label>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "slideUp 0.4s ease 0.35s both" }}>
          <button onClick={handleConfirmPayment} disabled={isProcessing}
            style={{ width: "100%", padding: "18px", background: isProcessing ? "#bae6fd" : "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: isProcessing ? "not-allowed" : "pointer", boxShadow: isProcessing ? "none" : "0 4px 14px rgba(14,165,233,0.3)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {isProcessing ? (
              <><div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Processing…</>
            ) : (
              <><Shield size={18} /> Confirm & Pay ₱{totalPrice.toLocaleString()}</>
            )}
          </button>
          <button onClick={() => navigate(-1)}
            style={{ width: "100%", padding: "14px", background: "#fff", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#0ea5e9"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
            Cancel
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "20px", color: "#94a3b8", fontSize: "13px" }}>
          <Lock size={14} /> Secured by 256-bit SSL encryption
        </div>
      </div>
    </div>
  );
}
