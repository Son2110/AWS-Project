import { FaThermometerHalf, FaTint, FaLightbulb, FaWifi, FaPowerOff } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const RoomCard = ({ room, onClick }) => {
  const { isDark } = useTheme();
  
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
        isDark
          ? "glass-dark hover:shadow-indigo-500/20 hover:border-indigo-500/50"
          : "glass hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200"
      }`}
      onClick={() => onClick(room.roomId || room.id)}
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        {/* Room Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3
              className={`text-xl font-bold mb-1 transition-colors ${
                isDark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-600"
              }`}
            >
              {room.thingName}
            </h3>
            <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              ID: {room.roomId || room.id}
            </p>
          </div>
          <div className="flex gap-2">
            {/* Connection Status */}
            <div className="group/tooltip relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  room.connectionStatus === "ONLINE"
                    ? "bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                }`}
              >
                <FaWifi size={14} />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {room.connectionStatus === "ONLINE" ? "Online" : "Offline"}
              </div>
            </div>

            {/* Device Status */}
            <div className="group/tooltip relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  room.deviceStatus === "ON"
                    ? "bg-indigo-500/10 text-indigo-500 shadow-lg shadow-indigo-500/20"
                    : "bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/20"
                }`}
              >
                <FaPowerOff size={14} />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {room.deviceStatus === "ON" ? "Device On" : "Device Off"}
              </div>
            </div>
          </div>
        </div>

        {/* Room Data Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Temperature */}
          <div
            className={`flex flex-col items-center p-3 rounded-2xl transition-colors ${
              isDark ? "bg-slate-800/50 group-hover:bg-slate-800" : "bg-slate-50/80 group-hover:bg-white"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                isDark
                  ? "bg-orange-500/10 text-orange-400"
                  : "bg-orange-100 text-orange-500"
              }`}
            >
              <FaThermometerHalf size={14} />
            </div>
            <span
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {room.targetTemperature || "--"}°
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Temp
            </span>
          </div>

          {/* Humidity */}
          <div
            className={`flex flex-col items-center p-3 rounded-2xl transition-colors ${
              isDark ? "bg-slate-800/50 group-hover:bg-slate-800" : "bg-slate-50/80 group-hover:bg-white"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                isDark
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-blue-100 text-blue-500"
              }`}
            >
              <FaTint size={14} />
            </div>
            <span
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {room.targetHumidity || "--"}%
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Humid
            </span>
          </div>

          {/* Light */}
          <div
            className={`flex flex-col items-center p-3 rounded-2xl transition-colors ${
              isDark ? "bg-slate-800/50 group-hover:bg-slate-800" : "bg-slate-50/80 group-hover:bg-white"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                isDark
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-yellow-100 text-yellow-500"
              }`}
            >
              <FaLightbulb size={14} />
            </div>
            <span
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {room.targetLight || "--"}
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Lux
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <button
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            isDark
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 hover:shadow-indigo-500/30"
              : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onClick(room.roomId || room.id);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
