import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Quote, User } from 'lucide-react';
import FeedbackCard from './feedback-card';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';

// Updated testimonials for a clothing store

const testimonials = [
  {
    name: "Thanamalar",
    title: "English Professor",
    review:
      "I like the sarees at Rachana's Boutique and find their collection to be exquisite. I had purchased a saree and found their delivery and service were efficient. Sridevi Mam gives her personal attention in fulfilling customer satisfaction. Thank you and all the best.",
    image: "https://randomuser.me/api/portraits/women/25.jpg",
  },
  {
    name: "Bharathi",
    title: "Actress",
    review:
      "RACHANA BOUTIQUE having an Exclusive saree collections of Excellent combinations of colours from various places inclusive of all Traditional & Fashionable Party wear sarees ranging from daily wear to Special Occasions. A must try place to have an Elegant Saree look.",
    image: "https://randomuser.me/api/portraits/women/30.jpg",
  },
  {
    name: "Prisha",
    title: "Fashion Designer",
    review:
      "I've honestly loved the saree collection the designs feel super fresh but still have that traditional touch. The fabric quality is really good, and the colors are so well picked. You've clearly put a lot of thought into every piece, and it shows. Can't wait to see how it all looks on the website.",
    image: "https://randomuser.me/api/portraits/women/35.jpg",
  },
  {
    name: "Lynn Ernestina",
    title: "Home Maker",
    review:
      "The service was very prompt, courteous and very professional. I am happy with the variety available and the overall experience. Definitely recommend and consider purchasing again.",
    image: "https://randomuser.me/api/portraits/women/40.jpg",
  },
  {
    name: "Shobhana",
    title: "Entrepreneur",
    review:
      "My recent saree shopping from Rachana's boutique was a great experience… lovely hand picked collections, choice of colours, good quality, and reasonable price. Overall a good shopping and satisfaction. Try Rachana's collections.",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    name: "Sumathi Puniyaseelan",
    title: "Home Maker",
    review:
      "RACHANA BOUTIQUE has a truly unique collection with a wide variety of beautiful designs at reasonable prices. The quality and patterns are exceptional—totally awesome experience! Highly recommended for anyone looking for stylish and affordable sarees.",
    image: "https://randomuser.me/api/portraits/women/50.jpg",
  },
];


const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const x = useMotionValue(0);
  const containerWidth = useRef(0);
  const autoScrollIntervalRef = useRef(null);
  const manualPauseTimeoutRef = useRef(null);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get items per slide based on screen size
  const getItemsPerSlide = useCallback(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getItemsPerSlide]);

  // Start auto-scroll on component mount
  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      setIsPaused(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

  const getCurrentSlideTestimonials = () => {
    const startIndex = currentIndex * itemsPerSlide;
    return testimonials.slice(startIndex, startIndex + itemsPerSlide);
  };

  const goToNextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    pauseAutoSlide();
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
    pauseAutoSlide();
  }, [totalSlides]);

  const pauseAutoSlide = () => {
    if (manualPauseTimeoutRef.current) {
      clearTimeout(manualPauseTimeoutRef.current);
    }
    setIsPaused(true);
    manualPauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  // Auto-scroll effect - infinite loop
  useEffect(() => {
    if (!isPaused && !isDragging && totalSlides > 0) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      autoScrollIntervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % totalSlides;
          return nextIndex;
        });
      }, 6000);
    } else {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    }
    return () => {
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
      if (manualPauseTimeoutRef.current) clearTimeout(manualPauseTimeoutRef.current);
    };
  }, [isPaused, isDragging, totalSlides]);

  // Drag handlers for swipe support
  const handleDragStart = () => {
    setIsDragging(true);
    setIsPaused(true);
    pauseAutoSlide();
  };

  const handleDragEnd = (_, info) => {
    setIsDragging(false);

    // Get container width on first drag if not already set
    if (containerWidth.current === 0) {
      const container = document.querySelector('.testimonial-slider-container');
      if (container) {
        containerWidth.current = container.offsetWidth;
      }
    }

    // Check if this is primarily a horizontal swipe
    const horizontalDistance = Math.abs(info.offset.x);
    const verticalDistance = Math.abs(info.offset.y);
    
    // Only trigger navigation if horizontal movement is greater than vertical movement
    if (horizontalDistance > verticalDistance && horizontalDistance > 20) {
      // Determine if we should navigate based on drag velocity or distance
      const threshold = containerWidth.current * 0.2;

      if (info.offset.x > threshold || (info.velocity.x > 0.5 && info.offset.x > 0)) {
        goToPrevSlide();
      } else if (info.offset.x < -threshold || (info.velocity.x < -0.5 && info.offset.x < 0)) {
        goToNextSlide();
      }
    }

    // Reset the x position
    x.set(0);
  };

  return (
    <div className='relative'>
      <div className='w-full mx-auto relative md:px-6'>
        {/* Navigation Arrows - Desktop Only */}
        {!isMobile && (
          <>
            <PrevIcon onClick={goToPrevSlide} />
            <NextIcon onClick={goToNextSlide} />
          </>
        )}

        {/* Slider Container */}
        <div className="w-full overflow-hidden testimonial-slider-container">
          <motion.div
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ x }}
            className="w-full"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="grid gap-6 md:gap-8"
                style={{
                  gridTemplateColumns: `repeat(${getCurrentSlideTestimonials().length}, 1fr)`
                }}
              >
                {getCurrentSlideTestimonials().map((testimonial, index) => (
                  <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setDirection(index > currentIndex ? 1 : -1);
                pauseAutoSlide();
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-gray-600' : 'bg-gray-200 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Feedback button positioned at the bottom center */}
        <div className="flex justify-center mt-8">
          <FeedbackCard />
        </div>
      </div>
    </div>
  );
};

// Modern testimonial card component
const TestimonialCard = ({ testimonial, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 50,
      }}
      className="px-2"
    >
      <div className="bg-white p-8 border border-gray-200 shadow-sm h-full flex flex-col">
        {/* Quote icon */}
        <div className="mb-6 text-blue-200"> {/* Changed quote color to light blue */}
          <Quote size={40} />
        </div>
        {/* Review text */}
        <p
          className="text-left text-gray-700 mb-8 flex-grow leading-relaxed italic font-medium text-lg" // Added font-medium for slight boldness
        >
          "{testimonial.review}"
        </p>
        {/* Customer info */}
        <div className="flex items-center mt-auto pt-6 border-t border-gray-100">
          <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
            <User size={40} className="text-gray-500" />
          </div>
          <div className="ml-4">
            <h4 className="font-bold text-xl text-gray-900">{testimonial.name}</h4>
            <p className="text-base text-gray-600">{testimonial.title}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Previous and Next arrows with updated styling
const PrevIcon = ({ onClick }) => {
  return (
    <button
      className="absolute left-2 md:left-0 top-[45%] -translate-y-1/2 -translate-x-6 z-10 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-colors"
      onClick={onClick}
      aria-label="Previous"
    >
      <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
    </button>
  );
};

const NextIcon = ({ onClick }) => {
  return (
    <button
      className="absolute right-2 md:right-0 top-[45%] -translate-y-1/2 translate-x-6 z-10 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-colors"
      onClick={onClick}
      aria-label="Next"
    >
      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
    </button>
  );
};

export default Testimonials;