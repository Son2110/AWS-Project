import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import RoomDetail from "./components/RoomDetail";
import ManagerManagement from "./components/ManagerManagement";
import ActivityLogs from "./components/ActivityLogs";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room/:roomId" element={<RoomDetail />} />
          <Route path="/managers" element={<ManagerManagement />} />
          <Route path="/activity-logs" element={<ActivityLogs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
