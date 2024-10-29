import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { withAuthContext } from "../../context/Auth";
import { withCartContext } from "../../context/Cart";
import { withWishlistContext } from "../../context/Wishlist";
import { withCompareContext } from "../../context/Compare";
import VehicleSelector from "../VehicleSelector";
import Logo from "../../assets/TorqueHubLogo.svg";
import "./index.css";
import {
  FaShoppingCart,
  FaHeart,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaSearch,
  FaBalanceScale,
} from "react-icons/fa";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/Category" },
  { label: "About", path: "/About" },
];

function Header({ Token, setToken, currUser, MenuOpen, setMenuOpen, Cart, Wishlist, Compare }) {
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);

  const cartCount = Cart?.length || 0;
  const wishlistCount = Wishlist?.length || 0;
  const compareCount = Compare?.length || 0;

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  // Debounced: waits for the user to pause typing before navigating, so
  // Category.js's search fetch doesn't fire on every keystroke.
  useEffect(() => {
    if (!searchOpen) return undefined;
    const timeout = setTimeout(() => {
      if (searchTerm.trim()) {
        navigate(`/Category?q=${encodeURIComponent(searchTerm.trim())}`);
      }
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken && setToken("");
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-[9999] w-full bg-white/95 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={Logo} alt="TorqueHub" className="h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="header-link text-[15px] text-[#1d1d1f] font-medium hover:text-[#f97316] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <VehicleSelector />
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Search */}
          <div className="relative hidden md:flex items-center">
            {searchOpen ? (
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchTerm.trim()) {
                    navigate(`/Category?q=${encodeURIComponent(searchTerm.trim())}`);
                  }
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                    setSearchTerm("");
                  }
                }}
                onBlur={() => {
                  if (!searchTerm.trim()) setSearchOpen(false);
                }}
                placeholder="Search parts..."
                className="w-48 lg:w-64 px-4 py-2 text-sm border border-[#d2d2d7] rounded-full outline-none focus:border-[#f97316] transition-colors"
              />
            ) : (
              <FaSearch
                className="w-5 h-5 cursor-pointer text-gray-700 hover:text-[#c2410c] transition-colors"
                onClick={() => setSearchOpen(true)}
              />
            )}
          </div>

          <div
            className="relative cursor-pointer text-gray-700 hover:text-[#c2410c] transition-colors"
            onClick={() => navigate("/Compare")}
          >
            <FaBalanceScale className="w-5 h-5 md:w-6 md:h-6" />
            {compareCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#c2410c] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {compareCount}
              </span>
            )}
          </div>

          <div
            className="relative cursor-pointer text-gray-700 hover:text-[#c2410c] transition-colors"
            onClick={() => navigate("/Wishlist")}
          >
            <FaHeart className="w-5 h-5 md:w-6 md:h-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#c2410c] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>

          <div
            className="relative cursor-pointer text-gray-700 hover:text-[#c2410c] transition-colors"
            onClick={() => navigate("/Cart")}
          >
            <FaShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#c2410c] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>

          {/* Account */}
          <div className="relative hidden md:block">
            {Token || localStorage.getItem("token") ? (
              <>
                <div
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-[#c2410c] transition-colors"
                >
                  <FaUserCircle className="w-6 h-6" />
                  <span className="text-sm font-semibold max-w-[100px] truncate">
                    {currUser?.name || "Account"}
                  </span>
                </div>
                {accountOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/Profile");
                      }}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-[#fff7ed] cursor-pointer"
                    >
                      My Profile
                    </div>
                    <div
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/OrderHistory");
                      }}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-[#fff7ed] cursor-pointer"
                    >
                      Order History
                    </div>
                    <div
                      onClick={logout}
                      className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer flex items-center gap-2"
                    >
                      <FaSignOutAlt className="w-3 h-3" /> Log Out
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate("/SignIn")}
                className="px-5 py-2 bg-[#1d1d1f] hover:bg-black text-white text-sm font-medium rounded-full transition-colors duration-200"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-700 text-2xl"
            onClick={() => setMenuOpen(!MenuOpen)}
          >
            {MenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {MenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchTerm.trim()) {
                setMenuOpen(false);
                navigate(`/Category?q=${encodeURIComponent(searchTerm.trim())}`);
              }
            }}
            placeholder="Search parts..."
            className="w-full px-4 py-2.5 text-sm border border-[#d2d2d7] rounded-full outline-none focus:border-[#f97316] transition-colors"
          />
          <VehicleSelector />
          <Link
            to="/Compare"
            onClick={() => setMenuOpen(false)}
            className="text-gray-700 font-semibold text-sm uppercase tracking-wide"
          >
            Compare{compareCount > 0 ? ` (${compareCount})` : ""}
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className="text-gray-700 font-semibold text-sm uppercase tracking-wide"
            >
              {link.label}
            </Link>
          ))}
          {Token || localStorage.getItem("token") ? (
            <>
              <Link to="/Profile" onClick={() => setMenuOpen(false)} className="text-gray-700 font-semibold text-sm">My Profile</Link>
              <Link to="/OrderHistory" onClick={() => setMenuOpen(false)} className="text-gray-700 font-semibold text-sm">Order History</Link>
              <button onClick={logout} className="text-left text-red-500 font-semibold text-sm">Log Out</button>
            </>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/SignIn");
              }}
              className="px-5 py-2 bg-[#1d1d1f] text-white text-sm font-medium rounded-full w-fit"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default withCompareContext(withWishlistContext(withCartContext(withAuthContext(Header))));
