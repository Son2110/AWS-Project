import { Navigate } from "react-router-dom";

/**
 * Auto redirect authenticated users to their dashboard
 * Non-authenticated users see landing page
 */
const LandingRedirect = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const userRole = localStorage.getItem("userRole");

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Show landing page for non-authenticated users
  return children;
};

export default LandingRedirect;
