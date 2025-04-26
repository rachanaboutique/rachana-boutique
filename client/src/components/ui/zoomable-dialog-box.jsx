import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// Modal component for zoom and navigation
function ZoomableModal({ isOpen, onClose, initialImage, images, imageAlt, onNavigate }) {
  // All refs must be declared before any conditional returns
  const currentIndexRef = useRef(images.findIndex(img => img === initialImage) || 0);
  const transformComponentRef = useRef(null);
  const lastTapRef = useRef(0);
  const lastTapPositionRef = useRef({ x: 0, y: 0 });
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const touchMoveCountRef = useRef(0);
  const containerRef = useRef(null);

  // All state hooks must be declared before any conditional returns
  const [displayImage, setDisplayImage] = useState(initialImage);
  const [secondaryImage, setSecondaryImage] = useState(null);
  const [transitionDirection, setTransitionDirection] = useState(null);
  const [scale, setScale] = useState(1);
  const [isZooming, setIsZooming] = useState(false);

  // Debug function to log touch events
  const logTouchEvent = (name, e) => {
    console.log(`Touch ${name}:`, {
      touches: e.touches.length,
      targetTouches: e.targetTouches.length,
      changedTouches: e.changedTouches.length,
      timeStamp: e.timeStamp
    });
  };

  useEffect(() => {
    if (isOpen) {
      currentIndexRef.current = images.findIndex(img => img === initialImage) || 0;
      setDisplayImage(initialImage);
      setSecondaryImage(null);
      setTransitionDirection(null);
      setScale(1);
      
      // Reset the transform component when modal opens
      if (transformComponentRef.current) {
        transformComponentRef.current.resetTransform();
      }
    }
  }, [initialImage, isOpen, images]);

  // Add event listeners for keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowLeft') {
        handleNavigation('prev');
      } else if (e.key === 'ArrowRight') {
        handleNavigation('next');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchStart = (e) => {
    // Reset touch move counter
    touchMoveCountRef.current = 0;
    
    // Store touch start position for swipe detection
    if (e.touches && e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      
      // Get current touch position for double tap detection
      const touch = e.touches[0];
      const currentPosition = { x: touch.clientX, y: touch.clientY };

      // Double tap detection with position check
      const currentTime = new Date().getTime();
      const timeSinceLastTap = currentTime - lastTapRef.current;
      const lastPosition = lastTapPositionRef.current;

      // Calculate distance between taps
      const distanceBetweenTaps = Math.sqrt(
        Math.pow(currentPosition.x - lastPosition.x, 2) +
        Math.pow(currentPosition.y - lastPosition.y, 2)
      );

      // Double tap detected if time between taps is short and taps are close together
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0 && distanceBetweenTaps < 30) {
        console.log('Double tap detected', { timeSinceLastTap, distanceBetweenTaps });

        if (transformComponentRef.current) {
          try {
            const { zoomIn, resetTransform } = transformComponentRef.current;

            if (scale > 1.1) {
              // If already zoomed in, reset to original size
              resetTransform();
              setScale(1);
            } else {
              // Zoom in to the tap position with smooth animation
              if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = (touch.clientX - rect.left) / rect.width;
                const y = (touch.clientY - rect.top) / rect.height;

                // Zoom to 2.5x with 300ms animation
                zoomIn(2.5, 300, x, y);
                setScale(2.5);
              }
            }
          } catch (error) {
            console.error("Error handling double tap:", error);
          }

          // Prevent default to avoid any browser handling
          e.preventDefault();
          e.stopPropagation();
        }
      }

      // Update last tap info
      lastTapRef.current = currentTime;
      lastTapPositionRef.current = currentPosition;
    }
  };

  const handleTouchMove = (e) => {
    // Count touch moves to distinguish between tap and swipe
    touchMoveCountRef.current += 1;
  };

  const handleTouchEnd = (e) => {
    // Only process swipe if:
    // 1. We're not zoomed in (scale is close to 1)
    // 2. We have touch start coordinates
    // 3. There were enough touch move events to consider it a swipe
    if (scale <= 1.1 && 
        touchStartXRef.current !== null && 
        touchMoveCountRef.current > 3 &&
        e.changedTouches && 
        e.changedTouches.length > 0) {

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartXRef.current;
      const deltaY = touchEndY - touchStartYRef.current;

      // Check if horizontal swipe (more horizontal than vertical)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        console.log('Swipe detected:', deltaX > 0 ? 'right' : 'left');
        const direction = deltaX > 0 ? 'prev' : 'next';
        handleNavigation(direction);
      }
    }

    // Reset touch tracking
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleNavigation = (direction) => {
    if (!images || images.length <= 1) return;
    
    // Don't allow navigation when zoomed in
    // Use the scale state instead of directly accessing transformComponentRef
    if (scale > 1.1) {
      return;
    }

    const newIndex = direction === 'next'
      ? (currentIndexRef.current + 1) % images.length
      : (currentIndexRef.current - 1 + images.length) % images.length;

    setSecondaryImage(images[newIndex]);
    setTransitionDirection(direction);
    currentIndexRef.current = newIndex;

    if (onNavigate) {
      onNavigate(direction);
    }

    setTimeout(() => {
      setDisplayImage(images[newIndex]);
      setSecondaryImage(null);
      setTransitionDirection(null);
    }, 300);
  };

  const handleZoomIn = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.zoomIn();
      setScale(prev => Math.min(prev + 0.5, 5));
    }
  };

  const handleZoomOut = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.zoomOut();
      setScale(prev => Math.max(prev - 0.5, 0.5));
    }
  };

  const handleResetTransform = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
      setScale(1);
    }
  };

  const getTransitionClasses = () => {
    if (!transitionDirection) return '';
    return transitionDirection === 'next' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0';
  };

  const getIncomingClasses = () => {
    if (!transitionDirection) return 'hidden';
    const baseClasses = 'absolute inset-0 transition-transform duration-300 ease-in-out transform';
    const directionClasses = transitionDirection === 'next'
      ? '-translate-x-full opacity-100'
      : 'translate-x-full opacity-100';
    return `${baseClasses} ${directionClasses}`;
  };

  return createPortal(
    <div className="fixed inset-0 bg-black flex justify-center items-center z-50">
      <div className="relative w-full h-full flex justify-center items-center overflow-hidden bg-black">
        <div className="w-full h-full md:h-[900px] md:mx-auto flex justify-center items-center lg:w-[600px] xl:w-[800px] 2xl:w-[1000px]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-gray-900 text-white rounded-full p-2 shadow-md z-50"
          >
            <X size={24} />
          </button>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-50">
            <button
              onClick={handleZoomIn}
              className="bg-gray-900 text-white rounded-full p-2 shadow-md"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleZoomOut}
              className="bg-gray-900 text-white rounded-full p-2 shadow-md"
            >
              <ZoomOut size={20} />
            </button>
            {scale !== 1 && (
              <button
                onClick={handleResetTransform}
                className="bg-gray-900 text-white rounded-full px-3 py-2 shadow-md text-xs font-medium"
              >
                Reset
              </button>
            )}
          </div>

          {/* Navigation buttons - only show when not zoomed in */}
          {images && images.length > 1 && (
            <div className={`transition-opacity duration-300 ${scale <= 1.1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button
                onClick={() => handleNavigation('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-900/50 text-white rounded-full p-2 z-40 hover:bg-gray-900/80 transition-colors"
                disabled={scale > 1.1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => handleNavigation('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-900/50 text-white rounded-full p-2 z-40 hover:bg-gray-900/80 transition-colors"
                disabled={scale > 1.1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}

          {/* Zoom indicator */}
          <div className="absolute top-4 left-4 bg-gray-900/70 text-white text-xs px-2 py-1 rounded-md z-40">
            {Math.round(scale * 100)}%
          </div>

          {/* Image container with zoom functionality */}
          <div 
            className="relative w-full h-full bg-black"
            ref={containerRef}
          >
            <TransformWrapper
              ref={transformComponentRef}
              initialScale={1}
              initialPositionX={0}
              initialPositionY={0}
              minScale={0.5}
              maxScale={5}
              centerOnInit={true}
              limitToBounds={true}
              doubleClick={{ disabled: true }} // Disable built-in double click to use our custom handler
              panning={{
                disabled: false,
                velocityDisabled: false,
                lockAxisX: false,
                lockAxisY: false,
                activationKeys: [],
                excluded: []
              }}
              wheel={{ 
                step: 0.1,
                wheelDisabled: false,
                touchPadDisabled: false
              }}
              pinch={{
                step: 0.1,
                disabled: false,
                disableLimitsOnZoomOut: true
              }}
              zoomAnimation={{
                disabled: false,
                size: 0.1,
                animationType: "easeOut",
                animationTime: 200
              }}
              alignmentAnimation={{
                disabled: false,
                sizeX: 0,
                sizeY: 0,
                animationType: "easeOut"
              }}
              velocityAnimation={{
                disabled: false,
                sensitivity: 1,
                animationTime: 200,
                animationType: "easeOut"
              }}
              onZoom={ref => {
                if (ref && ref.state) {
                  setScale(ref.state.scale);
                  setIsZooming(true);
                }
              }}
              onZoomStop={() => {
                setIsZooming(false);
              }}
              onPanning={() => {
                // Disable swipe navigation when panning
                touchStartXRef.current = null;
              }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black',
                    touchAction: 'none', // Prevent browser handling of touch events
                    userSelect: 'none' // Prevent text selection during touch
                  }}
                  contentClass="touch-none"
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'black'
                  }}
                >
                  <div
                    className="w-full h-full flex justify-center items-center bg-black"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className={`w-full h-full flex justify-center items-center transition-all duration-300 transform ${getTransitionClasses()}`}>
                      <img
                        src={displayImage}
                        alt={imageAlt}
                        className="max-w-full max-h-full object-contain"
                        onTouchStart={(e) => e.stopPropagation()} // Prevent double handling
                      />
                    </div>

                    {secondaryImage && (
                      <div className={getIncomingClasses()}>
                        <img
                          src={secondaryImage}
                          alt={imageAlt}
                          className="max-w-full max-h-full object-contain"
                          onTouchStart={(e) => e.stopPropagation()} // Prevent double handling
                        />
                      </div>
                    )}
                  </div>
                </TransformComponent>
              )}
            </TransformWrapper>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ZoomableImage({ imageSrc, imageAlt, onZoomData, onNavigate, images }) {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const zoomRef = useRef();
  const imageRef = useRef();
  const containerRef = useRef();

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;

    const rect = zoomRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHoverPosition({ x, y });

    const zoomX = (x / rect.width) * 100;
    const zoomY = (y / rect.height) * 100;

    onZoomData && onZoomData({ isHovering: true, zoomPosition: { x: zoomX, y: zoomY }, imageSrc });
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    onZoomData && onZoomData({ isHovering: false });
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleModalNavigate = (direction) => {
    onNavigate && onNavigate(direction);
  };

  return (
    <div className="flex flex-col gap-4" ref={containerRef}>
      <div
        className="w-full h-[550px] md:h-[900px] md:mx-auto relative overflow-hidden border shadow-md cursor-pointer
        lg:w-[450px] xl:w-[650px] 2xl:w-[700px]"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleImageClick}
        ref={zoomRef}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-fit"
        />
        {isHovering && (
          <div
            className="hidden md:block absolute pointer-events-none rounded-full bg-blue-500/30"
            style={{
              width: "100px",
              height: "100px",
              transform: "translate(-50%, -50%)",
              left: hoverPosition.x,
              top: hoverPosition.y,
            }}
          />
        )}
        
        {/* Mobile indicator */}
        <div className="md:hidden absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
          Tap to zoom
        </div>
      </div>

      <ZoomableModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialImage={imageSrc}
        images={images || [imageSrc]}
        imageAlt={imageAlt}
        onNavigate={handleModalNavigate}
      />
    </div>
  );
}

export default ZoomableImage;
