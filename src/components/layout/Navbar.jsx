import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaCog,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = ({ userName = "User" }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const dropdownRef = useRef(null);

  // Close dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load profile data khi mở modal
  useEffect(() => {
    if (showProfileModal) {
      setProfileData({
        name: localStorage.getItem("userName") || "",
        email: localStorage.getItem("userEmail") || "",
      });
    }
  }, [showProfileModal]);

  const handleOpenProfileModal = () => {
    setShowProfileDropdown(false);
    setShowProfileModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!profileData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!profileData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsUpdating(true);

    try {
      const userId = localStorage.getItem("userId");
      const idToken = localStorage.getItem("id_token");
      const API_URL = `${import.meta.env.VITE_API_BASE_URL}/profile-update`;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId: userId,
          updates: {
            name: profileData.name,
            email: profileData.email,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage
        localStorage.setItem("userName", profileData.name);
        localStorage.setItem("userEmail", profileData.email);

        // Close modal and refresh page
        setShowProfileModal(false);
        window.location.reload();
      } else {
        setErrors({ general: data.body || "Failed to update profile" });
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setErrors({ general: "Failed to update profile. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

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

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-all"
                style={{
                  color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                }}
              >
                <FaUserCircle className="text-xl" />
                <span
                  className="font-medium truncate max-w-[150px]"
                  title={userName}
                >
                  {userName}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-50 overflow-hidden"
                  style={{
                    backgroundColor: isDark
                      ? "rgb(31, 41, 55)"
                      : "rgb(255, 255, 255)",
                    border: isDark
                      ? "1px solid rgb(75, 85, 99)"
                      : "1px solid rgb(229, 231, 235)",
                  }}
                >
                  <div className="py-2">
                    <button
                      onClick={handleOpenProfileModal}
                      className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      <FaCog />
                      <span>Manage account</span>
                    </button>
                    <div
                      className="my-1 border-t"
                      style={{
                        borderColor: isDark
                          ? "rgb(75, 85, 99)"
                          : "rgb(229, 231, 235)",
                      }}
                    />
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 transition-colors text-red-600"
                    >
                      <FaSignOutAlt />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
        >
          <div
            className="rounded-xl shadow-2xl max-w-md w-full transition-colors duration-300"
            style={{
              backgroundColor: isDark
                ? "rgb(31, 41, 55)"
                : "rgb(255, 255, 255)",
            }}
          >
            <div className="p-6">
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              >
                Manage Account
              </h2>

              {/* Error Message */}
              {errors.general && (
                <div
                  className="mb-4 p-3 border rounded-lg"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(127, 29, 29, 0.3)"
                      : "rgb(254, 242, 242)",
                    borderColor: isDark
                      ? "rgb(153, 27, 27)"
                      : "rgb(254, 202, 202)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{
                      color: isDark ? "rgb(252, 165, 165)" : "rgb(220, 38, 38)",
                    }}
                  >
                    {errors.general}
                  </p>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => {
                      setProfileData({ ...profileData, name: e.target.value });
                      setErrors({ ...errors, name: "" });
                    }}
                    className="w-full px-4 py-2 rounded-lg border-2 transition-colors duration-300"
                    style={{
                      backgroundColor: isDark
                        ? "rgb(55, 65, 81)"
                        : "rgb(249, 250, 251)",
                      borderColor: errors.name
                        ? "rgb(239, 68, 68)"
                        : isDark
                        ? "rgb(75, 85, 99)"
                        : "rgb(209, 213, 219)",
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                    }}
                    disabled={isUpdating}
                  />
                  {errors.name && (
                    <p
                      className="mt-1 text-sm"
                      style={{
                        color: isDark
                          ? "rgb(252, 165, 165)"
                          : "rgb(239, 68, 68)",
                      }}
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => {
                      setProfileData({ ...profileData, email: e.target.value });
                      setErrors({ ...errors, email: "" });
                    }}
                    className="w-full px-4 py-2 rounded-lg border-2 transition-colors duration-300"
                    style={{
                      backgroundColor: isDark
                        ? "rgb(55, 65, 81)"
                        : "rgb(249, 250, 251)",
                      borderColor: errors.email
                        ? "rgb(239, 68, 68)"
                        : isDark
                        ? "rgb(75, 85, 99)"
                        : "rgb(209, 213, 219)",
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                    }}
                    disabled={isUpdating}
                  />
                  {errors.email && (
                    <p
                      className="mt-1 text-sm"
                      style={{
                        color: isDark
                          ? "rgb(252, 165, 165)"
                          : "rgb(239, 68, 68)",
                      }}
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 rounded-lg border-2 font-semibold transition-colors"
                    style={{
                      borderColor: isDark
                        ? "rgb(75, 85, 99)"
                        : "rgb(209, 213, 219)",
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
