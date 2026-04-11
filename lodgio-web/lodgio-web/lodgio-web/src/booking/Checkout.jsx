const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Lock, CreditCard, Shield, Check } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "JCB", label: "JCB", color: "#1e3a8a" },
  { id: "Mastercard", label: "Mastercard", color: "#dc2626" },
  { id: "Amex", label: "AMEX", color: "#1d4ed8" },
  { id: "Diners Club", label: "Diners Club", color: "#1e40af" },
];

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
  const [discountCode, setDiscountCode] = useState("");

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
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, navigate]);

  const nights = (checkIn && checkOut) ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 1;

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    const basePrice = listing.pricePerNight * nights;
    const totalPrice = basePrice + 1320 + 1760;
    const bookingPayload = {
      guest: { id: user.id },
      listing: { id: listing.id },
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice,
      messageToHost,
      paymentMethod,
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
        alert("Payment failed. Please try again.");
      }
    } catch (e) {
      alert("Network error.");
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

        {/* Saved Card Section - empty state */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", marginBottom: "16px", animation: "slideUp 0.4s ease 0.15s both" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CreditCard size={18} color="#0ea5e9" /> Saved Cards
          </h3>
          <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>No saved cards. You can save a card after entering details below.</p>
        </div>

        {/* Payment Method */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", marginBottom: "16px", animation: "slideUp 0.4s ease 0.2s both" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "14px" }}>Payment Method</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {PAYMENT_METHODS.map(pm => {
              const active = paymentMethod === pm.id;
              return (
                <button key={pm.id} type="button" onClick={() => setPaymentMethod(pm.id)}
                  style={{ padding: "14px", borderRadius: "12px", border: active ? "2px solid #0ea5e9" : "1.5px solid #e2e8f0", background: active ? "#f0f9ff" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", position: "relative" }}>
                  {active && <div style={{ position: "absolute", top: "6px", right: "6px", background: "#0ea5e9", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={10} color="#fff" strokeWidth={3} /></div>}
                  <span style={{ fontWeight: 800, color: pm.color, fontStyle: pm.id === "JCB" ? "italic" : "normal", fontSize: "15px" }}>{pm.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Details */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", marginBottom: "16px", animation: "slideUp 0.4s ease 0.25s both" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock size={18} color="#0ea5e9" /> Card Details
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name on card" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" style={inputStyle} onFocus={onFocus} onBlur={onBlur} maxLength={19} />
            <div style={{ display: "flex", gap: "12px" }}>
              <input type="text" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" style={{ ...inputStyle, flex: 1 }} onFocus={onFocus} onBlur={onBlur} maxLength={5} />
              <input type="text" value={cvc} onChange={e => setCvc(e.target.value)} placeholder="CVC" style={{ ...inputStyle, flex: 1 }} onFocus={onFocus} onBlur={onBlur} maxLength={4} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", color: "#475569", padding: "4px 0" }}>
              <input type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} style={{ accentColor: "#0ea5e9", width: "16px", height: "16px" }} />
              Save this card for future bookings
            </label>
          </div>
        </div>

        {/* Discount Code */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", marginBottom: "24px", animation: "slideUp 0.4s ease 0.3s both" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>Discount Code</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="text" value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="Enter promo code" style={{ ...inputStyle, flex: 1 }} onFocus={onFocus} onBlur={onBlur} />
            <button style={{ padding: "12px 20px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "14px", transition: "background 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => e.target.style.background = "#0ea5e9"}
              onMouseLeave={e => e.target.style.background = "#0f172a"}>
              Apply
            </button>
          </div>
        </div>

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
