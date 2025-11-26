import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaThermometerHalf, FaTint, FaSun } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/layout/ThemeToggle";
import Toast from "../components/common/Toast";
import apiService from "../services/apiService";

const RoomDetailPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [roomData, setRoomData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [configData, setConfigData] = useState({
    temperatureMode: "auto",
    humidityMode: "auto",
    lightMode: "auto",
    targetTemperature: 26,
    targetHumidity: 60,
    targetLight: 300,
    autoOnTime: "08:00",
    autoOffTime: "17:00",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchRoomData();
    const interval = setInterval(fetchRoomData, 120000);
    return () => clearInterval(interval);
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      setIsLoading(true);

      const officeId = localStorage.getItem("officeId");
      const data = await apiService.getRoomConfig(officeId, roomId);

      setConfigData({
        temperatureMode: data.temperatureMode || "auto",
        humidityMode: data.humidityMode || "auto",
        lightMode: data.lightMode || "auto",
        targetTemperature: data.targetTemperature || 26,
        targetHumidity: data.targetHumidity || 60,
        targetLight: data.targetLight || 300,
        autoOnTime: data.autoOnTime || "08:00",
        autoOffTime: data.autoOffTime || "17:00",
      });

      setRoomData({
        id: roomId,
        name: `Room ${roomId}`,
        currentTemp: 25,
        currentHumidity: 60,
        currentLight: 450,
        lastUpdate: data.lastUpdate,
      });

      const mockChartData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 20,
      }));
      setChartData(mockChartData);
    } catch (error) {
      console.error("Error fetching room data:", error);
      setDefaultRoomData();
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultRoomData = () => {
    setConfigData({
      temperatureMode: "auto",
      humidityMode: "auto",
      lightMode: "auto",
      targetTemperature: 26,
      targetHumidity: 60,
      targetLight: 300,
      autoOnTime: "08:00",
      autoOffTime: "17:00",
    });
    setRoomData({
      id: roomId,
      name: `Room ${roomId}`,
      currentTemp: 25,
      currentHumidity: 60,
      currentLight: 450,
    });
  };

  const getRoomName = (id) => {
    const names = {
      "room-a": "Meeting Room A",
      "room-b": "Meeting Room B",
      "server-room": "Server Room",
      "office-1": "Office 1",
    };
    return names[id] || "Room";
  };

  const handleSaveSettings = async () => {
    setShowConfirmModal(false);
    try {
      setIsSaving(true);

      const officeId = localStorage.getItem("officeId");

      const updates = {
        temperatureMode: configData.temperatureMode,
        humidityMode: configData.humidityMode,
        lightMode: configData.lightMode,
        targetTemperature: configData.targetTemperature,
        targetHumidity: configData.targetHumidity,
        targetLight: configData.targetLight,
        autoOnTime: configData.autoOnTime,
        autoOffTime: configData.autoOffTime,
      };

      await apiService.saveRoomConfig(officeId, roomId, updates);

      setShowConfirmModal(false);
      setToast({
        show: true,
        message: "Settings saved successfully",
        type: "success",
      });
      fetchRoomData();
    } catch (error) {
      console.error("Error saving settings:", error);
      setToast({
        show: true,
        message: "Failed to save settings",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex justify-center items-center transition-colors duration-300"
        style={{
          backgroundColor: isDark ? "rgb(17, 24, 39)" : "rgb(243, 244, 246)",
        }}
      >
        <div
          className="animate-spin rounded-full h-16 w-16 border-b-4"
          style={{
            borderColor: isDark ? "rgb(147, 197, 253)" : "rgb(37, 99, 235)",
          }}
        ></div>
      </div>
    );
  }

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 font-medium transition-colors duration-300"
              style={{
                color: isDark ? "rgb(147, 197, 253)" : "rgb(37, 99, 235)",
              }}
            >
              <FaArrowLeft />
              <span>Back to Overview</span>
            </button>
            <ThemeToggle />
          </div>
          <h1
            className="text-3xl font-bold transition-colors duration-300"
            style={{ color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)" }}
          >
            {roomData?.name}
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-4 mt-4">
          <div
            className="flex gap-2 border-b-2"
            style={{
              borderColor: isDark ? "rgb(75, 85, 99)" : "rgb(229, 231, 235)",
            }}
          >
            <button
              onClick={() => setActiveTab("dashboard")}
              className="px-6 py-3 font-semibold transition-all"
              style={{
                color:
                  activeTab === "dashboard"
                    ? isDark
                      ? "rgb(147, 197, 253)"
                      : "rgb(37, 99, 235)"
                    : isDark
                    ? "rgb(156, 163, 175)"
                    : "rgb(107, 114, 128)",
                borderBottom: activeTab === "dashboard" ? "3px solid" : "none",
                borderColor:
                  activeTab === "dashboard"
                    ? isDark
                      ? "rgb(147, 197, 253)"
                      : "rgb(37, 99, 235)"
                    : "transparent",
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className="px-6 py-3 font-semibold transition-all"
              style={{
                color:
                  activeTab === "config"
                    ? isDark
                      ? "rgb(147, 197, 253)"
                      : "rgb(37, 99, 235)"
                    : isDark
                    ? "rgb(156, 163, 175)"
                    : "rgb(107, 114, 128)",
                borderBottom: activeTab === "config" ? "3px solid" : "none",
                borderColor:
                  activeTab === "config"
                    ? isDark
                      ? "rgb(147, 197, 253)"
                      : "rgb(37, 99, 235)"
                    : "transparent",
              }}
            >
              Configuration
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Current Readings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="rounded-xl shadow-lg p-8 text-center transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgb(31, 41, 55)"
                    : "rgb(255, 255, 255)",
                }}
              >
                <FaThermometerHalf className="text-5xl text-red-500 mx-auto mb-3" />
                <p
                  className="text-sm mb-2 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
                  }}
                >
                  Temperature
                </p>
                <p
                  className="text-3xl font-bold transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                  }}
                >
                  {roomData?.currentTemp}°C
                </p>
              </div>

              <div
                className="rounded-xl shadow-lg p-8 text-center transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgb(31, 41, 55)"
                    : "rgb(255, 255, 255)",
                }}
              >
                <FaTint className="text-5xl text-blue-500 mx-auto mb-3" />
                <p
                  className="text-sm mb-2 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
                  }}
                >
                  Humidity
                </p>
                <p
                  className="text-3xl font-bold transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                  }}
                >
                  {roomData?.currentHumidity}%
                </p>
              </div>

              <div
                className="rounded-xl shadow-lg p-8 text-center transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgb(31, 41, 55)"
                    : "rgb(255, 255, 255)",
                }}
              >
                <FaSun className="text-5xl text-yellow-500 mx-auto mb-3" />
                <p
                  className="text-sm mb-2 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
                  }}
                >
                  Light
                </p>
                <p
                  className="text-3xl font-bold transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                  }}
                >
                  {roomData?.currentLight} lux
                </p>
              </div>
            </div>

            {/* Chart Section */}
            <div
              className="rounded-xl shadow-lg p-6 transition-colors duration-300"
              style={{
                backgroundColor: isDark
                  ? "rgb(31, 41, 55)"
                  : "rgb(255, 255, 255)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-4 transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              >
                Historical Data
                <span
                  className="text-sm font-normal ml-2 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
                  }}
                >
                  (Last 24 Hours)
                </span>
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ef4444"
                    name="Temperature (°C)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#3b82f6"
                    name="Humidity (%)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === "config" && (
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-xl shadow-lg p-6 transition-colors duration-300"
              style={{
                backgroundColor: isDark
                  ? "rgb(31, 41, 55)"
                  : "rgb(255, 255, 255)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6 transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              >
                Room Configuration
              </h2>

              {/* Temperature Control */}
              <div className="mb-6">
                <label
                  className="block text-sm font-bold mb-3 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                  }}
                >
                  <FaThermometerHalf className="inline mr-2 " />
                  Temperature Mode
                </label>
                <div className="flex gap-2 mb-3">
                  {["auto", "manual", "off"].map((mode) => {
                    const getColor = () => {
                      if (mode === "auto") return "rgb(22, 163, 74)";
                      if (mode === "manual") return "rgb(234, 179, 8)";
                      return "rgb(239, 68, 68)";
                    };
                    return (
                      <button
                        key={mode}
                        onClick={() =>
                          setConfigData({
                            ...configData,
                            temperatureMode: mode,
                          })
                        }
                        className="flex-1 py-2 px-3 rounded-lg font-medium transition-all text-sm"
                        style={{
                          backgroundColor:
                            configData.temperatureMode === mode
                              ? getColor()
                              : isDark
                              ? "rgb(55, 65, 81)"
                              : "rgb(229, 231, 235)",
                          color:
                            configData.temperatureMode === mode
                              ? "rgb(255, 255, 255)"
                              : isDark
                              ? "rgb(156, 163, 175)"
                              : "rgb(75, 85, 99)",
                        }}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    Target:
                  </span>
                  <input
                    type="number"
                    value={configData.targetTemperature}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        targetTemperature: parseInt(e.target.value),
                      })
                    }
                    disabled={configData.temperatureMode !== "auto"}
                    className="flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isDark
                        ? "rgb(55, 65, 81)"
                        : "rgb(255, 255, 255)",
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                      borderColor: isDark
                        ? "rgb(75, 85, 99)"
                        : "rgb(209, 213, 219)",
                    }}
                  />
                  <span
                    className="transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    °C
                  </span>
                </div>
              </div>

              {/* Humidity Control */}
              <div className="mb-6">
                <label
                  className="block text-sm font-bold mb-3 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                  }}
                >
                  <FaTint className="inline mr-2" />
                  Humidity Mode
                </label>
                <div className="flex gap-2 mb-3">
                  {["auto", "manual", "off"].map((mode) => {
                    const getColor = () => {
                      if (mode === "auto") return "rgb(22, 163, 74)";
                      if (mode === "manual") return "rgb(234, 179, 8)";
                      return "rgb(239, 68, 68)";
                    };
                    return (
                      <button
                        key={mode}
                        onClick={() =>
                          setConfigData({ ...configData, humidityMode: mode })
                        }
                        className="flex-1 py-2 px-3 rounded-lg font-medium transition-all text-sm"
                        style={{
                          backgroundColor:
                            configData.humidityMode === mode
                              ? getColor()
                              : isDark
                              ? "rgb(55, 65, 81)"
                              : "rgb(229, 231, 235)",
                          color:
                            configData.humidityMode === mode
                              ? "rgb(255, 255, 255)"
                              : isDark
                              ? "rgb(156, 163, 175)"
                              : "rgb(75, 85, 99)",
                        }}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    Target:
                  </span>
                  <input
                    type="number"
                    value={configData.targetHumidity}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        targetHumidity: parseInt(e.target.value),
                      })
                    }
                    disabled={configData.humidityMode !== "auto"}
                    className="flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isDark
                        ? "rgb(55, 65, 81)"
                        : "rgb(255, 255, 255)",
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                      borderColor: isDark
                        ? "rgb(75, 85, 99)"
                        : "rgb(209, 213, 219)",
                    }}
                  />
                  <span
                    className="transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    %
                  </span>
                </div>
              </div>

              {/* Light Control */}
              <div className="mb-6">
                <label
                  className="block text-sm font-bold mb-3 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                  }}
                >
                  <FaSun className="inline mr-2" />
                  Light Mode
                </label>
                <div className="flex gap-2 mb-3">
                  {["auto", "manual", "off"].map((mode) => {
                    const getColor = () => {
                      if (mode === "auto") return "rgb(22, 163, 74)";
                      if (mode === "manual") return "rgb(234, 179, 8)";
                      return "rgb(239, 68, 68)";
                    };
                    return (
                      <button
                        key={mode}
                        onClick={() =>
                          setConfigData({ ...configData, lightMode: mode })
                        }
                        className="flex-1 py-2 px-3 rounded-lg font-medium transition-all text-sm"
                        style={{
                          backgroundColor:
                            configData.lightMode === mode
                              ? getColor()
                              : isDark
                              ? "rgb(55, 65, 81)"
                              : "rgb(229, 231, 235)",
                          color:
                            configData.lightMode === mode
                              ? "rgb(255, 255, 255)"
                              : isDark
                              ? "rgb(156, 163, 175)"
                              : "rgb(75, 85, 99)",
                        }}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    Target:
                  </span>
                  <input
                    type="number"
                    value={configData.targetLight}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        targetLight: parseInt(e.target.value),
                      })
                    }
                    disabled={configData.lightMode !== "auto"}
                    className="flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isDark
                        ? "rgb(55, 65, 81)"
                        : "rgb(255, 255, 255)",
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                      borderColor: isDark
                        ? "rgb(75, 85, 99)"
                        : "rgb(209, 213, 219)",
                    }}
                  />
                  <span
                    className="transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    lux
                  </span>
                </div>
              </div>

              {/* Schedule Settings */}
              <div
                className="mb-6 p-4 rounded-lg transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgba(34, 197, 94, 0.1)"
                    : "rgb(240, 253, 244)",
                }}
              >
                <h3
                  className="font-semibold mb-4 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                  }}
                >
                  Auto Schedule
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm mb-2 transition-colors duration-300"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Auto On Time
                    </label>
                    <input
                      type="time"
                      value={configData.autoOnTime}
                      onChange={(e) =>
                        setConfigData({
                          ...configData,
                          autoOnTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300"
                      style={{
                        backgroundColor: isDark
                          ? "rgb(55, 65, 81)"
                          : "rgb(255, 255, 255)",
                        color: isDark
                          ? "rgb(243, 244, 246)"
                          : "rgb(31, 41, 55)",
                        borderColor: isDark
                          ? "rgb(75, 85, 99)"
                          : "rgb(209, 213, 219)",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm mb-2 transition-colors duration-300"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Auto Off Time
                    </label>
                    <input
                      type="time"
                      value={configData.autoOffTime}
                      onChange={(e) =>
                        setConfigData({
                          ...configData,
                          autoOffTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300"
                      style={{
                        backgroundColor: isDark
                          ? "rgb(55, 65, 81)"
                          : "rgb(255, 255, 255)",
                        color: isDark
                          ? "rgb(243, 244, 246)"
                          : "rgb(31, 41, 55)",
                        borderColor: isDark
                          ? "rgb(75, 85, 99)"
                          : "rgb(209, 213, 219)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isSaving}
                className="w-full py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "rgb(22, 163, 74)",
                  color: "rgb(255, 255, 255)",
                }}
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div
            className="rounded-xl shadow-2xl max-w-md w-full transition-colors duration-300"
            style={{
              backgroundColor: isDark
                ? "rgb(31, 41, 55)"
                : "rgb(255, 255, 255)",
            }}
          >
            <div className="p-6">
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              >
                Confirm Changes
              </h2>
              <p
                className="mb-6"
                style={{
                  color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                }}
              >
                Are you sure you want to save these configuration changes? This
                will update the room settings.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 rounded-lg border-2 font-semibold transition-colors"
                  style={{
                    borderColor: isDark
                      ? "rgb(75, 85, 99)"
                      : "rgb(209, 213, 219)",
                    color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
        duration={3000}
      />
    </div>
  );
};

export default RoomDetailPage;
