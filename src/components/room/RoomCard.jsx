import {
  FaThermometerHalf,
  FaTint,
  FaLightbulb,
  FaSnowflake,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const RoomCard = ({ room, onClick }) => {
  const { isDark } = useTheme();

  return (
    <div
      className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-400 cursor-pointer"
      style={{
        backgroundColor: isDark ? "rgb(31, 41, 55)" : "rgb(255, 255, 255)",
      }}
      onClick={() => onClick(room.id)}
    >
      <div className="p-6">
        {/* Room Header */}
        <div className="mb-4">
          <h3
            className="text-xl font-bold mb-2 transition-colors duration-300"
            style={{
              color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
            }}
          >
            {room.name}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="text-sm transition-colors duration-300"
              style={{
                color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
              }}
            >
              Mode:
            </span>
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor:
                  room.mode === "auto"
                    ? isDark
                      ? "rgba(34, 197, 94, 0.2)"
                      : "rgb(220, 252, 231)"
                    : isDark
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgb(219, 234, 254)",
                color:
                  room.mode === "auto"
                    ? isDark
                      ? "rgb(134, 239, 172)"
                      : "rgb(21, 128, 61)"
                    : isDark
                    ? "rgb(147, 197, 253)"
                    : "rgb(29, 78, 216)",
              }}
            >
              {room.mode === "auto" ? "Automatic" : "Manual"}
            </span>
          </div>
        </div>

        {/* Room Data Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaThermometerHalf className="text-red-500" />
              <span
                className="text-sm transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
                }}
              >
                Temperature:
              </span>
            </div>
            <span
              className="font-semibold transition-colors duration-300"
              style={{
                color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
              }}
            >
              {room.temperature}°C
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaTint className="text-blue-500" />
              <span
                className="text-sm transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
                }}
              >
                Humidity:
              </span>
            </div>
            <span
              className="font-semibold transition-colors duration-300"
              style={{
                color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
              }}
            >
              {room.humidity}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaLightbulb className="text-yellow-500" />
              <span
                className="text-sm transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
                }}
              >
                Light:
              </span>
            </div>
            <span
              className="font-semibold"
              style={{
                color:
                  room.light === "on"
                    ? isDark
                      ? "rgb(134, 239, 172)"
                      : "rgb(22, 163, 74)"
                    : isDark
                    ? "rgb(107, 114, 128)"
                    : "rgb(156, 163, 175)",
              }}
            >
              {room.light === "on" ? "On" : "Off"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaSnowflake className="text-cyan-500" />
              <span
                className="text-sm transition-colors duration-300"
                style={{
                  color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
                }}
              >
                AC:
              </span>
            </div>
            <span
              className="font-semibold"
              style={{
                color:
                  room.ac === "on"
                    ? isDark
                      ? "rgb(134, 239, 172)"
                      : "rgb(22, 163, 74)"
                    : isDark
                    ? "rgb(107, 114, 128)"
                    : "rgb(156, 163, 175)",
              }}
            >
              {room.ac === "on" ? "On" : "Off"}
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick(room.id);
          }}
        >
          Details & Control
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
