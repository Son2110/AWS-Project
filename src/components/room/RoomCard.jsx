import { FaThermometerHalf, FaTint, FaLightbulb } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const RoomCard = ({ room, onClick }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border ${
        isDark
          ? "bg-slate-800 border-slate-700 hover:border-indigo-500/50 hover:shadow-indigo-500/20 shadow-lg"
          : "bg-white border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 shadow-md"
      }`}
      onClick={() => onClick(room.roomId || room.id)}
    >
      <div className="p-6">
        {/* Room Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3
              className={`text-xl font-bold mb-1 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {room.thingName}
            </h3>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${
              room.connectionStatus === "ONLINE"
                ? "bg-green-500"
                : "bg-slate-300"
            }`}
          ></div>
        </div>

        {/* Room Data Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Temperature */}
          <div
            className={`flex flex-col items-center p-3 rounded-2xl ${
              isDark ? "bg-slate-700/50" : "bg-slate-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                isDark
                  ? "bg-orange-900/30 text-orange-400"
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
              className={`text-[10px] uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Temp
            </span>
          </div>

          {/* Humidity */}
          <div
            className={`flex flex-col items-center p-3 rounded-2xl ${
              isDark ? "bg-slate-700/50" : "bg-slate-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                isDark
                  ? "bg-blue-900/30 text-blue-400"
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
              className={`text-[10px] uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Humid
            </span>
          </div>

          {/* Light */}
          <div
            className={`flex flex-col items-center p-3 rounded-2xl ${
              isDark ? "bg-slate-700/50" : "bg-slate-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                isDark
                  ? "bg-yellow-900/30 text-yellow-400"
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
              className={`text-[10px] uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Lux
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <button
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
            isDark
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20"
              : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
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
