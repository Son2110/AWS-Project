import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-300 ${className}`}
      style={{
        backgroundColor: isDark ? "rgb(55, 65, 81)" : "rgb(229, 231, 235)",
        color: isDark ? "rgb(252, 211, 77)" : "rgb(75, 85, 99)",
      }}
      aria-label="Toggle theme"
    >
      {isDark ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
    </button>
  );
};

export default ThemeToggle;
