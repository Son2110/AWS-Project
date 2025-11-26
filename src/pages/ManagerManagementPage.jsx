import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaArrowLeft,
  FaUserShield,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTimes,
  FaCheckCircle,
  FaBan
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
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full blur-3xl opacity-10 ${isDark ? 'bg-blue-900' : 'bg-blue-200'}`}></div>
        <div className={`absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full blur-3xl opacity-10 ${isDark ? 'bg-indigo-900' : 'bg-indigo-200'}`}></div>
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
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <FaUserShield className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Manager Management
                </h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Manage user access and roles
                </p>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Controls Bar */}
        <div className={`p-4 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row gap-4 items-center justify-between ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          {/* Search */}
          <div className="relative w-full md:w-96">
            <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  isDark 
                    ? 'bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddManager}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
          >
            <FaUserPlus />
            <span>Add Manager</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          /* Managers Table */
          <div className={`rounded-3xl shadow-xl overflow-hidden border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Name</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Contact</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Role</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                    <th className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                  {filteredManagers.map((manager) => (
                    <tr 
                        key={manager.userId || manager.id} 
                        className={`transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              manager.role === "admin"
                                ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                                : isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {manager.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{manager.name}</div>
                            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Last login: {manager.lastLogin || "Never"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                <FaEnvelope className="text-xs opacity-50" /> {manager.email}
                            </div>
                            {manager.phone && (
                                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <FaPhone className="text-xs opacity-50" /> {manager.phone}
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            manager.role === "admin"
                                ? isDark ? 'bg-red-900/20 text-red-400 border border-red-900/30' : 'bg-red-50 text-red-600 border border-red-100'
                                : isDark ? 'bg-blue-900/20 text-blue-400 border border-blue-900/30' : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                            {manager.role === "admin" ? <FaUserShield className="text-[10px]" /> : <FaUser className="text-[10px]" />}
                            {manager.role || "manager"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            manager.status === "active"
                                ? isDark ? 'bg-green-900/20 text-green-400 border border-green-900/30' : 'bg-green-50 text-green-600 border border-green-100'
                                : isDark ? 'bg-slate-700 text-slate-400 border border-slate-600' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                            {manager.status === "active" ? <FaCheckCircle className="text-[10px]" /> : <FaBan className="text-[10px]" />}
                            {manager.status || "active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditManager(manager)}
                            className={`p-2 rounded-lg transition-colors ${
                                isDark 
                                    ? 'text-blue-400 hover:bg-blue-900/30' 
                                    : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteManager(manager.id)}
                            className={`p-2 rounded-lg transition-colors ${
                                isDark 
                                    ? 'text-red-400 hover:bg-red-900/30' 
                                    : 'text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete"
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
              <div className="text-center py-16">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                    <FaSearch className="text-2xl" />
                </div>
                <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No managers found</h3>
                <p className={`${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Try adjusting your search terms</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingManager ? "Edit Manager" : "Add New Manager"}
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                        isDark 
                            ? 'bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white' 
                            : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                    }`}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                        isDark 
                            ? 'bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white' 
                            : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                        isDark 
                            ? 'bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white' 
                            : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                    }`}
                    placeholder="+1 234 567 890"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Role *
                    </label>
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                            isDark 
                                ? 'bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white' 
                                : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                        }`}
                    >
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                    </div>

                    <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Status *
                    </label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                            isDark 
                                ? 'bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white' 
                                : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                        }`}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                        isDark 
                            ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                  >
                    {editingManager ? "Update Manager" : "Add Manager"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
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
