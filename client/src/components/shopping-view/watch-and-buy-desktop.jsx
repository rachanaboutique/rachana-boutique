import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import ReactPlayer from 'react-player';
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, ShoppingBag } from "lucide-react";
import FastMovingCard from "./fast-moving-card";

const WatchAndBuy = ({ products, handleAddtoCart }) => {
  const navigate = useNavigate();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  // Removed unused state: previousVideoIndex
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeItem] = useState(0);



  // Settings for the slider
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    adaptiveHeight: true,
    centerMode: false,
    swipeToSlide: true,
    variableWidth: false,
    draggable: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          dots: true,
          centerMode: false,
          infinite: true,
        }
      }
    ]
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
        <div className="w-full mb-4 -px-5">
          <div>
            <Slider {...sliderSettings} className="watch-buy-slider">
              {products.map((productItem, index) => (
                <div key={productItem._id} className="pb-2 px-[2px]">
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
                        aspectRatio: "9/14",
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
                      <h3 className="text-base font-medium line-clamp-1 mb-2">{productItem?.title}</h3>
                      <div className="flex justify-between items-center">
                        <p className="text-base font-bold">₹{productItem.price}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/shop/details/${productItem._id}`);
                            }}
                            className="w-9 h-9 bg-white border border-gray-300 text-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                            aria-label="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
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
      </div>


      {/* VideoStacker Modal - When a video is clicked */}
      {showVideoModal && selectedVideo && (
        <div
          className="fixed inset-0 bg-black z-50 flex flex-col modal-view"
          onClick={(e) => e.stopPropagation()} /* Prevent closing when clicking outside */
        >
          {/* Modal Header - Only Close Button in Top Right */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-end items-center z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVideoModal(false);
              }}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
            >
              <X className="h-5 w-5 text-white" stroke="currentColor" />
            </button>
          </div>

          {/* VideoStacker UI */}
          <div className="flex-grow flex flex-col items-center justify-center">
            {/* Video Timeline at Top - Outside the video */}
            <div className="z-20 flex justify-center gap-2 py-2">
              <div className="bg-black/30 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 w-auto">
                {products.map((_, index) => (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentVideoIndex(index);
                      setSelectedVideo(products[index]);
                    }}
                    className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 timeline-dot ${index === currentVideoIndex ? 'w-10 bg-white' : 'w-5 bg-white/50'}`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="video-stacker-container relative h-[90vh] w-full max-w-6xl overflow-hidden">
              {/* Navigation Arrows */}
              <div className="absolute top-1/2 left-4 z-30 transform -translate-y-1/2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = currentVideoIndex === 0 ?
                      products.length - 1 : currentVideoIndex - 1;
                    setCurrentVideoIndex(newIndex);
                    setSelectedVideo(products[newIndex]);
                  }}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full p-2 transition-all duration-300 nav-arrow"
                  aria-label="Previous video"
                >
                  <ChevronLeft className="h-8 w-8 text-white" />
                </button>
              </div>

              <div className="absolute top-1/2 right-4 z-30 transform -translate-y-1/2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = (currentVideoIndex + 1) % products.length;
                    setCurrentVideoIndex(newIndex);
                    setSelectedVideo(products[newIndex]);
                  }}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full p-2 transition-all duration-300 nav-arrow"
                  aria-label="Next video"
                >
                  <ChevronRight className="h-8 w-8 text-white" />
                </button>
              </div>

              {/* Stacked Videos */}
              <div className="video-stack-wrapper relative h-full w-full flex items-center justify-center px-0">
                {products.map((productItem, index) => {
                  // Calculate position: -1 = left, 0 = center, 1 = right
                  let position = 0;

                  if (index === currentVideoIndex) {
                    position = 0; // center
                  } else if (
                    index === (currentVideoIndex - 1 + products.length) % products.length
                  ) {
                    position = -1; // left
                  } else if (index === (currentVideoIndex + 1) % products.length) {
                    position = 1; // right
                  } else {
                    return null; // Don't render other videos
                  }

                  return (
                    <div
                      key={productItem._id}
                      className={`absolute transition-all duration-500 ease-in-out cursor-pointer video-card-container ${position === 0 ? 'z-20 scale-100 opacity-100' : 'z-10 scale-90 opacity-70'}`}
                      style={{
                        transform: `translateX(${position * 50}%) scale(${position === 0 ? 1 : 0.9})`,
                        filter: position !== 0 ? 'brightness(0.8)' : 'brightness(1)',
                        opacity: position !== 0 ? 0.8 : 1
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (position !== 0) {
                          // Determine direction of transition
                          const direction = position === -1 ? 'right' : 'left';

                          // Add leaving class to current card
                          const currentCard = document.querySelector('.video-card-container.z-20');
                          if (currentCard) {
                            currentCard.classList.add(`leaving-${direction}`);
                          }

                          // After current card starts leaving, update the index
                          setTimeout(() => {
                            setCurrentVideoIndex(index);
                            setSelectedVideo(products[index]);

                            // Add entering class to new center card
                            setTimeout(() => {
                              const newCards = document.querySelectorAll('.video-card-container');
                              newCards.forEach(card => {
                                card.classList.remove('leaving-left', 'leaving-right');
                                if (card.classList.contains('z-20')) {
                                  card.classList.add('entering');
                                }
                              });

                              // Remove entering class after animation completes
                              setTimeout(() => {
                                newCards.forEach(card => {
                                  card.classList.remove('entering');
                                });
                              }, 700);
                            }, 100);
                          }, 250);
                        }
                      }}
                    >
                      <div
                        className="video-card relative overflow-hidden shadow-xl"
                        style={showVideoModal ? { width: '370px', height: '750px' } : { width: '320px', height: '600px' }}
                      >
                        {/* Video Player */}
                        {productItem.videoUrl || productItem.video ? (
                          <div className="w-full h-full">
                            <div
                              className="react-player-container"
                              onContextMenu={(e) => e.preventDefault()}
                            >
                              <ReactPlayer
                                url={productItem.videoUrl || productItem.video}
                                className="react-player"
                                width="100%"
                                height="100%"
                                playing={position === 0 ? isPlaying : false}
                                loop
                                muted={position === 0 ? isMuted : true}
                                controls={false}
                                playsinline
                                onProgress={position === 0 ? (state) => setVideoProgress(state.played) : undefined}
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

                            {/* Video Progress Bar - Only for active video */}
                            {position === 0 && (
                              <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10">
                                <div
                                  className="h-full bg-white transition-all duration-100 ease-linear"
                                  style={{ width: `${videoProgress * 100}%` }}
                                ></div>
                              </div>
                            )}

                            {/* Video Controls - Always visible in top right */}
                            {position === 0 && (
                              <div className="video-controls">
                                <button
                                  className="video-control-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPlaying(!isPlaying);
                                  }}
                                >
                                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                </button>
                                <button
                                  className="video-control-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMuted(!isMuted);
                                  }}
                                >
                                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                </button>
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

          {/* Product Info and Action Buttons - Contained within the width of the video */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-40">
            <div className="relative flex items-center justify-between" style={{ width: '370px' }}>
         {/* Gradient background from bottom to top */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg"></div>

              {/* Product Info */}
              <div className="text-white p-2 z-10">
                <h3 className="text-lg font-medium truncate">{selectedVideo?.title}</h3>
                <p className="text-lg font-bold mt-1">₹{selectedVideo.price}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 p-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddtoCart(selectedVideo);
                  }}
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:bg-black/80 transition-colors border border-white/20"
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
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="View Details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Background gradient for better text visibility */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent z-30"></div>
        </div>
      )}
    </section>
  );
};

export default WatchAndBuy;


