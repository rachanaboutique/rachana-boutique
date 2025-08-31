/**
 * Cart Validation Utilities
 * 
 * Provides validation functions for cart operations including inventory checks
 * and existing cart quantity validation
 */

/**
 * Validate if adding an item to cart would exceed inventory limits
 * @param {Object} params - Validation parameters
 * @param {string} params.productId - Product ID
 * @param {string} params.colorId - Color ID (optional)
 * @param {number} params.quantityToAdd - Quantity to add
 * @param {Array} params.cartItems - Current cart items
 * @param {Array} params.productList - Product list for inventory data
 * @returns {Object} Validation result with success status and message
 */
export const validateAddToCart = ({ productId, colorId, quantityToAdd, cartItems, productList }) => {
  try {
    // Find the product
    const product = productList.find(p => p._id === productId);
    if (!product) {
      console.log('❌ Product not found in productList');
      return {
        success: false,
        message: "Product not found"
      };
    }

    console.log('✅ Product found:', product.title);

    // Find existing cart item
    const existingCartItem = cartItems.find(
      item => item.productId === productId &&
      (colorId ? item.colors?._id === colorId : (!item.colors || !item.colors._id || item.colors.length === 0))
    );

    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
    const newTotalQuantity = existingQuantity + quantityToAdd;

    if (colorId) {
      // For items with colors, check color inventory
      const color = product.colors?.find(c => c._id === colorId);
      if (!color) {
        return {
          success: false,
          message: "Selected color not found"
        };
      }

      if (color.inventory <= 0) {
        return {
          success: false,
          message: "Selected color is out of stock"
        };
      }

      if (newTotalQuantity > color.inventory) {
        return {
          success: false,
          message: `Only ${color.inventory} items available for this product`
        };
      }
    } else {
      // For items without colors, check total stock
      const totalStock = product.colors && product.colors.length > 0
        ? product.colors.reduce((sum, color) => sum + (color.inventory || 0), 0)
        : product.totalStock || 0;

      if (totalStock <= 0) {
        return {
          success: false,
          message: "This product is out of stock"
        };
      }

      if (newTotalQuantity > totalStock) {
        return {
          success: false,
          message: `Only ${totalStock} items available for this product`
        };
      }
    }

    return {
      success: true,
      message: "Item can be added to cart"
    };
  } catch (error) {
    console.error('Error validating add to cart:', error);
    return {
      success: false,
      message: "Failed to validate cart operation"
    };
  }
};

/**
 * Get available quantity that can be added to cart
 * @param {Object} params - Parameters
 * @param {string} params.productId - Product ID
 * @param {string} params.colorId - Color ID (optional)
 * @param {Array} params.cartItems - Current cart items
 * @param {Array} params.productList - Product list for inventory data
 * @returns {number} Available quantity that can be added
 */
export const getAvailableQuantityToAdd = ({ productId, colorId, cartItems, productList }) => {
  try {
    const product = productList.find(p => p._id === productId);
    if (!product) return 0;

    const existingCartItem = cartItems.find(
      item => item.productId === productId && 
      (colorId ? item.colors?._id === colorId : !item.colors)
    );
    
    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;

    if (colorId) {
      const color = product.colors?.find(c => c._id === colorId);
      if (!color) return 0;
      return Math.max(0, color.inventory - existingQuantity);
    } else {
      const totalStock = product.colors && product.colors.length > 0 
        ? product.colors.reduce((sum, color) => sum + (color.inventory || 0), 0)
        : product.totalStock || 0;
      return Math.max(0, totalStock - existingQuantity);
    }
  } catch (error) {
    console.error('Error getting available quantity:', error);
    return 0;
  }
};

/**
 * Check if a product/color is in stock
 * @param {Object} params - Parameters
 * @param {string} params.productId - Product ID
 * @param {string} params.colorId - Color ID (optional)
 * @param {Array} params.productList - Product list for inventory data
 * @returns {boolean} True if in stock
 */
export const isInStock = ({ productId, colorId, productList }) => {
  try {
    const product = productList.find(p => p._id === productId);
    if (!product) return false;

    if (colorId) {
      const color = product.colors?.find(c => c._id === colorId);
      return color ? color.inventory > 0 : false;
    } else {
      const totalStock = product.colors && product.colors.length > 0 
        ? product.colors.reduce((sum, color) => sum + (color.inventory || 0), 0)
        : product.totalStock || 0;
      return totalStock > 0;
    }
  } catch (error) {
    console.error('Error checking stock:', error);
    return false;
  }
};
