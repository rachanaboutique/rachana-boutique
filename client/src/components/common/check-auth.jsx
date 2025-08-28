import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  // Define protected routes that require authentication
  const protectedRoutes = ["/admin", "/shop/account", "/shop/checkout"];
  const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];
  const publicShopRoutes = ["/shop/home", "/shop/details", "/shop/collections", "/shop/new-arrivals", "/shop/search", "/shop/contact"];

  // Check if current path requires authentication
  const requiresAuth = protectedRoutes.some(route => location.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => location.pathname.startsWith(route));
  const isPublicShopRoute = publicShopRoutes.some(route => location.pathname.startsWith(route));

  // Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated && requiresAuth) {
    // Store the intended destination for redirect after login
    const redirectTo = location.pathname + location.search;
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
  }

  // Allow unauthenticated users to access public routes
  if (!isAuthenticated && (isAuthRoute || isPublicShopRoute || location.pathname === "/")) {
    return <>{children}</>;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return user?.role === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/shop/home" replace />
    );
  }

  // Protect admin routes - only admin users can access
  if (isAuthenticated && location.pathname.startsWith("/admin")) {
    if (user?.role !== "admin") {
      return <Navigate to="/unauth-page" replace />;
    }
  }

  // Redirect admin users away from shop routes (except public ones)
  if (
    isAuthenticated &&
    user?.role === "admin" &&
    (location.pathname.startsWith("/shop/account") || location.pathname.startsWith("/shop/checkout"))
  ) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}

export default CheckAuth;
