/**
 * Meta Pixel Event Functions
 * Centralized event tracking for Facebook Pixel
 * 
 * Usage: Import and call these functions when specific actions occur
 * Example: viewContentEvent({ content_ids: ['123'], value: 29.99 })
 */

// Check if fbq is available (for safety in SSR or when script fails to load)
const isFbqAvailable = () => {
  return typeof window !== 'undefined' && window.fbq && typeof window.fbq === 'function';
};

/**
 * Track PageView event
 * Automatically called by MetaPixelTracker on route changes
 */
export const pageViewEvent = () => {
  if (isFbqAvailable()) {
    window.fbq('track', 'PageView');
    console.log('Meta Pixel: PageView tracked');
  }
};

/**
 * Track ViewContent event
 * Call when user views a product details page
 * @param {Object} params - Event parameters
 * @param {string[]} params.content_ids - Product IDs
 * @param {string} params.content_type - Type of content (product)
 * @param {number} params.value - Product value
 * @param {string} params.currency - Currency code
 */
export const viewContentEvent = (params = {}) => {
  if (isFbqAvailable()) {
    const eventData = {
      content_type: 'product',
      currency: 'INR',
      ...params
    };
    
    window.fbq('track', 'ViewContent', eventData);
    console.log('Meta Pixel: ViewContent tracked', eventData);
  }
};

/**
 * Track AddToCart event
 * Call when user adds item to cart or visits cart page
 * @param {Object} params - Event parameters
 * @param {string[]} params.content_ids - Product IDs in cart
 * @param {string} params.content_type - Type of content
 * @param {number} params.value - Total cart value
 * @param {string} params.currency - Currency code
 */
export const addToCartEvent = (params = {}) => {
  if (isFbqAvailable()) {
    // Ensure required parameters are present and valid
    const eventData = {
      content_type: 'product',
      currency: 'INR',
      ...params
    };

    // Validate content_ids is an array
    if (eventData.content_ids && !Array.isArray(eventData.content_ids)) {
      eventData.content_ids = [eventData.content_ids];
    }

    // Ensure value is a number
    if (eventData.value && typeof eventData.value === 'string') {
      eventData.value = parseFloat(eventData.value);
    }

    // Remove undefined/null values
    Object.keys(eventData).forEach(key => {
      if (eventData[key] === undefined || eventData[key] === null) {
        delete eventData[key];
      }
    });

    window.fbq('track', 'AddToCart', eventData);
    console.log('Meta Pixel: AddToCart tracked', eventData);
  }
};

/**
 * Track InitiateCheckout event
 * Call when user starts the checkout process
 * @param {Object} params - Event parameters
 * @param {string[]} params.content_ids - Product IDs
 * @param {number} params.value - Total checkout value
 * @param {string} params.currency - Currency code
 * @param {number} params.num_items - Number of items
 */
export const initiateCheckoutEvent = (params = {}) => {
  if (isFbqAvailable()) {
    const eventData = {
      content_type: 'product',
      currency: 'INR',
      ...params
    };
    
    window.fbq('track', 'InitiateCheckout', eventData);
    console.log('Meta Pixel: InitiateCheckout tracked', eventData);
  }
};

/**
 * Track Purchase event
 * Call when user completes a purchase
 * @param {Object} params - Event parameters
 * @param {string[]} params.content_ids - Product IDs purchased
 * @param {number} params.value - Total purchase value
 * @param {string} params.currency - Currency code
 * @param {number} params.num_items - Number of items purchased
 */
export const purchaseEvent = (params = {}) => {
  if (isFbqAvailable()) {
    // Ensure required parameters are present and valid
    const eventData = {
      content_type: 'product',
      currency: 'INR',
      ...params
    };

    // Validate content_ids is an array
    if (eventData.content_ids && !Array.isArray(eventData.content_ids)) {
      eventData.content_ids = [eventData.content_ids];
    }

    // Ensure value is a number and greater than 0
    if (eventData.value) {
      if (typeof eventData.value === 'string') {
        eventData.value = parseFloat(eventData.value);
      }
      // Ensure value is positive
      if (eventData.value <= 0) {
        eventData.value = 0.01; // Minimum value for Facebook
      }
    }

    // Ensure num_items is a positive integer
    if (eventData.num_items) {
      eventData.num_items = Math.max(1, parseInt(eventData.num_items));
    }

    // Remove undefined/null values
    Object.keys(eventData).forEach(key => {
      if (eventData[key] === undefined || eventData[key] === null) {
        delete eventData[key];
      }
    });

    window.fbq('track', 'Purchase', eventData);
    console.log('Meta Pixel: Purchase tracked', eventData);
  }
};

