/**
 * Error Boundary and Error Handling Utilities
 * 
 * This file contains utilities for handling errors gracefully,
 * especially for iOS Safari and Mac Chrome compatibility issues.
 */

import React from 'react';

/**
 * Error Boundary Component for React
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to monitoring service if available
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('track', 'Error', {
          error_message: error.message,
          error_stack: error.stack,
          component_stack: errorInfo.componentStack
        });
      } catch (fbqError) {
        console.warn('Failed to report error to Meta Pixel:', fbqError);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '600px',
          margin: '50px auto'
        }}>
          <h1 style={{ color: '#e53935', marginBottom: '20px' }}>
            Oops! Something went wrong
          </h1>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#2c3315',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '5px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Safe async function wrapper
 */
export function safeAsync(asyncFn, fallback = null) {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      console.error('Async operation failed:', error);
      return fallback;
    }
  };
}

/**
 * Safe promise wrapper
 */
export function safePromise(promise, fallback = null) {
  return promise.catch(error => {
    console.error('Promise rejected:', error);
    return fallback;
  });
}

/**
 * Global error handler for unhandled promise rejections
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent the default browser behavior (logging to console)
    event.preventDefault();
    
    // Report to Meta Pixel if available
    if (window.fbq) {
      try {
        window.fbq('track', 'UnhandledRejection', {
          error_message: event.reason?.message || 'Unknown error',
          error_type: 'unhandled_promise_rejection'
        });
      } catch (fbqError) {
        console.warn('Failed to report unhandled rejection to Meta Pixel:', fbqError);
      }
    }
  });

  // Handle general JavaScript errors
  window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    
    // Report to Meta Pixel if available
    if (window.fbq) {
      try {
        window.fbq('track', 'JavaScriptError', {
          error_message: event.error?.message || event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      } catch (fbqError) {
        console.warn('Failed to report JS error to Meta Pixel:', fbqError);
      }
    }
  });

  console.log('✅ Global error handlers set up');
}

/**
 * iOS Safari specific error handling
 */
export function setupIOSErrorHandling() {
  if (typeof window === 'undefined') return;
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
               (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
  
  if (!isIOS) return;

  // Handle iOS Safari specific issues
  window.addEventListener('error', function(event) {
    const errorMessage = event.error?.message || event.message || '';
    
    // Check for common iOS Safari issues
    if (errorMessage.includes('message channel closed') ||
        errorMessage.includes('listener indicated an asynchronous response')) {
      console.warn('iOS Safari communication error detected, attempting recovery...');
      
      // Attempt to reload critical resources
      setTimeout(() => {
        if (typeof window.fbq === 'undefined') {
          console.log('Attempting to reload Meta Pixel...');
          // Meta Pixel reload logic could go here
        }
      }, 1000);
    }
  });

  console.log('✅ iOS Safari error handling set up');
}

/**
 * Initialize all error handling
 */
export function initErrorHandling() {
  setupGlobalErrorHandlers();
  setupIOSErrorHandling();
}

// Auto-initialize error handling
if (typeof window !== 'undefined') {
  setTimeout(initErrorHandling, 0);
}
