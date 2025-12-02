import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaBuilding, FaSearch, FaBell } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/layout/Navbar";
import OfficeCard from "../components/office/OfficeCard";
import CreateOfficeModal from "../components/office/CreateOfficeModal";
import apiService from "../services/apiService";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Get admin info from localStorage
  const adminName = localStorage.getItem("userName") || "Admin";
  const adminEmail = localStorage.getItem("userEmail") || "";
  const userId = localStorage.getItem("userId");
  const orgAlias = localStorage.getItem("orgAlias") || "";

  useEffect(() => {
    const fetchOffices = async () => {
      if (!orgAlias) {
        setLoading(false);
        return;
      }

      try {
        const officeList = await apiService.listOffices(orgAlias);
        setOffices(officeList);
      } catch (error) {
        console.error("Failed to fetch offices:", error);
        setOffices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, [orgAlias]);

  const handleAddOffice = () => {
    setShowModal(true);
  };

  const handleOfficeCreated = async () => {
    // Refresh offices list after successful creation
    try {
      if (orgAlias) {
        const officeList = await apiService.listOffices(orgAlias);
        setOffices(officeList);
      }
    } catch (error) {
      console.error("Failed to refresh offices:", error);
    }
  };

  const handleOfficeClick = (officeId) => {
    navigate(`/office/${officeId}`);
  };

  const filteredOffices = offices.filter(
    (office) =>
      office.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Welcome back, {adminName}
            </h1>
            <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {orgAlias && (
                <span className="font-semibold text-indigo-500">
                  {orgAlias} •{" "}
                </span>
              )}
              Manage your offices and organization settings
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`relative hidden md:block`}>
              <FaSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              />
              <input
                type="text"
                placeholder="Search offices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all w-64 focus:w-80
                  ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
                      : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  }`}
              />
            </div>

            <button
              className={`p-2.5 rounded-xl border transition-all ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500"
                  : "bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-500"
              }`}
            >
              <FaBell size={20} />
            </button>
          </div>
        </div>

        {/* Stats Overview - Optional but adds value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div
            className={`p-6 rounded-2xl border ${
              isDark
                ? "bg-slate-800/50 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  isDark
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                <FaBuilding size={24} />
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Total Offices
                </p>
                <h3
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {offices.length}
                </h3>
              </div>
            </div>
          </div>
          {/* Add more stats here if available */}
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Your Offices
            </h2>
            <button
              onClick={handleAddOffice}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-medium"
            >
              <FaPlus size={14} />
              <span>Add Office</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-64 rounded-2xl animate-pulse ${
                    isDark ? "bg-slate-800" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Office Cards */}
              {filteredOffices.map((office) => (
                <OfficeCard
                  key={office.officeId || office.id || Math.random()}
                  office={office}
                  onClick={() =>
                    handleOfficeClick(office.officeId || office.id)
                  }
                />
              ))}

              {/* Add New Office Card (Mobile/Desktop) */}
              <div
                onClick={handleAddOffice}
                className={`group relative h-full min-h-[280px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300
                  ${
                    isDark
                      ? "border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50"
                      : "border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50"
                  }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
                    isDark
                      ? "bg-slate-800 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white"
                      : "bg-slate-100 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white"
                  }`}
                >
                  <FaPlus size={24} />
                </div>
                <h3
                  className={`text-lg font-semibold mb-1 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Add New Office
                </h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Create a new location
                </p>
              </div>
            </div>
          )}

          {!loading && filteredOffices.length === 0 && (
            <div
              className={`text-center py-12 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <p>No offices found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Office Modal */}
      <CreateOfficeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleOfficeCreated}
        orgAlias={orgAlias}
        adminEmail={adminEmail}
        adminName={adminName}
      />
    </div>
  );
};

export default AdminDashboardPage;
