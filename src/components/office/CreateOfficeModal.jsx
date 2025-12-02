import { useState } from "react";
import {
  FaTimes,
  FaKey,
  FaCheck,
  FaPlus,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import apiService from "../../services/apiService";
import Toast from "../common/Toast";

const CreateOfficeModal = ({
  isOpen,
  onClose,
  onSuccess,
  orgAlias,
  adminEmail,
  adminName,
}) => {
  const { isDark } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Form state
  const [formData, setFormData] = useState({
    officeName: "",
    address: "",
    managerEmail: "",
    managerName: "",
    managerPassword: "",
  });
  const [useMyEmail, setUseMyEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const generateCognitoPassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*";

    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const handleClose = () => {
    setFormData({
      officeName: "",
      address: "",
      managerEmail: "",
      managerName: "",
      managerPassword: "",
    });
    setUseMyEmail(false);
    setShowPassword(false);
    setErrors({});
    onClose();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleUseMyEmailChange = (e) => {
    const checked = e.target.checked;
    setUseMyEmail(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        managerEmail: adminEmail,
        managerName: adminName,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        managerEmail: "",
        managerName: "",
      }));
    }
  };

  const handleGeneratePassword = () => {
    const password = generateCognitoPassword();
    setFormData((prev) => ({ ...prev, managerPassword: password }));
  };

  const handleCopyPassword = () => {
    if (formData.managerPassword) {
      navigator.clipboard.writeText(formData.managerPassword);
      setToast({
        show: true,
        message: "Password copied to clipboard!",
        type: "success",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.officeName.trim()) {
      newErrors.officeName = "Office name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.managerEmail.trim()) {
      newErrors.managerEmail = "Manager email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.managerEmail)) {
      newErrors.managerEmail = "Invalid email format";
    }

    if (!formData.managerName.trim()) {
      newErrors.managerName = "Manager name is required";
    }

    // Password is optional - only validate if provided
    if (formData.managerPassword && formData.managerPassword.length < 8) {
      newErrors.managerPassword = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        orgAlias: orgAlias,
        officeName: formData.officeName,
        address: formData.address,
        managerEmail: formData.managerEmail,
        managerName: formData.managerName,
      };

      // Only include password if provided
      if (formData.managerPassword) {
        payload.managerPassword = formData.managerPassword;
      }

      const result = await apiService.createOfficeWithManager(payload);

      setToast({
        show: true,
        message: "Office and manager created successfully!",
        type: "success",
      });

      // Close modal after short delay to show toast
      setTimeout(() => {
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to create office:", error);
      setErrors({
        general: error.message || "Failed to create office. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
          isDark ? "bg-slate-800" : "bg-white"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? "border-slate-700" : "border-slate-200"
          }`}
        >
          <h2
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Create New Office
          </h2>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? "hover:bg-slate-700 text-slate-400"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto"
        >
          {/* Company Name (Read-only) */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Company Name
            </label>
            <input
              type="text"
              value={orgAlias}
              disabled
              className={`w-full px-4 py-3 rounded-xl border cursor-not-allowed ${
                isDark
                  ? "bg-slate-900/50 border-slate-700 text-slate-500"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            />
          </div>

          {/* Office Name */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Office Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="officeName"
              value={formData.officeName}
              onChange={handleFormChange}
              placeholder="e.g., FPT HCM Office"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              } ${errors.officeName ? "border-red-500" : ""}`}
            />
            {errors.officeName && (
              <p className="text-red-500 text-sm mt-1">{errors.officeName}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="e.g., 123 Nguyen Hue, District 1, HCM City"
              rows="3"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              } ${errors.address ? "border-red-500" : ""}`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* Use My Email Checkbox */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <input
              type="checkbox"
              id="useMyEmail"
              checked={useMyEmail}
              onChange={handleUseMyEmailChange}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
            <label
              htmlFor="useMyEmail"
              className={`text-sm font-medium cursor-pointer ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Use my email as manager ({adminEmail})
            </label>
          </div>

          {/* Manager Email */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Manager Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="managerEmail"
              value={formData.managerEmail}
              onChange={handleFormChange}
              disabled={useMyEmail}
              placeholder="manager@company.com"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              } ${errors.managerEmail ? "border-red-500" : ""} ${
                useMyEmail ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            {errors.managerEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.managerEmail}</p>
            )}
          </div>

          {/* Manager Name */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Manager Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="managerName"
              value={formData.managerName}
              onChange={handleFormChange}
              disabled={useMyEmail}
              placeholder="e.g., Nguyen Van A"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              } ${errors.managerName ? "border-red-500" : ""} ${
                useMyEmail ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            {errors.managerName && (
              <p className="text-red-500 text-sm mt-1">{errors.managerName}</p>
            )}
          </div>

          {/* Password Field (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className={`text-sm font-medium ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Temporary Password (Optional)
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <FaKey size={12} />
                Generate
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="managerPassword"
                value={formData.managerPassword}
                onChange={handleFormChange}
                placeholder="Leave empty to let Cognito generate"
                className={`w-full px-4 py-3 pr-24 rounded-xl border outline-none transition-all ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                } ${errors.managerPassword ? "border-red-500" : ""}`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {formData.managerPassword && (
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? "hover:bg-slate-700 text-slate-400"
                        : "hover:bg-slate-200 text-slate-600"
                    }`}
                    title="Copy password"
                  >
                    <FaCheck size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-slate-700 text-slate-400"
                      : "hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {showPassword ? (
                    <FaEyeSlash size={14} />
                  ) : (
                    <FaEye size={14} />
                  )}
                </button>
              </div>
            </div>

            {errors.managerPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.managerPassword}
              </p>
            )}

            <p
              className={`text-xs mt-2 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {useMyEmail
                ? "Note: If using your own email, Cognito will not send a new password."
                : "If left empty, Cognito will generate and send a temporary password via email."}
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${
                isDark
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FaPlus size={14} />
                  Create Office
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default CreateOfficeModal;
