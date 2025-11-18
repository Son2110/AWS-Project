import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = ({ userName = "User" }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const idToken = localStorage.getItem("id_token");
    const accessToken = localStorage.getItem("access_token");
    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/logout`;

    if (idToken && accessToken) {
      try {
        await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: accessToken,
          }),
        });
      } catch (error) {
        console.error("Logout API call failed:", error);
      }
    }

    // Xóa tất cả tokens khỏi localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userGroups");
    localStorage.removeItem("isAuthenticated");

    // Điều hướng về login
    navigate("/");
  };

  return (
    <header
      className="shadow-md transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "rgb(31, 41, 55)" : "rgb(255, 255, 255)",
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="p-1.5 sm:p-2 rounded-lg transition-colors duration-300"
              style={{
                backgroundColor: isDark
                  ? "rgb(30, 58, 138)"
                  : "rgb(219, 234, 254)",
              }}
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(147, 197, 253)" : "rgb(37, 99, 235)",
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1
              className="text-lg sm:text-2xl font-bold transition-colors duration-300"
              style={{
                color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
              }}
            >
              Smart Office
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <ThemeToggle />
            <span
              className="font-medium transition-colors duration-300 truncate max-w-[150px]"
              style={{
                color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
              }}
              title={userName}
            >
              {userName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm lg:text-base"
            >
              <FaSignOutAlt />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
              }}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden mt-4 py-4 border-t transition-colors duration-300"
            style={{
              borderColor: isDark ? "rgb(75, 85, 99)" : "rgb(229, 231, 235)",
            }}
          >
            <div className="flex flex-col gap-4">
              <div
                className="px-4 py-2 rounded-lg transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgb(55, 65, 81)"
                    : "rgb(243, 244, 246)",
                  color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                }}
              >
                <span className="font-medium">{userName}</span>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
