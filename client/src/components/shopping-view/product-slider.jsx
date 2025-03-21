import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ShoppingProductTile from "./product-tile";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductSlider = ({
  products,
  handleGetProductDetails,
  handleAddtoCart,
  title,
  description,
  bgColor = "bg-gray-50",
  isNewArrival,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollIntervalRef = useRef(null);
  const manualPauseTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Refs for touch swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const swipeThreshold = 50; // minimum swipe distance in pixels

  // Responsive items per slide: 2 for mobile, 5 for desktop
  const itemsPerSlide = isMobile ? 2 : 5;

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate total number of slides available
  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  // Function to advance to the next slide
  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex >= totalSlides - 1 ? 0 : prevIndex + 1));
  };

  // Function to go to the previous slide
  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex <= 0 ? totalSlides - 1 : prevIndex - 1));
  };

  // Pause auto slide for 3 seconds on manual interaction, then resume
  const pauseAutoSlide = () => {
    if (manualPauseTimeoutRef.current) {
      clearTimeout(manualPauseTimeoutRef.current);
    }
    setIsPaused(true);
    manualPauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (products.length > itemsPerSlide && !isPaused) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      autoScrollIntervalRef.current = setInterval(goToNextSlide, 4000);
    }
    return () => {
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
      if (manualPauseTimeoutRef.current) clearTimeout(manualPauseTimeoutRef.current);
    };
  }, [products.length, isPaused, itemsPerSlide]);

  // If there are not enough products for sliding, show them statically
  if (products.length <= itemsPerSlide) {
    return (
      <section className={`py-16 ${bgColor}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">{title}</h2>
            <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
            <p className="text-gray-600">{description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 50,
                }}
              >
                <ShoppingProductTile
                  handleGetProductDetails={handleGetProductDetails}
                  product={product}
                  handleAddtoCart={handleAddtoCart}
                />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate(isNewArrival ? "/shop/new-arrivals" : "/shop/collections")}
              className="inline-block px-8 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
            >
              {isNewArrival ? "View New Products" : "View All Products"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Get products for the current slide
  const getCurrentSlideProducts = () => {
    const startIdx = currentIndex * itemsPerSlide;
    return products.slice(startIdx, startIdx + itemsPerSlide);
  };

  // Touch event handlers for swipe support, with auto slide pause
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    if (diff > swipeThreshold) {
      goToPrevSlide();
      pauseAutoSlide();
    } else if (diff < -swipeThreshold) {
      goToNextSlide();
      pauseAutoSlide();
    }
  };

  return (
    <section className={`py-16 ${bgColor}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">{title}</h2>
          <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Slider with external navigation arrows */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex items-center"
        >
          {/* Left Arrow */}
          <button
            onClick={() => {
              goToPrevSlide();
              pauseAutoSlide();
            }}
            className="mr-2 bg-white/75 hover:bg-white p-2 rounded-full shadow-md"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Slider Container */}
          <div
            className="overflow-hidden w-full"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-5"} gap-2 md:gap-8`}
              >
                {getCurrentSlideProducts().map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 50,
                    }}
                  >
                    <ShoppingProductTile
                      handleGetProductDetails={handleGetProductDetails}
                      product={product}
                      handleAddtoCart={handleAddtoCart}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => {
              goToNextSlide();
              pauseAutoSlide();
            }}
            className="ml-2 bg-white/75 hover:bg-white p-2 rounded-full shadow-md"
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots Navigation */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  pauseAutoSlide();
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-black border-2 border-gray-300 scale-125" : "bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        )}

        {/* View Products Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate(isNewArrival ? "/shop/new-arrivals" : "/shop/collections")}
            className="inline-block px-8 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
          >
            {isNewArrival ? "View New Products" : "View All Products"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;