import { useState } from "react";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/layout/ThemeToggle";
import apiService from "../services/apiService";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [selectedRole, setSelectedRole] = useState(""); // "admin" or "manager"
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // For NEW_PASSWORD_REQUIRED challenge
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [challengeSession, setChallengeSession] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowLoginForm(true);
    setErrors({});
  };

  const handleBackToRoleSelection = () => {
    setShowLoginForm(false);
    setSelectedRole("");
    setFormData({
      companyName: "",
      email: "",
      password: "",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setErrors({});
      try {
        const loginResult = await apiService.login(
          formData.email,
          formData.password,
          formData.companyName
        );

        // Check if challenge is required (NEW_PASSWORD_REQUIRED)
        if (loginResult.challengeName === "NEW_PASSWORD_REQUIRED") {
          setChallengeSession(loginResult.session);
          setShowChangePassword(true);
          setIsLoading(false);
          return;
        }

        const idTokenData = parseJwt(loginResult.id_token);
        const userGroups = idTokenData["cognito:groups"] || [];
        const userInfo = loginResult.user || {};

        // Check if backend role matches selected role
        if (selectedRole === "admin") {
          // User selected Admin role
          if (userInfo.role === "admin") {
            // Save to localStorage with admin role
            localStorage.setItem("access_token", loginResult.access_token);
            localStorage.setItem("id_token", loginResult.id_token);
            localStorage.setItem("refresh_token", loginResult.refresh_token);
            localStorage.setItem("userId", userInfo.userId || "");
            localStorage.setItem("userEmail", userInfo.email || "");
            localStorage.setItem("userName", userInfo.name || "");
            localStorage.setItem("userRole", "admin"); // Use selected role
            localStorage.setItem("officeId", userInfo.officeId || "");
            localStorage.setItem("orgAlias", userInfo.orgAlias || "");
            localStorage.setItem("userGroups", JSON.stringify(userGroups));
            localStorage.setItem("isAuthenticated", "true");

            navigate("/admin");
          } else {
            setErrors({
              general: "You do not have admin privileges for this account.",
            });
          }
        } else if (selectedRole === "manager") {
          // User selected Manager role
          // Check if user has Manager group AND has assigned office
          const hasManagerGroup = userGroups.includes("Manager");

          if (!hasManagerGroup) {
            setErrors({
              general: "You do not have manager privileges for this account.",
            });
          } else if (!userInfo.hasOffice || !userInfo.officeId) {
            setErrors({
              general:
                "No office assigned yet. Please contact your administrator.",
            });
          } else {
            // Save to localStorage with manager role
            localStorage.setItem("access_token", loginResult.access_token);
            localStorage.setItem("id_token", loginResult.id_token);
            localStorage.setItem("refresh_token", loginResult.refresh_token);
            localStorage.setItem("userId", userInfo.userId || "");
            localStorage.setItem("userEmail", userInfo.email || "");
            localStorage.setItem("userName", userInfo.name || "");
            localStorage.setItem("userRole", "manager");
            localStorage.setItem("officeId", userInfo.officeId || "");
            localStorage.setItem("orgAlias", userInfo.orgAlias || "");
            localStorage.setItem("userGroups", JSON.stringify(userGroups));
            localStorage.setItem("isAuthenticated", "true");

            navigate("/dashboard");
          }
        } else {
          setErrors({
            general: "Please select a role to login.",
          });
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrors({
          general: error.message || "Login failed. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      setErrors({ newPassword: "Password must be at least 8 characters" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await apiService.changeTemporaryPassword(
        formData.email,
        newPassword,
        challengeSession
      );

      // Password changed successfully, now complete login
      const idTokenData = parseJwt(result.id_token);
      const userGroups = idTokenData["cognito:groups"] || [];
      const userInfo = result.user || {};

      // Save to localStorage based on selected role
      if (selectedRole === "admin") {
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("id_token", result.id_token);
        localStorage.setItem("refresh_token", result.refresh_token);
        localStorage.setItem("userId", userInfo.userId || "");
        localStorage.setItem("userEmail", userInfo.email || "");
        localStorage.setItem("userName", userInfo.name || "");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("officeId", userInfo.officeId || "");
        localStorage.setItem("orgAlias", formData.companyName || "");
        localStorage.setItem("userGroups", JSON.stringify(userGroups));
        localStorage.setItem("isAuthenticated", "true");
        navigate("/admin");
      } else {
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("id_token", result.id_token);
        localStorage.setItem("refresh_token", result.refresh_token);
        localStorage.setItem("userId", userInfo.userId || "");
        localStorage.setItem("userEmail", userInfo.email || "");
        localStorage.setItem("userName", userInfo.name || "");
        localStorage.setItem("userRole", "manager");
        localStorage.setItem("officeId", userInfo.officeId || "");
        localStorage.setItem("orgAlias", formData.companyName || "");
        localStorage.setItem("userGroups", JSON.stringify(userGroups));
        localStorage.setItem("isAuthenticated", "true");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Change password error:", error);
      setErrors({
        general:
          error.message || "Failed to change password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden ${
        isDark ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div
          className={`absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-3xl ${
            isDark ? "bg-indigo-900/20" : "bg-indigo-100/50"
          }`}
        ></div>
        <div
          className={`absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl ${
            isDark ? "bg-violet-900/20" : "bg-violet-100/50"
          }`}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaArrowLeft /> Back to Home
          </Link>
          <ThemeToggle />
        </div>

        {/* Login Card */}
        <div
          className={`rounded-3xl shadow-2xl p-8 md:p-10 backdrop-blur-xl border transition-all duration-300 ${
            isDark
              ? "bg-slate-800/50 border-slate-700"
              : "bg-white/70 border-white/50"
          }`}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <img
                src="/smart-office-icon.svg"
                alt="Logo"
                className="w-10 h-10 brightness-0 invert"
              />
            </div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Welcome Back
            </h1>
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div
              className={`mb-6 p-4 rounded-xl border flex items-center justify-center text-sm font-medium ${
                isDark
                  ? "bg-red-900/20 border-red-800 text-red-300"
                  : "bg-red-50 border-red-100 text-red-600"
              }`}
            >
              {errors.general}
            </div>
          )}

          {/* Role Selection or Login Form */}
          {!showLoginForm ? (
            /* Role Selection */
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2
                  className={`text-xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Select Login Role
                </h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Choose your role to continue
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Admin Login Button */}
                <button
                  onClick={() => handleRoleSelect("admin")}
                  className={`group p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-[1.02] ${
                    isDark
                      ? "bg-slate-900/50 border-indigo-600 hover:bg-indigo-900/30 hover:border-indigo-500"
                      : "bg-white border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      A
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg mb-1 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Login as Admin
                      </h3>
                      <p
                        className={`text-sm ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Manage offices, rooms, and users
                      </p>
                    </div>
                    <svg
                      className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Manager Login Button */}
                <button
                  onClick={() => handleRoleSelect("manager")}
                  className={`group p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-[1.02] ${
                    isDark
                      ? "bg-slate-900/50 border-emerald-600 hover:bg-emerald-900/30 hover:border-emerald-500"
                      : "bg-white border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      M
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg mb-1 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Login as Manager
                      </h3>
                      <p
                        className={`text-sm ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Access your office dashboard
                      </p>
                    </div>
                    <svg
                      className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Company Name Field */}
              <div>
                <label
                  htmlFor="companyName"
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 ${
                    errors.companyName
                      ? "border-red-500 focus:border-red-500"
                      : isDark
                      ? "bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500"
                      : "bg-white border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder="Enter your company name"
                  disabled={isLoading}
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-500 font-medium">
                    {errors.companyName}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : isDark
                      ? "bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500"
                      : "bg-white border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder="name@company.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 pr-12 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : isDark
                        ? "bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500"
                        : "bg-white border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                      isDark
                        ? "text-slate-500 hover:text-slate-300"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={handleBackToRoleSelection}
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                ← Back to Role Selection
              </button>
            </form>
          )}

          {/* Change Password Form (NEW_PASSWORD_REQUIRED) */}
          {showChangePassword && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="text-center mb-6">
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Change Your Password
                </h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  You must change your temporary password before continuing
                </p>
              </div>

              {/* New Password */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                      isDark
                        ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                        : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    } ${errors.newPassword ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                      : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  } ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {errors.general && (
                <div
                  className={`p-4 rounded-xl ${
                    isDark
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p className="text-red-500 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Changing Password...
                  </span>
                ) : (
                  "Change Password & Continue"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          className={`mt-8 text-center text-sm ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}
        >
          <p>&copy; {new Date().getFullYear()} SmartOffice IoT Solutions.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
