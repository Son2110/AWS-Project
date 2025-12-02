import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaHistory, FaSearch, FaPlus } from "react-icons/fa";
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
      </div>

      {/* Navbar */}
      <Navbar userName={userName} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Page Title & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Office Overview
            </h2>
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Monitor and manage your workspace environment
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative">
              <FaSearch
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all ${
                  isDark
                    ? "bg-slate-800 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500"
                    : "bg-white border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>

            <div className="flex gap-2">
              {/* Create Room Button */}
              <button
                onClick={() => setShowCreateRoomModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/30"
                title="Create New Room"
              >
                <FaPlus />
                <span className="hidden sm:inline">Create Room</span>
              </button>

              {/* Admin Controls */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate("/managers")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700"
                        : "bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200"
                    }`}
                    title="Manage Managers"
                  >
                    <FaUserShield />
                  </button>
                  <button
                    onClick={() => navigate("/activity-logs")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700"
                        : "bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200"
                    }`}
                    title="View Activity Logs"
                  >
                    <FaHistory />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {/*  Loading State */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Loading dashboard data...
            </p>
          </div>
        ) : (
          <>
            {filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                className={`text-center py-20 rounded-3xl border border-dashed ${
                  isDark
                    ? "border-slate-700 text-slate-500"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                <p className="text-lg">
                  No rooms found matching "{searchQuery}"
                </p>
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
