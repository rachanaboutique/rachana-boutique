import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

function ZoomableImage({ imageSrc, imageAlt, onZoomData, onNavigate, images }) {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0); // Track double tap
  
  // Simpler swipe implementation
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50; // Minimum distance required for a swipe
  
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

    onZoomData({ isHovering: true, zoomPosition: { x: zoomX, y: zoomY }, imageSrc });
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    onZoomData({ isHovering: false });
  };

  const handleImageClick = () => {
    if (window.innerWidth < 768) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleZoom = (event) => {
    event.preventDefault();
    setZoomScale((prevScale) => {
      let newScale = prevScale + event.deltaY * -0.01;
      return Math.min(Math.max(newScale, 1), 3); // Restrict zoom between 1x and 3x
    });
  };

  const handlePan = (event) => {
    if (zoomScale > 1) {
      setPanPosition((prev) => ({
        x: Math.max(Math.min(prev.x + event.movementX, (zoomScale - 1) * 50), -(zoomScale - 1) * 50),
        y: Math.max(Math.min(prev.y + event.movementY, (zoomScale - 1) * 50), -(zoomScale - 1) * 50),
      }));
    }
  };

  // Simplified touch handlers for more reliable swipe detection
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    
    // Double tap detection
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (tapLength < 300 && tapLength > 0) {
      setZoomScale((prevScale) => (prevScale === 1 ? 2 : 1)); // Toggle between 1x and 2x zoom
      setPanPosition({ x: 0, y: 0 });
    }

    setLastTap(currentTime);
  };

  const handleTouchMove = (e) => {
    // Update the end position as the finger moves
    touchEndX.current = e.touches[0].clientX;
    
    // If zoomed in, handle panning
    if (zoomScale > 1) {
      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = e.touches[0].clientY - e.touches[0].clientY;
      
      setPanPosition((prev) => ({
        x: Math.max(Math.min(prev.x + deltaX * 0.05, (zoomScale - 1) * 50), -(zoomScale - 1) * 50),
        y: Math.max(Math.min(prev.y + deltaY * 0.05, (zoomScale - 1) * 50), -(zoomScale - 1) * 50),
      }));
      
      // Reset start position for continuous movement
      touchStartX.current = touchEndX.current;
      
      // Prevent default to avoid page scrolling when zoomed in
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    // Only process swipe if we're not zoomed in
    if (zoomScale === 1 && touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchEndX.current - touchStartX.current;
      
      // Check if the swipe distance is significant enough
      if (Math.abs(distance) > minSwipeDistance && images && images.length > 1) {
        // Determine swipe direction and navigate
        const direction = distance > 0 ? 'prev' : 'next';
        if (onNavigate) {
          onNavigate(direction);
        }
      }
    }
    
    // Reset touch positions
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="flex flex-col gap-4" ref={containerRef}>
      <div
        className="w-full h-[550px] md:h-[900px] relative overflow-hidden border shadow-md cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleImageClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
          ></div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
          {/* Modal Content */}
          <div
            className="relative w-full h-full flex justify-center items-center overflow-hidden"
            onWheel={handleZoom}
            onMouseMove={handlePan}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close Button on Image */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 bg-gray-900 text-white rounded-full p-2 shadow-md z-50"
            >
              <X size={24} />
            </button>

            <img
              src={imageSrc}
              alt={imageAlt}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: zoomScale > 1 
                  ? `scale(${zoomScale}) translate(${panPosition.x}%, ${panPosition.y}%)`
                  : 'none'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ZoomableImage;