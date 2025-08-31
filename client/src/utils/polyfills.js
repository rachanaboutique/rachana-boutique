/**
 * iOS Safari and Mac Chrome Compatibility Polyfills
 * 
 * This file contains polyfills for features that may not be fully supported
 * on iOS Safari or older versions of Mac Chrome.
 */

// Polyfill for ResizeObserver (iOS Safari < 13.4)
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.observedElements = new Set();
      this.boundHandleResize = this.handleResize.bind(this);
    }

    observe(element) {
      if (this.observedElements.size === 0) {
        window.addEventListener('resize', this.boundHandleResize);
        window.addEventListener('orientationchange', this.boundHandleResize);
      }
      this.observedElements.add(element);
    }

    unobserve(element) {
      this.observedElements.delete(element);
      if (this.observedElements.size === 0) {
        window.removeEventListener('resize', this.boundHandleResize);
        window.removeEventListener('orientationchange', this.boundHandleResize);
      }
    }

    disconnect() {
      this.observedElements.clear();
      window.removeEventListener('resize', this.boundHandleResize);
      window.removeEventListener('orientationchange', this.boundHandleResize);
    }

    handleResize() {
      const entries = Array.from(this.observedElements).map(element => ({
        target: element,
        contentRect: element.getBoundingClientRect()
      }));
      this.callback(entries);
    }
  };
}

// Polyfill for IntersectionObserver (iOS Safari < 12.2)
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback, options = {}) {
      this.callback = callback;
      this.options = {
        root: options.root || null,
        rootMargin: options.rootMargin || '0px',
        threshold: options.threshold || 0
      };
      this.observedElements = new Set();
      this.boundHandleScroll = this.handleScroll.bind(this);
    }

    observe(element) {
      if (this.observedElements.size === 0) {
        window.addEventListener('scroll', this.boundHandleScroll, { passive: true });
        window.addEventListener('resize', this.boundHandleScroll, { passive: true });
      }
      this.observedElements.add(element);
      this.handleScroll(); // Check initial state
    }

    unobserve(element) {
      this.observedElements.delete(element);
      if (this.observedElements.size === 0) {
        window.removeEventListener('scroll', this.boundHandleScroll);
        window.removeEventListener('resize', this.boundHandleScroll);
      }
    }

    disconnect() {
      this.observedElements.clear();
      window.removeEventListener('scroll', this.boundHandleScroll);
      window.removeEventListener('resize', this.boundHandleScroll);
    }

    handleScroll() {
      const entries = Array.from(this.observedElements).map(element => {
        const rect = element.getBoundingClientRect();
        const isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;
        return {
          target: element,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: rect
        };
      });
      this.callback(entries);
    }
  };
}

// Polyfill for requestIdleCallback (not supported in Safari)
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function(callback, options = {}) {
    const timeout = options.timeout || 0;
    const startTime = performance.now();
    
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining() {
          return Math.max(0, 50 - (performance.now() - startTime));
        }
      });
    }, timeout);
  };
  
  window.cancelIdleCallback = function(id) {
    clearTimeout(id);
  };
}

// Polyfill for Element.scrollIntoView with smooth behavior (iOS Safari < 15.4)
if (!CSS.supports || !CSS.supports('scroll-behavior', 'smooth')) {
  const originalScrollIntoView = Element.prototype.scrollIntoView;
  
  Element.prototype.scrollIntoView = function(options) {
    if (typeof options === 'object' && options.behavior === 'smooth') {
      const element = this;
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop;
      
      // Simple smooth scroll implementation
      const startY = scrollTop;
      const distance = targetY - startY;
      const duration = 500; // 500ms
      let startTime = null;
      
      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function
        const ease = progress * (2 - progress);
        window.scrollTo(0, startY + distance * ease);
        
        if (progress < 1) {
          requestAnimationFrame(animation);
        }
      }
      
      requestAnimationFrame(animation);
    } else {
      originalScrollIntoView.call(this, options);
    }
  };
}

// Polyfill for Array.prototype.at (not supported in iOS Safari < 15.4)
if (!Array.prototype.at) {
  Array.prototype.at = function(index) {
    const length = this.length;
    const relativeIndex = index >= 0 ? index : length + index;
    return (relativeIndex >= 0 && relativeIndex < length) ? this[relativeIndex] : undefined;
  };
}

// Polyfill for String.prototype.replaceAll (not supported in iOS Safari < 14)
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(searchValue, replaceValue) {
    if (searchValue instanceof RegExp) {
      if (!searchValue.global) {
        throw new TypeError('String.prototype.replaceAll called with a non-global RegExp argument');
      }
      return this.replace(searchValue, replaceValue);
    }
    return this.split(searchValue).join(replaceValue);
  };
}

// Fix for iOS Safari viewport height issues
function setVHProperty() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial value
setVHProperty();

// Update on resize and orientation change
window.addEventListener('resize', setVHProperty);
window.addEventListener('orientationchange', () => {
  setTimeout(setVHProperty, 100); // Delay to ensure proper measurement
});

// iOS Safari touch event fixes
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
  // Prevent zoom on double tap for specific elements
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
}

// Export polyfills for manual initialization if needed
export {
  setVHProperty
};

console.log('✅ iOS Safari and Mac Chrome polyfills loaded');
