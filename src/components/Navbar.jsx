import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await signOut();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Log Food", path: "/log" },
    { label: "History", path: "/history" },
    { label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-md border-b border-white/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Home Link */}
        <Link 
          to="/dashboard" 
          className="flex items-center text-decoration-none group"
          onClick={() => setMobileMenuOpen(false)}
          title="HonestBite AI Home"
        >
          <img 
            src="/logo-full.svg" 
            alt="HonestBite AI" 
            className="h-8 sm:h-9 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-200" 
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-2 lg:gap-5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "text-[#1F9E76] bg-[#1F9E76]/10 font-semibold"
                  : "text-[#5B6B65] hover:text-[#10241E] hover:bg-black/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop User Area */}
        {user && (
          <div className="hidden md:flex items-center gap-4">
            <span className="text-xs text-[#5B6B65] font-medium max-w-[180px] truncate" title={user.email}>
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-xs font-semibold text-[#e05d38] bg-[#FF8F6B]/15 border border-[#FF8F6B]/30 rounded-full hover:bg-[#FF8F6B]/25 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#10241E] hover:bg-black/5 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/60 bg-white/90 backdrop-blur-lg px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-base font-medium transition-all ${
                  isActive(item.path)
                    ? "text-[#1F9E76] bg-[#1F9E76]/10 font-semibold"
                    : "text-[#10241E] hover:bg-black/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {user && (
            <div className="pt-3 border-t border-black/5 flex flex-col space-y-3">
              <div className="px-3 text-xs text-[#5B6B65] font-medium truncate">
                Signed in as: <span className="text-[#10241E] font-semibold">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 text-sm font-semibold text-[#e05d38] bg-[#FF8F6B]/15 border border-[#FF8F6B]/30 rounded-xl hover:bg-[#FF8F6B]/25 transition-all text-center cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}