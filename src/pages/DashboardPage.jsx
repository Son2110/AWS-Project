import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaUserShield, FaHistory, FaSearch } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/layout/Navbar";
import RoomCard from "../components/room/RoomCard";
import apiService from "../services/apiService";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [userName, setUserName] = useState("Loading...");
  const [userGroups, setUserGroups] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

      if (!officeId) {
        setRooms([]);
        setIsLoading(false);
        return;
      }

      const roomsData = await apiService.getRoomsByOffice(officeId);
      const rooms = roomsData.rooms || [];

      // Generate alerts based on temperature
      const alerts = [];
      rooms.forEach((room) => {
        if (room.temperature > 30) {
          alerts.push({
            id: room.id || room.roomId,
            time: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            message: `${room.name} temperature exceeds safe threshold (${room.temperature}°C)!`,
            severity: "high",
          });
        }
      });

      setAlerts(alerts);
      setRooms(rooms);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      const mockRooms = [
        {
          id: "room-1",
          name: "Meeting Room A",
          temperature: 22,
          humidity: 45,
          occupancy: 4,
          maxOccupancy: 8,
          status: "occupied",
          targetTemperature: 24,
          targetHumidity: 45,
          targetLight: 500,
        },
        {
          id: "room-2",
          name: "Meeting Room B",
          temperature: 24,
          humidity: 40,
          occupancy: 0,
          maxOccupancy: 6,
          status: "available",
          targetTemperature: 22,
          targetHumidity: 40,
          targetLight: 0,
        },
        {
          id: "room-3",
          name: "Server Room",
          temperature: 32,
          humidity: 35,
          occupancy: 1,
          maxOccupancy: 2,
          status: "maintenance",
          targetTemperature: 18,
          targetHumidity: 35,
          targetLight: 200,
        },
        {
          id: "room-4",
          name: "Office 1",
          temperature: 23,
          humidity: 42,
          occupancy: 2,
          maxOccupancy: 4,
          status: "occupied",
          targetTemperature: 23,
          targetHumidity: 45,
          targetLight: 400,
        },
      ];

      const mockAlerts = [
        {
          id: "room-3",
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          message: "Server Room temperature exceeds safe threshold (32°C)!",
          severity: "high",
        },
      ];

      setRooms(mockRooms);
      setAlerts(mockAlerts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomClick = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  const filteredRooms = rooms.filter(room => 
    (room.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.roomId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-3xl opacity-20 ${isDark ? 'bg-indigo-900' : 'bg-indigo-200'}`}></div>
        <div className={`absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-3xl opacity-20 ${isDark ? 'bg-violet-900' : 'bg-violet-200'}`}></div>
      </div>

      {/* Navbar */}
      <Navbar userName={userName} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Page Title & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Office Overview
            </h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Monitor and manage your workspace environment
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative">
                <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input 
                    type="text" 
                    placeholder="Search rooms..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all ${
                        isDark 
                            ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500' 
                            : 'bg-white border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400'
                    }`}
                />
            </div>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex gap-2">
                <button
                    onClick={() => navigate("/managers")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                        isDark 
                            ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700' 
                            : 'bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200'
                    }`}
                    title="Manage Managers"
                >
                    <FaUserShield />
                </button>
                <button
                    onClick={() => navigate("/activity-logs")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                        isDark 
                            ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700' 
                            : 'bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200'
                    }`}
                    title="View Activity Logs"
                >
                    <FaHistory />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-10 animate-fade-in">
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>System Alerts</h3>
            <div className="grid gap-4">
                {alerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`p-4 rounded-2xl flex items-start gap-4 border ${
                    alert.severity === "high"
                        ? isDark ? "bg-red-900/10 border-red-900/30 text-red-200" : "bg-red-50 border-red-100 text-red-700"
                        : isDark ? "bg-yellow-900/10 border-yellow-900/30 text-yellow-200" : "bg-yellow-50 border-yellow-100 text-yellow-700"
                    }`}
                >
                    <div className={`p-2 rounded-full ${
                        alert.severity === "high"
                            ? isDark ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600"
                            : isDark ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-600"
                    }`}>
                        <FaExclamationTriangle />
                    </div>
                    <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className={`text-xs mt-1 opacity-70`}>{alert.time}</p>
                    </div>
                </div>
                ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading dashboard data...</p>
          </div>
        ) : (
          /* Room Cards Grid */
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
                <div className={`text-center py-20 rounded-3xl border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                    <p className="text-lg">No rooms found matching "{searchQuery}"</p>
                </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
