import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";


const Carousel = ({ bannersList }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const autoScrollIntervalRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Function to advance to the next slide
  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === bannersList.length - 1 ? 0 : prevIndex + 1
    );
  };

  // ✅ Dynamically Preload the First Image
  useEffect(() => {
    if (bannersList.length > 0) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = bannersList[0].image; // Preload first banner image
      link.type = "image/webp"; // Change this based on your actual format
      document.head.appendChild(link);
    }
  }, [bannersList]);

  // Auto-scroll effect
  useEffect(() => {
    // Only set up auto-scroll if we have more than one banner
    if (bannersList.length > 1 && !isPaused) {
      // Clear any existing interval
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }

      // Set up new interval for auto-scrolling (every 3 seconds)
      autoScrollIntervalRef.current = setInterval(goToNextSlide, 3000);
    }

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [bannersList.length, isPaused]);

  return (
    <div
      className="relative w-full h-full bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {bannersList.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          {/* ✅ Use Lazy Loading for Non-LCP Images */}
        <div className="w-full h-full">
        <img
            src={item.image}
            alt="Banner"
            className="w-full h-full object-center object-cover md:object-top"
            loading={index === 0 ? "eager" : "lazy"} // First image loads eagerly
          />
        </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>

          {/* Text Content */}
          <div className="absolute bottom-16 md:bottom-24 left-4 md:left-16 text-white max-w-2xl">
            <h2 className="w-4/5 md:w-full text-2xl md:text-6xl font-bold leading-snug tracking-wide drop-shadow-md animate-fade-slide-up ">
              {item?.description}
            </h2>
            <div className="w-[160px] flex items-center justify-center px-4 py-2 border border-white rounded-full 
                mt-4 group hover:cursor-pointer relative overflow-hidden 
                bg-white/10 backdrop-blur-lg shadow-lg " onClick={() => navigate(`/shop/collections`)}>
              {/* Gradient Overlay for Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <span className="text-xs md:text-sm uppercase tracking-wider font-medium text-white relative z-10 transition-all duration-300 group-hover:tracking-widest">
                Shop Now
              </span>

              <div className="ml-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center 
                  transform transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110">
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-white transition-transform duration-300 group-hover:rotate-45" />
              </div>
            </div>

          </div>
        </div>
      ))}

      {/* Dots (Always Visible) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {bannersList.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
              ? "bg-foreground border-2 border-white scale-125"
              : "bg-gray-500"
              }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;