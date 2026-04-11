import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Search, UserRound, LogOut } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hide the search bar on these specific pages
  const hideSearchBar = ["/login", "/register", "/profile", "/host-dashboard", "/guest-dashboard"].includes(location.pathname);

  useEffect(() => {
    const syncUser = () => {
      try {
        const raw = window.localStorage.getItem("lodgio_user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch { setUser(null); }
    };
    syncUser();
    window.addEventListener("lodgio-auth", syncUser);
    return () => window.removeEventListener("lodgio-auth", syncUser);
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem("lodgio_user");
    window.dispatchEvent(new Event("lodgio-auth"));
    navigate("/login");
  };

  const isHost = user?.role === "HOST";

  return (
    <header className="header">
      <div className="container navbar">
        <Link to={user ? (isHost ? "/host-dashboard" : "/guest-dashboard") : "/login"} className="brand" style={{textDecoration: "none", fontSize: "24px", fontWeight: 800, color: "#0ea5e9"}}>
          LODGIO
        </Link>

        {!hideSearchBar && (
          <div className="search-box">
            <Search size={18} className="search-icon" color="#94a3b8" />
            <input 
              className="search-input" 
              placeholder="Search destinations..." 
              disabled
            />
          </div>
        )}

        <div className="nav-actions">
          {user ? (
            <>
              {/* MODIFIED: Changed div to Link and added textDecoration: "none" */}
              <Link to="/profile" className="profile-btn" title="My Profile" style={{display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "#f1f5f9", color: "#64748b", textDecoration: "none"}}>
                <UserRound size={20} />
              </Link>

              <button type="button" className="btn-logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn-signin">
              <UserRound size={18} /> Sign in
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}