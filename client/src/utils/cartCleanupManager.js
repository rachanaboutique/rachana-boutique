/**
 * Cart Cleanup Manager
 * 
 * Handles automatic removal of purchased items from both actual cart and temp cart
 * after successful payment completion
 */

import { deleteCartItem, fetchCartItems, forceStopLoading } from "@/store/shop/cart-slice";
import { removeFromTempCart, getTempCartItems } from "./tempCartManager";

/**
 * Remove purchased items from both actual cart and temp cart
 * @param {Array} purchasedItems - Array of purchased items from order
 * @param {string} userId - User ID for actual cart operations
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<Object>} Cleanup result with success counts
 */
export const cleanupPurchasedItems = async (purchasedItems, userId, dispatch) => {
  const results = {
    actualCartCleaned: 0,
    tempCartCleaned: 0,
    actualCartErrors: 0,
    tempCartErrors: 0,
    success: false
  };

  if (!purchasedItems || !Array.isArray(purchasedItems) || purchasedItems.length === 0) {
    console.log('No purchased items to clean up');
    return results;
  }

  console.log('Starting cart cleanup for purchased items:', purchasedItems);

  // Clean up actual cart (for logged-in users)
  if (userId) {
    // Process deletions sequentially to avoid loading state conflicts
    for (const item of purchasedItems) {
      try {
        console.log(`Attempting to remove from cart: ${item.title || item.productId}`);

        const deleteResult = await dispatch(deleteCartItem({
          userId: userId,
          productId: item.productId,
          colorId: item.colors?._id || null
        }));

        // Wait for the action to complete before proceeding
        if (deleteResult?.payload?.success) {
          results.actualCartCleaned++;
          console.log(`✅ Removed from actual cart: ${item.title || item.productId}`);
        } else {
          results.actualCartErrors++;
          console.warn(`⚠️ Failed to remove from actual cart: ${item.title || item.productId}`, deleteResult);
        }

        // Small delay between deletions to prevent state conflicts
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.actualCartErrors++;
        console.error('❌ Error removing item from actual cart:', error);
      }
    }

    // Final refresh to ensure cart state is consistent
    try {
      console.log('Refreshing cart after cleanup...');
      await dispatch(fetchCartItems(userId));
      console.log('✅ Cart refreshed successfully after cleanup');
    } catch (error) {
      console.error('❌ Error refreshing cart after cleanup:', error);
      // Force stop loading state in case of error
      dispatch(forceStopLoading());
    }

    // Safety mechanism: Force stop loading after cleanup
    setTimeout(() => {
      dispatch(forceStopLoading());
    }, 1000);
  }

  // Clean up temp cart
  const tempCartItems = getTempCartItems();
  for (const item of purchasedItems) {
    const tempItem = tempCartItems.find(tempCartItem => 
      tempCartItem.productId === item.productId && 
      tempCartItem.colorId === (item.colors?._id || null)
    );
    
    if (tempItem) {
      try {
        const removeSuccess = removeFromTempCart(item.productId, item.colors?._id || null);
        if (removeSuccess) {
          results.tempCartCleaned++;
          console.log(`Removed from temp cart: ${item.title || item.productId}`);
        } else {
          results.tempCartErrors++;
          console.warn(`Failed to remove from temp cart: ${item.title || item.productId}`);
        }
      } catch (error) {
        results.tempCartErrors++;
        console.error('Error removing item from temp cart:', error);
      }
    }
  }

  // Determine overall success
  results.success = (results.actualCartCleaned + results.tempCartCleaned) > 0;

  console.log('Cart cleanup completed:', results);
  return results;
};

/**
 * Clean up cart items based on order details
 * @param {Object} orderDetails - Order details containing cartItems
 * @param {string} userId - User ID for actual cart operations  
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<Object>} Cleanup result
 */
export const cleanupCartFromOrder = async (orderDetails, userId, dispatch) => {
  if (!orderDetails || !orderDetails.cartItems) {
    console.log('No order details or cart items found for cleanup');
    return { success: false, message: 'No order details found' };
  }

  return await cleanupPurchasedItems(orderDetails.cartItems, userId, dispatch);
};

/**
 * Batch cleanup for multiple orders (if needed)
 * @param {Array} orders - Array of order objects
 * @param {string} userId - User ID for actual cart operations
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<Object>} Combined cleanup result
 */
export const batchCleanupOrders = async (orders, userId, dispatch) => {
  const combinedResults = {
    actualCartCleaned: 0,
    tempCartCleaned: 0,
    actualCartErrors: 0,
    tempCartErrors: 0,
    ordersProcessed: 0,
    success: false
  };

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return combinedResults;
  }

  for (const order of orders) {
    try {
      const result = await cleanupCartFromOrder(order, userId, dispatch);
      combinedResults.actualCartCleaned += result.actualCartCleaned || 0;
      combinedResults.tempCartCleaned += result.tempCartCleaned || 0;
      combinedResults.actualCartErrors += result.actualCartErrors || 0;
      combinedResults.tempCartErrors += result.tempCartErrors || 0;
      combinedResults.ordersProcessed++;
    } catch (error) {
      console.error('Error processing order cleanup:', error);
    }
  }

  combinedResults.success = combinedResults.ordersProcessed > 0 &&
    (combinedResults.actualCartCleaned + combinedResults.tempCartCleaned) > 0;

  return combinedResults;
};

/**
 * Manual cleanup trigger for testing or fallback scenarios
 * @param {string} orderId - Order ID to fetch and clean up
 * @param {string} userId - User ID for actual cart operations
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} getOrderDetails - Function to fetch order details
 * @returns {Promise<Object>} Cleanup result
 */
export const manualCleanupByOrderId = async (orderId, userId, dispatch, getOrderDetails) => {
  try {
    console.log('Manual cleanup triggered for order:', orderId);

    const orderResponse = await dispatch(getOrderDetails(orderId));
    if (orderResponse?.payload?.success) {
      const orderDetails = orderResponse.payload.data;
      return await cleanupCartFromOrder(orderDetails, userId, dispatch);
    } else {
      console.error('Failed to fetch order details for manual cleanup');
      return { success: false, message: 'Failed to fetch order details' };
    }
  } catch (error) {
    console.error('Error in manual cleanup:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if cart cleanup is needed for recent orders
 * @param {Array} recentOrders - Array of recent orders to check
 * @param {Array} currentCartItems - Current cart items
 * @returns {Object} Analysis of cleanup needs
 */
export const analyzeCleanupNeeds = (recentOrders, currentCartItems) => {
  const analysis = {
    needsCleanup: false,
    itemsToCleanup: [],
    ordersAffected: []
  };

  if (!recentOrders || !currentCartItems || currentCartItems.length === 0) {
    return analysis;
  }

  // Check for items in cart that were recently purchased
  for (const order of recentOrders) {
    if (order.paymentStatus === 'paid' && order.cartItems) {
      for (const purchasedItem of order.cartItems) {
        const cartItem = currentCartItems.find(item =>
          item.productId === purchasedItem.productId &&
          item.colors?._id === purchasedItem.colors?._id
        );

        if (cartItem) {
          analysis.needsCleanup = true;
          analysis.itemsToCleanup.push({
            productId: purchasedItem.productId,
            colorId: purchasedItem.colors?._id,
            title: purchasedItem.title,
            orderId: order._id
          });

          if (!analysis.ordersAffected.includes(order._id)) {
            analysis.ordersAffected.push(order._id);
          }
        }
      }
    }
  }

  return analysis;
};
