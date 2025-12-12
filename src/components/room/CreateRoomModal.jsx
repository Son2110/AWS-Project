import { useState } from "react";
import { createPortal } from "react-dom";
import JSZip from "jszip";
import {
  FaTimes,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaCopy,
  FaDownload,
  FaCheckCircle,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import apiService from "../../services/apiService";
import Toast from "../common/Toast";

const CredentialField = ({ label, value, isDark, onCopy }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label
          className={`text-sm font-semibold ${
            isDark ? "text-slate-200" : "text-slate-700"
          }`}
        >
          {label}
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className={`text-sm flex items-center gap-1.5 transition-colors ${
              isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {isVisible ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            {isVisible ? "Hide" : "Show"}
          </button>
          <button
            onClick={onCopy}
            className="text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
      <div className="relative">
        <textarea
          readOnly
          value={isVisible ? value : "•".repeat(600)}
          className={`w-full px-4 py-3 rounded-xl border-2 font-mono text-xs transition-all ${
            isDark
              ? "border-slate-700 bg-slate-900/50 text-slate-300 focus:border-indigo-500"
              : "border-slate-200 bg-slate-50 text-slate-700 focus:border-indigo-500"
          } ${!isVisible ? "tracking-widest overflow-hidden resize-none select-none text-slate-400" : ""}`}
          rows={6}
          style={{ 
            filter: !isVisible ? "blur(0px)" : "none",
            fontFamily: !isVisible ? "sans-serif" : "monospace" 
          }}
        />
      </div>
    </div>
  );
};

const CreateRoomModal = ({ isOpen, onClose, onSuccess, officeId }) => {
  const { isDark } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Form state
  const [formData, setFormData] = useState({
    roomId: "",
  });
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    setFormData({ roomId: "" });
    setErrors({});
    setCreatedRoom(null);
    onClose();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.roomId.trim()) {
      newErrors.roomId = "Room ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orgAlias = localStorage.getItem("orgAlias") || "";

      const payload = {
        roomId: formData.roomId.trim(),
        officeId: officeId,
        orgAlias: orgAlias,
      };

      const result = await apiService.createRoomConfig(payload);

      setCreatedRoom(result);
      setToast({
        show: true,
        message: "Room created successfully! Save the credentials below.",
        type: "success",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Create room error:", error);
      setToast({
        show: true,
        message: error.message || "Failed to create room",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setToast({
      show: true,
      message: `${label} copied to clipboard!`,
      type: "success",
    });
  };

  const downloadCredentials = async () => {
    if (!createdRoom) return;

    const roomPrefix = `room-${formData.roomId}`;

    try {
      // Create a zip file
      const zip = new JSZip();

      // Add certificate file
      zip.file(`${roomPrefix}-certificate.pem`, createdRoom.certificatePem);

      // Add private key file
      zip.file(`${roomPrefix}-private.key`, createdRoom.privateKey);

      // Add info file
      const infoContent = `Smart Office - Room Credentials
================================
Room ID: ${formData.roomId}
Office ID: ${officeId}
Thing Name: ${createdRoom.thingName}

Root CA Certificate:
${createdRoom.rootCA}
Download: https://www.amazontrust.com/repository/AmazonRootCA1.pem

Files:
- ${roomPrefix}-certificate.pem (Device Certificate)
- ${roomPrefix}-private.key (Private Key)
- ${roomPrefix}-info.txt (This file)

IMPORTANT: Keep these files secure. The private key cannot be retrieved again.
`;
      zip.file(`${roomPrefix}-info.txt`, infoContent);

      // Generate and download zip file
      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${roomPrefix}-credentials.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setToast({
        show: true,
        message: "Credentials zip downloaded successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Download error:", error);
      setToast({
        show: true,
        message: "Failed to download credentials",
        type: "error",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className={`${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-white/20"
        } rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border animate-slide-up`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">Create New Room</h2>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {!createdRoom ? (
            // Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Room ID */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Room ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleFormChange}
                  placeholder="e.g., 202, R301, Meeting-A"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    errors.roomId
                      ? "border-red-500"
                      : isDark
                      ? "border-slate-700 bg-slate-900/50 text-white focus:border-indigo-500"
                      : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500"
                  } focus:outline-none focus:ring-4 focus:ring-indigo-500/10`}
                />
                {errors.roomId && (
                  <p className="text-red-500 text-sm mt-1 font-medium">{errors.roomId}</p>
                )}
              </div>

              {/* Office ID Display */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Office ID
                </label>
                <div
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-slate-400"
                      : "border-slate-200 bg-slate-100 text-slate-600"
                  }`}
                >
                  {officeId}
                </div>
              </div>

              {/* Info Box */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? "bg-blue-900/20 border-blue-800 text-blue-300" : "bg-blue-50 border-blue-100 text-blue-700"
                }`}
              >
                <p className="text-sm">
                  <strong>Note:</strong> After creating the room, you will
                  receive IoT credentials (certificate and private key). These
                  credentials can only be viewed once. Make sure to download and
                  save them securely.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                    isDark
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                  {isSubmitting ? "Creating..." : "Create Room"}
                </button>
              </div>
            </form>
          ) : (
            // Success View with Credentials
            <div className="space-y-6 animate-fade-in">
              {/* Success Message */}
              <div className="relative overflow-hidden rounded-2xl p-8 text-center border border-emerald-500/20">
                {/* Background Glow */}
                <div className={`absolute inset-0 opacity-20 ${
                  isDark 
                    ? "bg-gradient-to-b from-emerald-500/30 to-transparent" 
                    : "bg-gradient-to-b from-emerald-400/30 to-transparent"
                }`} />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`mb-4 p-4 rounded-full shadow-lg ${
                    isDark ? "bg-emerald-500/20 text-emerald-400 shadow-emerald-900/20" : "bg-emerald-100 text-emerald-600 shadow-emerald-100"
                  }`}>
                    <FaCheckCircle size={48} />
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-slate-800"
                  }`}>
                    Room Created Successfully
                  </h3>
                  
                  <p className={`mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Your secure IoT room is ready for configuration.
                  </p>

                  <div className={`flex flex-col items-center gap-2 p-4 rounded-xl w-full max-w-sm border ${
                    isDark 
                      ? "bg-slate-900/50 border-slate-700" 
                      : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}>
                      Thing Name
                    </span>
                    <span className={`font-mono text-lg font-bold ${
                      isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}>
                      {createdRoom.thingName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark
                    ? "bg-amber-900/20 border-amber-500/30 text-amber-200"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
              >
                <p className="text-sm font-medium flex gap-3 items-start">
                  <span className="text-lg">⚠️</span>
                  <span>
                    <strong>Important:</strong> Save these credentials now. The private key cannot be retrieved again.
                  </span>
                </p>
              </div>

              {/* Certificate PEM */}
              <CredentialField 
                label="Certificate (PEM)" 
                value={createdRoom.certificatePem} 
                isDark={isDark}
                onCopy={() => copyToClipboard(createdRoom.certificatePem, "Certificate")}
              />

              {/* Private Key */}
              <CredentialField 
                label="Private Key" 
                value={createdRoom.privateKey} 
                isDark={isDark}
                onCopy={() => copyToClipboard(createdRoom.privateKey, "Private Key")}
              />

              {/* Root CA Info */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Root CA Certificate
                </label>
                <div
                  className={`p-4 rounded-xl border ${
                    isDark ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p
                    className={`text-sm font-mono truncate ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {createdRoom.rootCA}
                  </p>
                  <a
                    href="https://www.amazontrust.com/repository/AmazonRootCA1.pem"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:text-indigo-600 text-sm mt-2 inline-block font-medium hover:underline"
                  >
                    Download Amazon Root CA 1
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={downloadCredentials}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5"
                >
                  Download All Credentials
                </button>
                <button
                  onClick={handleClose}
                  className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                    isDark
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast - Render using Portal to escape modal z-index */}
      {toast.show &&
        createPortal(
          <div className="fixed top-4 right-4 z-[9999]">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ ...toast, show: false })}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default CreateRoomModal;
