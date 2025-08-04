import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingBag, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FastMovingCard from "./fast-moving-card";
import "@/styles/watch-and-buy-mobile.css";

// Cloudinary Video Player Component for Mobile
function VideoPlayer({ videoUrl, isPlaying, isMuted, onProgress, onEnded, onError, className, style }) {
  const videoRef = useRef();
  const playerInstanceRef = useRef();
  const containerRef = useRef();
  const [isCloudinaryLoaded, setIsCloudinaryLoaded] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isVideoSourceLoaded, setIsVideoSourceLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

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
    if (!isCloudinaryLoaded || playerInstanceRef.current || !videoRef.current || !videoUrl) return;

    try {
      // Create a timeout to ensure DOM is ready
      const initTimeout = setTimeout(() => {
        if (!videoRef.current || playerInstanceRef.current) {
          console.warn('Video element not available or player already initialized');
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
          autoplay: false, // Never autoplay during initialization
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
            setHasVideoError(true);
            if (onError) onError(error);
          });

          playerInstanceRef.current.on('loadedmetadata', () => {
            console.log('Video metadata loaded for:', extractPublicId(videoUrl));
            setIsPlayerReady(true);
            setIsVideoSourceLoaded(true);
          });

          playerInstanceRef.current.on('loadeddata', () => {
            console.log('Video data loaded for:', extractPublicId(videoUrl));
            setIsVideoSourceLoaded(true);
          });

          playerInstanceRef.current.on('canplay', () => {
            console.log('Video can play for:', extractPublicId(videoUrl));
            setIsPlayerReady(true);
            setIsVideoSourceLoaded(true);
          });

          playerInstanceRef.current.on('ready', () => {
            // console.log('Cloudinary player ready for:', extractPublicId(videoUrl));
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
              } catch (sourceError) {
                console.error('Error setting video source on ready:', sourceError);
                setHasVideoError(true);
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
  }, [isCloudinaryLoaded, videoUrl]);

  // Handle play/pause with improved logic
  useEffect(() => {
    if (playerInstanceRef.current && isPlayerReady && isVideoSourceLoaded) {
      try {
        if (isPlaying) {
          console.log('Playing video:', extractPublicId(videoUrl));
          // Add a small delay to ensure the video is fully ready
          setTimeout(() => {
            if (playerInstanceRef.current) {
              const playPromise = playerInstanceRef.current.play();
              if (playPromise !== undefined) {
                playPromise.catch(error => {
                  console.warn('Play failed:', error);
                  // Try again after a short delay
                  setTimeout(() => {
                    if (playerInstanceRef.current) {
                      playerInstanceRef.current.play().catch(e => console.warn('Retry play failed:', e));
                    }
                  }, 100);
                });
              }
            }
          }, 50);
        } else {
          console.log('Pausing video:', extractPublicId(videoUrl));
          playerInstanceRef.current.pause();
        }
      } catch (error) {
        console.error('Error controlling playback:', error);
      }
    }
  }, [isPlaying, isPlayerReady, isVideoSourceLoaded, videoUrl]);

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
    if (playerInstanceRef.current && videoUrl && isPlayerReady) {
      try {
        const publicId = extractPublicId(videoUrl);
        console.log('Changing video source to:', publicId);

        // Reset states before changing source
        setIsVideoSourceLoaded(false);
        setHasVideoError(false);

        playerInstanceRef.current.source(publicId, {
          transformation: {
            quality: 'auto',
            fetch_format: 'auto'
          }
        });

        // Reset progress when video source changes
        if (onProgress) {
          onProgress({ played: 0 });
        }
      } catch (error) {
        console.error('Error setting video source:', error);
        setHasVideoError(true);
        if (onError) onError(error);
      }
    }
  }, [videoUrl, isPlayerReady]);

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
      {!isVideoSourceLoaded && !hasVideoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <div className="text-white text-sm">Loading video...</div>
          </div>
        </div>
      )}
      {hasVideoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-sm">Unable to load video</div>
        </div>
      )}
    </div>
  );
}

