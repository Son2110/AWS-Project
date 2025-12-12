import { Navigate } from "react-router-dom";

/**
 * Simple Protected Route Component
 * Just checks if user is authenticated and has required role
 * Token expiration is 8 hours, so no need for complex refresh logic
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const userRole = localStorage.getItem("userRole");

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    return (
      <Navigate to={userRole === "admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  return children;
};

export default ProtectedRoute;
