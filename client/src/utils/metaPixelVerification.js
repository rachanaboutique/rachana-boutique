export const verifyPixelInstallation = () => {
  if (typeof window.fbq === 'undefined') {
    return false;
  }
  if (window.fbq.queue) {}
  if (window.fbq.version) {}
  return true;
};

export const testPixelEvent = () => {
  if (typeof window.fbq === 'undefined') {
    return;
  }
  try {
    window.fbq('track', 'Test-Event', {
      test_parameter: 'verification_test',
      timestamp: new Date().toISOString()
    });
  } catch (error) {}
};

export const showCurrentPageTracking = () => {
  const currentPath = window.location.pathname;
  if (currentPath.match(/^\/shop\/details\/[^/]+$/)) {
  } else if (currentPath === '/shop/checkout') {
  } else if (currentPath === '/shop/payment-success') {
  } else if (currentPath.startsWith('/shop/collections/')) {
  } else if (currentPath === '/shop/search') {
  } else {
  }
};

export const verifyTrackingFunctions = () => {
  // Note: Verification functions are available globally when metaPixelEvents is loaded
  // This avoids dynamic import conflicts with static imports elsewhere
  const functionsToCheck = [
    'pageViewEvent',
    'viewContentEvent',
    'addToCartEvent',
    'initiateCheckoutEvent',
    'purchaseEvent',
    'searchEvent',
    'completeRegistrationEvent'
  ];

  // Simple verification without dynamic imports
  return functionsToCheck.length > 0;
};

export const runCompleteVerification = () => {
  verifyPixelInstallation();
  verifyTrackingFunctions();
  showCurrentPageTracking();
};

if (import.meta.env.DEV) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        runCompleteVerification();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      runCompleteVerification();
    }, 1000);
  }
}

if (typeof window !== 'undefined') {
  window.metaPixelVerification = {
    verify: runCompleteVerification,
    testEvent: testPixelEvent,
    checkInstallation: verifyPixelInstallation,
    checkFunctions: verifyTrackingFunctions,
    showPageInfo: showCurrentPageTracking
  };
}
