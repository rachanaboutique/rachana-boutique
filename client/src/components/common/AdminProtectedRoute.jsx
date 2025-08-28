import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader } from "../ui/loader";

/**
 * AdminProtectedRoute Component
 * 
 * Provides robust protection for admin-only routes
 * Ensures only authenticated admin users can access admin pages
 */
function AdminProtectedRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();

  // Show loader while authentication is being checked
  if (isLoading) {
    return <Loader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const redirectTo = location.pathname + location.search;
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
  }

  // Redirect to unauthorized page if user is not admin
  if (isAuthenticated && user?.role !== "admin") {
    return <Navigate to="/unauth-page" replace />;
  }

  // Render children if user is authenticated admin
  return <>{children}</>;
}

export default AdminProtectedRoute;
