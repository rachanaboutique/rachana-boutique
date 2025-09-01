/**
 * Temporary Cart Manager
 * 
 * Manages cart items in localStorage for non-logged-in users
 * Allows users to add items and proceed to checkout before signing in
 */

const TEMP_CART_KEY = 'tempCart';

/**
 * Get temporary cart items from localStorage
 * @returns {Array} Array of cart items
 */
export const getTempCartItems = () => {
  try {
    const tempCart = localStorage.getItem(TEMP_CART_KEY);
    return tempCart ? JSON.parse(tempCart) : [];
  } catch (error) {
    console.error('Error getting temp cart items:', error);
    return [];
  }
};

/**
 * Add item to temporary cart in localStorage with inventory validation
 * @param {Object} item - Cart item to add
 * @param {string} item.productId - Product ID
 * @param {string} item.colorId - Color ID (optional)
 * @param {number} item.quantity - Quantity to add
 * @param {Object} item.productDetails - Product details for display
 * @param {Array} productList - Product list for inventory validation (optional)
 * @param {Array} existingCartItems - Existing cart items to check against (optional)
 * @returns {Object} Result object with success status and message
 */
export const addToTempCart = (item, productList = null, existingCartItems = null) => {
  try {
    const tempCart = getTempCartItems();

    // Check if item already exists in temp cart
    const existingItemIndex = tempCart.findIndex(
      cartItem => cartItem.productId === item.productId && cartItem.colorId === item.colorId
    );

    const quantityToAdd = item.quantity || 1;
    const existingQuantity = existingItemIndex > -1 ? tempCart[existingItemIndex].quantity : 0;
    const newTotalQuantity = existingQuantity + quantityToAdd;

    // Check existing cart items (actual cart) to prevent exceeding total stock
    let existingCartQuantity = 0;
    if (existingCartItems && existingCartItems.length > 0) {
      const existingCartItem = existingCartItems.find(
        cartItem => cartItem.productId === item.productId &&
        (item.colorId ? cartItem.colors?._id === item.colorId : (!cartItem.colors || !cartItem.colors._id || cartItem.colors.length === 0))
      );
      if (existingCartItem) {
        existingCartQuantity = existingCartItem.quantity;
      }
    }

    // Calculate total quantity including existing cart items
    const totalQuantityWithCart = newTotalQuantity + existingCartQuantity;

    // Validate inventory if productList is provided
    if (productList) {
      const product = productList.find(p => p._id === item.productId);
      if (product) {
        if (item.colorId) {
          // For items with colors, check color inventory
          const color = product.colors?.find(c => c._id === item.colorId);
          if (color) {
            if (color.inventory <= 0) {
              return {
                success: false,
                message: "Selected color is out of stock"
              };
            }
            if (totalQuantityWithCart > color.inventory) {
              return {
                success: false,
                message: `Only ${color.inventory} items available for this product`
              };
            }
          }
        } else {
          // For items without colors, check total stock
          const totalStock = product.colors && product.colors.length > 0
            ? product.colors.reduce((sum, color) => sum + (color.inventory || 0), 0)
            : product.totalStock || 0;

          if (totalQuantityWithCart > totalStock) {
            return {
              success: false,
              message: `Only ${totalStock} items available for this product`
            };
          }
        }
      }
    }

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      tempCart[existingItemIndex].quantity = newTotalQuantity;
    } else {
      // Add new item to temp cart
      tempCart.push({
        productId: item.productId,
        colorId: item.colorId || null,
        quantity: quantityToAdd,
        productDetails: item.productDetails || {},
        addedAt: new Date().toISOString()
      });
    }

    localStorage.setItem(TEMP_CART_KEY, JSON.stringify(tempCart));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('tempCartUpdated'));

    return { success: true, message: "Item added to cart successfully" };
  } catch (error) {
    console.error('Error adding to temp cart:', error);
    return { success: false, message: "Failed to add item to cart" };
  }
};

/**
 * Remove item from temporary cart
 * @param {string} productId - Product ID to remove
 * @param {string} colorId - Color ID (optional)
 */
export const removeFromTempCart = (productId, colorId = null) => {
  try {
    const tempCart = getTempCartItems();
    const updatedCart = tempCart.filter(
      item => !(item.productId === productId && item.colorId === colorId)
    );
    
    localStorage.setItem(TEMP_CART_KEY, JSON.stringify(updatedCart));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('tempCartUpdated'));

    return true;
  } catch (error) {
    console.error('Error removing from temp cart:', error);
    return false;
  }
};

/**
 * Update item quantity in temporary cart with inventory validation
 * @param {string} productId - Product ID
 * @param {string} colorId - Color ID (optional)
 * @param {number} quantity - New quantity
 * @param {Array} productList - Product list for inventory validation (optional)
 * @returns {Object} Result object with success status and message
 */
