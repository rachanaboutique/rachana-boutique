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
    return false;
  }
  
  if (cartCopyState.hasCompleted && cartCopyState.userId === userId) {
    return false;
  }
  
  cartCopyState.isInProgress = true;
  cartCopyState.userId = userId;
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
  } else {
    // Reset state on failure so it can be retried
    cartCopyState.hasCompleted = false;
    cartCopyState.userId = null;
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
};

/**
 * Get current cart copy state (for debugging)
 */
export const getCartCopyState = () => {
  return { ...cartCopyState };
};
