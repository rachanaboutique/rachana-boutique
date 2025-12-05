/**
 * Meta Pixel Advanced Matching Utility
 * 
 * This utility handles manual advanced matching for Meta Pixel.
 * Advanced matching allows Meta to match website visitors with their Facebook accounts
 * using hashed data (email, phone, name, etc.) for better ad targeting and conversion tracking.
 * 
 * All data is automatically hashed by Meta Pixel using SHA-256 before being sent.
 * 
 * Usage:
 * - Call setUserData() when user logs in or provides their information
 * - Call clearUserData() when user logs out
 * - Data is automatically hashed by Meta Pixel
 */

/**
 * Utility function to normalize and hash data for Meta Pixel
 * Note: Meta Pixel automatically hashes data, but we normalize it first
 */
const normalizeData = (value) => {
  if (!value) return '';
  
  // Convert to string and trim whitespace
  let normalized = String(value).trim().toLowerCase();
  
  // Remove spaces for phone numbers
  if (normalized.match(/^\d+$/)) {
    normalized = normalized.replace(/\s/g, '');
  }
  
  return normalized;
};

/**
 * Set user data for advanced matching
 * Call this when user logs in or provides their information
 * 
 * @param {Object} userData - User data object
 * @param {string} userData.email - User email address
 * @param {string} userData.phone - User phone number (10+ digits)
 * @param {string} userData.firstName - User first name
 * @param {string} userData.lastName - User last name
 * @param {string} userData.city - User city
 * @param {string} userData.state - User state
 * @param {string} userData.zipCode - User zip/postal code
 * @param {string} userData.country - User country code (e.g., 'IN')
 * @param {string} userData.externalId - Your internal user ID
 * 
 * Example:
 * setUserData({
 *   email: 'user@example.com',
 *   phone: '9876543210',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   city: 'Mumbai',
 *   state: 'MH',
 *   zipCode: '400001',
 *   country: 'IN',
 *   externalId: 'user_123'
 * })
 */
export const setUserData = (userData = {}) => {
  if (typeof window === 'undefined' || !window.fbq) {
    console.warn('Meta Pixel not available');
    return;
  }

  try {
    // Build the advanced matching data object
    const advancedMatchingData = {};

    // Email (em)
    if (userData.email) {
      advancedMatchingData.em = normalizeData(userData.email);
    }

    // Phone (ph) - should be 10+ digits
    if (userData.phone) {
      const normalizedPhone = normalizeData(userData.phone);
      if (normalizedPhone.match(/^\d{10,}$/)) {
        advancedMatchingData.ph = normalizedPhone;
      }
    }

    // First Name (fn)
    if (userData.firstName) {
      advancedMatchingData.fn = normalizeData(userData.firstName);
    }

    // Last Name (ln)
    if (userData.lastName) {
      advancedMatchingData.ln = normalizeData(userData.lastName);
    }

    // City (ct)
    if (userData.city) {
      advancedMatchingData.ct = normalizeData(userData.city);
    }

    // State (st)
    if (userData.state) {
      advancedMatchingData.st = normalizeData(userData.state);
    }

    // Zip Code (zp)
    if (userData.zipCode) {
      advancedMatchingData.zp = normalizeData(userData.zipCode);
    }

    // Country (country) - should be 2-letter country code
    if (userData.country) {
      advancedMatchingData.country = normalizeData(userData.country);
    }

    // External ID (external_id) - your internal user ID
    if (userData.externalId) {
      advancedMatchingData.external_id = String(userData.externalId);
    }

    // Only set data if we have at least one field
    if (Object.keys(advancedMatchingData).length > 0) {
      // Use setUserData API to set advanced matching data
      window.fbq('setUserData', advancedMatchingData);
      
      console.log('✅ Meta Pixel Advanced Matching Data Set:', {
        fields: Object.keys(advancedMatchingData),
        timestamp: new Date().toISOString()
      });

      // Store in localStorage for persistence
      localStorage.setItem('metaPixelUserData', JSON.stringify(advancedMatchingData));
    }
  } catch (error) {
    console.error('❌ Error setting Meta Pixel user data:', error);
  }
};

/**
 * Clear user data (call on logout)
 */
export const clearUserData = () => {
  if (typeof window === 'undefined' || !window.fbq) {
    console.warn('Meta Pixel not available');
    return;
  }

  try {
    // Clear user data
    window.fbq('clearUserData');
    
    console.log('✅ Meta Pixel User Data Cleared');

    // Remove from localStorage
    localStorage.removeItem('metaPixelUserData');
  } catch (error) {
    console.error('❌ Error clearing Meta Pixel user data:', error);
  }
};

/**
 * Get stored user data from localStorage
 */
export const getStoredUserData = () => {
  try {
    const stored = localStorage.getItem('metaPixelUserData');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error retrieving stored user data:', error);
    return null;
  }
};

/**
 * Restore user data on page load (for persistence across sessions)
 */
export const restoreUserDataOnPageLoad = () => {
  if (typeof window === 'undefined') return;

  // Wait for Meta Pixel to be ready
  const checkPixelReady = setInterval(() => {
    if (window.fbq && window.metaPixelReady) {
      clearInterval(checkPixelReady);
      
      const storedData = getStoredUserData();
      if (storedData) {
        try {
          window.fbq('setUserData', storedData);
          console.log('✅ Meta Pixel User Data Restored from Storage');
        } catch (error) {
          console.error('Error restoring user data:', error);
        }
      }
    }
  }, 100);

  // Clear interval after 5 seconds to avoid infinite loop
  setTimeout(() => clearInterval(checkPixelReady), 5000);
};

/**
 * Track user data with specific events
 * This sends user data along with event tracking
 */
export const trackEventWithUserData = (eventName, eventData = {}, userData = {}) => {
  if (typeof window === 'undefined' || !window.fbq) {
    console.warn('Meta Pixel not available');
    return;
  }

  try {
    // Set user data first
    if (Object.keys(userData).length > 0) {
      setUserData(userData);
    }

    // Then track the event
    window.fbq('track', eventName, eventData);
    
    console.log(`✅ Event tracked with user data: ${eventName}`);
  } catch (error) {
    console.error(`Error tracking event ${eventName}:`, error);
  }
};

/**
 * Verify advanced matching setup
 */
export const verifyAdvancedMatchingSetup = () => {
  if (typeof window === 'undefined' || !window.fbq) {
    console.error('❌ Meta Pixel not available');
    return false;
  }

  console.log('✅ Meta Pixel Advanced Matching Setup Verified');
  console.log('Available functions:');
  console.log('- setUserData(userData)');
  console.log('- clearUserData()');
  console.log('- getStoredUserData()');
  console.log('- trackEventWithUserData(eventName, eventData, userData)');
  
  return true;
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.metaPixelAdvancedMatching = {
    setUserData,
    clearUserData,
    getStoredUserData,
    restoreUserDataOnPageLoad,
    trackEventWithUserData,
    verify: verifyAdvancedMatchingSetup
  };
}

export default {
  setUserData,
  clearUserData,
  getStoredUserData,
  restoreUserDataOnPageLoad,
  trackEventWithUserData,
  verifyAdvancedMatchingSetup
};

