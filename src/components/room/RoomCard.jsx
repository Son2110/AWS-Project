import {
  FaThermometerHalf,
  FaTint,
  FaLightbulb,
  FaSnowflake,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const RoomCard = ({ room, onClick }) => {
  const { isDark } = useTheme();

  // Map officeId to location name
  const getLocationName = (officeId) => {
    const locationMap = {
      "office-hcm": "HCM Office",
      "office-hanoi": "Hanoi Office",
      "office-danang": "Da Nang Office",
    };
    return locationMap[officeId] || officeId || "Unknown";
  };

  return (
    <div
      className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-400 cursor-pointer"
      style={{
        backgroundColor: isDark ? "rgb(31, 41, 55)" : "rgb(255, 255, 255)",
      }}
      onClick={() => onClick(room.roomId || room.id)}
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
            Room {room.roomId || room.name || "Unknown"}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="text-sm transition-colors duration-300"
              style={{
                color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
              }}
            >
              📍 {getLocationName(room.officeId)}
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
                Target Temp:
              </span>
            </div>
            <span
              className="font-semibold transition-colors duration-300"
              style={{
                color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
              }}
            >
              {room.targetTemperature || "--"}°C
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
                Target Humidity:
              </span>
            </div>
            <span
              className="font-semibold transition-colors duration-300"
              style={{
                color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
              }}
            >
              {room.targetHumidity || "--"}%
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
                Target Light:
              </span>
            </div>
            <span
              className="font-semibold transition-colors duration-300"
              style={{
                color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
              }}
            >
              {room.targetLight || "--"} lux
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
