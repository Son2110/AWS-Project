import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaSignOutAlt,
  FaUserShield,
  FaHistory,
} from "react-icons/fa";
import { getCurrentUser, signOut, fetchAuthSession } from "aws-amplify/auth";
import apiService from "../services/apiService";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import RoomCard from "./RoomCard";

const Dashboard = () => {
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
      // Check if user is authenticated
      const user = await getCurrentUser();

      // Get user attributes
      setUserName(user.username || user.userId);

      // Get user groups from JWT token
      const session = await fetchAuthSession();
      const groups =
        session.tokens?.accessToken?.payload["cognito:groups"] || [];
      setUserGroups(groups);
      setIsAdmin(groups.includes("Admins"));

      console.log("User authenticated:", user.username);
      console.log("User groups:", groups);

      // Fetch dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error("Not authenticated:", error);
      // Redirect to login if not authenticated
      navigate("/");
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Call API Gateway với Cognito JWT token
      const response = await apiService.getRooms();

      console.log("API Response:", response);

      // Parse rooms data
      const rooms = response.rooms || [];

      // Generate alerts dựa trên temperature
      const alerts = [];
      rooms.forEach((room) => {
        if (room.temperature > 30) {
          alerts.push({
            id: room.roomId,
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
      setAlerts([
        {
          id: 1,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          message:
            "Failed to load data from API. Please check your connection.",
          severity: "high",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // AWS Cognito Sign Out
      await signOut();
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
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
      {/* Header */}
      <header
        className="shadow-md transition-colors duration-300"
        style={{
          backgroundColor: isDark ? "rgb(31, 41, 55)" : "rgb(255, 255, 255)",
        }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg transition-colors duration-300"
              style={{
                backgroundColor: isDark
                  ? "rgb(30, 58, 138)"
                  : "rgb(219, 234, 254)",
              }}
            >
              <svg
                className="w-8 h-8 transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(147, 197, 253)" : "rgb(37, 99, 235)",
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1
              className="text-2xl font-bold transition-colors duration-300"
              style={{
                color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
              }}
            >
              Smart Office
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span
              className="font-medium transition-colors duration-300"
              style={{
                color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
              }}
            >
              {userName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title & Admin Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2
            className="text-3xl font-bold transition-colors duration-300"
            style={{ color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)" }}
          >
            Office Overview
          </h2>

          {/* Admin Quick Access Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/managers")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 hover:shadow-lg"
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
              <span>Managers</span>
            </button>
            <button
              onClick={() => navigate("/activity-logs")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 hover:shadow-lg"
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
              <span>Activity Logs</span>
            </button>
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
              <RoomCard key={room.id} room={room} onClick={handleRoomClick} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
