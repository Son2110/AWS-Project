import { useState } from "react";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/layout/ThemeToggle";
import Toast from "../components/common/Toast";
import apiService from "../services/apiService";

const SignupPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

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
        await apiService.signup(formData);
        setShowVerification(true);
        setToast({
          show: true,
          message: "Verification code sent to your email!",
          type: "success",
        });
      } catch (error) {
        console.error("Signup error:", error);
        let errorMessage = error.message || "Signup failed";

        if (errorMessage.includes("Organization name already exists")) {
          errorMessage =
            "This company name is already taken. Please choose a different name.";
        } else if (errorMessage.includes("User already exists")) {
          errorMessage =
            "An account with this email already exists. Please login instead.";
        } else if (errorMessage.includes("Missing required fields")) {
          errorMessage = "Please fill in all required fields.";
        }

        setToast({
          show: true,
          message: errorMessage,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      setToast({
        show: true,
        message: "Please enter verification code",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiService.verifySignup(
        formData.email,
        verificationCode,
        formData.companyName
      );
      setToast({
        show: true,
        message: "Email verified successfully! Redirecting to login...",
        type: "success",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Verification error:", error);
      setToast({
        show: true,
        message: error.message || "Verification failed",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);

    try {
      await apiService.resendCode(formData.email);
      setToast({
        show: true,
        message: "Verification code resent!",
        type: "success",
      });
    } catch (error) {
      console.error("Resend code error:", error);
      setToast({
        show: true,
        message: "Network error. Please try again.",
        type: "error",
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

        {/* Signup Card */}
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
              Create Account
            </h1>
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Sign up to manage your smart office
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

          {/* Toast Notification */}
          <Toast
            show={toast.show}
            message={toast.message}
            type={toast.type}
            duration={5000}
            onClose={() => setToast({ show: false, message: "", type: "" })}
          />

          {/* Verification Form */}
          {showVerification ? (
            <form onSubmit={handleVerification} className="space-y-5">
              <div className="text-center mb-6">
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  We sent a verification code to
                  <br />
                  <span className="font-semibold text-indigo-600">
                    {formData.email}
                  </span>
                </p>
              </div>

              <div>
                <label
                  htmlFor="verificationCode"
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 text-center text-2xl tracking-widest ${
                    isDark
                      ? "bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500"
                      : "bg-white border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder="123456"
                  maxLength="6"
                  disabled={isLoading}
                />
              </div>

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
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className={`text-sm font-medium transition-colors ${
                    isDark
                      ? "text-indigo-400 hover:text-indigo-300"
                      : "text-indigo-600 hover:text-indigo-500"
                  } disabled:opacity-50`}
                >
                  Resend Code
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowVerification(false)}
                  className={`text-sm font-medium transition-colors ${
                    isDark
                      ? "text-slate-400 hover:text-slate-300"
                      : "text-slate-600 hover:text-slate-500"
                  }`}
                >
                  ← Back to Signup
                </button>
              </div>
            </form>
          ) : (
            /* Signup Form */
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
                  placeholder="Acme Corp"
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
                    Creating Account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          )}

          {/* Login Link */}
          <div
            className={`mt-8 text-center text-sm ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
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

export default SignupPage;
