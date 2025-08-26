/**
 * Cart Copy Manager
 * 
 * Manages the state of cart copying to prevent duplicate operations
 * across different components and authentication flows
 */

let cartCopyState = {
  isInProgress: false,
  hasCompleted: false,
  userId: null
};

/**
 * Check if cart copy is currently in progress
 */
export const isCartCopyInProgress = () => {
  return cartCopyState.isInProgress;
};

/**
 * Check if cart copy has been completed for the current user
 */
export const hasCartCopyCompleted = (userId) => {
  return cartCopyState.hasCompleted && cartCopyState.userId === userId;
};

/**
 * Start cart copy operation
 */
export const startCartCopy = (userId) => {
  if (cartCopyState.isInProgress) {
    console.log('Cart copy already in progress, skipping');
    return false;
  }
  
  if (cartCopyState.hasCompleted && cartCopyState.userId === userId) {
    console.log('Cart copy already completed for this user, skipping');
    return false;
  }
  
  cartCopyState.isInProgress = true;
  cartCopyState.userId = userId;
  console.log('Cart copy started for user:', userId);
  return true;
};

/**
 * Complete cart copy operation
 */
export const completeCartCopy = (userId, success = true) => {
  cartCopyState.isInProgress = false;
  
  if (success) {
    cartCopyState.hasCompleted = true;
    cartCopyState.userId = userId;
    console.log('Cart copy completed successfully for user:', userId);
  } else {
    // Reset state on failure so it can be retried
    cartCopyState.hasCompleted = false;
    cartCopyState.userId = null;
    console.log('Cart copy failed for user:', userId);
  }
};

/**
 * Reset cart copy state (call when user logs out)
 */
export const resetCartCopyState = () => {
  cartCopyState = {
    isInProgress: false,
    hasCompleted: false,
    userId: null
  };
  console.log('Cart copy state reset');
};

/**
 * Get current cart copy state (for debugging)
 */
export const getCartCopyState = () => {
  return { ...cartCopyState };
};
