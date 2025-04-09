import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import ScrollToTop from "./components/common/scroll-to-top.jsx";
import { Toaster } from "./components/ui/toaster.jsx";
import { HelmetProvider } from "react-helmet-async";

// Check if the current URL is for sitemap.xml or robots.txt
const path = window.location.pathname;
if (path === '/sitemap.xml' || path === '/robots.txt') {
  // Don't render the React app for these paths
  // They will be handled by the server
  console.log(`Static file requested: ${path}`);
} else {
  // Render the React app for all other paths
  createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <Provider store={store}>
        <HelmetProvider>
          <ScrollToTop />
          <App />
          <Toaster />
        </HelmetProvider>
      </Provider>
    </BrowserRouter>
  );
}
