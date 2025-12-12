import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaPlus,
  FaServer,
  FaEye,
  FaEyeSlash,
  FaCopy,
  FaCheck,
  FaHome,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/layout/Navbar";
import RoomCard from "../components/room/RoomCard";
import CreateRoomModal from "../components/room/CreateRoomModal";
import apiService from "../services/apiService";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [userName, setUserName] = useState("Loading...");
  const [userGroups, setUserGroups] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [officeId, setOfficeId] = useState("");
  const [showIoTEndpoint, setShowIoTEndpoint] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iotEndpoint, setIotEndpoint] = useState("Loading...");

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      if (!isAuthenticated) {
        navigate("/");
        return;
      }

      const userName = localStorage.getItem("userName") || "Unknown User";
      const groups = JSON.parse(localStorage.getItem("userGroups") || "[]");

      setUserName(userName);
      setUserGroups(groups);
      setIsAdmin(groups.includes("Admin"));
      await fetchDashboardData();
    } catch (error) {
      console.error("Authentication error:", error);
      navigate("/");
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      const officeId = localStorage.getItem("officeId");
      setOfficeId(officeId || "");

      if (!officeId) {
        setRooms([]);
        setIsLoading(false);
        return;
      }

      const roomsData = await apiService.getRoomsByOffice(officeId);
      const rooms = roomsData.rooms || [];

      // Get IoT endpoint from response or localStorage
      const endpoint =
        roomsData.iotEndpoint ||
        localStorage.getItem("iotEndpoint") ||
        "Not available";
      setIotEndpoint(endpoint);

      setRooms(rooms);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoomSuccess = () => {
    fetchDashboardData();
  };

  const handleRoomClick = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(iotEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRooms = rooms.filter(
    (room) =>
      (room.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.roomId || "").toLowerCase().includes(searchQuery.toLowerCase())
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
          className={`absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full blur-3xl opacity-20 ${
            isDark ? "bg-blue-900" : "bg-blue-200"
          }`}
        ></div>
      </div>

      {/* Navbar */}
      <Navbar userName={userName} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Page Title & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-slide-up">
          <div>
            <h2
              className={`text-3xl font-bold mb-2 flex items-center gap-3 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              <div className={`p-2 rounded-xl ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
                <FaHome size={24} />
              </div>
              Office Overview
            </h2>
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Monitor and manage your workspace environment
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative group">
              <FaSearch
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark ? "text-slate-500 group-focus-within:text-indigo-400" : "text-slate-400 group-focus-within:text-indigo-500"
                }`}
              />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full sm:w-64 pl-10 pr-4 py-3 rounded-xl border outline-none transition-all ${
                  isDark
                    ? "bg-slate-800/50 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500 focus:bg-slate-800"
                    : "bg-white/50 border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400 focus:bg-white"
                }`}
              />
            </div>

            <div className="flex gap-2">
              {/* Create Room Button */}
              <button
                onClick={() => setShowCreateRoomModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
                title="Create New Room"
              >
                <FaPlus />
                <span className="hidden sm:inline">Create Room</span>
              </button>
            </div>
          </div>
        </div>

        {/* IoT Endpoint Section */}
        <div
          className={`mb-8 rounded-3xl border transition-all animate-slide-up ${
            isDark
              ? "glass-dark"
              : "glass"
          }`}
          style={{ animationDelay: "0.1s" }}
        >
          <button
            onClick={() => setShowIoTEndpoint(!showIoTEndpoint)}
            className={`w-full flex items-center justify-between p-6 transition-colors rounded-3xl ${
              isDark ? "hover:bg-slate-800/30" : "hover:bg-white/30"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl ${
                  isDark
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                <FaServer className="text-xl" />
              </div>
              <div className="text-left">
                <h3
                  className={`font-bold text-lg ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  IoT Endpoint Configuration
                </h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  AWS IoT Core endpoint for device connection
                </p>
              </div>
            </div>
            <div
              className={`p-2 rounded-full transition-transform duration-300 ${
                showIoTEndpoint ? "rotate-180 bg-slate-800 text-white" : ""
              } ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {showIoTEndpoint ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </div>
          </button>

          {showIoTEndpoint && (
            <div
              className={`p-6 border-t ${
                isDark ? "border-slate-700/50" : "border-slate-200/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <code
                  className={`flex-1 px-4 py-3 rounded-xl font-mono text-sm ${
                    isDark
                      ? "bg-slate-950/50 text-indigo-400 border border-slate-800"
                      : "bg-slate-50 text-indigo-600 border border-slate-200"
                  }`}
                >
                  {iotEndpoint}
                </code>
                <button
                  onClick={handleCopyEndpoint}
                  className={`p-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                    copied
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : isDark
                      ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  }`}
                  title={copied ? "Copied!" : "Copy endpoint"}
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p
                className={`mt-3 text-xs ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Use this endpoint to configure your IoT devices for MQTT
                connection
              </p>
            </div>
          )}
        </div>

        {/*  Loading State */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
            </div>
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Loading dashboard data...
            </p>
          </div>
        ) : (
          <>
            {filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.roomId || room.id}
                    room={{
                      ...room,
                      id: room.roomId || room.id,
                      name: room.roomId || room.name || "Unknown Room",
                    }}
                    onClick={handleRoomClick}
                  />
                ))}
              </div>
            ) : (
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
                <p className="text-lg font-medium">
                  No rooms found matching "{searchQuery}"
                </p>
                <p className="text-sm mt-2 opacity-70">Try adjusting your search or create a new room</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        onSuccess={handleCreateRoomSuccess}
        officeId={officeId}
      />
    </div>
  );
};

export default DashboardPage;
