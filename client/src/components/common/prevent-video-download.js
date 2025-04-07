/**
 * Utility to prevent video download and context menu
 * This file contains functions to prevent users from downloading videos
 */

// Function to add attributes to video elements to prevent download
export const addNoDownloadAttributes = () => {
  // Find all video elements
  const videoElements = document.querySelectorAll('video');
  
  // Add attributes to each video element
  videoElements.forEach(video => {
    // Prevent download
    video.setAttribute('controlsList', 'nodownload');
    
    // Disable picture-in-picture
    video.setAttribute('disablePictureInPicture', 'true');
    
    // Disable remote playback
    video.setAttribute('disableRemotePlayback', 'true');
    
    // Add event listener to prevent context menu
    video.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  });
};

// Function to add CSS to prevent video download
export const addNoDownloadStyles = () => {
  // Create a style element
  const style = document.createElement('style');
  
  // Add CSS rules to prevent video download
  style.textContent = `
    video {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
    
    video::-webkit-media-controls-enclosure,
    video::-webkit-media-controls-panel,
    video::-webkit-media-controls {
      -webkit-appearance: none;
      appearance: none;
    }
  `;
  
  // Append the style element to the head
  document.head.appendChild(style);
};

// Function to initialize both prevention methods
export const initPreventVideoDownload = () => {
  // Add attributes to video elements
  addNoDownloadAttributes();
  
  // Add CSS styles
  addNoDownloadStyles();
  
  // Set up a MutationObserver to handle dynamically added videos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        addNoDownloadAttributes();
      }
    });
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Return the observer for cleanup
  return observer;
};
