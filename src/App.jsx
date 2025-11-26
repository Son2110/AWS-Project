import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import ManagerManagementPage from "./pages/ManagerManagementPage";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import LandingPage from "./pages/LandingPage";

// Protected Route Component
const ProtectedRoute = ({ children, requiredGroup }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const userGroups = JSON.parse(localStorage.getItem("userGroups") || "[]");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredGroup && !userGroups.includes(requiredGroup)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <RoomDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/managers"
            element={
              <ProtectedRoute requiredGroup="Admin">
                <ManagerManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity-logs"
            element={
              <ProtectedRoute requiredGroup="Admin">
                <ActivityLogsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
