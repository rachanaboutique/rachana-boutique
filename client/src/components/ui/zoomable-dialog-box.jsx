import { useState, useRef } from "react";

function ZoomableImage({ imageSrc, imageAlt, onZoomData }) {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const zoomRef = useRef();

  const handleMouseMove = (e) => {
    const rect = zoomRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHoverPosition({ x, y });

    const zoomX = (x / rect.width) * 100;
    const zoomY = (y / rect.height) * 100;

    onZoomData({ isHovering: true, zoomPosition: { x: zoomX, y: zoomY }, imageSrc });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    onZoomData({ isHovering: false });
  };
  // w-full h-full md:w-4/5 md:h-2/3
  return (
    <div className="flex flex-col gap-4">
      <div
        className=" relative overflow-hidden rounded-lg border shadow-md cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={zoomRef}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full  object-cover "
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
      <div className="flex gap-2">
        {/* Replace these with dynamic additional images */}
        <img
          src={imageSrc}
          alt="Thumbnail"
          className="w-16 h-16 object-cover rounded-lg cursor-pointer"
        />
        <img
          src={imageSrc}
          alt="Thumbnail"
          className="w-16 h-16 object-cover rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
}

export default ZoomableImage;
