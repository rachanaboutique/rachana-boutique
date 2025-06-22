
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, ShoppingBag } from "lucide-react";
import FastMovingCard from "./fast-moving-card";
import "../../styles/watch-and-buy-desktop.css";

// Cloudinary Video Player Component
function VideoPlayer({ videoUrl, isPlaying, isMuted, onProgress, onEnded, onError, className, style, autoplay = false }) {
  const videoRef = useRef();
  const playerInstanceRef = useRef();
  const containerRef = useRef();
  const [isCloudinaryLoaded, setIsCloudinaryLoaded] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Extract public ID from Cloudinary URL
  const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    try {

      // Find the upload part and get everything after it
      const uploadIndex = url.indexOf('/upload/');
      if (uploadIndex === -1) {
        return url;
      }

      // Get the part after /upload/
      const afterUpload = url.substring(uploadIndex + 8); // 8 = length of '/upload/'

      // Split by '/' to get segments
      const segments = afterUpload.split('/');

      // Find the last segment (which contains the public ID + extension)
      const lastSegment = segments[segments.length - 1];

      // Remove file extension (.mp4, .mov, etc.)
      const publicId = lastSegment.replace(/\.[^/.]+$/, '');

      return publicId;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return url;
    }
  };

  // Check if Cloudinary is loaded
  useEffect(() => {
    const checkCloudinary = () => {
      if (window.cloudinary) {
        setIsCloudinaryLoaded(true);
        return true;
      }
      return false;
    };

    if (checkCloudinary()) {
      return;
    }

    // Poll for Cloudinary to be loaded
    const interval = setInterval(() => {
      if (checkCloudinary()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Initialize Cloudinary player
  useEffect(() => {
    if (!isCloudinaryLoaded || playerInstanceRef.current || !videoRef.current) return;

    try {

      // Create a timeout to ensure DOM is ready
      const initTimeout = setTimeout(() => {
        if (!videoRef.current) {
          console.warn('Video element not available for initialization');
          return;
        }

        // Ensure video element is properly set up
        const videoElement = videoRef.current;
        videoElement.preload = 'metadata';
        videoElement.playsInline = true;
        videoElement.muted = true;

        playerInstanceRef.current = window.cloudinary.videoPlayer(videoElement, {
          cloud_name: 'dxfeyj7hl',
          controls: false,
          autoplay: autoplay,
          muted: true,
          loop: false,
          fluid: true,
          playsinline: true,
          preload: 'metadata',
          transformation: {
            quality: 'auto',
            fetch_format: 'auto'
          }
        });

        // Store reference to player on video element for external access
        videoElement.cloudinaryPlayer = playerInstanceRef.current;

        setIsPlayerReady(true);

        // Set up event listeners
        if (playerInstanceRef.current) {
          // Use a more robust approach for progress tracking
          playerInstanceRef.current.on('timeupdate', () => {
            if (onProgress && playerInstanceRef.current) {
              try {
                const player = playerInstanceRef.current;
                const currentTime = player.currentTime();
                const duration = player.duration();

                if (duration && duration > 0 && !isNaN(currentTime) && !isNaN(duration)) {
                  const progress = currentTime / duration;
                  onProgress({ played: progress });
                }
              } catch (err) {
                console.warn('Error in timeupdate:', err);
              }
            }
          });

          playerInstanceRef.current.on('ended', () => {
            if (onEnded) onEnded();
          });

          playerInstanceRef.current.on('error', (error) => {
            console.error('Cloudinary player error:', error);
            setIsPlayerReady(false);
            if (onError) onError(error);
          });

          playerInstanceRef.current.on('loadstart', () => {
          });

          playerInstanceRef.current.on('loadeddata', () => {
          });

          playerInstanceRef.current.on('loadedmetadata', () => {
            setIsPlayerReady(true);
          });

          playerInstanceRef.current.on('canplay', () => {
          });

          playerInstanceRef.current.on('playing', () => {
          });

          playerInstanceRef.current.on('pause', () => {
          });

          playerInstanceRef.current.on('ready', () => {
            setIsPlayerReady(true);

            // Set video source immediately when player is ready
            if (videoUrl) {
              try {
                const publicId = extractPublicId(videoUrl);

                playerInstanceRef.current.source(publicId, {
                  transformation: {
                    quality: 'auto',
                    fetch_format: 'auto'
                  }
                });


                // If autoplay is enabled, start playing immediately
                if (autoplay) {
                  setTimeout(() => {
                    if (playerInstanceRef.current) {
                      try {
                        const playPromise = playerInstanceRef.current.play();
                        if (playPromise !== undefined) {
                          playPromise.then(() => {
                          }).catch(error => {
                            console.warn('Autoplay failed:', error);
                          });
                        }
                      } catch (playError) {
                        console.warn('Error starting autoplay:', playError);
                      }
                    }
                  }, 1000); // Increased delay to ensure video is fully loaded
                }
              } catch (sourceError) {
                console.error('Error setting video source on ready:', sourceError);
              }
            }
          });
        }
      }, 100);

      return () => clearTimeout(initTimeout);
    } catch (error) {
      console.error('Error initializing Cloudinary player:', error);
      if (onError) onError(error);
    }
  }, [isCloudinaryLoaded, videoUrl, onProgress, onEnded, onError]);

  // Handle play/pause
  useEffect(() => {
    if (playerInstanceRef.current && isPlayerReady) {
      try {
        if (isPlaying) {
          const playPromise = playerInstanceRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn('Play failed:', error);
            });
          }
        } else {
          playerInstanceRef.current.pause();
        }
      } catch (error) {
        console.error('Error controlling playback:', error);
      }
    }
  }, [isPlaying, isPlayerReady]);

  // Handle mute/unmute
  useEffect(() => {
    if (playerInstanceRef.current) {
      try {
        if (isMuted) {
          playerInstanceRef.current.mute();
        } else {
          playerInstanceRef.current.unmute();
        }
      } catch (error) {
        console.error('Error controlling volume:', error);
      }
    }
  }, [isMuted]);

  // Update video source when videoUrl changes
  useEffect(() => {
    if (playerInstanceRef.current && videoUrl) {
      try {
        const publicId = extractPublicId(videoUrl);

        playerInstanceRef.current.source(publicId, {
          transformation: {
            quality: 'auto',
            fetch_format: 'auto'
          }
        });
      } catch (error) {
        console.error('Error setting video source:', error);
        if (onError) onError(error);
      }
    }
  }, [videoUrl]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (playerInstanceRef.current) {
        try {

          // Pause the video first
          if (typeof playerInstanceRef.current.pause === 'function') {
            playerInstanceRef.current.pause();
          }

          // Remove all event listeners
          if (typeof playerInstanceRef.current.off === 'function') {
            playerInstanceRef.current.off();
          }

          // Dispose the player
          if (typeof playerInstanceRef.current.dispose === 'function') {
            playerInstanceRef.current.dispose();
          }

          playerInstanceRef.current = null;
        } catch (error) {
          console.error('Error disposing Cloudinary player:', error);
          // Force cleanup
          playerInstanceRef.current = null;
        }
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={className} style={style}>
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%' }}
        playsInline
        preload="metadata"
        muted
        onContextMenu={(e) => e.preventDefault()}
        suppressHydrationWarning={true}
        onLoadStart={() => console.log('Video element load started')}
        onLoadedMetadata={() => console.log('Video element metadata loaded')}
        onCanPlay={() => console.log('Video element can play')}
        onError={(e) => console.error('Video element error:', e)}
      />
      {!isPlayerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-white text-sm">Loading video...</div>
        </div>
      )}
    </div>
  );
}

const WatchAndBuy = ({ products, handleAddtoCart }) => {
  const navigate = useNavigate();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Start muted to match video player initialization
  const [activeItem] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [videoCardHeight, setVideoCardHeight] = useState(600);
  const [videoCardWidth, setVideoCardWidth] = useState(320);
  const [modalArrowOffset, setModalArrowOffset] = useState(0);

  // Ref to store last progress value for throttling
  const lastProgressRef = useRef(0);

  // Reference to the slider
  const sliderRef = useRef(null);

  // Ensure slider starts from the first slide
  useEffect(() => {
    if (sliderRef.current) {
      // Reset to first slide on component mount
      sliderRef.current.slickGoTo(0);
    }
  }, [products]);

  // Custom navigation functions
  const goToNextSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  const goToPrevSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  // Settings for the slider - ensure exactly 5 cards are shown
  const sliderSettings = {
    dots: true,
    infinite: products.length >= 5, // Only infinite if we have 5+ products
    speed: 500,
    slidesToShow: Math.min(5, products.length), // Show max 5 or total products if less
    slidesToScroll: 1, // Scroll one card at a time
    autoplay: products.length >= 5, // Only autoplay if we have 5+ products
    autoplaySpeed: 3000, // 3 seconds delay between slides
    arrows: false, // We'll use custom arrows
    adaptiveHeight: false, // Set to false for consistent height
    centerMode: false, // Ensure no center mode
    swipeToSlide: false, // Disable swipe to slide for precise movement
    variableWidth: false, // Fixed width for consistent layout
    draggable: false, // Disable dragging for precise control
    cssEase: "ease-out",
    slidesPerRow: 1,
    initialSlide: 0, // Start from the first slide
    rtl: false, // Left to right direction
    lazyLoad: 'ondemand',
    afterChange: (current) => setCurrentSlideIndex(current),
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: Math.min(5, products.length),
          slidesToScroll: 1,
          dots: true,
          centerMode: false,
          infinite: products.length >= 5,
          autoplay: products.length >= 5,
          autoplaySpeed: 3000,
          initialSlide: 0,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(4, products.length),
          slidesToScroll: 1,
          dots: true,
          centerMode: false,
          infinite: products.length >= 4,
          autoplay: products.length >= 4,
          autoplaySpeed: 3000,
          initialSlide: 0,
        }
      }
    ]
  };

  // Function to force unmute the active video player
  const forceUnmuteActiveVideo = useCallback(() => {
    // Multiple strategies to find and unmute the active video
    setTimeout(() => {
      console.log('Attempting to force unmute active video...');

      // Strategy 1: Find by z-20 class (center video)
      let activeVideoElements = document.querySelectorAll('.video-card-container.z-20 video');
      console.log('Found videos with z-20:', activeVideoElements.length);

      // Strategy 2: If no z-20, find all videos and unmute them
      if (activeVideoElements.length === 0) {
        activeVideoElements = document.querySelectorAll('.video-card video');
        console.log('Found videos with video-card:', activeVideoElements.length);
      }

      // Strategy 3: Find all videos in modal
      if (activeVideoElements.length === 0) {
        activeVideoElements = document.querySelectorAll('.modal-view video');
        console.log('Found videos in modal:', activeVideoElements.length);
      }

      activeVideoElements.forEach((video, index) => {
        console.log(`Processing video ${index}:`, video);

        // Try cloudinaryPlayer reference
        if (video && video.cloudinaryPlayer) {
          try {
            video.cloudinaryPlayer.unmute();
            console.log(`Successfully unmuted video ${index} via cloudinaryPlayer`);
          } catch (error) {
            console.warn(`Error unmuting video ${index} via cloudinaryPlayer:`, error);
          }
        }

        // Also try direct video element unmute
        if (video) {
          try {
            video.muted = false;
            console.log(`Set video ${index} muted property to false`);
          } catch (error) {
            console.warn(`Error setting muted property on video ${index}:`, error);
          }
        }
      });

      // Also ensure React state is updated
      setIsMuted(false);
      console.log('Set React isMuted state to false');
    }, 200); // Increased delay to ensure DOM is ready
  }, []);

  // Function to go to the next video (infinite loop)
  const goToNextVideo = useCallback(() => {
    const newIndex = (currentVideoIndex + 1) % products.length;
    setCurrentVideoIndex(newIndex);
    setSelectedVideo(products[newIndex]);
    // Ensure audio is unmuted for the new video
    setIsMuted(false);
    // Force unmute the active video player
    forceUnmuteActiveVideo();
  }, [currentVideoIndex, products, forceUnmuteActiveVideo]);

  // Function to go to the previous video (infinite loop)
  const goToPrevVideo = useCallback(() => {
    const newIndex = currentVideoIndex === 0 ? products.length - 1 : currentVideoIndex - 1;
    setCurrentVideoIndex(newIndex);
    setSelectedVideo(products[newIndex]);
    // Ensure audio is unmuted for the new video
    setIsMuted(false);
    // Force unmute the active video player
    forceUnmuteActiveVideo();
  }, [currentVideoIndex, products, forceUnmuteActiveVideo]);

  // Function to go to a specific video
  const goToVideo = useCallback((index) => {
    setCurrentVideoIndex(index);
    setSelectedVideo(products[index]);
    // Ensure audio is unmuted for the new video
    setIsMuted(false);
    // Force unmute the active video player
    forceUnmuteActiveVideo();
  }, [products, forceUnmuteActiveVideo]);

  // Reset video state when modal opens or video changes
  useEffect(() => {
    if (showVideoModal) {
      setIsPlaying(true);
      setVideoProgress(0);
      lastProgressRef.current = 0;

      // Unmute audio after a short delay to ensure player is ready
      setTimeout(() => {
        setIsMuted(false);
        // Also force unmute when modal opens or video changes
        forceUnmuteActiveVideo();
      }, 500);
    }
  }, [showVideoModal, currentVideoIndex, forceUnmuteActiveVideo]);

  // Calculate and update video card dimensions based on viewport size
  useEffect(() => {
    const calculateDimensions = () => {
      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // For regular view, use a responsive approach
      // Base height is 60% of viewport height, with min/max constraints
      const regularHeight = Math.max(
        Math.min(Math.floor(viewportHeight * 0.6), 600), // Max 600px
        400 // Min 400px
      );

      // Calculate width based on the aspect ratio of 9:16
      // This maintains the proper video aspect ratio
      const aspectRatio = 9/16; // width:height
      const calculatedWidth = Math.floor(regularHeight * aspectRatio);

      // Apply min/max constraints to width
      const regularWidth = Math.max(
        Math.min(calculatedWidth, 350), // Max 350px
        225 // Min 225px
      );

      // For larger screens, scale up the width more aggressively
      const finalWidth = viewportWidth > 1440 ?
        Math.min(regularWidth * 1.2, 400) : regularWidth;

      // Calculate modal video dimensions
      const modalHeight = Math.floor(viewportHeight * 0.8);
      const modalWidth = Math.floor(modalHeight * aspectRatio);

      // Calculate the offset for arrows in modal view
      // This positions arrows outside the three-card stacker
      // The multiplier adjusts based on screen size to ensure arrows are always outside
      let multiplier = 1.7; // Default multiplier

      // Adjust multiplier based on screen width
      if (viewportWidth < 768) {
        multiplier = 1.5; // Smaller screens need less space
      } else if (viewportWidth > 1440) {
        multiplier = 2.0; // Larger screens need more space
      }

      // Calculate the final offset
      const offset = Math.floor(modalWidth * multiplier / 2);

      // Update state with calculated dimensions
      setVideoCardHeight(regularHeight);
      setVideoCardWidth(finalWidth);
      setModalArrowOffset(offset);
    };

    // Calculate on mount and window resize
    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);

    // Clean up event listener
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  // Throttled onProgress handler
  const handleProgress = useCallback((state) => {
    // Update only if progress increased by more than 0.01
    if (state.played - lastProgressRef.current > 0.01) {
      lastProgressRef.current = state.played;
      setVideoProgress(state.played);
    }
  }, []);

  // Handle video end - auto slide to next video with a slight delay
  const handleVideoEnd = useCallback(() => {
    // Simple delay before going to next video
    setTimeout(() => {
      goToNextVideo();
    }, 300);
  }, [goToNextVideo]);

  // Check if we have products to display
  const hasWatchAndBuyProducts = products && products.length > 0;
  if (!hasWatchAndBuyProducts) return null;

  return (
    <section className="w-full py-6 md:py-12 bg-white">
      <div className="px-2 md:px-8">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">Watch And Buy</h2>
          <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
          <p className="text-gray-600">Explore our curated collection of trending products</p>
        </div>

        {/* Watch and Buy Slider - Both Mobile and Desktop */}
        <div className="w-full mb-4 px-6">
          <div className="relative">

            {/* <button
              onClick={goToPrevSlide}
              className="custom-nav-arrow custom-nav-prev absolute left-2 top-[250px] -translate-y-1/2 z-10"
              aria-label="Previous slide"
            >
              <div className="big-arrow-left">
                <ChevronLeft className="h-7 w-7 text-white" />
              </div>
            </button>

            <button
              onClick={goToNextSlide}
              className="custom-nav-arrow custom-nav-next absolute right-1 top-[250px] -translate-y-1/2 z-10"
              aria-label="Next slide"
            >
              <div className="big-arrow-right">
                <ChevronRight className="h-7 w-7 text-white" />
              </div>
            </button> */}

            <Slider ref={sliderRef} {...sliderSettings} className="watch-buy-slider">
              {products.map((productItem, index) => (
                <div key={productItem._id} className="pb-2 px-1">
                  <div
                    onClick={() => {
                      setSelectedVideo(productItem);
                      setCurrentVideoIndex(index);
                      setShowVideoModal(true);
                    }}
                    className="relative"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                      }}
                      className="relative cursor-pointer shadow-md overflow-hidden watch-buy-mobile-card"
                      style={{
                        aspectRatio: "9/15",
                        background: "#f8f8f8",
                      }}
                    >
                      <FastMovingCard
                        item={productItem}
                        index={index}
                        activeItem={activeItem}
                        handleAddtoCart={handleAddtoCart}
                        isMobileCard={true}
                      />
                    </motion.div>

                    {/* Product info below the card */}
                    <div className="mt-3 px-1">
                      <h3 className="text-lg font-medium line-clamp-2 mb-1">{productItem?.title}</h3>
                      <div className="flex justify-between items-center">
                        <p className="text-md font-semibold">₹{productItem.price}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/shop/details/${productItem._id}`);
                            }}
                            className="w-9 h-9 bg-white border border-gray-300 text-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                            aria-label="View Details"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddtoCart(productItem);
                            }}
                            className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm"
                            aria-label="Add to Cart"
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {/* Custom Dots Indicator - Absolutely positioned at the bottom */}
        <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: products.length }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  // When using dots navigation, go directly to the selected slide
                  if (sliderRef.current) {
                    sliderRef.current.slickGoTo(index);
                  }
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlideIndex ? "bg-black border-2 border-gray-300 scale-125" : "bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
      </div>

      {/* VideoStacker Modal - When a video is clicked */}
      {showVideoModal && selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col modal-view"
          onClick={(e) => e.stopPropagation()}
        >


          {/* VideoStacker UI */}
          <div className="flex-grow flex flex-col items-center justify-center">
            {/* Video Timeline */}
            <div className="z-20 flex justify-center gap-2 py-2">
              <div className="bg-black/30 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 w-auto">
                {products.map((_, index) => (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToVideo(index);
                    }}
                    className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 timeline-dot ${
                      index === currentVideoIndex ? "w-10 bg-white" : "w-5 bg-white/50"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="video-stacker-container relative h-[90vh] w-full max-w-6xl overflow-hidden">
               {/* Modal Header - Only Close Button in Top Right */}
          <div   style={{ right: `calc(50% - ${modalArrowOffset}px - 40px)` }} className="absolute top-0 p-4 flex justify-end items-center z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVideoModal(false);
              }}
              className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
            >
              <X className="h-10 w-10 text-white" stroke="currentColor" />
            </button>
          </div>
              {/* Navigation Arrows */}
              <div
                className="absolute top-1/2 z-30 "
                style={{ left: `calc(50% - ${modalArrowOffset}px - 40px)` }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevVideo();
                  }}
                  className="nav-arrow "
                  aria-label="Previous video"
                >
                  <div className="big-arrow-left">
                    <ChevronLeft className="h-8 w-8   md:w-12 md:h-12 text-white" />
                  </div>
                </button>
              </div>

              <div
                className="absolute top-1/2 z-30  "
                style={{ right: `calc(50% - ${modalArrowOffset}px - 40px)` }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextVideo();
                  }}
                  className="nav-arrow "
                  aria-label="Next video"
                >
                  <div className="big-arrow-right">
                    <ChevronRight className="h-8 w-8 md:w-12 md:h-12 text-white" />
                  </div>
                </button>
              </div>

              {/* Stacked Videos */}
              <div className="video-stack-wrapper relative h-full w-full flex items-center justify-center px-0">
                {products.map((productItem, index) => {
                  // Calculate position: -1 = left, 0 = center, 1 = right
                  let position = 0;
                  if (index === currentVideoIndex) {
                    position = 0;
                  } else if (index === (currentVideoIndex - 1 + products.length) % products.length) {
                    position = -1;
                  } else if (index === (currentVideoIndex + 1) % products.length) {
                    position = 1;
                  } else {
                    return null;
                  }

                  return (
                    <div
                      key={productItem._id}
                      className={`absolute transition-all duration-500 ease-in-out  video-card-container ${
                        position === 0 ? "z-20 scale-100 opacity-100" : "z-10 scale-90 opacity-70"
                      }`}
                      style={{
                        transform: `translateX(${position * 50}%) scale(${position === 0 ? 1 : 0.7})`,
                        filter: position !== 0 ? "brightness(0.7)" : "brightness(1)",
                        opacity: position !== 0 ? 0.8 : 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (position !== 0) {
                          const direction = position === -1 ? "right" : "left";
                          const currentCard = document.querySelector(".video-card-container.z-20");
                          if (currentCard) {
                            currentCard.classList.add(`leaving-${direction}`);
                          }
                          setTimeout(() => {
                            goToVideo(index);
                            setTimeout(() => {
                              const newCards = document.querySelectorAll(".video-card-container");
                              newCards.forEach((card) => {
                                card.classList.remove("leaving-left", "leaving-right");
                                if (card.classList.contains("z-20")) {
                                  card.classList.add("entering");
                                }
                              });
                              setTimeout(() => {
                                newCards.forEach((card) => {
                                  card.classList.remove("entering");
                                });
                              }, 700);
                            }, 100);
                          }, 250);
                        }
                      }}
                    >
                      <div
                        className="video-card relative overflow-hidden shadow-xl"
                        style={
                          showVideoModal
                            ? {
                                width: `${Math.floor(Math.floor(window.innerHeight * 0.87) * (9/16))}px`,
                                height: `${Math.floor(window.innerHeight * 0.85)}px`,
                                marginBottom: "10px",
                                aspectRatio: "9/16"
                              }
                            : {
                                width: `${videoCardWidth}px`,
                                height: `${videoCardHeight}px`,
                                aspectRatio: "9/16"
                              }
                        }
                      >
                        {/* Video Player */}
                        {productItem.videoUrl || productItem.video ? (
                          <div className="w-full h-full">
                            <div className="react-player-container" onContextMenu={(e) => e.preventDefault()}>
                              <VideoPlayer
                                key={`${productItem._id}-${position}-${showVideoModal}`}
                                videoUrl={productItem.videoUrl || productItem.video}
                                className="react-player"
                                style={{ width: "100%", height: "100%" }}
                                isPlaying={position === 0 ? isPlaying : false}
                                isMuted={position === 0 ? isMuted : false}
                                autoplay={position === 0 && showVideoModal}
                                onProgress={position === 0 ? handleProgress : undefined}
                                onEnded={position === 0 ? handleVideoEnd : undefined}
                                onError={(e) => console.log("Video error:", e)}
                              />
                            </div>

                            {/* Video Progress Bar - repositioned below the top at 40px with smoother transition */}
                            {position === 0 && (
                              <div className="absolute top-[0px] left-0 right-0 h-2 bg-black/50 z-[9999]" style={{ width: "100%" }}>
                                <div
                                  className="h-full bg-white transition-all duration-300 ease-out"
                                  style={{ width: `${videoProgress * 100}%` }}
                                ></div>
                              </div>
                            )}

                            {/* Video Controls - redesigned for better clickability */}
                            {position === 0 && (
                              <div className="absolute top-2 right-4 flex gap-4 z-[9999]">
                                <div
                                  className="w-12 h-12 rounded-full bg-black/70 flex items-center justify-center cursor-pointer hover:bg-black/90 transition-all border border-white/30 video-control-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPlaying(!isPlaying);
                                  }}
                                  style={{
                                    width: window.innerWidth >= 2000 ? '60px' : window.innerWidth >= 1440 ? '50px' : '48px',
                                    height: window.innerWidth >= 2000 ? '60px' : window.innerWidth >= 1440 ? '50px' : '48px'
                                  }}
                                >
                                  {isPlaying ? (
                                    <Pause
                                      size={window.innerWidth >= 2000 ? 32 : window.innerWidth >= 1440 ? 28 : 24}
                                      className="text-white w-full h-full p-2"
                                    />
                                  ) : (
                                    <Play
                                      size={window.innerWidth >= 2000 ? 32 : window.innerWidth >= 1440 ? 28 : 24}
                                      className="text-white w-full h-full p-2"
                                    />
                                  )}
                                </div>

                                <div
                                  className="w-12 h-12 rounded-full bg-black/70 flex items-center justify-center cursor-pointer hover:bg-black/90 transition-all border border-white/30 video-control-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Muting/unmuting doesn't affect auto-advance behavior
                                    setIsMuted(!isMuted);
                                  }}
                                  style={{
                                    width: window.innerWidth >= 2000 ? '60px' : window.innerWidth >= 1440 ? '50px' : '48px',
                                    height: window.innerWidth >= 2000 ? '60px' : window.innerWidth >= 1440 ? '50px' : '48px'
                                  }}
                                >
                                  {isMuted ? (
                                    <VolumeX
                                      size={window.innerWidth >= 2000 ? 32 : window.innerWidth >= 1440 ? 28 : 24}
                                      className="text-white w-full h-full p-2"
                                    />
                                  ) : (
                                    <Volume2
                                      size={window.innerWidth >= 2000 ? 32 : window.innerWidth >= 1440 ? 28 : 24}
                                      className="text-white w-full h-full p-2"
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <p className="text-white">Video not available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Product Info and Action Buttons */}
          <div className="absolute bottom-[48px] left-0 right-0 flex justify-center z-40">
          <div className="absolute -bottom-[5px] inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg"></div>
            <div className="relative flex items-center justify-between" style={{ width: `${Math.floor(Math.floor(window.innerHeight * 0.8) * (9/16))}px` }}>

              <div className="text-white p-2 z-10">
                <h3 className="text-lg font-medium truncate product-info-title">{selectedVideo?.title}</h3>
                <p className="text-lg font-bold mt-1 product-info-price">₹{selectedVideo.price}</p>
              </div>
              <div className="flex flex-col gap-2 p-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddtoCart(selectedVideo);
                  }}
                  className="rounded-full bg-black text-white flex items-center justify-center shadow-md hover:bg-black/80 transition-colors border border-white/20 modal-control-button"
                  style={{
                    width: window.innerWidth >= 2000 ? '50px' : window.innerWidth >= 1440 ? '45px' : '40px',
                    height: window.innerWidth >= 2000 ? '50px' : window.innerWidth >= 1440 ? '45px' : '40px'
                  }}
                  aria-label="Add to Cart"
                >
                  <ShoppingBag
                    size={window.innerWidth >= 2000 ? 24 : window.innerWidth >= 1440 ? 20 : 18}
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/shop/details/${selectedVideo._id}`);
                    setShowVideoModal(false);
                  }}
                  className="rounded-full bg-white text-black flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors modal-control-button"
                  style={{
                    width: window.innerWidth >= 2000 ? '50px' : window.innerWidth >= 1440 ? '45px' : '40px',
                    height: window.innerWidth >= 2000 ? '50px' : window.innerWidth >= 1440 ? '45px' : '40px'
                  }}
                  aria-label="View Details"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={window.innerWidth >= 2000 ? "24" : window.innerWidth >= 1440 ? "20" : "18"}
                    height={window.innerWidth >= 2000 ? "24" : window.innerWidth >= 1440 ? "20" : "18"}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent z-30"></div>
        </div>
      )}
    </section>
  );
};

export default WatchAndBuy;
