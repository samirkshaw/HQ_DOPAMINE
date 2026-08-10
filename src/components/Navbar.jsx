import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        backgroundColor: "#1e293b",
        borderBottom: "1px solid #334155",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            color: "#38bdf8",
            fontSize: "18px",
          }}
        >
          HQ DOPAMINE
        </span>

        <Link
          to="/"
          style={{
            color: "#cbd5e1",
            textDecoration: "none",
          }}
        >
          Home
        </Link>

        <Link
          to="/dashboard"
          style={{
            color: "#cbd5e1",
            textDecoration: "none",
          }}
        >
          Dashboard
        </Link>

        <Link
          to="/log"
          style={{
            color: "#cbd5e1",
            textDecoration: "none",
          }}
        >
          Log Food
        </Link>
      </div>

      {user && (
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              color: "#94a3b8",
            }}
          >
            {user.email}
          </span>

          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}