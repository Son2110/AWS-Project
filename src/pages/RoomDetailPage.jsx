import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaThermometerHalf,
  FaTint,
  FaSun,
  FaClock,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
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
  const [chartTab, setChartTab] = useState("temperature"); // temperature, humidity, light
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
      const data = await apiService.getRoomConfig(roomId, officeId);

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
        name: `${roomId}`,
        currentTemp: data.currentTemperature,
        currentHumidity: data.currentHumidity,
        currentLight: data.currentLight,
        lastUpdate: data.lastUpdate,
      });

      // Fetch real sensor data from API
      try {
        const sensorResponse = await apiService.getSensorData(roomId, 24);
        const sensorData = sensorResponse.data || [];

        // Transform data for chart
        const transformedData = sensorData.map((item, index) => {
          // Parse timestamp (format: '29/11/2025 10:38:0')
          const [datePart, timePart] = item.timestamp.split(" ");
          const [day, month, year] = datePart.split("/");
          const [hours, minutes, seconds] = timePart.split(":");
          const date = new Date(year, month - 1, day, hours, minutes, seconds);

          // Parse values with units (remove units and convert to numbers)
          const parseValue = (str) => {
            if (!str) return 0;
            // Extract number from string like '25.68 °C' or '16.6 %' or '24.9 cd'
            const match = str.toString().match(/[\d.]+/);
            return match ? parseFloat(match[0]) : 0;
          };

          return {
            // Use timestamp with seconds to ensure unique time values
            time: date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }),
            temperature: parseValue(item.temperature),
            humidity: parseValue(item.humidity),
            light: parseValue(item.lighting), // Note: 'lighting' not 'light'
            // Add index as backup identifier
            index: index,
          };
        });

        setChartData(transformedData);
      } catch (sensorError) {
        console.error("Error fetching sensor data:", sensorError);
        // Set empty chart data if sensor data fetch fails
        setChartData([]);
      }
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
      name: `${roomId}`,
      currentTemp: 25,
      currentHumidity: 60,
      currentLight: 450,
    });
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

      await apiService.updateRoomConfig(roomId, officeId, updates);

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
        className={`min-h-screen flex justify-center items-center transition-colors duration-300 ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

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

      {/* Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
          isDark
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className={`flex items-center gap-2 font-medium transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaArrowLeft />
              <span>Back to Overview</span>
            </button>
            <ThemeToggle />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1
                className={`text-3xl font-bold mb-1 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {roomData?.name}
              </h1>
              <p
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Manage environment settings and view real-time data
              </p>
            </div>

            {/* Tab Navigation */}
            <div
              className={`flex p-1 rounded-xl ${
                isDark ? "bg-slate-800" : "bg-slate-100"
              }`}
            >
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === "dashboard"
                    ? isDark
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-white text-indigo-600 shadow-sm"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("config")}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === "config"
                    ? isDark
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-white text-indigo-600 shadow-sm"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Configuration
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* Current Readings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Temperature Card */}
              <div
                className={`rounded-3xl p-6 relative overflow-hidden group ${
                  isDark ? "bg-slate-800" : "bg-white"
                } shadow-xl`}
              >
                <div
                  className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}
                >
                  <FaThermometerHalf className="text-9xl" />
                </div>
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                      isDark
                        ? "bg-orange-900/30 text-orange-400"
                        : "bg-orange-100 text-orange-500"
                    }`}
                  >
                    <FaThermometerHalf className="text-2xl" />
                  </div>
                  <p
                    className={`text-sm font-medium mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Temperature
                  </p>
                  <p
                    className={`text-4xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {roomData?.currentTemp}°C
                  </p>
                </div>
              </div>

              {/* Humidity Card */}
              <div
                className={`rounded-3xl p-6 relative overflow-hidden group ${
                  isDark ? "bg-slate-800" : "bg-white"
                } shadow-xl`}
              >
                <div
                  className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}
                >
                  <FaTint className="text-9xl" />
                </div>
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                      isDark
                        ? "bg-blue-900/30 text-blue-400"
                        : "bg-blue-100 text-blue-500"
                    }`}
                  >
                    <FaTint className="text-2xl" />
                  </div>
                  <p
                    className={`text-sm font-medium mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Humidity
                  </p>
                  <p
                    className={`text-4xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {roomData?.currentHumidity}%
                  </p>
                </div>
              </div>

              {/* Light Card */}
              <div
                className={`rounded-3xl p-6 relative overflow-hidden group ${
                  isDark ? "bg-slate-800" : "bg-white"
                } shadow-xl`}
              >
                <div
                  className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}
                >
                  <FaSun className="text-9xl" />
                </div>
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                      isDark
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-yellow-100 text-yellow-500"
                    }`}
                  >
                    <FaSun className="text-2xl" />
                  </div>
                  <p
                    className={`text-sm font-medium mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Light Intensity
                  </p>
                  <p
                    className={`text-4xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {roomData?.currentLight}{" "}
                    <span className="text-lg font-normal opacity-60">lux</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div
              className={`rounded-3xl shadow-xl p-6 md:p-8 ${
                isDark ? "bg-slate-800" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Environmental Trends
                  </h2>
                  <p
                    className={`text-sm ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Last 24 Hours
                  </p>
                </div>
              </div>

              {/* Chart Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                  onClick={() => setChartTab("temperature")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    chartTab === "temperature"
                      ? isDark
                        ? "bg-orange-600 text-white"
                        : "bg-orange-500 text-white"
                      : isDark
                      ? "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <FaThermometerHalf />
                  Temperature
                </button>
                <button
                  onClick={() => setChartTab("humidity")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    chartTab === "humidity"
                      ? isDark
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                      : isDark
                      ? "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <FaTint />
                  Humidity
                </button>
                <button
                  onClick={() => setChartTab("light")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    chartTab === "light"
                      ? isDark
                        ? "bg-yellow-600 text-white"
                        : "bg-yellow-500 text-white"
                      : isDark
                      ? "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <FaSun />
                  Light
                </button>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartTab === "temperature" && (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorTemp"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ef4444"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ef4444"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#374151" : "#e5e7eb"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="time"
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        domain={[15, 35]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          borderColor: isDark ? "#374151" : "#e5e7eb",
                          borderRadius: "12px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          color: isDark ? "#f3f4f6" : "#111827",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: "20px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTemp)"
                        name="Nhiệt độ (°C)"
                      />
                    </AreaChart>
                  )}

                  {chartTab === "humidity" && (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorHumid"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#374151" : "#e5e7eb"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="time"
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        domain={[30, 80]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          borderColor: isDark ? "#374151" : "#e5e7eb",
                          borderRadius: "12px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          color: isDark ? "#f3f4f6" : "#111827",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: "20px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorHumid)"
                        name="Độ ẩm (%)"
                      />
                    </AreaChart>
                  )}

                  {chartTab === "light" && (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorLight"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#eab308"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#eab308"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#374151" : "#e5e7eb"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="time"
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        domain={[100, 500]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          borderColor: isDark ? "#374151" : "#e5e7eb",
                          borderRadius: "12px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          color: isDark ? "#f3f4f6" : "#111827",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: "20px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="light"
                        stroke="#eab308"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorLight)"
                        name="Ánh sáng (lux)"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === "config" && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div
              className={`rounded-3xl shadow-xl overflow-hidden ${
                isDark ? "bg-slate-800" : "bg-white"
              }`}
            >
              <div
                className={`p-8 border-b ${
                  isDark ? "border-slate-700" : "border-slate-100"
                }`}
              >
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Room Configuration
                </h2>
                <p
                  className={`${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Adjust automated systems and targets
                </p>
              </div>

              <div className="p-8 space-y-8">
                {/* Temperature Control */}
                <div
                  className={`p-6 rounded-2xl border ${
                    isDark
                      ? "bg-slate-900/50 border-slate-700"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isDark
                          ? "bg-orange-900/30 text-orange-400"
                          : "bg-orange-100 text-orange-500"
                      }`}
                    >
                      <FaThermometerHalf />
                    </div>
                    <h3
                      className={`text-lg font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Temperature Control
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Operation Mode
                      </label>
                      <div
                        className={`flex p-1 rounded-xl ${
                          isDark
                            ? "bg-slate-800"
                            : "bg-white border border-slate-200"
                        }`}
                      >
                        {["auto", "manual", "off"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() =>
                              setConfigData({
                                ...configData,
                                temperatureMode: mode,
                              })
                            }
                            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                              configData.temperatureMode === mode
                                ? "bg-indigo-600 text-white shadow-md"
                                : isDark
                                ? "text-slate-400 hover:text-white"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Target Temperature
                      </label>
                      <div className="relative">
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
                          className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${
                            isDark
                              ? "bg-slate-800 border-slate-700 focus:border-indigo-500 text-white"
                              : "bg-white border-slate-200 focus:border-indigo-500 text-slate-900"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                        <span
                          className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          °C
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Humidity Control */}
                <div
                  className={`p-6 rounded-2xl border ${
                    isDark
                      ? "bg-slate-900/50 border-slate-700"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isDark
                          ? "bg-blue-900/30 text-blue-400"
                          : "bg-blue-100 text-blue-500"
                      }`}
                    >
                      <FaTint />
                    </div>
                    <h3
                      className={`text-lg font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Humidity Control
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Operation Mode
                      </label>
                      <div
                        className={`flex p-1 rounded-xl ${
                          isDark
                            ? "bg-slate-800"
                            : "bg-white border border-slate-200"
                        }`}
                      >
                        {["auto", "manual", "off"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() =>
                              setConfigData({
                                ...configData,
                                humidityMode: mode,
                              })
                            }
                            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                              configData.humidityMode === mode
                                ? "bg-indigo-600 text-white shadow-md"
                                : isDark
                                ? "text-slate-400 hover:text-white"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Target Humidity
                      </label>
                      <div className="relative">
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
                          className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${
                            isDark
                              ? "bg-slate-800 border-slate-700 focus:border-indigo-500 text-white"
                              : "bg-white border-slate-200 focus:border-indigo-500 text-slate-900"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                        <span
                          className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Light Control */}
                <div
                  className={`p-6 rounded-2xl border ${
                    isDark
                      ? "bg-slate-900/50 border-slate-700"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isDark
                          ? "bg-yellow-900/30 text-yellow-400"
                          : "bg-yellow-100 text-yellow-500"
                      }`}
                    >
                      <FaSun />
                    </div>
                    <h3
                      className={`text-lg font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Light Control
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Operation Mode
                      </label>
                      <div
                        className={`flex p-1 rounded-xl ${
                          isDark
                            ? "bg-slate-800"
                            : "bg-white border border-slate-200"
                        }`}
                      >
                        {["auto", "manual", "off"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() =>
                              setConfigData({ ...configData, lightMode: mode })
                            }
                            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                              configData.lightMode === mode
                                ? "bg-indigo-600 text-white shadow-md"
                                : isDark
                                ? "text-slate-400 hover:text-white"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Target Light
                      </label>
                      <div className="relative">
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
                          className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${
                            isDark
                              ? "bg-slate-800 border-slate-700 focus:border-indigo-500 text-white"
                              : "bg-white border-slate-200 focus:border-indigo-500 text-slate-900"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                        <span
                          className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          lux
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Settings */}
                <div
                  className={`p-6 rounded-2xl border ${
                    isDark
                      ? "bg-green-900/10 border-green-900/30"
                      : "bg-green-50 border-green-100"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isDark
                          ? "bg-green-900/30 text-green-400"
                          : "bg-green-100 text-green-500"
                      }`}
                    >
                      <FaClock />
                    </div>
                    <h3
                      className={`text-lg font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Auto Schedule
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
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
                        className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${
                          isDark
                            ? "bg-slate-800 border-slate-700 focus:border-green-500 text-white"
                            : "bg-white border-slate-200 focus:border-green-500 text-slate-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
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
                        className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${
                          isDark
                            ? "bg-slate-800 border-slate-700 focus:border-green-500 text-white"
                            : "bg-white border-slate-200 focus:border-green-500 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isSaving}
                    className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Saving Settings...
                      </>
                    ) : (
                      <>
                        <FaSave /> Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`rounded-3xl shadow-2xl max-w-md w-full p-8 ${
              isDark ? "bg-slate-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-2xl font-bold mb-4 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Confirm Changes
            </h3>
            <p
              className={`mb-8 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Are you sure you want to save these changes to the room
              configuration?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  isDark
                    ? "bg-slate-700 hover:bg-slate-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all"
              >
                Confirm Save
              </button>
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
