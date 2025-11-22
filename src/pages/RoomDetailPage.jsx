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

const RoomDetailPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { isDark } = useTheme();
  const [roomData, setRoomData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [mode, setMode] = useState("auto");
  const [controls, setControls] = useState({
    light: false,
    ac: false,
  });
  const [autoSettings, setAutoSettings] = useState({
    tempThreshold: 26,
    lightThreshold: 300,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRoomData();
    // Set up polling every 2 minutes
    const interval = setInterval(fetchRoomData, 120000);
    return () => clearInterval(interval);
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      setIsLoading(true);
      // TODO: Call API Gateway - GET /api/sensors/{roomId}?duration=24h
      // const response = await fetch(`${API_ENDPOINT}/api/sensors/${roomId}?duration=24h`);
      // const data = await response.json();

      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockRoomData = {
        id: roomId,
        name: getRoomName(roomId),
        currentTemp: 25,
        currentHumidity: 60,
        currentLight: 450,
        mode: "auto",
        controls: {
          light: true,
          ac: false,
        },
        autoSettings: {
          tempThreshold: 26,
          lightThreshold: 300,
        },
      };

      // Generate mock chart data for last 24 hours
      const mockChartData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 20,
      }));

      setRoomData(mockRoomData);
      setChartData(mockChartData);
      setMode(mockRoomData.mode);
      setControls(mockRoomData.controls);
      setAutoSettings(mockRoomData.autoSettings);
    } catch (error) {
      console.error("Error fetching room data:", error);
    } finally {
      setIsLoading(false);
    }
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
    try {
      setIsSaving(true);

      const configData = {
        mode,
        controls: mode === "manual" ? controls : undefined,
        autoSettings: mode === "auto" ? autoSettings : undefined,
      };

      // TODO: Call API Gateway - POST /api/config/{roomId}
      // const response = await fetch(`${API_ENDPOINT}/api/config/${roomId}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(configData)
      // });

      console.log("Saving config:", configData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
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
            Manage: {roomData?.name}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Monitoring */}
          <div className="space-y-6">
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
                Sensor Data
                <span
                  className="text-sm font-normal ml-2 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
                  }}
                >
                  (Updates every 2 minutes)
                </span>
              </h2>

              {/* Current Readings */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div
                  className="p-4 rounded-lg text-center transition-colors duration-300"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgb(254, 242, 242)",
                  }}
                >
                  <FaThermometerHalf className="text-3xl text-red-500 mx-auto mb-2" />
                  <p
                    className="text-sm mb-1 transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
                    }}
                  >
                    Temperature
                  </p>
                  <p
                    className="text-2xl font-bold transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                    }}
                  >
                    {roomData?.currentTemp}°C
                  </p>
                </div>
                <div
                  className="p-4 rounded-lg text-center transition-colors duration-300"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgb(239, 246, 255)",
                  }}
                >
                  <FaTint className="text-3xl text-blue-500 mx-auto mb-2" />
                  <p
                    className="text-sm mb-1 transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
                    }}
                  >
                    Humidity
                  </p>
                  <p
                    className="text-2xl font-bold transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                    }}
                  >
                    {roomData?.currentHumidity}%
                  </p>
                </div>
                <div
                  className="p-4 rounded-lg text-center transition-colors duration-300"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(234, 179, 8, 0.1)"
                      : "rgb(254, 252, 232)",
                  }}
                >
                  <FaSun className="text-3xl text-yellow-500 mx-auto mb-2" />
                  <p
                    className="text-sm mb-1 transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
                    }}
                  >
                    Light
                  </p>
                  <p
                    className="text-2xl font-bold transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                    }}
                  >
                    {roomData?.currentLight} lux
                  </p>
                </div>
              </div>

              {/* Chart */}
              <h3
                className="text-lg font-semibold mb-4 transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              >
                Last 24 Hours
              </h3>
              <ResponsiveContainer width="100%" height={300}>
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

          {/* Column 2: Controls */}
          <div className="space-y-6">
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
                Control Panel
              </h2>

              {/* Mode Toggle */}
              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-3 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                  }}
                >
                  Mode
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setMode("auto")}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all"
                    style={{
                      backgroundColor:
                        mode === "auto"
                          ? "rgb(22, 163, 74)"
                          : isDark
                          ? "rgb(55, 65, 81)"
                          : "rgb(229, 231, 235)",
                      color:
                        mode === "auto"
                          ? "rgb(255, 255, 255)"
                          : isDark
                          ? "rgb(156, 163, 175)"
                          : "rgb(75, 85, 99)",
                    }}
                  >
                    Automatic
                  </button>
                  <button
                    onClick={() => setMode("manual")}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all"
                    style={{
                      backgroundColor:
                        mode === "manual"
                          ? "rgb(37, 99, 235)"
                          : isDark
                          ? "rgb(55, 65, 81)"
                          : "rgb(229, 231, 235)",
                      color:
                        mode === "manual"
                          ? "rgb(255, 255, 255)"
                          : isDark
                          ? "rgb(156, 163, 175)"
                          : "rgb(75, 85, 99)",
                    }}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {/* Manual Controls */}
              {mode === "manual" && (
                <div
                  className="space-y-4 mb-6 p-4 rounded-lg transition-colors duration-300"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgb(239, 246, 255)",
                  }}
                >
                  <h3
                    className="font-semibold transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                    }}
                  >
                    Manual Control
                  </h3>

                  <div className="flex items-center justify-between">
                    <span
                      className="transition-colors duration-300"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Light
                    </span>
                    <button
                      onClick={() =>
                        setControls((prev) => ({ ...prev, light: !prev.light }))
                      }
                      className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
                      style={{
                        backgroundColor: controls.light
                          ? "rgb(22, 163, 74)"
                          : isDark
                          ? "rgb(75, 85, 99)"
                          : "rgb(209, 213, 219)",
                      }}
                    >
                      <span
                        className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
                        style={{
                          transform: controls.light
                            ? "translateX(1.75rem)"
                            : "translateX(0.25rem)",
                        }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="transition-colors duration-300"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Air Conditioner
                    </span>
                    <button
                      onClick={() =>
                        setControls((prev) => ({ ...prev, ac: !prev.ac }))
                      }
                      className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
                      style={{
                        backgroundColor: controls.ac
                          ? "rgb(22, 163, 74)"
                          : isDark
                          ? "rgb(75, 85, 99)"
                          : "rgb(209, 213, 219)",
                      }}
                    >
                      <span
                        className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
                        style={{
                          transform: controls.ac
                            ? "translateX(1.75rem)"
                            : "translateX(0.25rem)",
                        }}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Automatic Settings */}
              {mode === "auto" && (
                <div
                  className="space-y-4 mb-6 p-4 rounded-lg transition-colors duration-300"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(34, 197, 94, 0.1)"
                      : "rgb(240, 253, 244)",
                  }}
                >
                  <h3
                    className="font-semibold transition-colors duration-300"
                    style={{
                      color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                    }}
                  >
                    Automatic Threshold Settings
                  </h3>

                  <div>
                    <label
                      className="block text-sm mb-2 transition-colors duration-300"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Turn on AC when temperature &gt;
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={autoSettings.tempThreshold}
                        onChange={(e) =>
                          setAutoSettings((prev) => ({
                            ...prev,
                            tempThreshold: parseInt(e.target.value),
                          }))
                        }
                        className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300"
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
                      <span
                        className="transition-colors duration-300"
                        style={{
                          color: isDark
                            ? "rgb(209, 213, 219)"
                            : "rgb(55, 65, 81)",
                        }}
                      >
                        °C
                      </span>
                    </div>
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
                      Turn on light when brightness &lt;
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={autoSettings.lightThreshold}
                        onChange={(e) =>
                          setAutoSettings((prev) => ({
                            ...prev,
                            lightThreshold: parseInt(e.target.value),
                          }))
                        }
                        className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300"
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
                      <span
                        className="transition-colors duration-300"
                        style={{
                          color: isDark
                            ? "rgb(209, 213, 219)"
                            : "rgb(55, 65, 81)",
                        }}
                      >
                        lux
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
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
        </div>
      </main>
    </div>
  );
};

export default RoomDetailPage;
