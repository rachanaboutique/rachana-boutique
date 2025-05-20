// import React, { useState, useRef, useEffect } from "react";
// import { createPortal } from "react-dom";
// import { X, ZoomOut } from "lucide-react";
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
// import { motion, AnimatePresence } from "framer-motion";

// /**
//  * MobileZoomableModal - A modal optimized for mobile touch interactions
//  * Handles pinch zoom and double tap without triggering unwanted navigation
//  */
// function MobileZoomableModal({ isOpen, onClose, initialImage, images, imageAlt }) {
//   // State for tracking current image and transitions
//   const [currentIndex, setCurrentIndex] = useState(images.findIndex(img => img === initialImage) || 0);
//   const [isZoomed, setIsZoomed] = useState(false);
//   const [direction, setDirection] = useState(null); // 'left' or 'right' for transition direction

//   // Refs for touch handling
//   const transformComponentRef = useRef(null);
//   const touchStartRef = useRef(null);
//   const lastTapTimeRef = useRef(0);
//   const swipeEnabledRef = useRef(true);

//   // Reset when modal opens or image changes
//   useEffect(() => {
//     if (isOpen) {
//       setCurrentIndex(images.findIndex(img => img === initialImage) || 0);
//       setIsZoomed(false);
//       setDirection(null); // Reset direction when modal opens

//       // Reset the transform component when modal opens
//       if (transformComponentRef.current) {
//         transformComponentRef.current.resetTransform();
//       }
//     }
//   }, [initialImage, isOpen, images]);

//   // Handle keyboard navigation
//   useEffect(() => {
//     if (!isOpen) return;

//     const handleKeyDown = (e) => {
//       if (e.key === "ArrowLeft" && currentIndex > 0) {
//         setDirection('right'); // Moving right to show previous image
//         setTimeout(() => {
//           setCurrentIndex(prev => prev - 1);
//         }, 10);
//       } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
//         setDirection('left'); // Moving left to show next image
//         setTimeout(() => {
//           setCurrentIndex(prev => prev + 1);
//         }, 10);
//       } else if (e.key === "Escape") {
//         onClose();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [isOpen, currentIndex, images.length, onClose]);

//   // Handle zoom state change - only used for pinch zoom
//   const handleZoomChange = (ref) => {
//     if (!ref) return;

//     try {
//       // Get the current scale - different versions of the library have different structures
//       let currentScale = 1;
//       if (ref.instance?.transformState?.scale) {
//         currentScale = ref.instance.transformState.scale;
//       } else if (ref.state?.scale) {
//         currentScale = ref.state.scale;
//       }

//       // Consider zoomed if scale is greater than 1.1
//       const isCurrentlyZoomed = currentScale > 1.1;

//       // Only update swipe enabled state - let double tap handle the zoom state
//       swipeEnabledRef.current = !isCurrentlyZoomed;

//       // Log for debugging
//       console.log('Zoom change detected, scale:', currentScale, 'swipe enabled:', swipeEnabledRef.current);
//     } catch (error) {
//       console.error('Error in handleZoomChange:', error);
//     }
//   };

//   // Handle touch start for swipe and double tap
//   const handleTouchStart = (e) => {
//     // Store touch start position
//     if (e.touches.length === 1) {
//       const touch = e.touches[0];
//       const now = Date.now();

//       // Check for double tap
//       const timeSinceLastTap = now - lastTapTimeRef.current;

//       // Simple double tap detection based on time only
//       if (timeSinceLastTap < 300) {
//         console.log("Double tap detected!");

//         // Get current scale to determine if we're zoomed
//         let currentScale = 1;
//         if (transformComponentRef.current) {
//           if (transformComponentRef.current.instance?.transformState?.scale) {
//             currentScale = transformComponentRef.current.instance.transformState.scale;
//           } else if (transformComponentRef.current.state?.scale) {
//             currentScale = transformComponentRef.current.state.scale;
//           }
//         }

//         // Check if we're already zoomed based on actual scale, not just state
//         const isCurrentlyZoomed = currentScale > 1.1;

//         // Update state based on actual zoom level
//         setIsZoomed(!isCurrentlyZoomed);

//         // Toggle zoom based on current scale
//         if (!isCurrentlyZoomed) {
//           console.log("Zooming in...");
//           if (transformComponentRef.current) {
//             setTimeout(() => {
//               transformComponentRef.current.zoomIn(2);
//             }, 50);
//           }
//         } else {
//           // If already zoomed, zoom out completely
//           console.log("Zooming out completely...");
//           if (transformComponentRef.current) {
//             transformComponentRef.current.resetTransform();
//           }
//         }

//         // Prevent this from being treated as a swipe
//         touchStartRef.current = null;
//       } else {
//         // Not a double tap, store for swipe detection
//         touchStartRef.current = {
//           x: touch.clientX,
//           y: touch.clientY,
//           time: now
//         };
//       }

//       lastTapTimeRef.current = now;
//     }
//   };

//   // Update swipe enabled state when zoom state changes
//   useEffect(() => {
//     // Disable swipe when zoomed
//     swipeEnabledRef.current = !isZoomed;

//     // Reset direction when zoom state changes to ensure smooth transitions
//     if (!isZoomed) {
//       setDirection(null);
//     }
//   }, [isZoomed]);

//   // Add a touch move handler to prevent default scrolling when zoomed
//   const handleTouchMove = (e) => {
//     // Check if we're currently zoomed in
//     const isCurrentlyZoomed = isZoomed || (transformComponentRef.current &&
//       (transformComponentRef.current.instance?.transformState?.scale > 1.1 ||
//        transformComponentRef.current.state?.scale > 1.1));

