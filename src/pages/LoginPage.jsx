import { useState } from "react";
import { FaEye, FaEyeSlash, FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
      const API_URL = `${import.meta.env.VITE_API_BASE_URL}/login`;
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.email,
            password: formData.password,
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          // Handle different response formats
          let errorMessage = "Invalid email or password.";

          if (responseData.body) {
            const errorBody = JSON.parse(responseData.body);
            errorMessage = errorBody.message || errorMessage;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          }

          setErrors({ general: errorMessage });
        } else {
          let loginResult;

          if (responseData.body) {
            loginResult = JSON.parse(responseData.body);
          } else {
            loginResult = responseData;
          }

          const idTokenData = parseJwt(loginResult.id_token);
          const userGroups = idTokenData["cognito:groups"] || [];
          const userInfo = loginResult.user || {};
          localStorage.setItem("access_token", loginResult.access_token);
          localStorage.setItem("id_token", loginResult.id_token);
          localStorage.setItem("refresh_token", loginResult.refresh_token);
          localStorage.setItem("userId", userInfo.userId || "");
          localStorage.setItem(
            "userEmail",
            userInfo.email || idTokenData.email
          );
          localStorage.setItem("userName", userInfo.name || idTokenData.email);
          localStorage.setItem("userRole", userInfo.role || "manager");
          localStorage.setItem("officeId", userInfo.officeId || "");
          localStorage.setItem(
            "userGroups",
            JSON.stringify(userInfo.cognitoGroups || userGroups)
          );
          localStorage.setItem("isAuthenticated", "true");

          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrors({
          general: "Login failed. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
      style={{
        background: isDark
          ? "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(0, 0, 0))"
          : "linear-gradient(to bottom right, rgb(6, 182, 212), rgb(37, 99, 235), rgb(67, 56, 202))",
      }}
    >
      <div className="w-full max-w-md">
        {/* Theme Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            style={{
              backgroundColor: isDark
                ? "rgb(55, 65, 81)"
                : "rgb(255, 255, 255)",
              color: isDark ? "rgb(252, 211, 77)" : "rgb(75, 85, 99)",
            }}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <FaSun className="text-xl" />
            ) : (
              <FaMoon className="text-xl" />
            )}
          </button>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl shadow-2xl p-8 transition-colors duration-300"
          style={{
            backgroundColor: isDark ? "rgb(31, 41, 55)" : "rgb(255, 255, 255)",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <div
              className="inline-block p-3 rounded-full mb-4 transition-colors duration-300"
              style={{
                backgroundColor: isDark
                  ? "rgb(30, 58, 138)"
                  : "rgb(219, 234, 254)",
              }}
            >
              <svg
                className="w-12 h-12 transition-colors duration-300"
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
              className="text-3xl font-bold mb-2 transition-colors duration-300"
              style={{
                color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
              }}
            >
              Smart Office
            </h1>
            <p
              className="transition-colors duration-300"
              style={{
                color: isDark ? "rgb(209, 213, 219)" : "rgb(75, 85, 99)",
              }}
            >
              Welcome to Dashboard
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div
              className="mb-4 p-3 border rounded-lg transition-colors duration-300"
              style={{
                backgroundColor: isDark
                  ? "rgba(127, 29, 29, 0.3)"
                  : "rgb(254, 242, 242)",
                borderColor: isDark ? "rgb(153, 27, 27)" : "rgb(254, 202, 202)",
              }}
            >
              <p
                className="text-sm text-center transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(252, 165, 165)" : "rgb(220, 38, 38)",
                }}
              >
                {errors.general}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                }}
              >
                Email
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{
                  backgroundColor: isDark
                    ? "rgb(55, 65, 81)"
                    : "rgb(255, 255, 255)",
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                  borderColor: errors.email
                    ? isDark
                      ? "rgb(239, 68, 68)"
                      : "rgb(239, 68, 68)"
                    : isDark
                    ? "rgb(75, 85, 99)"
                    : "rgb(209, 213, 219)",
                }}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <p
                  className="mt-1 text-sm transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(252, 165, 165)" : "rgb(239, 68, 68)",
                  }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                }}
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
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                  style={{
                    backgroundColor: isDark
                      ? "rgb(55, 65, 81)"
                      : "rgb(255, 255, 255)",
                    color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                    borderColor: errors.password
                      ? isDark
                        ? "rgb(239, 68, 68)"
                        : "rgb(239, 68, 68)"
                      : isDark
                      ? "rgb(75, 85, 99)"
                      : "rgb(209, 213, 219)",
                  }}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{
                    color: isDark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
                  }}
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
                <p
                  className="mt-1 text-sm transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(252, 165, 165)" : "rgb(239, 68, 68)",
                  }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-medium transition-colors duration-300 hover:underline"
                style={{
                  color: isDark ? "rgb(147, 197, 253)" : "rgb(37, 99, 235)",
                }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: isDark
                  ? "linear-gradient(to right, rgb(29, 78, 216), rgb(67, 56, 202))"
                  : "linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))",
                color: "rgb(255, 255, 255)",
              }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div
          className="mt-6 text-center text-sm transition-colors duration-300"
          style={{
            color: isDark ? "rgb(209, 213, 219)" : "rgb(255, 255, 255)",
          }}
        >
          <p>© 2025 Smart Office. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
