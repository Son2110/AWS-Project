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
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

const ActivityLogs = () => {
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
      return { bg: "rgb(254, 226, 226)", text: "rgb(220, 38, 38)" };
    if (action.includes("turned_on"))
      return { bg: "rgb(220, 252, 231)", text: "rgb(21, 128, 61)" };
    if (action.includes("turned_off"))
      return { bg: "rgb(243, 244, 246)", text: "rgb(107, 114, 128)" };
    return { bg: "rgb(219, 234, 254)", text: "rgb(37, 99, 235)" };
  };

  const rooms = [...new Set(logs.map((log) => log.room))];
  const users = [...new Set(logs.map((log) => log.user))];
  const actions = [...new Set(logs.map((log) => log.action))];

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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              style={{
                color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
              }}
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgb(30, 58, 138)"
                    : "rgb(219, 234, 254)",
                }}
              >
                <FaHistory
                  className="w-8 h-8 transition-colors duration-300"
                  style={{
                    color: isDark ? "rgb(147, 197, 253)" : "rgb(37, 99, 235)",
                  }}
                />
              </div>
              <h1
                className="text-2xl font-bold transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              >
                Activity Logs
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <div
          className="rounded-xl shadow-lg p-6 mb-6 transition-colors duration-300"
          style={{
            backgroundColor: isDark ? "rgb(31, 41, 55)" : "rgb(255, 255, 255)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <FaFilter
              style={{
                color: isDark ? "rgb(147, 197, 253)" : "rgb(37, 99, 235)",
              }}
            />
            <h2
              className="text-lg font-semibold"
              style={{
                color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
              }}
            >
              Filters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Room Filter */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                }}
              >
                Room
              </label>
              <select
                value={filters.room}
                onChange={(e) =>
                  setFilters({ ...filters, room: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border-2 transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgb(55, 65, 81)"
                    : "rgb(249, 250, 251)",
                  borderColor: isDark
                    ? "rgb(75, 85, 99)"
                    : "rgb(209, 213, 219)",
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              >
                <option value="all">All Rooms</option>
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                }}
              >
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) =>
                  setFilters({ ...filters, action: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border-2 transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgb(55, 65, 81)"
                    : "rgb(249, 250, 251)",
                  borderColor: isDark
                    ? "rgb(75, 85, 99)"
                    : "rgb(209, 213, 219)",
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              >
                <option value="all">All Actions</option>
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                }}
              >
                User
              </label>
              <select
                value={filters.user}
                onChange={(e) =>
                  setFilters({ ...filters, user: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border-2 transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgb(55, 65, 81)"
                    : "rgb(249, 250, 251)",
                  borderColor: isDark
                    ? "rgb(75, 85, 99)"
                    : "rgb(209, 213, 219)",
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              >
                <option value="all">All Users</option>
                {users.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                }}
              >
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border-2 transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgb(55, 65, 81)"
                    : "rgb(249, 250, 251)",
                  borderColor: isDark
                    ? "rgb(75, 85, 99)"
                    : "rgb(209, 213, 219)",
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              />
            </div>

            {/* Date To */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                }}
              >
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border-2 transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgb(55, 65, 81)"
                    : "rgb(249, 250, 251)",
                  borderColor: isDark
                    ? "rgb(75, 85, 99)"
                    : "rgb(209, 213, 219)",
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              />
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <FaDownload />
              <span>Export to CSV</span>
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4">
          <p
            className="text-sm"
            style={{
              color: isDark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
            }}
          >
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : (
          /* Logs Table */
          <div
            className="rounded-xl shadow-lg overflow-hidden transition-colors duration-300"
            style={{
              backgroundColor: isDark
                ? "rgb(31, 41, 55)"
                : "rgb(255, 255, 255)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  style={{
                    backgroundColor: isDark
                      ? "rgb(55, 65, 81)"
                      : "rgb(249, 250, 251)",
                  }}
                >
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Timestamp
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Room
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Action
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Device
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Changes
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      User
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Mode
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => {
                    const colors = getActionColor(log.action);
                    return (
                      <tr
                        key={log.id}
                        className="border-t transition-colors duration-200 hover:bg-opacity-50"
                        style={{
                          borderColor: isDark
                            ? "rgb(75, 85, 99)"
                            : "rgb(229, 231, 235)",
                          backgroundColor: isDark
                            ? index % 2 === 0
                              ? "transparent"
                              : "rgba(55, 65, 81, 0.3)"
                            : index % 2 === 0
                            ? "transparent"
                            : "rgba(249, 250, 251, 0.5)",
                        }}
                      >
                        <td
                          className="px-6 py-4 text-sm whitespace-nowrap"
                          style={{
                            color: isDark
                              ? "rgb(209, 213, 219)"
                              : "rgb(75, 85, 99)",
                          }}
                        >
                          {log.timestamp}
                        </td>
                        <td
                          className="px-6 py-4 font-medium"
                          style={{
                            color: isDark
                              ? "rgb(243, 244, 246)"
                              : "rgb(31, 41, 55)",
                          }}
                        >
                          {log.room}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="p-2 rounded-lg"
                              style={{
                                backgroundColor: isDark
                                  ? "rgba(59, 130, 246, 0.2)"
                                  : colors.bg,
                                color: isDark
                                  ? "rgb(147, 197, 253)"
                                  : colors.text,
                              }}
                            >
                              {getActionIcon(log.action)}
                            </span>
                            <span
                              className="text-sm font-medium"
                              style={{
                                color: isDark
                                  ? "rgb(209, 213, 219)"
                                  : "rgb(55, 65, 81)",
                              }}
                            >
                              {log.action.replace(/_/g, " ").toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-6 py-4"
                          style={{
                            color: isDark
                              ? "rgb(209, 213, 219)"
                              : "rgb(75, 85, 99)",
                          }}
                        >
                          {log.device}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <span
                              style={{
                                color: isDark
                                  ? "rgb(248, 113, 113)"
                                  : "rgb(220, 38, 38)",
                              }}
                            >
                              {log.oldValue}
                            </span>
                            <span
                              className="mx-2"
                              style={{
                                color: isDark
                                  ? "rgb(156, 163, 175)"
                                  : "rgb(107, 114, 128)",
                              }}
                            >
                              →
                            </span>
                            <span
                              style={{
                                color: isDark
                                  ? "rgb(134, 239, 172)"
                                  : "rgb(21, 128, 61)",
                              }}
                            >
                              {log.newValue}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FaUser
                              className="text-sm"
                              style={{
                                color: isDark
                                  ? "rgb(156, 163, 175)"
                                  : "rgb(107, 114, 128)",
                              }}
                            />
                            <span
                              className="text-sm"
                              style={{
                                color: isDark
                                  ? "rgb(209, 213, 219)"
                                  : "rgb(55, 65, 81)",
                              }}
                            >
                              {log.user}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor:
                                log.mode === "auto"
                                  ? isDark
                                    ? "rgba(34, 197, 94, 0.2)"
                                    : "rgb(220, 252, 231)"
                                  : isDark
                                  ? "rgba(59, 130, 246, 0.2)"
                                  : "rgb(219, 234, 254)",
                              color:
                                log.mode === "auto"
                                  ? isDark
                                    ? "rgb(134, 239, 172)"
                                    : "rgb(21, 128, 61)"
                                  : isDark
                                  ? "rgb(147, 197, 253)"
                                  : "rgb(37, 99, 235)",
                            }}
                          >
                            {log.mode.toUpperCase()}
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
              <div className="text-center py-12">
                <p
                  className="text-lg"
                  style={{
                    color: isDark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
                  }}
                >
                  No activity logs found
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ActivityLogs;
