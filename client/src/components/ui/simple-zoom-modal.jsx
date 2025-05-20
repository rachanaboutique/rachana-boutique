import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SimpleZoomModal - A simplified modal for image viewing with double tap zoom
 */
function SimpleZoomModal({ isOpen, onClose, initialImage, images, imageAlt }) {
  // State for tracking current image and zoom
  const [currentIndex, setCurrentIndex] = useState(images.findIndex(img => img === initialImage) || 0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [direction, setDirection] = useState(null);
  
  // Refs for touch handling
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);
  const lastTapTimeRef = useRef(0);
  
  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(images.findIndex(img => img === initialImage) || 0);
      setIsZoomed(false);
      setDirection(null);
    }
  }, [isOpen, initialImage, images]);
  
  // Handle touch start for double tap detection
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    
    // Check for double tap
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    
    if (timeSinceLastTap < 300) {
      // Double tap detected - toggle zoom
      setIsZoomed(!isZoomed);
      
      // Prevent this from being treated as a swipe
      touchStartRef.current = null;
    }
    
    lastTapTimeRef.current = now;
  };
  
  // Handle touch move for swipe detection
  const handleTouchMove = (e) => {
    // Don't handle swipe when zoomed
    if (isZoomed || !touchStartRef.current || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    
    // If significant horizontal movement, prevent default to avoid page scrolling
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  };
  
  // Handle touch end for swipe navigation
  const handleTouchEnd = (e) => {
    // Don't handle swipe when zoomed
    if (isZoomed || !touchStartRef.current) {
      touchStartRef.current = null;
      return;
    }
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const timeDelta = Date.now() - touchStartRef.current.time;
    
    // Check if it's a swipe (fast movement)
    const isSwipe = timeDelta < 300 && Math.abs(deltaX) > 50;
    
    if (isSwipe) {
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - previous image
        setDirection('right');
        setTimeout(() => {
          setCurrentIndex(prev => prev - 1);
        }, 10);
      } else if (deltaX < 0 && currentIndex < images.length - 1) {
        // Swipe left - next image
        setDirection('left');
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
        }, 10);
      }
    }
    
    touchStartRef.current = null;
  };
  
  if (!isOpen) return null;
  
  return createPortal(
    <div 
      className="fixed inset-0 bg-black z-50 overflow-hidden"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar with counter and close button */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-50">
        <div className="text-white/80 text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          onClick={onClose}
          className="text-white p-2 bg-black/30 backdrop-blur-sm rounded-full"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Main image container */}
      <div className="w-full h-full flex items-center justify-center">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={direction ? {
              x: direction === 'left' ? 300 : -300,
              opacity: 0
            } : { opacity: 1, x: 0 }}
            animate={{
              x: 0,
              opacity: 1
            }}
            exit={direction ? {
              x: direction === 'left' ? -300 : 300,
              opacity: 0
            } : { opacity: 0 }}
            transition={{
              x: { type: "spring", stiffness: 250, damping: 25, mass: 1 },
              opacity: { duration: 0.3, ease: "easeInOut" }
            }}
            className="w-full h-full absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: isZoomed ? 5 : 1,
                transition: { duration: 0.3 }
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <img
                src={images[currentIndex]}
                alt={imageAlt || `Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain select-none"
                draggable="false"
                style={{ pointerEvents: "none" }}
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
        {isZoomed ? "Double-tap to zoom out" : "Double-tap to zoom in"}
      </div>
    </div>,
    document.body
  );
}

export default SimpleZoomModal;
