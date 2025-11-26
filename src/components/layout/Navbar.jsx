import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import {
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaCog,
  FaUser,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import Toast from "../common/Toast";
import apiService from "../../services/apiService";

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
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      await apiService.updateUserProfile(userId, {
        name: profileData.name,
        email: profileData.email,
      });

      localStorage.setItem("userName", profileData.name);
      localStorage.setItem("userEmail", profileData.email);

      setShowProfileModal(false);
      setToast({
        show: true,
        message: "Profile updated successfully",
        type: "success",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Update profile error:", error);
      setToast({
        show: true,
        message: "Failed to update profile. Please try again.",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      try {
        await apiService.logout(accessToken);
      } catch (error) {
        console.error("Logout API call failed:", error);
      }
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userGroups");
    localStorage.removeItem("isAuthenticated");

    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        isDark 
            ? "bg-slate-900/80 border-slate-800" 
            : "bg-white/80 border-slate-200"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className={`relative p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <img src="/smart-office-icon.svg" alt="Logo" className="w-6 h-6" />
                </div>
            </div>
            <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600`}>
              SmartOffice
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={`flex items-center gap-3 px-3 py-2 rounded-full border transition-all ${
                    isDark 
                        ? "bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300" 
                        : "bg-white border-slate-200 hover:border-indigo-200 text-slate-700"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    <FaUser size={14} />
                </div>
                <span className="font-medium text-sm max-w-[150px] truncate">
                  {userName}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className={`absolute right-0 mt-2 w-60 rounded-2xl shadow-xl border overflow-hidden animate-fade-in ${
                    isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
                }`}>
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Signed in as</p>
                    <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{userName}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleOpenProfileModal}
                      className={`w-full px-3 py-2 text-left flex items-center gap-3 rounded-lg transition-colors ${
                        isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <FaCog className="text-slate-400" />
                      <span>Manage account</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-3 rounded-lg transition-colors ${
                        isDark ? "hover:bg-red-900/20 text-red-400" : "hover:bg-red-50 text-red-600"
                      }`}
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
              className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className={`md:hidden mt-4 py-4 border-t animate-slide-down ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex flex-col gap-4">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    <FaUser size={16} />
                </div>
                <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{userName}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Logged in</p>
                </div>
              </div>
              
              <button
                onClick={handleOpenProfileModal}
                className={`flex items-center gap-3 px-4 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                <FaCog /> Manage Account
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-lg shadow-red-500/30"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Update Modal */}
      {showProfileModal && createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="p-8">
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Manage Account
              </h2>
              <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Update your personal details</p>

              {/* Error Message */}
              {errors.general && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center justify-center text-sm font-medium ${isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-100 text-red-600'}`}>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => {
                      setProfileData({ ...profileData, name: e.target.value });
                      setErrors({ ...errors, name: "" });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                        errors.name 
                            ? 'border-red-500' 
                            : isDark 
                                ? 'bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white' 
                                : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                    disabled={isUpdating}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => {
                      setProfileData({ ...profileData, email: e.target.value });
                      setErrors({ ...errors, email: "" });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                        errors.email 
                            ? 'border-red-500' 
                            : isDark 
                                ? 'bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white' 
                                : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                    disabled={isUpdating}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    disabled={isUpdating}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                        isDark 
                            ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70"
                  >
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
        duration={3000}
      />
    </header>
  );
};

export default Navbar;
