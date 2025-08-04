/**
 * iOS Autoplay Manager
 * 
 * Centralized management for iOS autoplay restrictions.
 * Handles user interaction detection and state management across components.
 */

class IOSAutoplayManager {
  constructor() {
    this.isIOS = this.detectIOS();
    this.hasUserInteracted = false;
    this.listeners = new Set();
    this.eventListenersAdded = false;
    
    // Check session storage for existing interaction
    if (typeof window !== 'undefined') {
      this.hasUserInteracted = sessionStorage.getItem('ios-user-interacted') === 'true';
    }
    
    // Set up event listeners if on iOS and user hasn't interacted
    if (this.isIOS && !this.hasUserInteracted) {
      this.setupEventListeners();
    }
    
    console.log('IOSAutoplayManager initialized:', {
      isIOS: this.isIOS,
      hasUserInteracted: this.hasUserInteracted
    });
  }
  
  detectIOS() {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    return (
      /ipad|iphone|ipod/.test(userAgent) ||
      (platform === 'macintel' && navigator.maxTouchPoints > 1) ||
      (/safari/.test(userAgent) && /mobile/.test(userAgent))
    );
  }
  
  setupEventListeners() {
    if (this.eventListenersAdded || typeof document === 'undefined') return;
    
    const handleUserInteraction = () => {
      console.log('iOS user interaction detected globally');
      this.setUserInteracted();
    };
    
    // Add multiple event listeners to catch any user interaction
    document.addEventListener('touchstart', handleUserInteraction, { passive: true, capture: true });
    document.addEventListener('touchend', handleUserInteraction, { passive: true, capture: true });
    document.addEventListener('click', handleUserInteraction, { capture: true });
    document.addEventListener('scroll', handleUserInteraction, { passive: true, capture: true });
    
    this.eventListenersAdded = true;
    this.cleanupFunction = () => {
      document.removeEventListener('touchstart', handleUserInteraction, true);
      document.removeEventListener('touchend', handleUserInteraction, true);
      document.removeEventListener('click', handleUserInteraction, true);
      document.removeEventListener('scroll', handleUserInteraction, true);
    };
  }
  
  setUserInteracted() {
    if (this.hasUserInteracted) return; // Already set
    
    this.hasUserInteracted = true;
    
    // Store in session storage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ios-user-interacted', 'true');
    }
    
    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback(true);
      } catch (error) {
        console.error('Error in iOS autoplay listener:', error);
      }
    });
    
    // Clean up event listeners
    if (this.cleanupFunction) {
      this.cleanupFunction();
      this.eventListenersAdded = false;
    }
    
    console.log('iOS autoplay enabled globally');
  }
  
  canAutoplay() {
    return !this.isIOS || this.hasUserInteracted;
  }
  
  subscribe(callback) {
    this.listeners.add(callback);
    
    // Immediately call with current state
    callback(this.hasUserInteracted);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  forceEnable() {
    this.setUserInteracted();
  }
}

// Create singleton instance
const iosAutoplayManager = new IOSAutoplayManager();

export default iosAutoplayManager;
