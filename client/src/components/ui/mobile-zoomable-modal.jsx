import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomOut } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion, AnimatePresence } from "framer-motion";

function MobileZoomableModal({ isOpen, onClose, initialImage, images, imageAlt }) {
  const [currentIndex, setCurrentIndex] = useState(images.findIndex(img => img === initialImage) || 0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [direction, setDirection] = useState(null);

  const transformComponentRef = useRef(null);
  const touchStartRef = useRef(null);
  const lastTapTimeRef = useRef(0);
  const swipeEnabledRef = useRef(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(images.findIndex(img => img === initialImage) || 0);
      setIsZoomed(false);
      setDirection(null);
      if (transformComponentRef.current) transformComponentRef.current.resetTransform();
    }
  }, [initialImage, isOpen, images]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setDirection('right');
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        setDirection('left');
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose]);

  const handleZoomChange = (ref) => {
    try {
      let currentScale = ref.instance?.transformState?.scale || ref.state?.scale || 1;
      const isCurrentlyZoomed = currentScale > 1.1;
      swipeEnabledRef.current = !isCurrentlyZoomed;
    } catch (error) {
      console.error('Error in handleZoomChange:', error);
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;

      if (timeSinceLastTap < 300) {
        let currentScale = transformComponentRef.current?.instance?.transformState?.scale || 1;
        const isCurrentlyZoomed = currentScale > 1.1;
        setIsZoomed(!isCurrentlyZoomed);
        if (!isCurrentlyZoomed) {
          setTimeout(() => transformComponentRef.current?.zoomIn(2), 50);
        } else {
          transformComponentRef.current?.resetTransform();
        }
        touchStartRef.current = null;
      } else {
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };
      }
      lastTapTimeRef.current = now;
    }
  };

  useEffect(() => {
    swipeEnabledRef.current = !isZoomed;
    if (!isZoomed) setDirection(null);
  }, [isZoomed]);

  const handleTouchMove = (e) => {
    const isCurrentlyZoomed = isZoomed || (transformComponentRef.current?.instance?.transformState?.scale > 1.1);
    swipeEnabledRef.current = !isCurrentlyZoomed;

    if (!isCurrentlyZoomed && touchStartRef.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
    }
  };

  const handleTouchEnd = (e) => {
    if (isZoomed || !touchStartRef.current) {
      touchStartRef.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const timeDelta = Date.now() - touchStartRef.current.time;
    const isSwipe = timeDelta < 250 && Math.abs(deltaX) > 50;

    if (isSwipe) {
      if (deltaX > 0 && currentIndex > 0) {
        setDirection('right');
        setCurrentIndex(prev => prev - 1);
      } else if (deltaX < 0 && currentIndex < images.length - 1) {
        setDirection('left');
        setCurrentIndex(prev => prev + 1);
      }
    }

    touchStartRef.current = null;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white p-2 bg-black/30 backdrop-blur-sm rounded-full"
      >
        <X size={20} />
      </button>

      <div className="absolute top-4 left-4 z-50 text-white/80 text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      <div
        className="w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none" }}
      >
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={3}
          centerOnInit={true}
          doubleClick={{ disabled: true }}
          panning={{ disabled: false, velocityDisabled: false }}
          onZoomChange={handleZoomChange}
          limitToBounds={true}
          ref={transformComponentRef}
        >
          {({ resetTransform }) => (
            <>
              {isZoomed && (
                <button
                  onClick={() => {
                    resetTransform();
                    setIsZoomed(false);
                  }}
                  className="absolute bottom-20 right-4 z-50 text-white p-2 bg-black/50 backdrop-blur-sm rounded-full"
                  aria-label="Reset zoom"
                >
                  <ZoomOut size={20} />
                </button>
              )}
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%', backgroundColor: 'black' }}
                contentStyle={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.img
                    key={images[currentIndex]}
                    src={images[currentIndex]}
                    alt={imageAlt || `Image ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                    draggable="false"
                    initial={{
                      x: direction === 'left' ? 300 : direction === 'right' ? -300 : 0,
                      opacity: 0
                    }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{
                      x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
                      opacity: 0
                    }}
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                  />
                </AnimatePresence>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/70 text-xs bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
        {isZoomed ? "Double-tap or use reset button to zoom out" : "Double-tap to zoom in"}
      </div>
    </div>,
    document.body
  );
}

export default MobileZoomableModal;
