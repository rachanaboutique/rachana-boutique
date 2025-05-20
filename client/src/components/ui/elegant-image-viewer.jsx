import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Elegant Image Viewer - A creative and functional image gallery
 */
function ElegantImageViewer({ isOpen, onClose, initialImage, images, imageAlt, onNavigate }) {
  // State for current image and interactions
  const [currentIndex, setCurrentIndex] = useState(images.findIndex(img => img === initialImage) || 0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isHandlingDoubleTap, setIsHandlingDoubleTap] = useState(false);
  const [isPinching, setIsPinching] = useState(false);

  // Refs for touch handling
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  const doubleTapTimeRef = useRef(0);
  const lastTapPositionRef = useRef({ x: 0, y: 0 });
  const pinchStartDistanceRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(images.findIndex(img => img === initialImage) || 0);
      setIsZoomed(false);
      setZoomLevel(1);
      setDragPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialImage, images]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        navigateToPrev();
      } else if (e.key === "ArrowRight") {
        navigateToNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  // If modal is closed, don't render anything
  if (!isOpen) return null;

  // Navigation functions
  const navigateToNext = () => {
    if (isZoomed) return; // Don't navigate when zoomed

    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);

    if (onNavigate) {
      onNavigate("next");
    }
  };

  const navigateToPrev = () => {
    if (isZoomed) return; // Don't navigate when zoomed

    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);

    if (onNavigate) {
      onNavigate("prev");
    }
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    // Handle multi-touch for pinch zoom
    if (e.touches.length > 1) {
      // Prevent default to allow pinch zoom to work properly
      e.preventDefault();
      e.stopPropagation();

      // Start pinch zoom tracking
      setIsPinching(true);

      // Calculate initial distance between touch points
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      pinchStartDistanceRef.current = {
        distance,
        scale: zoomLevel
      };

      return;
    }

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Check for double tap
    const now = Date.now();
    const timeSinceLastTap = now - doubleTapTimeRef.current;
    const lastPosition = lastTapPositionRef.current;
    const currentPosition = { x: touch.clientX, y: touch.clientY };

    // Calculate distance between taps
    const distanceBetweenTaps = Math.sqrt(
      Math.pow(currentPosition.x - lastPosition.x, 2) +
      Math.pow(currentPosition.y - lastPosition.y, 2)
    );

    if (timeSinceLastTap < 300 && distanceBetweenTaps < 30) {
      // Double tap detected - set flag to prevent navigation
      setIsHandlingDoubleTap(true);
      e.preventDefault();
      e.stopPropagation();

      // Handle the double tap zoom
      handleDoubleTap(touch.clientX, touch.clientY);

      // Reset the flag after a delay
      setTimeout(() => {
        setIsHandlingDoubleTap(false);
      }, 300);
    }

    // Update last tap info
    doubleTapTimeRef.current = now;
    lastTapPositionRef.current = currentPosition;

    // Clear any existing timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
  };

  const handleTouchMove = (e) => {
    // Handle multi-touch for pinch zoom
    if (e.touches.length > 1) {
      // Prevent default to allow pinch zoom to work properly
      e.preventDefault();
      e.stopPropagation();

      // Handle pinch zoom
      if (isPinching && pinchStartDistanceRef.current) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        // Calculate current distance between touch points
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        // Calculate scale factor based on the change in distance
        const scaleFactor = currentDistance / pinchStartDistanceRef.current.distance;
        const newScale = Math.max(1, Math.min(5, pinchStartDistanceRef.current.scale * scaleFactor));

        // Update zoom state
        setZoomLevel(newScale);
        setIsZoomed(newScale > 1.1);

        // Calculate the center point between the two touches
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        // If we're zooming in significantly, adjust the position to center on pinch point
        if (newScale > 1.5 && !isZoomed) {
          const rect = containerRef.current.getBoundingClientRect();
          const containerCenterX = rect.left + rect.width / 2;
          const containerCenterY = rect.top + rect.height / 2;

          // Calculate offset to center the pinch point
          const offsetX = (containerCenterX - centerX) * 0.2;
          const offsetY = (containerCenterY - centerY) * 0.2;

          setDragPosition({ x: offsetX, y: offsetY });
        }
      }

      return;
    }

    if (!touchStartRef.current || e.touches.length !== 1) return;

    // If zoomed or handling double tap, handle drag instead of swipe
    if (isZoomed || isHandlingDoubleTap) {
      e.preventDefault(); // Prevent scrolling and other touch behaviors
      e.stopPropagation();

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (isZoomed) {
        setDragPosition(prev => ({
          x: prev.x + deltaX / 2,
          y: prev.y + deltaY / 2
        }));
      }

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: touchStartRef.current.time
      };

      return;
    }

    // Otherwise, handle swipe for navigation
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // If horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      e.preventDefault(); // Prevent page scrolling
    }
  };

  const handleTouchEnd = (e) => {
    // Reset pinch zoom state
    if (isPinching) {
      setIsPinching(false);
      pinchStartDistanceRef.current = null;
      return;
    }

    if (!touchStartRef.current) return;

    // Don't handle navigation when zoomed or handling double tap
    if (!isZoomed && !isHandlingDoubleTap) {
      // Only process if we have touch data
      if (e.changedTouches && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        const timeDelta = Date.now() - touchStartRef.current.time;

        // Check if it's a swipe (fast movement)
        const isSwipe = timeDelta < 300 && Math.abs(deltaX) > 50;

        // If horizontal swipe is dominant
        if (isSwipe && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0) {
            navigateToPrev();
          } else {
            navigateToNext();
          }
        }
      }
    }

    touchStartRef.current = null;
  };

  // Handle double tap to zoom
  const handleDoubleTap = (x, y) => {
    if (!containerRef.current) return;

    // Prevent any ongoing navigation
    touchStartRef.current = null;

    if (isZoomed) {
      // Reset zoom
      setIsZoomed(false);
      setZoomLevel(1);
      setDragPosition({ x: 0, y: 0 });
    } else {
      // Zoom in
      setIsZoomed(true);
      setZoomLevel(2.5);

      // Calculate position to zoom into (center on tap point)
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate offset to center the tapped point
      const offsetX = (centerX - x) * 0.5;
      const offsetY = (centerY - y) * 0.5;

      setDragPosition({ x: offsetX, y: offsetY });

      // Log for debugging
      console.log('Double tap zoom at:', { x, y, offsetX, offsetY });
    }
  };

  // Handle image click for simple navigation
  const handleImageClick = (e) => {
    if (isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Click on left side to go back, right side to go forward
    if (x < rect.width / 2) {
      navigateToPrev();
    } else {
      navigateToNext();
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black z-50 overflow-hidden"
    >
      {/* Top bar with counter and close button */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-50"
      >
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
      </motion.div>

      {/* Main image container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ touchAction: isZoomed ? 'none' : 'pan-y' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full flex items-center justify-center"
            onClick={handleImageClick}
          >
            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              animate={{
                scale: zoomLevel,
                x: dragPosition.x,
                y: dragPosition.y
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <img
                src={images[currentIndex]}
                alt={imageAlt || `Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain select-none"
                style={{
                  cursor: isZoomed ? "grab" : "default",
                  pointerEvents: "none" // Prevent image from capturing pointer events
                }}
                draggable="false"
                onDragStart={(e) => e.preventDefault()} // Extra protection against dragging
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows - only show when not zoomed */}
      {!isZoomed && images.length > 1 && (
        <>
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={navigateToPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40
                      text-white/80 hover:text-white transition-all
                      opacity-70 hover:opacity-100 hover:scale-110
                      bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-2"
            aria-label="Previous image"
          >
            <ChevronLeft size={30} strokeWidth={1.5} />
          </motion.button>
          <motion.button
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={navigateToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40
                      text-white/80 hover:text-white transition-all
                      opacity-70 hover:opacity-100 hover:scale-110
                      bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-2"
            aria-label="Next image"
          >
            <ChevronRight size={30} strokeWidth={1.5} />
          </motion.button>
        </>
      )}

      {/* Progress bar */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-3/4 max-w-md h-0.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/80"
            initial={{ width: `${(currentIndex / (images.length - 1)) * 100}%` }}
            animate={{ width: `${(currentIndex / (images.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Instruction indicator */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2
                  text-white/70 text-xs bg-black/40 px-3 py-1.5 rounded-full
                  backdrop-blur-sm pointer-events-none flex items-center gap-1.5"
      >
        {isZoomed ? (
          <>
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Double-tap to zoom out
          </>
        ) : (
          <>
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Double-tap to zoom in
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default ElegantImageViewer;