//     // Update swipe enabled ref based on zoom state
//     if (isCurrentlyZoomed !== !swipeEnabledRef.current) {
//       swipeEnabledRef.current = !isCurrentlyZoomed;
//     }

//     // If not zoomed and we're tracking a touch for potential swipe
//     if (!isCurrentlyZoomed && touchStartRef.current && e.touches.length === 1) {
//       const touch = e.touches[0];
//       const deltaX = touch.clientX - touchStartRef.current.x;
//       const deltaY = touch.clientY - touchStartRef.current.y;

//       // If horizontal movement is greater than vertical, it's likely a swipe
//       if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
//         // This is handled by the touchAction: none style now
//         // No need to call preventDefault() which causes the warning
//       }
//     }
//   };

//   // Handle touch end for swipe navigation
//   const handleTouchEnd = (e) => {
//     // Don't handle swipe when zoomed or touch start wasn't recorded
//     if (isZoomed || !touchStartRef.current) {
//       touchStartRef.current = null;
//       return;
//     }

//     const touch = e.changedTouches[0];
//     const deltaX = touch.clientX - touchStartRef.current.x;
//     const timeDelta = Date.now() - touchStartRef.current.time;

//     // Check if it's a swipe (fast movement)
//     const isSwipe = timeDelta < 250 && Math.abs(deltaX) > 50;

//     if (isSwipe) {
//       console.log("Swipe detected, delta:", deltaX);

//       // Always set direction first before changing the index
//       if (deltaX > 0 && currentIndex > 0) {
//         // Swipe right - previous image
//         console.log("Navigating to previous image");
//         setDirection('right');
//         setTimeout(() => {
//           setCurrentIndex(prev => prev - 1);
//         }, 10);
//       } else if (deltaX < 0 && currentIndex < images.length - 1) {
//         // Swipe left - next image
//         console.log("Navigating to next image");
//         setDirection('left');
//         setTimeout(() => {
//           setCurrentIndex(prev => prev + 1);
//         }, 10);
//       }
//     }

//     touchStartRef.current = null;
//   };

//   if (!isOpen) return null;

//   return createPortal(
//     <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
//       {/* Close button */}
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 text-white p-2 bg-black/30 backdrop-blur-sm rounded-full"
//       >
//         <X size={20} />
//       </button>

//       {/* Image counter */}
//       <div className="absolute top-4 left-4 z-50 text-white/80 text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
//         {currentIndex + 1} / {images.length}
//       </div>

//       {/* Main image with zoom */}
//       <div
//         className="w-full h-full"
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//         style={{ touchAction: "none" }}
//       >
//         <AnimatePresence initial={false} mode="wait" custom={direction}>
//           <motion.div
//             key={currentIndex}
//             custom={direction}
//             initial={direction ? {
//               x: direction === 'left' ? 300 : -300,
//               opacity: 0
//             } : { opacity: 1, x: 0 }}
//             animate={{
//               x: 0,
//               opacity: 1
//             }}
//             exit={direction ? {
//               x: direction === 'left' ? -300 : 300,
//               opacity: 0
//             } : { opacity: 0 }}
//             transition={{
//               x: { type: "spring", stiffness: 250, damping: 25, mass: 1 },
//               opacity: { duration: 0.3, ease: "easeInOut" }
//             }}
//             className="w-full h-full absolute inset-0"
//           >
//             <TransformWrapper
//               initialScale={1}
//               minScale={1}
//               maxScale={3}
//               centerOnInit={true}
//               doubleClick={{ disabled: true }} // We handle double tap manually
//               panning={{
//                 disabled: false,
//                 velocityDisabled: false
//               }}
//               onZoomChange={handleZoomChange}
//               limitToBounds={true}
//               ref={transformComponentRef}
//               key={currentIndex} // Force re-render on image change
//             >
//               {({ zoomIn, zoomOut, resetTransform }) => (
//                 <React.Fragment>
//                   {/* Reset zoom button - only visible when zoomed */}
//                   {isZoomed && (
//                     <button
//                       onClick={() => {
//                         resetTransform();
//                         setIsZoomed(false);
//                       }}
//                       className="absolute bottom-20 right-4 z-50 text-white p-2 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
//                       aria-label="Reset zoom"
//                     >
//                       <ZoomOut size={20} />
//                     </button>
//                   )}
//                   <TransformComponent
//                     wrapperStyle={{
//                       width: '100%',
//                       height: '100%',
//                       backgroundColor: 'black'
//                     }}
//                     contentStyle={{
//                       width: '100%',
//                       height: '100%',
//                       display: 'flex',
//                       justifyContent: 'center',
//                       alignItems: 'center'
//                     }}
//                   >
//                     <img
//                       src={images[currentIndex]}
//                       alt={imageAlt || `Image ${currentIndex + 1}`}
//                       className="max-w-full max-h-full object-contain"
//                       draggable="false"
//                     />
//                   </TransformComponent>
//                 </React.Fragment>
//               )}
//             </TransformWrapper>
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       {/* Instruction indicator */}
//       <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2
//                     text-white/70 text-xs bg-black/40 px-3 py-1.5 rounded-full
//                     backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
//         <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
//         {isZoomed ? "Double-tap or use reset button to zoom out" : "Double-tap to zoom in"}
//       </div>
//     </div>,
//     document.body
//   );
// }

// export default MobileZoomableModal;


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
