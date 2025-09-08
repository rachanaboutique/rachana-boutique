/**
 * Cart Debug Helper
 * Utility functions to help debug cart-related issues
 */

/**
 * Debug cart items structure
 * @param {Array} cartItems - Cart items array
 * @param {Array} productList - Product list for reference
 */
export const debugCartItems = (cartItems, productList = []) => {
  console.group('🔍 Cart Items Debug');
  
  console.log('📊 Cart Items Summary:', {
    totalItems: cartItems.length,
    cartItemsType: Array.isArray(cartItems) ? 'Array' : typeof cartItems,
    firstItemKeys: cartItems.length > 0 ? Object.keys(cartItems[0]) : 'No items'
  });

  cartItems.forEach((item, index) => {
    console.group(`📦 Cart Item ${index + 1}`);
    
    // Basic item info
    console.log('Basic Info:', {
      productId: item.productId,
      title: item.title,
      quantity: item.quantity,
      hasColors: !!item.colors,
      colorId: item.colors?._id,
      colorTitle: item.colors?.title
    });

    // Check if product exists in productList
    const productFromList = productList.find(p => p._id === item.productId);
    console.log('Product List Match:', {
      found: !!productFromList,
      titleFromList: productFromList?.title,
      colorsCount: productFromList?.colors?.length || 0
    });

    // Inventory info
    if (item.colors && item.colors._id) {
      const availableInventory = item.productColors
        ? item.productColors.find(color => color._id === item.colors._id)?.inventory || 0
        : item.colors.inventory || 0;
      
      console.log('Color Inventory:', {
        colorTitle: item.colors.title,
        availableInventory,
        requestedQuantity: item.quantity,
        hasEnoughStock: item.quantity <= availableInventory
      });
    } else {
      console.log('Total Stock:', {
        totalStock: item.totalStock || 0,
        requestedQuantity: item.quantity,
        hasEnoughStock: item.quantity <= (item.totalStock || 0)
      });
    }

    // Full item structure (for debugging)
    console.log('Full Item Structure:', item);
    
    console.groupEnd();
  });

  console.groupEnd();
};

/**
 * Debug temp cart items structure
 * @param {Array} tempCartItems - Temp cart items array
 * @param {Array} productList - Product list for reference
 */
export const debugTempCartItems = (tempCartItems, productList = []) => {
  console.group('🔍 Temp Cart Items Debug');
  
  console.log('📊 Temp Cart Items Summary:', {
    totalItems: tempCartItems.length,
    tempCartItemsType: Array.isArray(tempCartItems) ? 'Array' : typeof tempCartItems
  });

  tempCartItems.forEach((item, index) => {
    console.group(`📦 Temp Cart Item ${index + 1}`);
    
    // Basic item info
    console.log('Basic Info:', {
      productId: item.productId,
      colorId: item.colorId,
      quantity: item.quantity,
      productDetailsTitle: item.productDetails?.title
    });

    // Check if product exists in productList
    const productFromList = productList.find(p => p._id === item.productId);
    console.log('Product List Match:', {
      found: !!productFromList,
      titleFromList: productFromList?.title,
      colorsCount: productFromList?.colors?.length || 0
    });

    // Inventory info
    if (item.colorId && productFromList) {
      const color = productFromList.colors?.find(c => c._id === item.colorId);
      console.log('Color Inventory:', {
        colorTitle: color?.title,
        availableInventory: color?.inventory || 0,
        requestedQuantity: item.quantity,
        hasEnoughStock: item.quantity <= (color?.inventory || 0)
      });
    }

    // Full item structure (for debugging)
    console.log('Full Temp Item Structure:', item);
    
    console.groupEnd();
  });

  console.groupEnd();
};

/**
 * Debug product list structure
 * @param {Array} productList - Product list array
 */
export const debugProductList = (productList = []) => {
  console.group('🔍 Product List Debug');
  
  console.log('📊 Product List Summary:', {
    totalProducts: productList.length,
    productListType: Array.isArray(productList) ? 'Array' : typeof productList,
    firstProductKeys: productList.length > 0 ? Object.keys(productList[0]) : 'No products'
  });

  if (productList.length > 0) {
    console.log('Sample Product Structure:', productList[0]);
  }

  console.groupEnd();
};

/**
 * Run comprehensive cart debug
 * @param {Object} params - Debug parameters
 */
export const runCartDebug = ({ cartItems = [], tempCartItems = [], productList = [] }) => {
  console.group('🚀 Comprehensive Cart Debug');
  
  debugCartItems(cartItems, productList);
  debugTempCartItems(tempCartItems, productList);
  debugProductList(productList);
  
  console.groupEnd();
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.debugCartItems = debugCartItems;
  window.debugTempCartItems = debugTempCartItems;
  window.debugProductList = debugProductList;
  window.runCartDebug = runCartDebug;
}
