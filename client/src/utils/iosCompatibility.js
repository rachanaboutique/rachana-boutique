/**
 * iOS Safari and Mac Chrome Compatibility Utilities
 * 
 * This file contains utilities to detect and handle iOS Safari and Mac Chrome
 * specific compatibility issues.
 */

/**
 * Improved iOS detection that works with modern browsers
 */
export function detectIOS() {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for iOS devices
  const isIOSDevice = /ipad|iphone|ipod/.test(userAgent);
  
  // Check for iPad Pro with iPadOS (reports as Mac)
  const isIPadPro = navigator.maxTouchPoints > 1 && 
    (userAgent.includes('mac') || 
     (navigator.userAgentData?.platform === 'macOS'));
  
  return isIOSDevice || isIPadPro;
}

/**
 * Detect Safari browser (including iOS Safari)
 */
export function detectSafari() {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /safari/.test(userAgent) && !/chrome|chromium|edg/.test(userAgent);
}

/**
 * Detect Mac Chrome specifically
 */
export function detectMacChrome() {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMac = /mac/.test(userAgent) || navigator.userAgentData?.platform === 'macOS';
  const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
  
  return isMac && isChrome;
}

/**
 * Check if the current browser needs special handling
 */
export function needsCompatibilityFixes() {
  return detectIOS() || detectSafari() || detectMacChrome();
}

/**
 * Initialize iOS-specific fixes
 */
export function initIOSFixes() {
  if (!detectIOS()) return;
  
  // Fix for iOS Safari viewport height
  function setVHProperty() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  setVHProperty();
  window.addEventListener('resize', setVHProperty);
  window.addEventListener('orientationchange', () => {
    setTimeout(setVHProperty, 100);
  });
  
  // Prevent zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
  
  // Fix for iOS Safari scroll bounce
  document.body.style.overscrollBehavior = 'none';
  
  console.log('✅ iOS compatibility fixes applied');
}

/**
 * Get video attributes optimized for iOS Safari
 */
export function getIOSVideoAttributes() {
  const baseAttributes = {
    playsInline: true,
    muted: true,
    preload: 'metadata',
    controls: false,
    disablePictureInPicture: true,
    controlsList: 'nodownload',
    disableRemotePlayback: true
  };
  
  if (detectIOS()) {
    return {
      ...baseAttributes,
      // iOS-specific optimizations
      'webkit-playsinline': 'true',
      'x-webkit-airplay': 'allow'
    };
  }
  
  return baseAttributes;
}

/**
 * Check if dynamic imports are supported
 */
export function supportsDynamicImports() {
  try {
    // Test if dynamic import syntax is supported
    new Function('import("")');
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe dynamic import with fallback
 */
export async function safeDynamicImport(modulePath) {
  try {
    if (supportsDynamicImports()) {
      // @vite-ignore - Dynamic import path is intentionally variable
      return await import(/* @vite-ignore */ modulePath);
    } else {
      console.warn(`Dynamic import not supported for ${modulePath}`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to import ${modulePath}:`, error);
    return null;
  }
}

/**
 * Check if IntersectionObserver is supported
 */
export function supportsIntersectionObserver() {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}

/**
 * Check if ResizeObserver is supported
 */
export function supportsResizeObserver() {
  return typeof window !== 'undefined' && 'ResizeObserver' in window;
}

/**
 * Get CSS properties with vendor prefixes for better compatibility
 */
export function getCSSWithVendorPrefixes(property, value) {
  const prefixes = ['-webkit-', '-moz-', '-ms-', '-o-', ''];
  return prefixes.map(prefix => `${prefix}${property}: ${value};`).join('\n');
}

/**
 * Apply iOS-specific CSS fixes
 */
export function applyIOSCSSFixes() {
  if (!detectIOS() && !detectSafari()) return;
  
  const style = document.createElement('style');
  style.textContent = `
    /* iOS Safari specific fixes */
    * {
      -webkit-touch-callout: none;
      -webkit-text-size-adjust: 100%;
      -webkit-tap-highlight-color: transparent;
    }
    
    html, body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overscroll-behavior: none;
    }
    
    /* Fix for iOS Safari viewport units */
    .ios-vh-fix {
      height: 100vh;
      height: calc(var(--vh, 1vh) * 100);
    }
    
    /* Fix for iOS Safari video playback */
    video {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }
    
    /* Fix for iOS Safari flexbox issues */
    .ios-flex-fix {
      -webkit-flex-shrink: 0;
      flex-shrink: 0;
    }
  `;
  
  document.head.appendChild(style);
  console.log('✅ iOS CSS fixes applied');
}

/**
 * Initialize all compatibility fixes
 */
export function initCompatibilityFixes() {
  if (typeof window === 'undefined') return;
  
  console.log('🔧 Initializing browser compatibility fixes...');
  
  // Apply fixes based on browser detection
  if (detectIOS()) {
    initIOSFixes();
    applyIOSCSSFixes();
  }
  
  if (detectSafari()) {
    applyIOSCSSFixes();
  }
  
  console.log('✅ Browser compatibility fixes initialized');
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Use setTimeout to ensure DOM is ready
  setTimeout(initCompatibilityFixes, 0);
}
