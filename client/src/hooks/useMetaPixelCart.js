/**
 * useMetaPixelCart Hook
 * 
 * This hook provides enhanced Meta Pixel tracking for cart-related actions.
 * It integrates with your Redux cart state to provide accurate tracking data.
 * 
 * Usage: Call these functions when cart actions occur
 * Example: const { trackAddToCart, trackCartView } = useMetaPixelCart();
 */

import { useSelector } from 'react-redux';
import { addToCartEvent, viewContentEvent } from '../utils/metaPixelEvents';

export const useMetaPixelCart = () => {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);

  /**
   * Track when user adds item to cart
   * @param {string} productId - Product ID that was added
   * @param {string} colorId - Color ID if applicable
   * @param {number} quantity - Quantity added
   */
  const trackAddToCart = (productId, colorId = null, quantity = 1) => {
    try {
      // Find the product details
      const product = productList.find(p => p._id === productId);
      
      if (product) {
        // Calculate the value based on product price and quantity
        const productPrice = product.salePrice || product.price || 0;
        const totalValue = productPrice * quantity;

        addToCartEvent({
          content_ids: [productId],
          content_type: 'product',
          value: totalValue,
          currency: 'INR',
          content_name: product.title,
          content_category: product.category,
          num_items: quantity
        });
      } else {
        // Fallback if product not found in list
        addToCartEvent({
          content_ids: [productId],
          content_type: 'product',
          currency: 'INR',
          num_items: quantity
        });
      }
    } catch (error) {
      console.error('Error tracking AddToCart:', error);
    }
  };

  /**
   * Track when user views cart (opens cart drawer)
   */
  const trackCartView = () => {
    try {
      if (cartItems && cartItems.length > 0) {
        // Calculate total cart value
        const totalValue = cartItems.reduce((total, item) => {
          const product = productList.find(p => p._id === item.productId);
          const price = product?.salePrice || product?.price || 0;
          return total + (price * item.quantity);
        }, 0);

        // Get all product IDs in cart
        const contentIds = cartItems.map(item => item.productId);

        addToCartEvent({
          content_ids: contentIds,
          content_type: 'product',
          value: totalValue,
          currency: 'INR',
          num_items: cartItems.reduce((total, item) => total + item.quantity, 0)
        });
      }
    } catch (error) {
      console.error('Error tracking cart view:', error);
    }
  };

  /**
   * Get current cart data for tracking
   * @returns {Object} Cart tracking data
   */
  const getCartTrackingData = () => {
    try {
      if (!cartItems || cartItems.length === 0) {
        return {
          content_ids: [],
          value: 0,
          currency: 'INR',
          num_items: 0
        };
      }

      // Calculate total cart value
      const totalValue = cartItems.reduce((total, item) => {
        const product = productList.find(p => p._id === item.productId);
        const price = product?.salePrice || product?.price || 0;
        return total + (price * item.quantity);
      }, 0);

      // Get all product IDs in cart
      const contentIds = cartItems.map(item => item.productId);

      return {
        content_ids: contentIds,
        content_type: 'product',
        value: totalValue,
        currency: 'INR',
        num_items: cartItems.reduce((total, item) => total + item.quantity, 0)
      };
    } catch (error) {
      console.error('Error getting cart tracking data:', error);
      return {
        content_ids: [],
        value: 0,
        currency: 'INR',
        num_items: 0
      };
    }
  };

  return {
    trackAddToCart,
    trackCartView,
    getCartTrackingData
  };
};
