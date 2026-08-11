import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.navbar}>
      <div style={styles.leftSection}>
        <Link to="/dashboard" style={styles.brandLink}>
          <span style={styles.brandBadge}>HQ</span>
          <span style={styles.brandName}>DOPAMINE</span>
        </Link>

        <div style={styles.navLinksGroup}>
          <Link
            to="/dashboard"
            style={{
              ...styles.navLink,
              ...(isActive("/dashboard") ? styles.activeNavLink : {}),
            }}
          >
            Dashboard
          </Link>

          <Link
            to="/log"
            style={{
              ...styles.navLink,
              ...(isActive("/log") ? styles.activeNavLink : {}),
            }}
          >
            Log Food
          </Link>

          <Link
            to="/history"
            style={{
              ...styles.navLink,
              ...(isActive("/history") ? styles.activeNavLink : {}),
            }}
          >
            History
          </Link>

          <Link
            to="/profile"
            style={{
              ...styles.navLink,
              ...(isActive("/profile") ? styles.activeNavLink : {}),
            }}
          >
            Profile
          </Link>
        </div>
      </div>

      {user && (
        <div style={styles.rightSection}>
          <span style={styles.userEmail}>{user.email}</span>

          <button onClick={handleLogout} style={styles.signOutBtn}>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 28px",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.85)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 4px 20px rgba(16, 36, 30, 0.03)",
  },
  leftSection: {
    display: "flex",
    gap: "32px",
    alignItems: "center",
  },
  brandLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
  },
  brandBadge: {
    backgroundColor: "#1F9E76",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "12px",
    padding: "3px 7px",
    borderRadius: "6px",
  },
  brandName: {
    fontFamily: "var(--font-display)",
    fontSize: "19px",
    fontWeight: "700",
    color: "#10241E",
    letterSpacing: "-0.5px",
  },
  navLinksGroup: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  navLink: {
    color: "#5B6B65",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    padding: "6px 12px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
  },
  activeNavLink: {
    color: "#1F9E76",
    backgroundColor: "rgba(31, 158, 118, 0.1)",
    fontWeight: "600",
  },
  rightSection: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  userEmail: {
    fontSize: "13px",
    color: "#5B6B65",
    fontWeight: "500",
  },
  signOutBtn: {
    padding: "8px 16px",
    backgroundColor: "rgba(255, 143, 107, 0.15)",
    color: "#e05d38",
    border: "1px solid rgba(255, 143, 107, 0.3)",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "all 0.2s ease",
  },
};