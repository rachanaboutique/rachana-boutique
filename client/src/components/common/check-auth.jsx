import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  // Root path is now handled directly in App.jsx by rendering ShoppingHome
  // No need to redirect from root path anymore

  if (
    !isAuthenticated &&
    !(location.pathname.includes("/login") || location.pathname.includes("/register") || location.pathname.includes("/forgot-password") || location.pathname.includes("/reset-password") || location.pathname.includes("/shop/home"))
  ) {
    return <Navigate to="/auth/login" />;
  }

  if (
    isAuthenticated &&
    (location.pathname.includes("/login") || location.pathname.includes("/register"))
  ) {
    return user?.role === "admin" ? (
      <Navigate to="/admin/dashboard" />
    ) : (
      <Navigate to="/shop/home" />
    );
  }

  if (
    isAuthenticated &&
    user?.role !== "admin" &&
    location.pathname.includes("/admin")
  ) {
    return <Navigate to="/unauth-page" />;
  }

  if (
    isAuthenticated &&
    user?.role === "admin" &&
    location.pathname.includes("/shop")
  ) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <>{children}</>;
}

export default CheckAuth;
