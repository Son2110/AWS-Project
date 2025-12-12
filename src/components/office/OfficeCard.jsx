import React from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const OfficeCard = ({ office, onClick }) => {
  const { isDark } = useTheme();

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
        isDark
          ? "glass-dark hover:shadow-indigo-500/20 hover:border-indigo-500/50"
          : "glass hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200"
      }`}
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-6">
          <div
            className={`p-3 rounded-2xl transition-colors ${
              isDark
                ? "bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white"
                : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
            }`}
          >
            <FaBuilding size={24} />
          </div>
          <div
            className={`p-2 rounded-full transition-all duration-300 transform group-hover:translate-x-1 ${
              isDark
                ? "bg-slate-800 text-slate-400 group-hover:text-indigo-400"
                : "bg-slate-100 text-slate-400 group-hover:text-indigo-600"
            }`}
          >
            <FaArrowRight size={14} />
          </div>
        </div>

        <h3
          className={`text-xl font-bold mb-2 transition-colors ${
            isDark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-600"
          }`}
        >
          {office.name}
        </h3>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <FaMapMarkerAlt
              className={isDark ? "text-slate-500" : "text-slate-400"}
              size={14}
            />
            <span
              className={`text-sm ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {office.address || "No address specified"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <FaUsers
              className={isDark ? "text-slate-500" : "text-slate-400"}
              size={14}
            />
            <span
              className={`text-sm ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Manager: {office.manager?.managerName || "N/A"}
            </span>
          </div>
        </div>

        <div
          className={`pt-4 border-t flex items-center justify-between ${
            isDark ? "border-slate-700/50" : "border-slate-100"
          }`}
        >
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              office.manager?.managerStatus === "ACTIVE"
                ? isDark
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : isDark
                ? "bg-slate-800 text-slate-400 border border-slate-700"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            {office.manager?.managerStatus || "N/A"}
          </span>
          <span
            className={`text-xs font-medium ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {office.manager?.managerRole || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OfficeCard;
