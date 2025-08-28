import { Route, Routes, Navigate } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import CheckAuth from "./components/common/check-auth";
import AdminProtectedRoute from "./components/common/AdminProtectedRoute";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useLayoutEffect, useRef } from "react";
import { checkAuth, refreshToken, fetchUserProfile } from "./store/auth-slice";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import ProductDetailsPage from "./pages/shopping-view/product-details-page";
import SearchProducts from "./pages/shopping-view/search";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import NewArrivals from "./pages/shopping-view/new-arrivals";
import Contact from "./pages/shopping-view/contact";
import AdminCategories from "./pages/admin-view/categories";
import AdminBanners from "./pages/admin-view/banner";
import AdminInstafeed from "./pages/admin-view/instafeed";
import AdminFeedback from "./pages/admin-view/feedback";
import AuthForgotPassword from "./pages/auth/forgot-password";
import AuthResetPassword from "./pages/auth/reset-password";
import { Loader } from "./components/ui/loader";
import { initPreventVideoDownload } from "./components/common/prevent-video-download";
import AdminUsers from "./pages/admin-view/users";
import AdminProductReview from "./pages/admin-view/review";
import AdminContact from "./pages/admin-view/contact";
import AdminNewsLetter from "./pages/admin-view/newsletter";
import MetaPixelTracker from "./components/common/MetaPixelTracker";
import ProtectedPaymentRoute from "./components/common/ProtectedPaymentRoute";
import { getTempCartItems, copyTempCartToUser } from "./utils/tempCartManager";
import { addToCart } from "./store/shop/cart-slice";
import { startCartCopy, completeCartCopy, hasCartCopyCompleted, resetCartCopyState } from "./utils/cartCopyManager";

// Import Meta Pixel verification in development mode
if (import.meta.env.DEV) {
  import("./utils/metaPixelVerification.js");
}



function App() {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const videoObserverRef = useRef(null);
  const hasCopiedCart = useRef(false);

  // Prevent context menu on all video elements
  useLayoutEffect(() => {
    const preventVideoContextMenu = (e) => {
      if (e.target.tagName.toLowerCase() === 'video') {
        e.preventDefault();
        return false;
      }
    };

    // Add global event listener
    document.addEventListener('contextmenu', preventVideoContextMenu);

    // Initialize the video download prevention utility
    videoObserverRef.current = initPreventVideoDownload();

    // Clean up
    return () => {
      document.removeEventListener('contextmenu', preventVideoContextMenu);

      // Disconnect the observer when component unmounts
      if (videoObserverRef.current) {
        videoObserverRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Attempt to validate the token
        const authResult = await dispatch(checkAuth()).unwrap();

        // If authenticated but no user data, fetch user profile
        if (authResult.success && (!authResult.user || !authResult.user.userName)) {
          await dispatch(fetchUserProfile()).unwrap();
        }
      } catch (error) {
        if (error === "No access token found" || error?.status === 401) {
          // Attempt to refresh the token if expired or not found
          try {
            await dispatch(refreshToken()).unwrap();
            const retryResult = await dispatch(checkAuth()).unwrap(); // Retry after refreshing

            // If authenticated after refresh but no user data, fetch user profile
            if (retryResult.success && (!retryResult.user || !retryResult.user.userName)) {
              await dispatch(fetchUserProfile()).unwrap();
            }
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
          }
        } else {
          console.error("Authentication failed:", error);
        }
      }
    };

    validateToken();
  }, [dispatch]);

  // Handle cart copy when user becomes authenticated (backup system)
  useEffect(() => {
    const handleCartCopy = async () => {
      // Only copy if user just became authenticated and we haven't copied yet
      // This is a backup system - the login page should handle most cases
      if (isAuthenticated && user?.id && !hasCartCopyCompleted(user.id) && !isLoading) {
        const tempCartItems = getTempCartItems();

        if (tempCartItems.length > 0) {
          // Add a small delay to avoid conflicts with login page copying
          setTimeout(async () => {
            // Double-check that copying hasn't happened yet using global state
            if (!hasCartCopyCompleted(user.id) && startCartCopy(user.id)) {
              try {
                console.log('Auto-copying cart items for authenticated user (backup system)');
                const copyResult = await copyTempCartToUser(
                  (cartData) => dispatch(addToCart(cartData)),
                  user.id
                );

                if (copyResult.success && copyResult.copied > 0) {
                  completeCartCopy(user.id, true);
                  console.log(`Successfully copied ${copyResult.copied} items to user cart`);
                } else {
                  completeCartCopy(user.id, false);
                }
              } catch (error) {
                console.error('Error auto-copying cart:', error);
                completeCartCopy(user.id, false);
              }
            }
          }, 2000); // 2 second delay to avoid conflicts with login page
        }
      }
    };

    handleCartCopy();
  }, [isAuthenticated, user?.id, isLoading, dispatch]);

  // Reset copy state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      resetCartCopyState();
    }
  }, [isAuthenticated]);

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      {/* Meta Pixel Tracker - Automatically tracks page views and events */}
      <MetaPixelTracker />


      <Routes>
        {/* Base Route */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? user?.role === "admin"
                ? <Navigate to="/admin/dashboard" />
                : <Navigate to="/shop/home" />
              : <Navigate to="/shop/home" />
          }
        />

        {/* Auth Routes */}
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="forgot-password" element={<AuthForgotPassword />} />
          <Route path="reset-password" element={<AuthResetPassword />} />


        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="instafeed" element={<AdminInstafeed />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminProductReview />} />
          <Route path="contacts" element={<AdminContact />} />
          <Route path="newsletters" element={<AdminNewsLetter />} />



        </Route>

        {/* Shop Routes */}
        <Route
          path="/shop"
          element={
            <ShoppingLayout />
          }
        >
          <Route path="home" element={<ShoppingHome />} />
          <Route path="details/:id" element={<ProductDetailsPage />} />
          <Route path="collections" element={<ShoppingListing />} />

          {/* SEO-friendly category routes */}
          <Route path="collections/tussar-sarees" element={<ShoppingListing categorySlug="tussar-sarees" />} />
          <Route path="collections/banaras-sarees" element={<ShoppingListing categorySlug="banaras-sarees" />} />
          <Route path="collections/cotton-sarees" element={<ShoppingListing categorySlug="cotton-sarees" />} />
          <Route path="collections/organza-sarees" element={<ShoppingListing categorySlug="organza-sarees" />} />
          {/* Kora category removed as requested */}
          {/* <Route path="collections/kora-sarees" element={<ShoppingListing categorySlug="kora-sarees" />} /> */}
          <Route path="collections/georgette-sarees" element={<ShoppingListing categorySlug="georgette-sarees" />} />
          <Route path="collections/celebrity-collection" element={<ShoppingListing categorySlug="celebrity-collection" />} />

          <Route path="new-arrivals" element={<NewArrivals />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="paypal-return" element={<PaypalReturnPage />} />
          <Route path="payment-success" element={
            <ProtectedPaymentRoute>
              <PaymentSuccessPage />
            </ProtectedPaymentRoute>
          } />
          <Route path="search" element={<SearchProducts />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Unauthenticated and Not Found Pages */}
        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}



export default App;
