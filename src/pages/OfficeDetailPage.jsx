import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaCalendarAlt,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaDoorOpen,
  FaArrowRight,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/layout/Navbar";
import Toast from "../components/common/Toast";
import ConfirmDialog from "../components/common/ConfirmDialog";
import apiService from "../services/apiService";

const OfficeDetailPage = () => {
  const { officeId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [office, setOffice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [roomCount, setRoomCount] = useState(0);
  const [isAdminAlsoManager, setIsAdminAlsoManager] = useState(false);

  const orgAlias = localStorage.getItem("orgAlias") || "";
  const currentUserEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    const fetchOfficeDetail = async () => {
      if (!orgAlias || !officeId) {
        setError("Missing required parameters");
        setLoading(false);
        return;
      }

      try {
        const data = await apiService.getOfficeDetail(orgAlias, officeId);
        setOffice(data);

        // Check if current admin is also the manager of this office
        if (data.manager && data.manager.managerEmail === currentUserEmail) {
          setIsAdminAlsoManager(true);
        }

        // Fetch room count
        try {
          const roomData = await apiService.getRoomsByOffice(officeId);
          setRoomCount(roomData.roomCount || 0);
        } catch (roomErr) {
          console.error("Failed to fetch room count:", roomErr);
          setRoomCount(0);
        }
      } catch (err) {
        console.error("Failed to fetch office detail:", err);
        setError(err.message || "Failed to load office details");
      } finally {
        setLoading(false);
      }
    };

    fetchOfficeDetail();
  }, [orgAlias, officeId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleEdit = () => {
    setFormData({
      officeName: office.name || "",
      officeAddress: office.address || "",
      managerName: office.manager?.managerName || "",
      managerStatus: office.manager?.managerStatus || "ACTIVE",
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    setShowUpdateConfirm(true);
  };

  const confirmUpdate = async () => {
    setSaving(true);
    try {
      // Update office
      await apiService.updateOfficeOrManager("OFFICE", orgAlias, officeId, {
        name: formData.officeName,
        address: formData.officeAddress,
      });

      // Update manager if exists
      if (office.manager?.userId) {
        await apiService.updateOfficeOrManager(
          "MANAGER",
          orgAlias,
          office.manager.userId,
          { name: formData.managerName, status: formData.managerStatus }
        );
      }

      showToast("Updated successfully!", "success");
      setShowUpdateConfirm(false);
      setShowEditModal(false);

      // Refresh office detail
      const updatedData = await apiService.getOfficeDetail(orgAlias, officeId);
      setOffice(updatedData);
    } catch (err) {
      console.error("Failed to update:", err);
      showToast(err.message || "Failed to update", "error");
      setShowUpdateConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await apiService.deleteOfficeOrManager(
        "DELETE_OFFICE",
        orgAlias,
        officeId,
        true
      );
      showToast("Office deleted successfully!", "success");
      setShowDeleteConfirm(false);

      // Navigate back to dashboard after successful deletion
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (err) {
      console.error("Failed to delete:", err);
      showToast(err.message || "Failed to delete", "error");
      setShowDeleteConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div
              className={`h-8 rounded w-1/4 ${
                isDark ? "bg-slate-800" : "bg-slate-200"
              }`}
            />
            <div
              className={`h-64 rounded-2xl ${
                isDark ? "bg-slate-800" : "bg-slate-200"
              }`}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error || !office) {
    return (
      <div
        className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-xl transition-colors ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <div
            className={`text-center py-12 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            <p>{error || "Office not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-xl transition-colors ${
            isDark
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FaArrowLeft />
          <span>Back to Dashboard</span>
        </button>

        {/* Office Header */}
        <div
          className={`rounded-2xl border p-8 mb-6 ${
            isDark
              ? "bg-slate-800/50 border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-start gap-6">
            <div
              className={`p-4 rounded-xl ${
                isDark
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <FaBuilding size={32} />
            </div>
            <div className="flex-1">
              <h1
                className={`text-3xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {office.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt
                  className={isDark ? "text-slate-500" : "text-slate-400"}
                />
                <span
                  className={`text-lg ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {office.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt
                  className={isDark ? "text-slate-500" : "text-slate-400"}
                  size={14}
                />
                <span
                  className={`text-sm ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Created: {formatDate(office.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <FaEdit />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Manager Information */}
        <div
          className={`rounded-2xl border p-8 ${
            isDark
              ? "bg-slate-800/50 border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Manager Information
            </h2>
          </div>

          {office.manager ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`p-4 rounded-xl ${
                    isDark ? "bg-slate-700/50" : "bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FaUser
                      className={isDark ? "text-indigo-400" : "text-indigo-600"}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Manager Name
                    </span>
                  </div>
                  <p
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {office.manager.managerName}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl ${
                    isDark ? "bg-slate-700/50" : "bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FaEnvelope
                      className={isDark ? "text-indigo-400" : "text-indigo-600"}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Email
                    </span>
                  </div>
                  <p
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {office.manager.managerEmail}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl ${
                    isDark ? "bg-slate-700/50" : "bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FaDoorOpen
                      className={isDark ? "text-indigo-400" : "text-indigo-600"}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Total Rooms
                    </span>
                  </div>
                  <p
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {roomCount}
                  </p>
                </div>

                {/* Manager Dashboard Button (Only if admin is also manager) */}
                {isAdminAlsoManager && (
                  <button
                    onClick={() => {
                      localStorage.setItem("officeId", officeId);
                      localStorage.setItem("officeName", office.name);
                      navigate("/dashboard");
                    }}
                    className={`p-4 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                      isDark
                        ? "bg-gradient-to-r from-indigo-900/30 to-violet-900/30 hover:from-indigo-900/50 hover:to-violet-900/50 border border-indigo-700/50"
                        : "bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 border border-indigo-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isDark
                            ? "bg-indigo-600 text-white"
                            : "bg-indigo-600 text-white"
                        }`}
                      >
                        <FaUserShield size={18} />
                      </div>
                      <div className="text-left">
                        <p
                          className={`text-sm font-medium ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          You are the Manager
                        </p>
                        <p
                          className={`text-base font-semibold ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          Switch to Dashboard
                        </p>
                      </div>
                    </div>
                    <FaArrowRight
                      className={`transform group-hover:translate-x-1 transition-transform ${
                        isDark ? "text-indigo-400" : "text-indigo-600"
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`text-center py-12 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <p>No manager assigned to this office</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Edit Office & Manager
            </h3>

            <div className="space-y-6">
              {/* Office Section */}
              <div className="space-y-4">
                <h4
                  className={`text-lg font-semibold ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Office Information
                </h4>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Office Name
                  </label>
                  <input
                    type="text"
                    name="officeName"
                    value={formData.officeName || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-xl border outline-none transition-all ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-white focus:border-indigo-500"
                        : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    name="officeAddress"
                    value={formData.officeAddress || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-xl border outline-none transition-all ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-white focus:border-indigo-500"
                        : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"
                    }`}
                  />
                </div>
              </div>

              {/* Manager Section */}
              {office.manager && (
                <div className="space-y-4">
                  <h4
                    className={`text-lg font-semibold ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    Manager Information
                  </h4>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Manager Name
                    </label>
                    <input
                      type="text"
                      name="managerName"
                      value={formData.managerName || ""}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-xl border outline-none transition-all ${
                        isDark
                          ? "bg-slate-700 border-slate-600 text-white focus:border-indigo-500"
                          : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Status
                    </label>
                    <select
                      name="managerStatus"
                      value={formData.managerStatus || "ACTIVE"}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-xl border outline-none transition-all ${
                        isDark
                          ? "bg-slate-700 border-slate-600 text-white focus:border-indigo-500"
                          : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"
                      }`}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={saving}
                className={`flex-1 px-4 py-2 rounded-xl border transition-colors ${
                  isDark
                    ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClick}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={confirmUpdate}
        title="Save Changes?"
        message="Are you sure you want to proceed with this action?"
        confirmText="Save"
        cancelText="Cancel"
        confirmButtonClass="bg-indigo-600 hover:bg-indigo-700"
        loading={saving}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Office?"
        message="Are you sure you want to proceed with this action?"
        confirmText="Delete"
        cancelText="Cancel"
        loading={saving}
      />

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />
    </div>
  );
};

export default OfficeDetailPage;
