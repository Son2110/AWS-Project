import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeContext";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

const Toast = ({
  show,
  message,
  type = "success",
  onClose,
  duration = 3000,
}) => {
  const { isDark } = useTheme();

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getToastConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: <FaCheckCircle className="text-green-500 text-xl" />,
          bgColor: isDark ? "bg-green-900/20" : "bg-green-50",
          borderColor: "border-green-500",
          titleColor: isDark ? "text-green-400" : "text-green-800",
          title: "Success",
        };
      case "error":
        return {
          icon: <FaExclamationCircle className="text-red-500 text-xl" />,
          bgColor: isDark ? "bg-red-900/20" : "bg-red-50",
          borderColor: "border-red-500",
          titleColor: isDark ? "text-red-400" : "text-red-800",
          title: "Error",
        };
      case "warning":
        return {
          icon: <FaExclamationTriangle className="text-yellow-500 text-xl" />,
          bgColor: isDark ? "bg-yellow-900/20" : "bg-yellow-50",
          borderColor: "border-yellow-500",
          titleColor: isDark ? "text-yellow-400" : "text-yellow-800",
          title: "Warning",
        };
      case "info":
      default:
        return {
          icon: <FaInfoCircle className="text-blue-500 text-xl" />,
          bgColor: isDark ? "bg-blue-900/20" : "bg-blue-50",
          borderColor: "border-blue-500",
          titleColor: isDark ? "text-blue-400" : "text-blue-800",
          title: "Info",
        };
    }
  };

  const config = getToastConfig();

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[200] animate-slide-up">
      <div
        className={`flex items-start gap-4 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 min-w-[320px] max-w-md ${
          isDark 
            ? "bg-slate-800/90 border-slate-700" 
            : "bg-white/90 border-slate-200"
        }`}
      >
        <div className={`p-2 rounded-full shrink-0 ${config.bgColor}`}>
          {config.icon}
        </div>
        
        <div className="flex-1 pt-0.5">
          <h4 className={`font-bold text-sm mb-1 ${config.titleColor}`}>
            {config.title}
          </h4>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className={`shrink-0 p-1 rounded-lg transition-colors ${
            isDark 
                ? "text-slate-500 hover:bg-slate-700 hover:text-slate-300" 
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          }`}
        >
          <FaTimes />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Toast;
