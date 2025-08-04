/**
 * Meta Pixel Verification Utility
 * 
 * This utility helps verify that Meta Pixel is properly installed and working.
 * Run these functions in browser console to test the integration.
 */

/**
 * Check if Meta Pixel is loaded and initialized
 */
export const verifyPixelInstallation = () => {
  console.log('🔍 Verifying Meta Pixel Installation...\n');
  
  // Check if fbq function exists
  if (typeof window.fbq === 'undefined') {
    console.error('❌ Meta Pixel not found! fbq function is not available.');
    return false;
  }
  
  console.log('✅ Meta Pixel script loaded successfully');
  
  // Check if pixel is initialized
  if (window.fbq.queue) {
    console.log('✅ Meta Pixel queue exists');
  }
  
  // Check if pixel version is correct
  if (window.fbq.version) {
    console.log(`✅ Meta Pixel version: ${window.fbq.version}`);
  }
  
  console.log('\n📊 To verify events are firing:');
  console.log('1. Install Meta Pixel Helper Chrome extension');
  console.log('2. Navigate through your site');
  console.log('3. Check Events Manager in Meta Business');
  
  return true;
};

/**
 * Test fire a custom event to verify tracking
 */
export const testPixelEvent = () => {
  if (typeof window.fbq === 'undefined') {
    console.error('❌ Meta Pixel not available for testing');
    return;
  }
  
  console.log('🧪 Testing Meta Pixel with custom event...');
  
  try {
    window.fbq('track', 'Test-Event', {
      test_parameter: 'verification_test',
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Test event fired successfully!');
    console.log('Check Meta Pixel Helper or Events Manager to confirm receipt.');
  } catch (error) {
    console.error('❌ Error firing test event:', error);
  }
};

/**
 * Display current page tracking info
 */
export const showCurrentPageTracking = () => {
  const currentPath = window.location.pathname;
  console.log(`📍 Current page: ${currentPath}`);
  
  // Determine what events should fire on this page
  if (currentPath.match(/^\/shop\/details\/[^/]+$/)) {
    console.log('📊 Expected events: PageView, ViewContent');
  } else if (currentPath === '/shop/checkout') {
    console.log('📊 Expected events: PageView, InitiateCheckout');
  } else if (currentPath === '/shop/payment-success') {
    console.log('📊 Expected events: PageView, Purchase');
  } else if (currentPath.startsWith('/shop/collections/')) {
    console.log('📊 Expected events: PageView, Category-View');
  } else if (currentPath === '/shop/search') {
    console.log('📊 Expected events: PageView, Search (if query present)');
  } else {
    console.log('📊 Expected events: PageView');
  }
};

/**
 * Check if tracking functions are available
 */
export const verifyTrackingFunctions = () => {
  console.log('🔍 Verifying tracking functions...\n');
  
  const functionsToCheck = [
    'pageViewEvent',
    'viewContentEvent', 
    'addToCartEvent',
    'initiateCheckoutEvent',
    'purchaseEvent',
    'searchEvent',
    'completeRegistrationEvent'
  ];
  
  try {
    // Dynamic import to check if functions exist
    import('./metaPixelEvents.js').then(module => {
      functionsToCheck.forEach(funcName => {
        if (typeof module[funcName] === 'function') {
          console.log(`✅ ${funcName} available`);
        } else {
          console.log(`❌ ${funcName} not found`);
        }
      });
    });
  } catch (error) {
    console.error('❌ Error checking tracking functions:', error);
  }
};

/**
 * Run complete verification
 */
export const runCompleteVerification = () => {
  console.log('🚀 Running Complete Meta Pixel Verification\n');
  console.log('='.repeat(50));
  
  verifyPixelInstallation();
  console.log('\n' + '-'.repeat(30) + '\n');
  
  verifyTrackingFunctions();
  console.log('\n' + '-'.repeat(30) + '\n');
  
  showCurrentPageTracking();
  console.log('\n' + '-'.repeat(30) + '\n');
  
  console.log('🧪 Run testPixelEvent() to fire a test event');
  console.log('📊 Check Meta Pixel Helper extension for real-time verification');
  console.log('🔗 Visit Events Manager: https://business.facebook.com/events_manager2');
};

// Auto-run verification in development mode
if (import.meta.env.DEV) {
  // Wait for page to load before running verification
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        console.log('\n🎯 Meta Pixel Auto-Verification (Development Mode)');
        runCompleteVerification();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      console.log('\n🎯 Meta Pixel Auto-Verification (Development Mode)');
      runCompleteVerification();
    }, 1000);
  }
}

// Make functions available globally for manual testing
if (typeof window !== 'undefined') {
  window.metaPixelVerification = {
    verify: runCompleteVerification,
    testEvent: testPixelEvent,
    checkInstallation: verifyPixelInstallation,
    checkFunctions: verifyTrackingFunctions,
    showPageInfo: showCurrentPageTracking
  };
  
  console.log('\n💡 Meta Pixel verification functions available globally:');
  console.log('- window.metaPixelVerification.verify()');
  console.log('- window.metaPixelVerification.testEvent()');
  console.log('- window.metaPixelVerification.checkInstallation()');
}