/**
 * Track Lead event
 * Call when user submits contact form or newsletter signup
 * @param {Object} params - Event parameters
 */
export const leadEvent = (params = {}) => {
  if (isFbqAvailable()) {
    window.fbq('track', 'Lead', params);
    console.log('Meta Pixel: Lead tracked', params);
  }
};

/**
 * Track Search event
 * Call when user performs a search
 * @param {Object} params - Event parameters
 * @param {string} params.search_string - Search query
 */
export const searchEvent = (params = {}) => {
  if (isFbqAvailable()) {
    window.fbq('track', 'Search', params);
    console.log('Meta Pixel: Search tracked', params);
  }
};

/**
 * Track CompleteRegistration event
 * Call when user completes registration
 * @param {Object} params - Event parameters
 */
export const completeRegistrationEvent = (params = {}) => {
  if (isFbqAvailable()) {
    window.fbq('track', 'CompleteRegistration', params);
    console.log('Meta Pixel: CompleteRegistration tracked', params);
  }
};

/**
 * Custom Events - Following your example pattern
 */

export const signUpOTPVerificationEvent = () => {
  if (isFbqAvailable()) {
    window.fbq('track', 'SignUp-OTP-Verification');
    console.log('Meta Pixel: SignUp-OTP-Verification tracked');
  }
};

export const signUpPhoneNumberEvent = () => {
  if (isFbqAvailable()) {
    window.fbq('track', 'SignUp-PhoneNumber-Entered');
    console.log('Meta Pixel: SignUp-PhoneNumber-Entered tracked');
  }
};

export const landingPageEvent = () => {
  if (isFbqAvailable()) {
    window.fbq('track', 'Lead-LandingPage');
    console.log('Meta Pixel: Lead-LandingPage tracked');
  }
};

export const kycUploadEvent = () => {
  if (isFbqAvailable()) {
    window.fbq('track', 'KYC-Upload');
    console.log('Meta Pixel: KYC-Upload tracked');
  }
};

/**
 * Additional custom events for your saree boutique
 */

export const categoryViewEvent = (categoryName) => {
  if (isFbqAvailable()) {
    window.fbq('track', 'Category-View', { category: categoryName });
    console.log('Meta Pixel: Category-View tracked', categoryName);
  }
};

export const newsletterSignupEvent = () => {
  if (isFbqAvailable()) {
    window.fbq('track', 'Newsletter-Signup');
    console.log('Meta Pixel: Newsletter-Signup tracked');
  }
};

export const contactFormSubmitEvent = () => {
  if (isFbqAvailable()) {
    window.fbq('track', 'Contact-Form-Submit');
    console.log('Meta Pixel: Contact-Form-Submit tracked');
  }
};

export const wishlistAddEvent = (productId) => {
  if (isFbqAvailable()) {
    window.fbq('track', 'AddToWishlist', { content_ids: [productId] });
    console.log('Meta Pixel: AddToWishlist tracked', productId);
  }
};

/**
 * Test function to manually fire events for debugging
 * Call this from browser console to test if events are working
 */
export const testMetaPixelEvents = () => {
  console.log('🧪 Testing Meta Pixel Events...');

  if (!isFbqAvailable()) {
    console.error('❌ Meta Pixel not available');
    return;
  }

  // Test AddToCart
  console.log('Testing AddToCart event...');
  addToCartEvent({
    content_ids: ['test_product_123'],
    value: 99.99,
    currency: 'INR',
    content_name: 'Test Product',
    num_items: 1
  });

  // Test Purchase
  setTimeout(() => {
    console.log('Testing Purchase event...');
    purchaseEvent({
      content_ids: ['test_product_123', 'test_product_456'],
      value: 199.98,
      currency: 'INR',
      num_items: 2,
      transaction_id: 'test_order_789'
    });
  }, 2000);

  console.log('✅ Test events fired. Check Meta Pixel Helper and Events Manager.');
};

// Make test function available globally for debugging
if (typeof window !== 'undefined') {
  window.testMetaPixelEvents = testMetaPixelEvents;
  console.log('💡 Test function available: window.testMetaPixelEvents()');
}
