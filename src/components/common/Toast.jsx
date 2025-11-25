import { useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

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

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          borderColor: "rgb(34, 197, 94)",
          iconColor: "rgb(34, 197, 94)",
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          title: "Success!",
        };
      case "error":
        return {
          borderColor: "rgb(239, 68, 68)",
          iconColor: "rgb(239, 68, 68)",
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          title: "Error!",
        };
      case "warning":
        return {
          borderColor: "rgb(245, 158, 11)",
          iconColor: "rgb(245, 158, 11)",
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          title: "Warning!",
        };
      case "info":
        return {
          borderColor: "rgb(59, 130, 246)",
          iconColor: "rgb(59, 130, 246)",
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          title: "Info",
        };
      default:
        return getToastStyles();
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className="px-6 py-4 rounded-lg shadow-2xl border-l-4 flex items-center gap-3 min-w-[320px]"
        style={{
          backgroundColor: isDark ? "rgb(31, 41, 55)" : "rgb(255, 255, 255)",
          borderLeftColor: styles.borderColor,
        }}
      >
        <div className="shrink-0" style={{ color: styles.iconColor }}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <p
            className="font-semibold text-lg"
            style={{
              color: isDark ? "rgb(243, 244, 246)" : "rgb(31, 41, 55)",
            }}
          >
            {styles.title}
          </p>
          <p
            className="text-sm"
            style={{
              color: isDark ? "rgb(156, 163, 175)" : "rgb(75, 85, 99)",
            }}
          >
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          style={{
            color: isDark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
