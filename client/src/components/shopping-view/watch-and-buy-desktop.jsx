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
        <div className="w-full mb-4 px-0">
          <div>
            <Slider {...sliderSettings} className="watch-buy-slider">
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
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                      }}
                      className="relative cursor-pointer shadow-md overflow-hidden watch-buy-mobile-card"
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
                        activeItem={activeItem}
                        handleAddtoCart={handleAddtoCart}
                        isMobileCard={true}
                      />
                    </motion.div>

                    {/* Product info below the card */}
                    <div className="mt-0.5 px-0">
                      <h3 className="text-sm font-medium line-clamp-1 mb-1">{productItem?.title}</h3>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold">₹{productItem.price}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddtoCart(productItem);
                          }}
                          className="text-xs bg-black text-white p-1.5 rounded-full"
                          aria-label="Add to Cart"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </button>
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
          {/* Modal Header - Only Close Button */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVideoModal(false);
              }}
              className="text-white"
            >
              <div className="icon-container">
                <X className="h-6 w-6" stroke="currentColor" />
              </div>
            </button>

            {/* Video Controls in Top Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
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
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Video Timeline at Top */}
          <div className="absolute top-16 left-0 right-0 z-20 flex justify-center gap-2 py-4 px-4">
            <div className="bg-black/30 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 w-auto">
              {products.map((_, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentVideoIndex(index);
                    setSelectedVideo(products[index]);
                  }}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${index === currentVideoIndex ? 'w-10 bg-white' : 'w-5 bg-white/50'}`}
                ></div>
              ))}
            </div>
          </div>

          {/* VideoStacker UI */}
          <div className="flex-grow flex items-center justify-center">
            <div className="video-stacker-container relative h-[80vh] w-full max-w-5xl overflow-hidden">
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
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full p-2 transition-all duration-300"
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
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full p-2 transition-all duration-300"
                  aria-label="Next video"
                >
                  <ChevronRight className="h-8 w-8 text-white" />
                </button>
              </div>

              {/* Stacked Videos */}
              <div className="video-stack-wrapper relative h-full w-full flex items-center justify-center">
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
                      className={`absolute transition-all duration-500 ease-in-out cursor-pointer ${position === 0 ? 'z-20 scale-100 opacity-100' : 'z-10 scale-90 opacity-70'}`}
                      style={{
                        transform: `translateX(${position * 60}%) scale(${position === 0 ? 1 : 0.9})`,
                        filter: position !== 0 ? 'brightness(0.8)' : 'brightness(1)',
                        opacity: position !== 0 ? 0.8 : 1
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (position !== 0) {

                          setCurrentVideoIndex(index);
                          setSelectedVideo(products[index]);
                        }
                      }}
                    >
                      <div
                        className="video-card relative overflow-hidden shadow-xl"
                        style={{ width: '400px', height: '550px' }}
                      >
                        {/* Video Player */}
                        {productItem.videoUrl || productItem.video ? (
                          <div className="w-full h-full">
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
                              onProgress={undefined}
                              config={{
                                file: {
                                  attributes: {
                                    controlsList: 'nodownload'
                                  }
                                }
                              }}
                            />

                            {/* Video Controls */}
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
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <p className="text-white">Video not available</p>
                          </div>
                        )}

                        {/* Product Info Overlay - Only for side videos */}
                        {position !== 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                            <h3 className="text-lg font-medium mb-1">{productItem?.title}</h3>
                            <div className="flex justify-between items-center">
                              <p className="text-lg font-bold">₹{productItem.price}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddtoCart(productItem);
                                }}
                                className="flex items-center gap-1 bg-white text-black px-4 py-1.5 text-sm font-medium hover:bg-gray-200 transition-colors"
                              >
                                <ShoppingBag className="h-4 w-4" />
                                <span>Add</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Product Info and Actions - Slide Up from Bottom */}
          <div className="flex flex-col items-center bg-transparent backdrop-blur-xs p-4 rounded-t-3xl absolute bottom-0 w-full shadow-lg">
            <div className="text-white flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-medium">{selectedVideo?.title}</h3>
              </div>
              <div className="text-xl font-bold ml-2">₹{selectedVideo.price}</div>
            </div>

            <div className="w-full md:w-1/4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddtoCart(selectedVideo);
                }}
                className="flex items-center justify-center gap-2 border border-white flex-1 bg-black text-white py-3 font-medium"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/shop/details/${selectedVideo._id}`);
                  setShowVideoModal(false);
                }}
                className="flex-1 bg-white border border-black text-black py-3 font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WatchAndBuy;


