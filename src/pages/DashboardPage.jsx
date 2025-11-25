import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaUserShield, FaHistory } from "react-icons/fa";
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
      const userEmail = localStorage.getItem("userEmail") || "";
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
        },
        {
          id: "room-2",
          name: "Meeting Room B",
          temperature: 24,
          humidity: 40,
          occupancy: 0,
          maxOccupancy: 6,
          status: "available",
        },
        {
          id: "room-3",
          name: "Server Room",
          temperature: 32,
          humidity: 35,
          occupancy: 1,
          maxOccupancy: 2,
          status: "maintenance",
        },
        {
          id: "room-4",
          name: "Office 1",
          temperature: 23,
          humidity: 42,
          occupancy: 2,
          maxOccupancy: 4,
          status: "occupied",
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

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "rgb(17, 24, 39)" : "rgb(243, 244, 246)",
      }}
    >
      {/* Navbar */}
      <Navbar userName={userName} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title & Admin Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2
            className="text-2xl sm:text-3xl font-bold transition-colors duration-300"
            style={{ color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)" }}
          >
            Office Overview
          </h2>

          {/* Quick Access Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Managers button - Admin only */}
            {isAdmin && (
              <button
                onClick={() => navigate("/managers")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors duration-300 hover:shadow-lg text-sm sm:text-base"
                style={{
                  backgroundColor: isDark
                    ? "rgb(55, 65, 81)"
                    : "rgb(255, 255, 255)",
                  color: isDark ? "rgb(147, 197, 253)" : "rgb(37, 99, 235)",
                  border: isDark
                    ? "2px solid rgb(75, 85, 99)"
                    : "2px solid rgb(219, 234, 254)",
                }}
              >
                <FaUserShield />
                <span className="hidden sm:inline">Managers</span>
              </button>
            )}

            {/* Activity Logs button - Admin only */}
            {isAdmin && (
              <button
                onClick={() => navigate("/activity-logs")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors duration-300 hover:shadow-lg text-sm sm:text-base"
                style={{
                  backgroundColor: isDark
                    ? "rgb(55, 65, 81)"
                    : "rgb(255, 255, 255)",
                  color: isDark ? "rgb(147, 197, 253)" : "rgb(37, 99, 235)",
                  border: isDark
                    ? "2px solid rgb(75, 85, 99)"
                    : "2px solid rgb(219, 234, 254)",
                }}
              >
                <FaHistory />
                <span className="hidden sm:inline">Activity Logs</span>
              </button>
            )}
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  alert.severity === "high"
                    ? "bg-red-100 border-2 border-red-300"
                    : "bg-yellow-100 border-2 border-yellow-300"
                }`}
              >
                <FaExclamationTriangle
                  className={`text-2xl mt-1 ${
                    alert.severity === "high"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                />
                <div>
                  <p
                    className={`font-semibold ${
                      alert.severity === "high"
                        ? "text-red-800"
                        : "text-yellow-800"
                    }`}
                  >
                    [{alert.time}] {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : (
          /* Room Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
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
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
