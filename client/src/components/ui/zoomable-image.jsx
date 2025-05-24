import { useState, useRef, useEffect } from "react";
import MobileZoomableModal from "./mobile-zoomable-modal";

function ZoomableImage({ imageSrc, imageAlt, onZoomData, onNavigate, images }) {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for the main image view
  const zoomRef = useRef();
  const imageRef = useRef();
  const containerRef = useRef();

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    // Only open modal on mobile devices
    if (window.innerWidth < 768) {
      setIsModalOpen(true);
    }
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
       className="w-full h-[550px] md:w-[620px] md:h-[900px] relative overflow-hidden border shadow-md cursor-pointer"

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

      {/* Only render modal for mobile devices */}
      {isMobile && (
        <MobileZoomableModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          initialImage={imageSrc}
          images={images || [imageSrc]}
          imageAlt={imageAlt}
        />
      )}
    </div>
  );
}

export default ZoomableImage;
