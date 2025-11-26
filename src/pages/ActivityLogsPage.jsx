import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHistory,
  FaFilter,
  FaDownload,
  FaArrowLeft,
  FaThermometerHalf,
  FaLightbulb,
  FaSnowflake,
  FaCog,
  FaUser,
  FaCalendarAlt,
  FaSearch
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/layout/ThemeToggle";

const ActivityLogsPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    room: "all",
    action: "all",
    user: "all",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, logs]);

  const fetchActivityLogs = async () => {
    try {
      setIsLoading(true);
      // TODO: Call API Gateway - GET /api/admin/activity-logs
      // const response = await fetch(`${API_ENDPOINT}/api/admin/activity-logs`);
      // const data = await response.json();

      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockLogs = [
        {
          id: 1,
          timestamp: "2025-11-03 09:45:23",
          room: "Meeting Room A",
          action: "temperature_changed",
          device: "AC",
          oldValue: "26°C",
          newValue: "24°C",
          user: "Hoang Son",
          mode: "manual",
        },
        {
          id: 2,
          timestamp: "2025-11-03 09:30:15",
          room: "Server Room",
          action: "ac_turned_on",
          device: "AC",
          oldValue: "Off",
          newValue: "On",
          user: "System",
          mode: "auto",
        },
        {
          id: 3,
          timestamp: "2025-11-03 09:15:42",
          room: "Office 1",
          action: "light_turned_off",
          device: "Light",
          oldValue: "On",
          newValue: "Off",
          user: "Nguyen Van A",
          mode: "manual",
        },
        {
          id: 4,
          timestamp: "2025-11-03 08:50:10",
          room: "Meeting Room B",
          action: "mode_changed",
          device: "System",
          oldValue: "Manual",
          newValue: "Automatic",
          user: "Tran Thi B",
          mode: "manual",
        },
        {
          id: 5,
          timestamp: "2025-11-03 08:30:05",
          room: "Server Room",
          action: "threshold_changed",
          device: "Temperature Sensor",
          oldValue: "Threshold: 30°C",
          newValue: "Threshold: 28°C",
          user: "Hoang Son",
          mode: "manual",
        },
        {
          id: 6,
          timestamp: "2025-11-02 16:45:30",
          room: "Meeting Room A",
          action: "ac_turned_off",
          device: "AC",
          oldValue: "On",
          newValue: "Off",
          user: "System",
          mode: "auto",
        },
        {
          id: 7,
          timestamp: "2025-11-02 15:20:18",
          room: "Office 1",
          action: "light_turned_on",
          device: "Light",
          oldValue: "Off",
          newValue: "On",
          user: "Le Van C",
          mode: "manual",
        },
        {
          id: 8,
          timestamp: "2025-11-02 14:10:55",
          room: "Meeting Room B",
          action: "temperature_changed",
          device: "AC",
          oldValue: "25°C",
          newValue: "23°C",
          user: "Nguyen Van A",
          mode: "manual",
        },
        {
          id: 9,
          timestamp: "2025-11-02 13:05:40",
          room: "Server Room",
          action: "alert_triggered",
          device: "Temperature Sensor",
          oldValue: "28°C",
          newValue: "35°C",
          user: "System",
          mode: "auto",
        },
        {
          id: 10,
          timestamp: "2025-11-02 12:00:00",
          room: "Office 1",
          action: "mode_changed",
          device: "System",
          oldValue: "Automatic",
          newValue: "Manual",
          user: "Tran Thi B",
          mode: "manual",
        },
      ];

      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.room !== "all") {
      filtered = filtered.filter((log) => log.room === filters.room);
    }

    if (filters.action !== "all") {
      filtered = filtered.filter((log) => log.action === filters.action);
    }

    if (filters.user !== "all") {
      filtered = filtered.filter((log) => log.user === filters.user);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (log) => log.timestamp.split(" ")[0] >= filters.dateFrom
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (log) => log.timestamp.split(" ")[0] <= filters.dateTo
      );
    }

    setFilteredLogs(filtered);
  };

  const handleExportCSV = () => {
    const headers = [
      "Timestamp",
      "Room",
      "Action",
      "Device",
      "Old Value",
      "New Value",
      "User",
      "Mode",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        [
          log.timestamp,
          log.room,
          log.action,
          log.device,
          log.oldValue,
          log.newValue,
          log.user,
          log.mode,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getActionIcon = (action) => {
    if (action.includes("temperature")) return <FaThermometerHalf />;
    if (action.includes("light")) return <FaLightbulb />;
    if (action.includes("ac")) return <FaSnowflake />;
    if (action.includes("mode") || action.includes("threshold"))
      return <FaCog />;
    return <FaHistory />;
  };

  const getActionColor = (action) => {
    if (action.includes("alert") || action.includes("threshold"))
      return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" };
    if (action.includes("turned_on"))
      return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" };
    if (action.includes("turned_off"))
      return { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-400" };
    return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" };
  };

  const rooms = [...new Set(logs.map((log) => log.room))];
  const users = [...new Set(logs.map((log) => log.user))];
  const actions = [...new Set(logs.map((log) => log.action))];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full blur-3xl opacity-10 ${isDark ? 'bg-indigo-900' : 'bg-indigo-200'}`}></div>
        <div className={`absolute bottom-[10%] left-[10%] w-[30%] h-[30%] rounded-full blur-3xl opacity-10 ${isDark ? 'bg-blue-900' : 'bg-blue-200'}`}></div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                <FaHistory className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Activity Logs
                </h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Track system events and user actions
                </p>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Filters Section */}
        <div className={`rounded-3xl shadow-lg p-6 mb-8 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <FaFilter />
            </div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Filter Logs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Room Filter */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Room
              </label>
              <div className="relative">
                <select
                    value={filters.room}
                    onChange={(e) => setFilters({ ...filters, room: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none appearance-none transition-all ${
                        isDark 
                            ? 'bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white' 
                            : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                >
                    <option value="all">All Rooms</option>
                    {rooms.map((room) => (
                    <option key={room} value={room}>{room}</option>
                    ))}
                </select>
                <FaSearch className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Action Filter */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Action
              </label>
              <div className="relative">
                <select
                    value={filters.action}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none appearance-none transition-all ${
                        isDark 
                            ? 'bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white' 
                            : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                >
                    <option value="all">All Actions</option>
                    {actions.map((action) => (
                    <option key={action} value={action}>{action.replace(/_/g, " ").toUpperCase()}</option>
                    ))}
                </select>
                <FaCog className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* User Filter */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                User
              </label>
              <div className="relative">
                <select
                    value={filters.user}
                    onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none appearance-none transition-all ${
                        isDark 
                            ? 'bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white' 
                            : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                >
                    <option value="all">All Users</option>
                    {users.map((user) => (
                    <option key={user} value={user}>{user}</option>
                    ))}
                </select>
                <FaUser className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                From Date
              </label>
              <div className="relative">
                <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${
                        isDark 
                            ? 'bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white' 
                            : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                />
                <FaCalendarAlt className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                To Date
              </label>
              <div className="relative">
                <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition-all ${
                        isDark 
                            ? 'bg-slate-900/50 border-slate-700 focus:border-indigo-500 text-white' 
                            : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900'
                    }`}
                />
                <FaCalendarAlt className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className={`mt-6 pt-6 border-t flex justify-end ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5"
            >
              <FaDownload />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between">
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Showing <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{filteredLogs.length}</span> of {logs.length} logs
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          /* Logs Table */
          <div className={`rounded-3xl shadow-xl overflow-hidden border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Timestamp</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Room</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Action</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Device</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Changes</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>User</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mode</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                  {filteredLogs.map((log) => {
                    const colors = getActionColor(log.action);
                    return (
                      <tr 
                        key={log.id}
                        className={`transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
                      >
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {log.timestamp}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {log.room}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
                              {getActionIcon(log.action)}
                            </span>
                            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {log.action.replace(/_/g, " ").toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {log.device}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-red-500 line-through opacity-70">
                              {log.oldValue}
                            </span>
                            <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`}>→</span>
                            <span className="font-bold text-green-500">
                              {log.newValue}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                                <FaUser className="text-[10px]" />
                            </div>
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {log.user}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                            log.mode === "auto"
                              ? isDark ? 'bg-green-900/20 text-green-400 border border-green-900/30' : 'bg-green-50 text-green-600 border border-green-100'
                              : isDark ? 'bg-blue-900/20 text-blue-400 border border-blue-900/30' : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {log.mode}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredLogs.length === 0 && (
              <div className="text-center py-16">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                    <FaHistory className="text-2xl" />
                </div>
                <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No logs found</h3>
                <p className={`${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ActivityLogsPage;
