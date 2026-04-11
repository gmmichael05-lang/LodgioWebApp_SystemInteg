import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import Login from "./auth/Login";
import Register from "./auth/Register";
import HostDashboard from "./listing/HostDashboard";
import GuestDashboard from "./listing/GuestDashboard";
import Profile from "./user/Profile";
import AdminDashboard from "./admin/AdminDashboard";
import ListingDetails from "./listing/ListingDetails";
import CreateListing from "./listing/CreateListing";
import ConfirmAndPay from "./booking/ConfirmAndPay";
import Checkout from "./booking/Checkout";

export default function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Restored your original Navigate logic */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/host-dashboard" element={<HostDashboard />} />
          <Route path="/guest-dashboard" element={<GuestDashboard />} />

          {/* -- ADDED ROUTE -- */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/booking/:id/confirm" element={<ConfirmAndPay />} />
          <Route path="/booking/:id/checkout" element={<Checkout />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}