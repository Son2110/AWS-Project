import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaArrowLeft,
  FaUserShield,
  FaUser,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/layout/ThemeToggle";
import Toast from "../components/common/Toast";
import apiService from "../services/apiService";

const ManagerManagementPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [managers, setManagers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "manager",
    status: "active",
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setIsLoading(true);
      const companyId = localStorage.getItem("companyId");

      if (!companyId) {
        console.error("No companyId found in localStorage");
        setManagers([]);
        return;
      }

      const data = await apiService.getUsers(companyId);
      setManagers(data.users || []);
    } catch (error) {
      console.error("Error fetching managers:", error);
      setToast({
        show: true,
        message: "Failed to load users",
        type: "error",
      });
      setManagers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManager = () => {
    setEditingManager(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "manager",
      status: "active",
    });
    setShowAddModal(true);
  };

  const handleEditManager = (manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      role: manager.role,
      status: manager.status,
    });
    setShowAddModal(true);
  };

  const handleDeleteManager = (managerId) => {
    if (window.confirm("Are you sure you want to delete this manager?")) {
      // TODO: Call API to delete
      setManagers(managers.filter((m) => m.id !== managerId));
      setToast({
        show: true,
        message: "Manager deleted successfully",
        type: "success",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Call API to add/update manager
    if (editingManager) {
      setManagers(
        managers.map((m) =>
          m.id === editingManager.id ? { ...m, ...formData } : m
        )
      );
      setToast({
        show: true,
        message: "Manager updated successfully",
        type: "success",
      });
    } else {
      const newManager = {
        id: Date.now(),
        ...formData,
        joinDate: new Date().toISOString().split("T")[0],
        lastLogin: "Never",
      };
      setManagers([...managers, newManager]);
      setToast({
        show: true,
        message: "Manager added successfully",
        type: "success",
      });
    }
    setShowAddModal(false);
  };

  const filteredManagers = managers.filter(
    (manager) =>
      manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <FaUserShield
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
                Manager Management
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{
                  color: isDark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
                }}
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors duration-300"
                style={{
                  backgroundColor: isDark
                    ? "rgb(31, 41, 55)"
                    : "rgb(255, 255, 255)",
                  borderColor: isDark
                    ? "rgb(75, 85, 99)"
                    : "rgb(209, 213, 219)",
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              />
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddManager}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <FaUserPlus />
            <span>Add Manager</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : (
          /* Managers Table */
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
                      Name
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Email
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Role
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Last Login
                    </th>
                    <th
                      className="px-6 py-4 text-center text-sm font-semibold"
                      style={{
                        color: isDark
                          ? "rgb(209, 213, 219)"
                          : "rgb(55, 65, 81)",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManagers.map((manager, index) => (
                    <tr
                      key={manager.userId || manager.id}
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor:
                                manager.role === "admin"
                                  ? isDark
                                    ? "rgba(239, 68, 68, 0.2)"
                                    : "rgb(254, 226, 226)"
                                  : isDark
                                  ? "rgba(59, 130, 246, 0.2)"
                                  : "rgb(219, 234, 254)",
                            }}
                          >
                            {manager.role === "admin" ? (
                              <FaUserShield
                                className="text-lg"
                                style={{
                                  color:
                                    manager.role === "admin"
                                      ? isDark
                                        ? "rgb(248, 113, 113)"
                                        : "rgb(220, 38, 38)"
                                      : isDark
                                      ? "rgb(147, 197, 253)"
                                      : "rgb(37, 99, 235)",
                                }}
                              />
                            ) : (
                              <FaUser
                                className="text-lg"
                                style={{
                                  color: isDark
                                    ? "rgb(147, 197, 253)"
                                    : "rgb(37, 99, 235)",
                                }}
                              />
                            )}
                          </div>
                          <span
                            className="font-medium"
                            style={{
                              color: isDark
                                ? "rgb(243, 244, 246)"
                                : "rgb(31, 41, 55)",
                            }}
                          >
                            {manager.name}
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
                        {manager.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor:
                              manager.role === "admin"
                                ? isDark
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : "rgb(254, 226, 226)"
                                : isDark
                                ? "rgba(59, 130, 246, 0.2)"
                                : "rgb(219, 234, 254)",
                            color:
                              manager.role === "admin"
                                ? isDark
                                  ? "rgb(248, 113, 113)"
                                  : "rgb(220, 38, 38)"
                                : isDark
                                ? "rgb(147, 197, 253)"
                                : "rgb(37, 99, 235)",
                          }}
                        >
                          {(manager.role || "manager").toUpperCase()}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{
                          color: isDark
                            ? "rgb(156, 163, 175)"
                            : "rgb(107, 114, 128)",
                        }}
                      >
                        {manager.lastLogin || "Never"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditManager(manager)}
                            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                            style={{
                              color: isDark
                                ? "rgb(147, 197, 253)"
                                : "rgb(37, 99, 235)",
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteManager(manager.id)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                            style={{
                              color: isDark
                                ? "rgb(248, 113, 113)"
                                : "rgb(220, 38, 38)",
                            }}
                            disabled={manager.role === "admin"}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredManagers.length === 0 && (
              <div className="text-center py-12">
                <p
                  className="text-lg"
                  style={{
                    color: isDark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
                  }}
                >
                  No managers found
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                className="text-2xl font-bold mb-6"
                style={{
                  color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
                }}
              >
                {editingManager ? "Edit Manager" : "Add New Manager"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border-2 transition-colors duration-300"
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

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border-2 transition-colors duration-300"
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

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border-2 transition-colors duration-300"
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

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border-2 transition-colors duration-300"
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
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      color: isDark ? "rgb(209, 213, 219)" : "rgb(55, 65, 81)",
                    }}
                  >
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border-2 transition-colors duration-300"
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {editingManager ? "Update" : "Add"}
                  </button>
                </div>
              </form>
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

export default ManagerManagementPage;
