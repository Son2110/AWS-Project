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
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl cursor-pointer
        ${
          isDark
            ? "bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800"
            : "bg-white border-slate-200 hover:border-indigo-500/50 hover:bg-slate-50"
        }
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-xl ${
              isDark
                ? "bg-indigo-500/20 text-indigo-400"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <FaBuilding size={24} />
          </div>
          <div
            className={`p-2 rounded-full transition-colors duration-300 ${
              isDark
                ? "bg-slate-700 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white"
                : "bg-slate-100 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white"
            }`}
          >
            <FaArrowRight size={14} />
          </div>
        </div>

        <h3
          className={`text-xl font-bold mb-2 ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {office.name}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-2">
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
          className={`mt-6 pt-4 border-t flex items-center justify-between ${
            isDark ? "border-slate-700" : "border-slate-100"
          }`}
        >
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              office.manager?.managerStatus === "ACTIVE"
                ? isDark
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-emerald-100 text-emerald-700"
                : isDark
                ? "bg-slate-700 text-slate-400"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {office.manager?.managerStatus || "N/A"}
          </span>
          <span
            className={`text-xs ${
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
