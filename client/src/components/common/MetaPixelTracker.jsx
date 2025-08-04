/**
 * MetaPixelTracker Component
 * 
 * This component automatically tracks Meta Pixel events based on route changes.
 * It listens to location changes and fires appropriate events for different pages.
 * 
 * Features:
 * - Automatic PageView tracking on every route change
 * - Automatic standard event tracking based on URL patterns
 * - Client-side only execution (safe for SSR)
 * - Centralized tracking logic
 * - Compatible with Meta Event Setup Tool
 * 
 * Usage: Import and include this component at the top level of your app (App.jsx)
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  pageViewEvent,
  viewContentEvent,
  addToCartEvent,
  initiateCheckoutEvent,
  purchaseEvent,
  categoryViewEvent,
  searchEvent
} from '../../utils/metaPixelEvents';
import { useMetaPixelCart } from '../../hooks/useMetaPixelCart';

const MetaPixelTracker = () => {
  const location = useLocation();
  const { productList } = useSelector((state) => state.shopProducts);
  const { getCartTrackingData } = useMetaPixelCart();

  useEffect(() => {
    // Only run on client-side (browser)
    if (typeof window === 'undefined') return;

    // Small delay to ensure the page has loaded and fbq is available
    const trackPageView = () => {
      const currentPath = location.pathname;
      
      console.log('MetaPixelTracker: Route changed to', currentPath);
      
      // Always track PageView first
      pageViewEvent();
      
      // Track specific events based on URL patterns
      trackSpecificEvents(currentPath);
    };

    // Use setTimeout to ensure fbq is loaded and DOM is ready
    const timeoutId = setTimeout(trackPageView, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]); // Re-run when pathname changes

  /**
   * Track specific events based on the current route
   * @param {string} pathname - Current route pathname
   */
  const trackSpecificEvents = (pathname) => {
    try {
      // Product Details Page: /shop/details/:id
      if (pathname.match(/^\/shop\/details\/[^/]+$/)) {
        const productId = pathname.split('/').pop();

        // Find product details for enhanced tracking
        const product = productList.find(p => p._id === productId);

        if (product) {
          // Track ViewContent event with actual product data
          viewContentEvent({
            content_ids: [productId],
            content_type: 'product',
            value: product.salePrice || product.price || 0,
            currency: 'INR',
            content_name: product.title,
            content_category: product.category
          });
        } else {
          // Fallback if product not found
          viewContentEvent({
            content_ids: [productId],
            content_type: 'product',
            currency: 'INR'
          });
        }
      }
      
      // Checkout Page: /shop/checkout
      else if (pathname === '/shop/checkout') {
        // Get current cart data for accurate tracking
        const cartData = getCartTrackingData();

        // Track InitiateCheckout event with actual cart data
        initiateCheckoutEvent({
          ...cartData,
          content_type: 'product'
        });
      }
      
      // Payment Success/Thank You Page: /shop/payment-success
      else if (pathname === '/shop/payment-success') {
        purchaseEvent({
          content_type: 'product'
          // Note: You can enhance this with actual order data
          // content_ids: orderItems.map(item => item.id),
          // value: orderTotal,
          // currency: 'INR',
          // num_items: orderItems.length
        });
      }
      
      // Category Pages
      else if (pathname.startsWith('/shop/collections/')) {
        const categorySlug = pathname.split('/').pop();
        const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        categoryViewEvent(categoryName);
      }
      
      // Search Page
      else if (pathname === '/shop/search') {
        // Note: You might want to get the actual search query from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q') || urlParams.get('query');
        
        if (searchQuery) {
          searchEvent({
            search_string: searchQuery
          });
        }
      }
      
      // Home Page
      else if (pathname === '/shop/home' || pathname === '/') {
        // You can track custom events for home page if needed
        // landingPageEvent();
      }
      
    } catch (error) {
      console.error('MetaPixelTracker: Error tracking events', error);
    }
  };

  // This component doesn't render anything
  return null;
};

export default MetaPixelTracker;
