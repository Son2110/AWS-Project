import { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaTimes,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaCopy,
  FaDownload,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import apiService from "../../services/apiService";
import Toast from "../common/Toast";

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

  const downloadCredentials = () => {
    if (!createdRoom) return;

    const content = `Smart Office - Room Credentials
================================
Room ID: ${formData.roomId}
Office ID: ${officeId}
Thing Name: ${createdRoom.thingName}

Certificate (PEM):
${createdRoom.certificatePem}

Private Key:
${createdRoom.privateKey}

Root CA: ${createdRoom.rootCA}

IMPORTANT: Save this file securely. The private key cannot be retrieved again.
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `room-${formData.roomId}-credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setToast({
      show: true,
      message: "Credentials downloaded successfully!",
      type: "success",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`${
          isDark ? "bg-slate-800" : "bg-white"
        } rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">Create New Room</h2>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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
                      ? "border-slate-600 bg-slate-700 text-white focus:border-indigo-500"
                      : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
                {errors.roomId && (
                  <p className="text-red-500 text-sm mt-1">{errors.roomId}</p>
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
                      ? "border-slate-600 bg-slate-700/50 text-slate-400"
                      : "border-slate-300 bg-slate-100 text-slate-600"
                  }`}
                >
                  {officeId}
                </div>
              </div>

              {/* Info Box */}
              <div
                className={`p-4 rounded-xl ${
                  isDark ? "bg-blue-900/20" : "bg-blue-50"
                }`}
              >
                <p
                  className={`text-sm ${
                    isDark ? "text-blue-300" : "text-blue-700"
                  }`}
                >
                  <strong>Note:</strong> After creating the room, you will
                  receive IoT credentials (certificate and private key). These
                  credentials can only be viewed once. Make sure to download and
                  save them securely.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    isDark
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Room"}
                </button>
              </div>
            </form>
          ) : (
            // Success View with Credentials
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-1">
                  Room Created Successfully!
                </h3>
                <p className="text-sm">
                  Thing Name: <strong>{createdRoom.thingName}</strong>
                </p>
              </div>

              {/* Warning */}
              <div
                className={`p-4 rounded-xl border-2 ${
                  isDark
                    ? "bg-red-900/20 border-red-500"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    isDark ? "text-red-300" : "text-red-700"
                  }`}
                >
                  ⚠️ IMPORTANT: Save these credentials now. The private key
                  cannot be retrieved again!
                </p>
              </div>

              {/* Certificate PEM */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    className={`text-sm font-semibold ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    Certificate (PEM)
                  </label>
                  <button
                    onClick={() =>
                      copyToClipboard(createdRoom.certificatePem, "Certificate")
                    }
                    className="text-indigo-500 hover:text-indigo-600 text-sm flex items-center gap-1"
                  >
                    <FaCopy /> Copy
                  </button>
                </div>
                <textarea
                  readOnly
                  value={createdRoom.certificatePem}
                  className={`w-full px-4 py-3 rounded-xl border-2 font-mono text-xs ${
                    isDark
                      ? "border-slate-600 bg-slate-700 text-slate-300"
                      : "border-slate-300 bg-slate-50 text-slate-700"
                  }`}
                  rows={8}
                />
              </div>

              {/* Private Key */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    className={`text-sm font-semibold ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    Private Key
                  </label>
                  <button
                    onClick={() =>
                      copyToClipboard(createdRoom.privateKey, "Private Key")
                    }
                    className="text-indigo-500 hover:text-indigo-600 text-sm flex items-center gap-1"
                  >
                    <FaCopy /> Copy
                  </button>
                </div>
                <textarea
                  readOnly
                  value={createdRoom.privateKey}
                  className={`w-full px-4 py-3 rounded-xl border-2 font-mono text-xs ${
                    isDark
                      ? "border-slate-600 bg-slate-700 text-slate-300"
                      : "border-slate-300 bg-slate-50 text-slate-700"
                  }`}
                  rows={8}
                />
              </div>

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
                  className={`p-4 rounded-xl ${
                    isDark ? "bg-slate-700" : "bg-slate-100"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {createdRoom.rootCA}
                  </p>
                  <a
                    href="https://www.amazontrust.com/repository/AmazonRootCA1.pem"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:text-indigo-600 text-sm mt-2 inline-block"
                  >
                    → Download Amazon Root CA 1
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={downloadCredentials}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaDownload /> Download All Credentials
                </button>
                <button
                  onClick={handleClose}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
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
