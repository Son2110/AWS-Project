import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaBuilding,
  FaSearch,
  FaBell,
  FaUserShield,
  FaDoorOpen,
} from "react-icons/fa";
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
  const [totalRooms, setTotalRooms] = useState(0);

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

        // Fetch total rooms count from all offices
        let roomCount = 0;
        for (const office of officeList) {
          try {
            const roomData = await apiService.getRoomsByOffice(office.officeId);
            roomCount += roomData.roomCount || 0;
          } catch (err) {
            console.error(
              `Failed to fetch rooms for office ${office.officeId}:`,
              err
            );
          }
        }
        setTotalRooms(roomCount);
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
      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className={`absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-3xl opacity-20 ${
            isDark ? "bg-indigo-900" : "bg-indigo-200"
          }`}
        ></div>
        <div
          className={`absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl opacity-20 ${
            isDark ? "bg-violet-900" : "bg-violet-200"
          }`}
        ></div>
        <div
          className={`absolute bottom-[-20%] right-[10%] w-[40%] h-[40%] rounded-full blur-3xl opacity-20 ${
            isDark ? "bg-emerald-900" : "bg-emerald-200"
          }`}
        ></div>
      </div>

      <Navbar />

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-slide-up">
          <div>
            <h1
              className={`text-3xl font-bold mb-2 flex items-center gap-3 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              <div className={`p-2 rounded-xl ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
                <FaUserShield size={24} />
              </div>
              Welcome back, {adminName}
            </h1>
            <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {orgAlias && (
                <span className="font-semibold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md mr-2">
                  {orgAlias}
                </span>
              )}
              Manage your offices and organization settings
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`relative hidden md:block group`}>
              <FaSearch
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark ? "text-slate-500 group-focus-within:text-indigo-400" : "text-slate-400 group-focus-within:text-indigo-500"
                }`}
              />
              <input
                type="text"
                placeholder="Search offices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-3 rounded-xl border outline-none transition-all w-64 focus:w-80
                  ${
                    isDark
                      ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800"
                      : "bg-white/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white"
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div
            className={`p-6 rounded-3xl border transition-all hover:-translate-y-1 ${
              isDark
                ? "glass-dark hover:shadow-indigo-500/10"
                : "glass hover:shadow-xl hover:shadow-indigo-100/30"
            }`}
          >
            <div className="flex items-center gap-5">
              <div
                className={`p-4 rounded-2xl ${
                  isDark
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <FaBuilding size={28} />
              </div>
              <div>
                <p
                  className={`text-sm font-medium mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Total Offices
                </p>
                <h3
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {offices.length}
                </h3>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-3xl border transition-all hover:-translate-y-1 ${
              isDark
                ? "glass-dark hover:shadow-indigo-500/10"
                : "glass hover:shadow-xl hover:shadow-indigo-100/30"
            }`}
          >
            <div className="flex items-center gap-5">
              <div
                className={`p-4 rounded-2xl ${
                  isDark
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                <FaDoorOpen size={28} />
              </div>
              <div>
                <p
                  className={`text-sm font-medium mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Total Rooms
                </p>
                <h3
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {totalRooms}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
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
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl transition-all font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
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
                  className={`h-72 rounded-3xl animate-pulse ${
                    isDark ? "bg-slate-800/50" : "bg-slate-200/50"
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
                className={`group relative h-full min-h-[280px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300
                  ${
                    isDark
                      ? "border-slate-700 hover:border-indigo-500 hover:bg-slate-800/30"
                      : "border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30"
                  }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                    isDark
                      ? "bg-slate-800 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-indigo-500/30"
                      : "bg-slate-100 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-indigo-500/30"
                  }`}
                >
                  <FaPlus size={24} />
                </div>
                <h3
                  className={`text-lg font-bold mb-1 transition-colors ${
                    isDark ? "text-white group-hover:text-indigo-400" : "text-slate-900 group-hover:text-indigo-600"
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
              className={`text-center py-20 rounded-3xl border-2 border-dashed transition-colors ${
                isDark
                  ? "border-slate-700 text-slate-500 bg-slate-800/20"
                  : "border-slate-300 text-slate-400 bg-slate-50/50"
              }`}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                <FaSearch size={24} />
              </div>
              <p className="text-lg font-medium">No offices found matching your search.</p>
              <button 
                onClick={handleAddOffice}
                className="mt-4 text-indigo-500 hover:text-indigo-600 font-medium"
              >
                Create a new office
              </button>
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
