import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Simple Image Viewer - A clean, minimal image gallery focused on mobile experience
 */
function SimpleImageViewer({ isOpen, onClose, initialImage, images, imageAlt }) {
  // State for current image and interactions
  const [currentIndex, setCurrentIndex] = useState(images.findIndex(img => img === initialImage) || 0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Refs for touch handling
  const viewerRef = useRef(null);
  const lastTapRef = useRef(0);
  const touchStartRef = useRef(null);
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(images.findIndex(img => img === initialImage) || 0);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialImage, images]);
  
  // Add non-passive touch event listeners
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !isOpen) return;
    
    const options = { passive: false };
    
    const handleTouchStart = (e) => {
      // Store touch start position
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
        
        // Check for double tap
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;
        
        if (timeSinceLastTap < 300) {
          // Double tap detected
          e.preventDefault();
          
          // Toggle zoom
          if (scale > 1) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          } else {
            setScale(2.5);
          }
        }
        
        lastTapRef.current = now;
      }
    };
    
    const handleTouchMove = (e) => {
      // If zoomed in, allow panning
      if (scale > 1 && e.touches.length === 1 && touchStartRef.current) {
        e.preventDefault();
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        
        setPosition(prev => ({
          x: prev.x + deltaX * 0.7,
          y: prev.y + deltaY * 0.7
        }));
        
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: touchStartRef.current.time
        };
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!touchStartRef.current) return;
      
      // Only handle swipe if not zoomed in
      if (scale === 1) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        const timeDelta = Date.now() - touchStartRef.current.time;
        
        // Check if it's a swipe (fast movement)
        const isSwipe = timeDelta < 300 && Math.abs(deltaX) > 50;
        
        // If horizontal swipe is dominant
        if (isSwipe && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0 && currentIndex > 0) {
            // Swipe right - previous image
            setCurrentIndex(prev => prev - 1);
          } else if (deltaX < 0 && currentIndex < images.length - 1) {
            // Swipe left - next image
            setCurrentIndex(prev => prev + 1);
          }
        }
      }
      
      touchStartRef.current = null;
    };
    
    // Add event listeners with non-passive option
    viewer.addEventListener('touchstart', handleTouchStart, options);
    viewer.addEventListener('touchmove', handleTouchMove, options);
    viewer.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      // Clean up
      viewer.removeEventListener('touchstart', handleTouchStart, options);
      viewer.removeEventListener('touchmove', handleTouchMove, options);
      viewer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, scale, currentIndex, images.length]);
  
  // If modal is closed, don't render anything
  if (!isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 bg-black z-50 overflow-hidden" ref={viewerRef}>
      {/* Top bar with counter and close button */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-50">
        <div className="text-white/80 text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          onClick={onClose}
          className="text-white p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Main image container */}
      <div className="w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: scale,
                x: position.x,
                y: position.y
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <img
                src={images[currentIndex]}
                alt={imageAlt || `Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain select-none"
                draggable="false"
                onDragStart={(e) => e.preventDefault()}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Instruction indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 
                    text-white/70 text-xs bg-black/40 px-3 py-1.5 rounded-full
                    backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
        Double-tap to {scale > 1 ? "zoom out" : "zoom in"}
      </div>
    </div>,
    document.body
  );
}

export default SimpleImageViewer;
