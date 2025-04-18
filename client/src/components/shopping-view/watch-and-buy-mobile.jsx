import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import ReactPlayer from 'react-player';
import { X, ShoppingBag, Play, Pause, Volume2, VolumeX } from "lucide-react";
import FastMovingCard from "./fast-moving-card";
import "@/styles/watch-and-buy-mobile.css";

const WatchAndBuyMobile = ({ products, handleAddtoCart }) => {
  const navigate = useNavigate();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoContainerRef = useRef(null);
  const progressBarRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle touch events for mobile video swiping
  const handleTouchStart = (e) => {
    if (!isMobile || !showVideoModal) return;

    // Get all the video slides
    const slides = document.querySelectorAll('.mobile-video-slide');
    if (!slides.length) return;

    // Store the starting touch position
    const touchY = e.touches[0].clientY;
    videoContainerRef.current.dataset.touchStartY = touchY;

    // Add a class to indicate active swiping
    videoContainerRef.current.classList.add('active-swiping');
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

    // Calculate the percentage of the swipe (0 to 1)
    const screenHeight = window.innerHeight;
    const swipePercentage = Math.min(Math.abs(diff) / (screenHeight * 0.3), 1);

    // Apply transforms based on swipe direction and percentage
    if (direction === 'up') {
      activeSlide.style.transform = `translateY(${-swipePercentage * 100}%)`;
      targetSlide.style.transform = `translateY(${(100 + 20/screenHeight*100) - swipePercentage * (100 + 20/screenHeight*100)}%)`;
    } else {
      activeSlide.style.transform = `translateY(${swipePercentage * 100}%)`;
      targetSlide.style.transform = `translateY(${-(100 + 20/screenHeight*100) + swipePercentage * (100 + 20/screenHeight*100)}%)`;
    }
  };

  const handleTouchEnd = (e) => {
    if (!isMobile || !showVideoModal) return;

    // Remove active swiping class
    videoContainerRef.current.classList.remove('active-swiping');

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

    // Determine if the swipe was far enough to change slides
    const threshold = window.innerHeight * 0.15;
    const shouldChangeSlide = Math.abs(diff) > threshold;

    // Add transition class for smooth animation
    activeSlide.classList.add('manual-transition');
    targetSlide.classList.add('manual-transition');

    if (shouldChangeSlide) {
      // Complete the transition
      if (direction === 'up') {
        // Move to next slide
        activeSlide.style.transform = 'translateY(-100%)';
        targetSlide.style.transform = 'translateY(0)';

        // After animation completes, update the current index
        setTimeout(() => {
          const newIndex = (currentVideoIndex + 1) % products.length;
          setCurrentVideoIndex(newIndex);
          setSelectedVideo(products[newIndex]);

          // Reset all slides
          slides.forEach(slide => {
            slide.classList.remove('manual-transition');
            slide.style.transform = '';
          });
        }, 300);
      } else {
        // Move to previous slide
        activeSlide.style.transform = 'translateY(100%)';
        targetSlide.style.transform = 'translateY(0)';

        // After animation completes, update the current index
        setTimeout(() => {
          const newIndex = currentVideoIndex === 0 ? products.length - 1 : currentVideoIndex - 1;
          setCurrentVideoIndex(newIndex);
          setSelectedVideo(products[newIndex]);

          // Reset all slides
          slides.forEach(slide => {
            slide.classList.remove('manual-transition');
            slide.style.transform = '';
          });
        }, 300);
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
          slide.classList.remove('manual-transition');
          slide.style.transform = '';
        });
      }, 300);
    }
  };

  // Settings for the slider
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  };

  // Reset video state when modal opens or video changes
  useEffect(() => {
    if (showVideoModal) {
      setIsPlaying(true);
      setIsMuted(false);
      setVideoProgress(0);
    }
  }, [showVideoModal, currentVideoIndex]);

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

        {/* Watch and Buy Slider - Both Mobile and Desktop */}
        <div className="w-full mb-4 px-1">
          <div>
            <Slider {...sliderSettings} className="watch-buy-slider mobile-watch-buy-slider">
              {products.map((productItem, index) => (
                <div key={productItem._id} className="pb-2">
                  <div
                    onClick={() => {
                      setSelectedVideo(productItem);
                      setCurrentVideoIndex(index);
                      setShowVideoModal(true);
                    }}
                    className="relative"
                  >
                    <div
                      className="relative cursor-pointer shadow-md overflow-hidden watch-buy-mobile-card"
                      style={{
                        aspectRatio: "8/16",
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
                    <div className="mt-2 px-0">
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
                </div>
              ))}
            </Slider>
          </div>
        </div>
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
              ref={progressBarRef}
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${videoProgress * 100}%` }}
            ></div>
          </div>

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
                  // For mobile: Only show current, previous, and next videos
                  if (index !== currentVideoIndex &&
                      index !== (currentVideoIndex + 1) % products.length &&
                      index !== (currentVideoIndex - 1 + products.length) % products.length) {
                    return null; // Don't render videos that aren't visible in the carousel
                  }

                  return (
                    <div
                      key={productItem._id}
                      className={`mobile-video-slide ${
                         index === currentVideoIndex ? 'active' :
                         index === (currentVideoIndex + 1) % products.length ? 'next' :
                         index === (currentVideoIndex - 1 + products.length) % products.length ? 'prev' : ''
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
                              <ReactPlayer
                                url={productItem.videoUrl || productItem.video}
                                className="react-player"
                                width="100%"
                                height="100%"
                                playing={index === currentVideoIndex ? isPlaying : false}
                                loop
                                muted={isMuted}
                                controls={false}
                                playsinline
                                onProgress={(state) => index === currentVideoIndex && setVideoProgress(state.played)}
                                config={{
                                  file: {
                                    attributes: {
                                      controlsList: 'nodownload',
                                      disablePictureInPicture: true,
                                      disableRemotePlayback: true,
                                      onContextMenu: "return false;"
                                    }
                                  }
                                }}
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