const WatchAndBuyMobile = ({ products, handleAddtoCart }) => {
  const navigate = useNavigate();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for previous
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState({});
  const videoContainerRef = useRef(null);
  const progressBarRef = useRef(null);
  const sliderRef = useRef(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Touch event states for custom slider
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [touchEndY, setTouchEndY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef(null);
  const autoPlayIntervalRef = useRef(null);

  // Function to pause all videos except the active one
  const pauseAllVideosExceptActive = useCallback(() => {
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach((video, index) => {
      const videoContainer = video.closest('.mobile-video-slide');
      const isActiveVideo = videoContainer && videoContainer.classList.contains('active');

      if (!isActiveVideo) {
        // Pause non-active videos
        if (video.cloudinaryPlayer) {
          try {
            video.cloudinaryPlayer.pause();
            console.log(`Paused non-active video ${index} via cloudinaryPlayer`);
          } catch (error) {
            console.warn(`Error pausing video ${index}:`, error);
          }
        } else {
          video.pause();
          console.log(`Paused non-active video ${index} via HTML5`);
        }
      }
    });
  }, []);

  // Function to force unmute the active video player
  const forceUnmuteActiveVideo = useCallback(() => {
    // Multiple strategies to find and unmute the active video
    setTimeout(() => {
      console.log('Attempting to force unmute active mobile video...');

      // First pause all non-active videos
      pauseAllVideosExceptActive();

      // Strategy 1: Find by active class
      let activeVideoElements = document.querySelectorAll('.mobile-video-slide.active video');
      console.log('Found active mobile videos:', activeVideoElements.length);

      // Strategy 2: Find all videos in modal
      if (activeVideoElements.length === 0) {
        activeVideoElements = document.querySelectorAll('.fast-moving-video-modal video');
        console.log('Found videos in mobile modal:', activeVideoElements.length);
      }

      // Strategy 3: Find all videos
      if (activeVideoElements.length === 0) {
        activeVideoElements = document.querySelectorAll('video');
        console.log('Found all videos:', activeVideoElements.length);
      }

      activeVideoElements.forEach((video, index) => {
        console.log(`Processing mobile video ${index}:`, video);

        // Try cloudinaryPlayer reference
        if (video && video.cloudinaryPlayer) {
          try {
            video.cloudinaryPlayer.unmute();
            console.log(`Successfully unmuted mobile video ${index} via cloudinaryPlayer`);
          } catch (error) {
            console.warn(`Error unmuting mobile video ${index} via cloudinaryPlayer:`, error);
          }
        }

        // Also try direct video element unmute
        if (video) {
          try {
            video.muted = false;
            console.log(`Set mobile video ${index} muted property to false`);
          } catch (error) {
            console.warn(`Error setting muted property on mobile video ${index}:`, error);
          }
        }
      });

      // Also ensure React state is updated
      setIsMuted(false);
      console.log('Set React isMuted state to false for mobile');
    }, 300); // Increased delay to ensure transitions are complete
  }, [pauseAllVideosExceptActive]);

  // Reset progress for specific video (mobile behavior - start from beginning)
  const resetVideoProgress = useCallback((videoIndex) => {
    setVideoProgress(prev => ({
      ...prev,
      [videoIndex]: 0
    }));
  }, []);

  // Function to go to the next video (infinite loop)
  const goToNextVideo = useCallback(() => {
    const newIndex = (currentVideoIndex + 1) % products.length;
    // Reset progress for the new video (mobile behavior - start from beginning)
    resetVideoProgress(newIndex);
    setCurrentVideoIndex(newIndex);
    setSelectedVideo(products[newIndex]);
    // Ensure audio continues playing for the new video
    setIsMuted(false);
    // Force unmute the active video player
    forceUnmuteActiveVideo();
  }, [currentVideoIndex, products, forceUnmuteActiveVideo, resetVideoProgress]);

  // Handle video end - auto slide to next video with a slight delay
  const handleVideoEnd = useCallback(() => {
    // Smooth delay before going to next video
    setTimeout(() => {
      goToNextVideo();
    }, 800);
  }, [goToNextVideo]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Responsive items per slide: 2 for mobile, 5 for desktop
  const getSlidesPerView = () => {
    if (typeof window === 'undefined') return 2;
    const width = window.innerWidth;
    if (width >= 1280) return 5;
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    return 2;
  };

  // Calculate total number of slides available
  const getTotalSlides = useCallback(() => {
    const itemsPerSlide = getSlidesPerView();
    return Math.ceil((products?.length || 0) / itemsPerSlide);
  }, [products?.length]);

  // Get products for the current slide
  const getCurrentSlideProducts = useCallback(() => {
    if (!products || !products.length) return [];
    const itemsPerSlide = getSlidesPerView();
    const startIdx = currentSlideIndex * itemsPerSlide;
    return products.slice(startIdx, startIdx + itemsPerSlide);
  }, [currentSlideIndex, products]);

  // Function to advance to the next slide
  const nextSlide = useCallback(() => {
    const totalSlides = getTotalSlides();
    setDirection(1);
    setCurrentSlideIndex((prevIndex) => {
      const next = prevIndex >= totalSlides - 1 ? 0 : prevIndex + 1;
      console.log(`Moving from slide ${prevIndex} to ${next} (total: ${totalSlides})`);
      return next;
    });
  }, [getTotalSlides]);

  // Function to go to the previous slide
  const prevSlide = useCallback(() => {
    const totalSlides = getTotalSlides();
    setDirection(-1);
    setCurrentSlideIndex((prevIndex) => {
      const previous = prevIndex <= 0 ? totalSlides - 1 : prevIndex - 1;
      console.log(`Moving from slide ${prevIndex} to ${previous} (total: ${totalSlides})`);
      return previous;
    });
  }, [getTotalSlides]);

  const goToSlide = useCallback((index) => {
    // Set direction based on relative index
    setDirection(index > currentSlideIndex ? 1 : -1);
    setCurrentSlideIndex(index);
    console.log(`Going to slide ${index}`);
  }, [currentSlideIndex]);

  // Initialize slider
  useEffect(() => {
    if (products.length > 0) {
      setCurrentSlideIndex(0); // Always start at the beginning
      console.log(`Initialized slider with ${products.length} products`);
    }
  }, [products.length]);

  // Auto-play functionality with longer delay
  useEffect(() => {
    if (isAutoPlaying && !isDragging && products.length > 0) {
      autoPlayIntervalRef.current = setInterval(() => {
        console.log('Auto-play: moving to next slide');
        nextSlide();
      }, 8000); // Increased from 4000ms to 8000ms (8 seconds)
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isAutoPlaying, isDragging, nextSlide, products.length]);

  // Touch handlers for custom slider
  const handleTouchStartSlider = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
    setIsAutoPlaying(false);
  }, []);

  const handleTouchMoveSlider = useCallback((e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = touchStartX - currentX;
    setDragOffset(-diff);
  }, [isDragging, touchStartX]);

  const handleTouchEndSlider = useCallback((e) => {
    if (!isDragging) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    setTouchEndX(touchEndX);
    setTouchEndY(touchEndY);
    
    const horizontalDiff = touchStartX - touchEndX;
    const verticalDiff = touchStartY - touchEndY;
    const threshold = 50; // Minimum swipe distance
    
    // Only trigger slide if horizontal movement is greater than vertical movement
    if (Math.abs(horizontalDiff) > Math.abs(verticalDiff) && Math.abs(horizontalDiff) > threshold) {
      if (horizontalDiff > 0) {
        nextSlide(); // Swipe left - next slide
      } else {
        prevSlide(); // Swipe right - previous slide
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
    
    // Resume autoplay after touch interaction
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 5000);
  }, [isDragging, touchStartX, touchStartY, nextSlide, prevSlide]);

  // Mouse handlers for desktop dragging
  const handleMouseDown = useCallback((e) => {
    setTouchStartX(e.clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diff = touchStartX - currentX;
    setDragOffset(-diff);
  }, [isDragging, touchStartX]);

  const handleMouseUp = useCallback((e) => {
    if (!isDragging) return;
    
    const mouseEnd = e.clientX;
    const diff = touchStartX - mouseEnd;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
    
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 5000);
  }, [isDragging, touchStartX, nextSlide, prevSlide]);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);





  // Effect to manage video playback when currentVideoIndex changes
  useEffect(() => {
    if (showVideoModal) {
      // Small delay to ensure DOM is updated and transitions are complete
      setTimeout(() => {
        pauseAllVideosExceptActive();
        // Force play the new active video after transition
        setTimeout(() => {
          setIsPlaying(true);
        }, 100);
      }, 200);
    }
  }, [currentVideoIndex, showVideoModal, pauseAllVideosExceptActive]);

  // Handle touch events for mobile video swiping
  const handleTouchStart = (e) => {
    if (!isMobile || !showVideoModal) return;

    // Get all the video slides
    const slides = document.querySelectorAll('.mobile-video-slide');
    if (!slides.length) return;

    // Store the starting touch position and timestamp for velocity calculation
    const touchY = e.touches[0].clientY;
    const touchTime = Date.now();
    videoContainerRef.current.dataset.touchStartY = touchY;
    videoContainerRef.current.dataset.touchStartTime = touchTime;

    // Add a class to indicate active swiping
    videoContainerRef.current.classList.add('active-swiping');
    const stackerContainer = videoContainerRef.current.querySelector('.video-stacker-container');
    if (stackerContainer) {
      stackerContainer.classList.add('active-swiping');
    }

    // Temporarily pause video during swipe for better performance
    setIsPlaying(false);
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !showVideoModal) return;
    // Removed e.preventDefault() as we're using touchAction: 'none' instead

    const slides = document.querySelectorAll('.mobile-video-slide');
    if (!slides.length) return;

    // Calculate how far we've swiped
    const touchStartY = parseFloat(videoContainerRef.current.dataset.touchStartY);
    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY;

    // Find the active slide and the target slide (next or previous)
    let activeSlide = null;
    let targetSlide = null;

    slides.forEach(slide => {
      if (slide.classList.contains('active')) {
        activeSlide = slide;
      }
    });

    if (!activeSlide) return;

    // Determine swipe direction
    const direction = diff > 0 ? 'up' : 'down';

    // Find the target slide based on direction
    if (direction === 'up') {
      slides.forEach(slide => {
        if (slide.classList.contains('next')) {
          targetSlide = slide;
        }
      });
    } else {
      slides.forEach(slide => {
        if (slide.classList.contains('prev')) {
          targetSlide = slide;
        }
      });
    }

    if (!targetSlide) return;

    // Calculate the percentage of the swipe with damping for smoother feel
    const screenHeight = window.innerHeight;
    const rawSwipePercentage = Math.abs(diff) / (screenHeight * 0.4); // Increased threshold for less sensitivity
    
    // Apply easing to the swipe percentage for more natural feel
    const swipePercentage = Math.min(rawSwipePercentage * (2 - rawSwipePercentage), 1); // Ease-out curve
    
    // Apply transforms based on swipe direction and percentage with smoother interpolation
    if (direction === 'up') {
      const activeTransform = -swipePercentage * 100;
      const targetTransform = 100 - (swipePercentage * 100);
      
      activeSlide.style.transform = `translateY(${activeTransform}%)`;
      targetSlide.style.transform = `translateY(${targetTransform}%)`;
    } else {
      const activeTransform = swipePercentage * 100;
      const targetTransform = -100 + (swipePercentage * 100);
      
      activeSlide.style.transform = `translateY(${activeTransform}%)`;
      targetSlide.style.transform = `translateY(${targetTransform}%)`;
    }
  };

  const handleTouchEnd = (e) => {
    if (!isMobile || !showVideoModal) return;

    // Remove active swiping class
    videoContainerRef.current.classList.remove('active-swiping');
    const stackerContainer = videoContainerRef.current.querySelector('.video-stacker-container');
    if (stackerContainer) {
      stackerContainer.classList.remove('active-swiping');
    }

    const slides = document.querySelectorAll('.mobile-video-slide');
    if (!slides.length) return;

    // Calculate how far we've swiped
    const touchStartY = parseFloat(videoContainerRef.current.dataset.touchStartY);
    const touchY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchY;

    // Find the active slide and the target slide (next or previous)
    let activeSlide = null;
    let targetSlide = null;

    slides.forEach(slide => {
      if (slide.classList.contains('active')) {
        activeSlide = slide;
      }
    });

    if (!activeSlide) return;

    // Determine swipe direction
    const direction = diff > 0 ? 'up' : 'down';

    // Find the target slide based on direction
    if (direction === 'up') {
      slides.forEach(slide => {
        if (slide.classList.contains('next')) {
          targetSlide = slide;
        }
      });
    } else {
      slides.forEach(slide => {
        if (slide.classList.contains('prev')) {
          targetSlide = slide;
        }
      });
    }

    if (!targetSlide) return;

    // Calculate velocity for better swipe detection
    const touchStartTime = parseFloat(videoContainerRef.current.dataset.touchStartTime);
    const touchEndTime = Date.now();
    const timeDiff = touchEndTime - touchStartTime;
    const velocity = Math.abs(diff) / Math.max(timeDiff, 1); // pixels per ms
    
    // Determine if the swipe was far enough to change slides with velocity consideration
    const threshold = window.innerHeight * 0.25; // Threshold for distance-based swipe
    const velocityThreshold = 0.5; // pixels per ms for velocity-based swipe
    const shouldChangeSlide = Math.abs(diff) > threshold || velocity > velocityThreshold;

    // Add smooth completion transition class
    activeSlide.classList.add('completing-swipe');
    targetSlide.classList.add('completing-swipe');

    if (shouldChangeSlide) {
      // Complete the transition
      if (direction === 'up') {
        // Move to next slide
        activeSlide.style.transform = 'translateY(-100%)';
        targetSlide.style.transform = 'translateY(0)';

        // After animation completes, update the current index
        setTimeout(() => {
          const newIndex = (currentVideoIndex + 1) % products.length;
          // Reset progress for the new video (mobile behavior - start from beginning)
          resetVideoProgress(newIndex);
          setCurrentVideoIndex(newIndex);
          setSelectedVideo(products[newIndex]);
          // Ensure audio continues playing for the new video
          setIsMuted(false);
          // Force unmute the active video player
          forceUnmuteActiveVideo();

          // Reset all slides
          slides.forEach(slide => {
            slide.classList.remove('completing-swipe');
            slide.style.transform = '';
          });
          
          // Resume video playback
          setIsPlaying(true);
        }, 800);
      } else {
        // Move to previous slide
        activeSlide.style.transform = 'translateY(100%)';
        targetSlide.style.transform = 'translateY(0)';

        // After animation completes, update the current index
        setTimeout(() => {
          const newIndex = currentVideoIndex === 0 ? products.length - 1 : currentVideoIndex - 1;
          // Reset progress for the new video (mobile behavior - start from beginning)
          resetVideoProgress(newIndex);
          setCurrentVideoIndex(newIndex);
          setSelectedVideo(products[newIndex]);
          // Ensure audio continues playing for the new video
          setIsMuted(false);
          // Force unmute the active video player
          forceUnmuteActiveVideo();

          // Reset all slides
          slides.forEach(slide => {
            slide.classList.remove('completing-swipe');
            slide.style.transform = '';
          });
          
          // Resume video playback
          setIsPlaying(true);
        }, 800);
      }
    } else {
      // Return to original positions
      activeSlide.style.transform = 'translateY(0)';
      if (direction === 'up') {
        targetSlide.style.transform = 'translateY(100%)';
      } else {
        targetSlide.style.transform = 'translateY(-100%)';
      }

      // After animation completes, remove transition class
      setTimeout(() => {
        slides.forEach(slide => {
          slide.classList.remove('completing-swipe');
          slide.style.transform = '';
        });
        
        // Resume video playback
        setIsPlaying(true);
      }, 800);
    }
  };



  // Reset video state when modal opens or video changes
  useEffect(() => {
    if (showVideoModal) {
      setIsPlaying(true);
      setIsMuted(false);

      // Pause all videos first
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach(video => {
        if (video.cloudinaryPlayer) {
          try {
            video.cloudinaryPlayer.pause();
          } catch (error) {
            console.warn('Error pausing video:', error);
          }
        } else {
          video.pause();
        }
      });

      // Force unmute when modal opens or video changes
      setTimeout(() => {
        forceUnmuteActiveVideo();
      }, 300);
    }
  }, [showVideoModal, currentVideoIndex, forceUnmuteActiveVideo]);

  // Get current video progress
  const getCurrentVideoProgress = () => {
    return videoProgress[currentVideoIndex] || 0;
  };

  // Update progress for specific video
  const updateVideoProgress = (videoIndex, progress) => {
    setVideoProgress(prev => ({
      ...prev,
      [videoIndex]: progress
    }));
  };

  // Check if we have products to display
  const hasWatchAndBuyProducts = products && products.length > 0;

  if (!hasWatchAndBuyProducts) return null;

  return (
    <section className="py-6 md:py-12 bg-white">
      <div className="container mx-auto px-2">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">Watch And Buy</h2>
          <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
          <p className="text-gray-600">Explore our curated collection of trending products</p>
        </div>

        {/* Custom Watch and Buy Slider */}
        <div className="relative w-full mb-4">
          {/* Slider Container */}
          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            ref={containerRef}
            onTouchStart={handleTouchStartSlider}
            onTouchMove={handleTouchMoveSlider}
            onTouchEnd={handleTouchEndSlider}
            onMouseDown={handleMouseDown}
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, x: direction * 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 100 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex"
                style={{ width: "100%", touchAction: "pan-y", gap: "12px" }}
              >
                {getCurrentSlideProducts()?.map((productItem, index) => (
                  <motion.div
                    key={productItem._id}
                    initial={{ opacity: 0, x: direction * 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                    className="flex-shrink-0"
                    style={{ 
                      width: `calc((100% - ${(getCurrentSlideProducts().length - 1) * 12}px) / ${getCurrentSlideProducts().length})`
                    }}
                  >
                    <div
                      onClick={() => {
                        if (!isDragging) {
                          setSelectedVideo(productItem);
                          setCurrentVideoIndex(index);
                          setShowVideoModal(true);
                          setIsPlaying(true);
                        }
                      }}
                      className="relative w-full"
                    >
                      <div
                        className="relative cursor-pointer shadow-md overflow-hidden watch-buy-mobile-card rounded-lg w-full"
                        style={{
                          aspectRatio: "9/16",
                          background: "#f8f8f8",
                        }}
                      >
                        {/* Video thumbnail with play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="w-12 h-12 rounded-full bg-white bg-opacity-70 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-black border-b-[8px] border-b-transparent ml-1"></div>
                          </div>
                        </div>

                        <FastMovingCard
                          item={productItem}
                          index={index}
                          activeItem={0}
                          handleAddtoCart={handleAddtoCart}
                          isMobileCard={true}
                        />
                      </div>

                      {/* Product info below the card */}
                      <div className="mt-2">
                        <h3 className="text-sm font-medium line-clamp-1 mb-1">{productItem?.title}</h3>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold">₹{productItem.price}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/shop/details/${productItem._id}`);
                              }}
                              className="w-8 h-8 bg-white border border-gray-300 text-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
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
                              className="text-xs bg-black text-white p-1.5 rounded-full"
                              aria-label="Add to Cart"
                            >
                              <ShoppingBag className="h-4 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Custom Dots Indicator */}
        {getTotalSlides() > 1 && (
          <div className="custom-dots">
            {Array.from({ length: getTotalSlides() }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  goToSlide(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 5000);
                }}
                className={`custom-dot ${index === currentSlideIndex ? 'active' : ''}`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        )}
      </div>

      {/* VideoStacker Modal - When a video is clicked */}
      {showVideoModal && selectedVideo && (
        <div
          className="fixed inset-0 bg-black z-50 flex flex-col"
          onClick={() => setShowVideoModal(false)}
        >
          {/* Semi-transparent overlay at the top for better control visibility */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-40 pointer-events-none"></div>

          {/* Removed bottom overlay as it's now part of the product info section */}

          {/* Modal Header - Controls in Top Right */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVideoModal(false);
              }}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5 text-white" stroke="currentColor" />
            </button>

            {/* Video Controls in Top Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-white" />
                ) : (
                  <Play className="h-5 w-5 text-white ml-0.5" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Video Progress Bar at the top */}
          <div className="absolute top-0 left-0 right-0 z-40 h-1 bg-white/20">
            <div
              key={`progress-${currentVideoIndex}`}
              ref={progressBarRef}
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${getCurrentVideoProgress() * 100}%` }}
              title={`Progress: ${Math.round(getCurrentVideoProgress() * 100)}%`}
            ></div>
          </div>
          {/* Debug info */}
          {/* <div className="absolute top-2 left-2 z-50 text-white text-xs bg-black/50 px-2 py-1 rounded">
            Progress: {Math.round(videoProgress * 100)}%
          </div> */}

          {/* VideoStacker UI - Full Height */}
          <div
            className="h-full w-full video-stacker-wrapper"
            ref={videoContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none', height: '100vh', maxHeight: '-webkit-fill-available' }} /* This prevents browser default touch actions */
          >
            <div className="video-stacker-container relative h-full w-full overflow-hidden">
              {/* Stacked Videos */}
              <div className="video-stack-wrapper relative h-full w-full flex flex-col">
                {products.map((productItem, index) => {
                  // For mobile: Only render the current video to prevent multiple videos playing
                  const isCurrentVideo = index === currentVideoIndex;
                  const isNextVideo = index === (currentVideoIndex + 1) % products.length;
                  const isPrevVideo = index === (currentVideoIndex - 1 + products.length) % products.length;

                  if (!isCurrentVideo && !isNextVideo && !isPrevVideo) {
                    return null; // Don't render videos that aren't visible in the carousel
                  }

                  return (
                    <div
                      key={`${productItem._id}-${currentVideoIndex}`} // Include currentVideoIndex to force re-render
                      className={`mobile-video-slide ${
                         isCurrentVideo ? 'active' :
                         isNextVideo ? 'next' :
                         isPrevVideo ? 'prev' : ''
                        }`}
                    >
                      <div
                        className="video-card relative overflow-hidden mobile-video-card"
                        style={{ width: '100vw', height: '100vh', maxHeight: '-webkit-fill-available' }}
                      >
                        {/* Video Player - Full Height */}
                        {productItem.videoUrl || productItem.video ? (
                          <div className="w-full h-full">
                            <div
                              className="react-player-container h-full w-full"
                              onContextMenu={(e) => e.preventDefault()}
                            >
                              <VideoPlayer
                                key={`video-${productItem._id}-${index}-${currentVideoIndex}-${showVideoModal}`}
                                videoUrl={productItem.videoUrl || productItem.video}
                                className="react-player"
                                style={{ width: "100%", height: "100%" }}
                                isPlaying={isCurrentVideo && isPlaying && showVideoModal}
                                isMuted={isMuted}
                                onProgress={(state) => {
                                  // Only update progress for the currently active video
                                  if (isCurrentVideo && state.played >= 0) {
                                    updateVideoProgress(index, state.played);
                                  }
                                }}
                                onEnded={isCurrentVideo ? handleVideoEnd : undefined}
                                onError={(e) => console.log("Video error:", e)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <p className="text-white">Video not available</p>
                          </div>
                        )}

                        {/* Product Info Overlay - Improved positioning and visibility */}
                        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 z-40 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-16">
                          <div className="flex flex-col text-white">
                            <h3 className="text-xl font-medium truncate text-white drop-shadow-md">{productItem?.title}</h3>
                            <p className="text-xl font-bold mt-2 text-white drop-shadow-md">₹{productItem.price}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Global Floating Action Buttons */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddtoCart(selectedVideo);
              }}
              className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-xl hover:bg-black/80 transition-colors border border-white/20"
              aria-label="Add to Cart"
            >
              <ShoppingBag className="h-5 w-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/shop/details/${selectedVideo._id}`);
                setShowVideoModal(false);
              }}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:bg-gray-100 transition-colors"
              aria-label="View Details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default WatchAndBuyMobile;
