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
    const eventData = {
      content_type: 'product',
      currency: 'INR',
      ...params
    };
    
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
    const eventData = {
      content_type: 'product',
      currency: 'INR',
      ...params
    };
    
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
