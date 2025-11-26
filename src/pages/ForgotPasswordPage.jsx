import { useState } from "react";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/layout/ThemeToggle";

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
          navigate("/login");
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
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className={`absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-3xl ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-100/50'}`}></div>
        <div className={`absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl ${isDark ? 'bg-violet-900/20' : 'bg-violet-100/50'}`}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
            <Link to="/login" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                <FaArrowLeft /> Back to Login
            </Link>
            <ThemeToggle />
        </div>

        {/* Card */}
        <div className={`rounded-3xl shadow-2xl p-8 md:p-10 backdrop-blur-xl border transition-all duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/70 border-white/50'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {step === 1
                ? "Enter your email to receive a verification code"
                : "Enter the code and your new password"}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center justify-center text-sm font-medium ${isDark ? 'bg-green-900/20 border-green-800 text-green-300' : 'bg-green-50 border-green-100 text-green-600'}`}>
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center justify-center text-sm font-medium ${isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-100 text-red-600'}`}>
              {errors.general}
            </div>
          )}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 ${
                    errors.email 
                        ? 'border-red-500 focus:border-red-500' 
                        : isDark 
                            ? 'bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500' 
                            : 'bg-white border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400'
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                    </span>
                ) : "Send Verification Code"}
              </button>
            </form>
          )}

          {/* Step 2: Enter Code and New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Verification Code */}
              <div>
                <label htmlFor="code" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 text-center text-2xl tracking-widest ${
                    errors.code 
                        ? 'border-red-500 focus:border-red-500' 
                        : isDark 
                            ? 'bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500' 
                            : 'bg-white border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-500 font-medium">
                    {errors.code}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 pr-12 ${
                        errors.newPassword 
                            ? 'border-red-500 focus:border-red-500' 
                            : isDark 
                                ? 'bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500' 
                                : 'bg-white border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500 font-medium">
                    {errors.newPassword}
                  </p>
                )}
                <p className={`mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Must be 8+ characters with uppercase, lowercase, number & special character
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 pr-12 ${
                        errors.confirmPassword 
                            ? 'border-red-500 focus:border-red-500' 
                            : isDark 
                                ? 'bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500' 
                                : 'bg-white border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 font-medium">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting...
                    </span>
                ) : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
