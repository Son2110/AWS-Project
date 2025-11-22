import { useState } from "react";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code & new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Email is invalid" });
      return false;
    }
    return true;
  };

  const validatePasswordReset = () => {
    const newErrors = {};

    if (!code.trim()) {
      newErrors.code = "Verification code is required";
    } else if (code.length !== 6) {
      newErrors.code = "Code must be 6 digits";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(newPassword)) {
      newErrors.newPassword = "Password must contain lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(newPassword)) {
      newErrors.newPassword = "Password must contain uppercase letter";
    } else if (!/(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = "Password must contain number";
    } else if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
      newErrors.newPassword =
        "Password must contain special character (@$!%*?&)";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsLoading(true);
    setErrors({});

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/forgot-password`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email }),
      });

      const responseText = await response.text();

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        data = {};
      }

      if (response.ok) {
        // Success - email sent (even if response body is empty)
        setSuccessMessage("Verification code sent to your email!");
        setStep(2);
      } else {
        setErrors({
          general: data.message || "Failed to send verification code",
        });
      }
    } catch (error) {
      setErrors({ general: "Failed to send code. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validatePasswordReset()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/confirm-forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            code: code,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          "Password reset successfully! Redirecting to login..."
        );
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setErrors({ general: data.message || "Failed to reset password" });
      }
    } catch (error) {
      setErrors({ general: "Failed to reset password. Please try again." });
    } finally {
      setIsLoading(false);
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
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: isDark ? "rgb(55, 65, 81)" : "rgb(255, 255, 255)",
            color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
          }}
        >
          <FaArrowLeft />
          <span>Back to Login</span>
        </button>

        {/* Card */}
        <div
          className="rounded-2xl shadow-2xl p-8 transition-colors duration-300"
          style={{
            backgroundColor: isDark ? "rgb(31, 41, 55)" : "rgb(255, 255, 255)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1
              className="text-3xl font-bold mb-2 transition-colors duration-300"
              style={{
                color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
              }}
            >
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </h1>
            <p
              className="transition-colors duration-300"
              style={{
                color: isDark ? "rgb(209, 213, 219)" : "rgb(75, 85, 99)",
              }}
            >
              {step === 1
                ? "Enter your email to receive a verification code"
                : "Enter the code and your new password"}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div
              className="mb-4 p-3 border rounded-lg transition-colors duration-300"
              style={{
                backgroundColor: isDark
                  ? "rgba(6, 95, 70, 0.3)"
                  : "rgb(240, 253, 244)",
                borderColor: isDark ? "rgb(6, 95, 70)" : "rgb(187, 247, 208)",
              }}
            >
              <p
                className="text-sm text-center transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(134, 239, 172)" : "rgb(22, 163, 74)",
                }}
              >
                {successMessage}
              </p>
            </div>
          )}

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

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({});
                  }}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{
                    backgroundColor: isDark
                      ? "rgb(55, 65, 81)"
                      : "rgb(255, 255, 255)",
                    color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                    borderColor: errors.email
                      ? "rgb(239, 68, 68)"
                      : isDark
                      ? "rgb(75, 85, 99)"
                      : "rgb(209, 213, 219)",
                  }}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: isDark ? "rgb(252, 165, 165)" : "rgb(239, 68, 68)",
                    }}
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isDark
                    ? "linear-gradient(to right, rgb(29, 78, 216), rgb(67, 56, 202))"
                    : "linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))",
                  color: "rgb(255, 255, 255)",
                }}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {/* Step 2: Enter Code and New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Verification Code */}
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium mb-2 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                  }}
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setErrors((prev) => ({ ...prev, code: "" }));
                  }}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-2xl tracking-widest"
                  style={{
                    backgroundColor: isDark
                      ? "rgb(55, 65, 81)"
                      : "rgb(255, 255, 255)",
                    color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                    borderColor: errors.code
                      ? "rgb(239, 68, 68)"
                      : isDark
                      ? "rgb(75, 85, 99)"
                      : "rgb(209, 213, 219)",
                  }}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                />
                {errors.code && (
                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: isDark ? "rgb(252, 165, 165)" : "rgb(239, 68, 68)",
                    }}
                  >
                    {errors.code}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium mb-2 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                  }}
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, newPassword: "" }));
                    }}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                    style={{
                      backgroundColor: isDark
                        ? "rgb(55, 65, 81)"
                        : "rgb(255, 255, 255)",
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                      borderColor: errors.newPassword
                        ? "rgb(239, 68, 68)"
                        : isDark
                        ? "rgb(75, 85, 99)"
                        : "rgb(209, 213, 219)",
                    }}
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: isDark
                        ? "rgb(156, 163, 175)"
                        : "rgb(107, 114, 128)",
                    }}
                  >
                    {showNewPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: isDark ? "rgb(252, 165, 165)" : "rgb(239, 68, 68)",
                    }}
                  >
                    {errors.newPassword}
                  </p>
                )}
                <p
                  className="mt-1 text-xs"
                  style={{
                    color: isDark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
                  }}
                >
                  Must be 8+ characters with uppercase, lowercase, number &
                  special character
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-2 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                  }}
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
                    style={{
                      backgroundColor: isDark
                        ? "rgb(55, 65, 81)"
                        : "rgb(255, 255, 255)",
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                      borderColor: errors.confirmPassword
                        ? "rgb(239, 68, 68)"
                        : isDark
                        ? "rgb(75, 85, 99)"
                        : "rgb(209, 213, 219)",
                    }}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: isDark
                        ? "rgb(156, 163, 175)"
                        : "rgb(107, 114, 128)",
                    }}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: isDark ? "rgb(252, 165, 165)" : "rgb(239, 68, 68)",
                    }}
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isDark
                    ? "linear-gradient(to right, rgb(29, 78, 216), rgb(67, 56, 202))"
                    : "linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))",
                  color: "rgb(255, 255, 255)",
                }}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
