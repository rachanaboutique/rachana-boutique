import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// Import polyfills for iOS Safari and Mac Chrome compatibility
import "./utils/polyfills.js";
// Import iOS compatibility utilities
import "./utils/iosCompatibility.js";
// Import error handling utilities
import { ErrorBoundary } from "./utils/errorBoundary.jsx";
import { BrowserRouter, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import ScrollToTop from "./components/common/scroll-to-top.jsx";
import { Toaster } from "./components/ui/toaster.jsx";
import { HelmetProvider } from "react-helmet-async";

// Ensure DOM is fully ready before rendering (especially important for iOS Safari and BrowserStack)
function initializeApp() {
  // Check if the current URL is for sitemap.xml or robots.txt
  const path = window.location.pathname;
  if (path === '/sitemap.xml' || path === '/robots.txt') {
    // Don't render the React app for these paths
    // They will be handled by the server
    console.log(`Static file requested: ${path}`);
    return;
  }

  // Ensure root element exists
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  try {
    // Render the React app for all other paths
    createRoot(rootElement).render(
      <ErrorBoundary>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Provider store={store}>
            <HelmetProvider>
              <ScrollToTop />
              <App />
              <Toaster />
            </HelmetProvider>
          </Provider>
        </BrowserRouter>
      </ErrorBoundary>
    );
    console.log("✅ React app initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize React app:", error);
    // Fallback: show a simple error message
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1>Loading Error</h1>
        <p>Please refresh the page to try again.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2c3315; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}