export const updateTempCartQuantity = (productId, colorId = null, quantity, productList = null) => {
  try {
    const tempCart = getTempCartItems();
    const itemIndex = tempCart.findIndex(
      item => item.productId === productId && item.colorId === colorId
    );

    if (itemIndex === -1) {
      return { success: false, message: "Item not found in cart" };
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      tempCart.splice(itemIndex, 1);
      localStorage.setItem(TEMP_CART_KEY, JSON.stringify(tempCart));

      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('tempCartUpdated'));

      return { success: true, message: "Item removed from cart" };
    }

    // Validate inventory if productList is provided
    if (productList) {
      const product = productList.find(p => p._id === productId);
      if (product) {
        if (colorId) {
          // For items with colors, check color inventory
          const color = product.colors?.find(c => c._id === colorId);
          if (color) {
            if (color.inventory <= 0) {
              return {
                success: false,
                message: "Selected color is out of stock"
              };
            }
            if (quantity > color.inventory) {
              return {
                success: false,
                message: `Only ${color.inventory} items available for ${color.title}`
              };
            }
          }
        } else {
          // For items without colors, check total stock
          const totalStock = product.colors && product.colors.length > 0
            ? product.colors.reduce((sum, color) => sum + (color.inventory || 0), 0)
            : product.totalStock || 0;

          if (quantity > totalStock) {
            return {
              success: false,
              message: `Only ${totalStock} items available for this product`
            };
          }
        }
      }
    }

    // Update quantity
    tempCart[itemIndex].quantity = quantity;
    localStorage.setItem(TEMP_CART_KEY, JSON.stringify(tempCart));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('tempCartUpdated'));

    return { success: true, message: "Quantity updated successfully" };
  } catch (error) {
    console.error('Error updating temp cart quantity:', error);
    return { success: false, message: "Failed to update quantity" };
  }
};

/**
 * Clear temporary cart
 */
export const clearTempCart = () => {
  try {
    localStorage.removeItem(TEMP_CART_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing temp cart:', error);
    return false;
  }
};

/**
 * Get temporary cart count (number of unique products, consistent with actual cart)
 * @returns {number} Number of unique products in temp cart
 */
export const getTempCartCount = () => {
  const tempCart = getTempCartItems();
  return tempCart.length; // Count unique products, not total quantity
};

/**
 * Reset temp cart copy flag for a user (call on logout)
 * @param {string} userId - User ID
 */
export const resetTempCartCopyFlag = (userId) => {
  try {
    const copyKey = `tempCartCopied_${userId}`;
    localStorage.removeItem(copyKey);
    return true;
  } catch (error) {
    console.error('Error resetting temp cart copy flag:', error);
    return false;
  }
};

/**
 * Get temporary cart total value
 * @returns {number} Total value of items in temp cart
 */
export const getTempCartTotal = () => {
  const tempCart = getTempCartItems();
  return tempCart.reduce((total, item) => {
    const price = item.productDetails?.salePrice || item.productDetails?.price || 0;
    return total + (price * item.quantity);
  }, 0);
};

/**
 * Change color of an item in temporary cart
 * @param {string} productId - Product ID
 * @param {string} oldColorId - Current color ID
 * @param {string} newColorId - New color ID
 * @param {Object} productDetails - Product details for the new color
 */
export const changeTempCartColor = (productId, oldColorId, newColorId, productDetails) => {
  try {
    const tempCart = getTempCartItems();
    const itemIndex = tempCart.findIndex(
      item => item.productId === productId && item.colorId === oldColorId
    );

    if (itemIndex === -1) {
      console.error('Item not found in temp cart');
      return false;
    }

    const currentItem = tempCart[itemIndex];

    // Check if there's already an item with the new color
    const existingNewColorIndex = tempCart.findIndex(
      item => item.productId === productId && item.colorId === newColorId
    );

    if (existingNewColorIndex > -1) {
      // Merge quantities
      tempCart[existingNewColorIndex].quantity += currentItem.quantity;
      // Remove the old color item
      tempCart.splice(itemIndex, 1);
    } else {
      // Just update the color ID and product details
      tempCart[itemIndex].colorId = newColorId;
      tempCart[itemIndex].productDetails = { ...tempCart[itemIndex].productDetails, ...productDetails };
    }

    localStorage.setItem(TEMP_CART_KEY, JSON.stringify(tempCart));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('tempCartUpdated'));

    return true;
  } catch (error) {
    console.error('Error changing temp cart color:', error);
    return false;
  }
};

/**
 * Copy temporary cart items to user's actual cart after login
 * @param {Function} addToCartFunction - Function to add items to actual cart
 * @param {string} userId - User ID after login
 */
export const copyTempCartToUser = async (addToCartFunction, userId) => {
  try {
    const tempCart = getTempCartItems();

    if (tempCart.length === 0) {
      return { success: true, message: 'No items to copy' };
    }

    // Check if we've already copied for this user to prevent duplicates
    const copyKey = `tempCartCopied_${userId}`;
    const alreadyCopied = localStorage.getItem(copyKey);

    if (alreadyCopied) {
      return { success: true, message: 'Already copied', copied: 0, failed: 0 };
    }

    const copyResults = [];

    // Copy each item to user's cart (don't clear temp cart)
    for (const item of tempCart) {
      try {
        const result = await addToCartFunction({
          userId,
          productId: item.productId,
          quantity: item.quantity,
          colorId: item.colorId
        });

        copyResults.push({
          productId: item.productId,
          success: result?.payload?.success || false,
          error: result?.error || null
        });
      } catch (error) {
        copyResults.push({
          productId: item.productId,
          success: false,
          error: error.message
        });
      }
    }

    // Count successful and failed copies
    const successCount = copyResults.filter(r => r.success).length;
    const failCount = copyResults.filter(r => !r.success).length;

    // Don't clear temp cart - keep items for when user logs out
    // This allows users to see their temp cart items again after logout

    // Mark as copied for this user to prevent future duplicates
    if (successCount > 0) {
      const copyKey = `tempCartCopied_${userId}`;
      localStorage.setItem(copyKey, 'true');
    }

 

    return {
      success: failCount === 0,
      copied: successCount,
      failed: failCount,
      results: copyResults
    };

  } catch (error) {
    console.error('Error copying temp cart:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Keep the old function for backward compatibility but mark as deprecated
export const transferTempCartToUser = copyTempCartToUser;
