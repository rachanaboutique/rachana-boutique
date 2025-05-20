import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import classNames from "classnames";
import { Heart, ExternalLink, X, ShoppingBag, Loader, Play } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useInView } from "react-intersection-observer";

const FastMovingCard = ({ item, index, activeItem, handleAddtoCart, isMobileCard = false }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const videoRef = useRef(null);

  // Use react-intersection-observer for better viewport detection
  const [ref, inView] = useInView({
    threshold: 0.3, // 30% of element must be visible
    triggerOnce: false, // Keep observing for changes
    rootMargin: '100px 0px', // Load videos 100px before they come into view
  });

  // Determine if the card is currently active (desktop slider logic)
  const isStripeOpen = activeItem === index;

  // State to track liked status for the heart icon
  const [liked, setLiked] = useState(false);

  // State to track mobile modal visibility and mobile detection
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Video states
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Listen for resize events to update mobile flag
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle video playback based on visibility
  const handleVideoPlayback = useCallback(() => {
    if (!videoRef.current || !item?.video) return;

    if (inView && videoReady) {
      // Play video when in view and ready
      videoRef.current.play()
        .catch(err => {
          console.log('Video play error:', err);
          // If autoplay is prevented, try muted autoplay
          if (err.name === 'NotAllowedError') {
            videoRef.current.muted = true;
            videoRef.current.play().catch(e => console.log('Muted play error:', e));
          }
        });
    } else if (videoRef.current) {
      // Pause when not in view to save resources
      videoRef.current.pause();
    }
  }, [inView, item?.video, videoReady]);

  // Apply video playback logic when visibility or readiness changes
  useEffect(() => {
    handleVideoPlayback();
  }, [handleVideoPlayback, inView, videoReady]);

  // When opening modal, reset video loading state
  const handleCardClick = () => {
    if (isMobile && item?.video && !isMobileCard) {
      setModalOpen(true);
      setVideoLoading(true);
      setVideoError(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleViewDetails = (productId) => {
    navigate(`/shop/details/${productId}`);
  };

  const handleAddToCartClick = (e) => {
    if (e) {
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      toast({
        title: "Please log in to add items to the cart!",
        variant: "destructive"
      });
    } else {
      // Pass the entire item to the handler
      handleAddtoCart(item);
    }
  };

  // Handle video loaded data event
  const handleVideoLoaded = () => {
    setVideoLoading(false);
    setVideoReady(true);
    handleVideoPlayback();
  };

  // Handle video error
  const handleVideoError = () => {
    setVideoLoading(false);
    setVideoError(true);
    console.error('Video failed to load:', item?.video);
  };
  return (
    <>
      {/* Mobile Card Style for the new Instagram-like UI */}
      {isMobileCard ? (
        <div className="relative h-full w-full overflow-hidden">
          {/* Product Image or Video Thumbnail */}
          <div className="relative w-full h-full">
            {item?.video ? (
              <div
                className="w-full h-full"
                onContextMenu={(e) => e.preventDefault()}
              >
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (isMobileCard) ref(el);
                  }}
                  className="w-full h-full object-cover"
                  src={item.video}
                  loop
                  muted
                  playsInline
                  controlsList="nodownload"
                  onLoadedData={handleVideoLoaded}
                  onError={handleVideoError}
                  preload="metadata"
                  poster={item.images && item.images.length > 0 ? item.images[0] : ''}
                />
              </div>
            ) : item?.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No image</p>
              </div>
            )}

            {/* No product info overlay - handled in parent component */}
          </div>
        </div>
      ) : (
        // Enhanced Desktop Card Style
        <div
          className="relative h-full w-full overflow-hidden bg-foreground group cursor-pointer"
          onClick={handleCardClick}
        >
          {/* Top Left Like Icon with improved styling */}
          <div className="absolute top-3 left-3 z-20">
            <button
              onClick={(e) => {
                // Prevent triggering card click when toggling like
                e.stopPropagation();
                setLiked(!liked);
              }}
              className={classNames(
                "p-1.5 rounded-full transition-all duration-300 shadow-lg",
                liked
                  ? "bg-white text-red-500 scale-110"
                  : "bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
              )}
              title="Like"
            >
              <Heart className={classNames(
                "w-5 h-5 transition-transform",
                liked ? "fill-current scale-110" : "stroke-current"
              )} />
            </button>
          </div>

          {/* Enhanced Video Element for Desktop */}
          {item?.video && !isMobile && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-5 pointer-events-none"></div>
              <div
                className="absolute right-0 top-1/2 h-auto w-24 max-w-none -translate-y-1/2 md:left-1/2 md:h-[640px] md:w-[590px] md:-translate-x-1/2 transition-transform duration-700 group-hover:scale-105"
                onContextMenu={(e) => e.preventDefault()}
              >
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    ref(el);
                  }}
                  className="w-full h-full object-cover"
                  src={item.video}
                  loop
                  muted
                  playsInline
                  controlsList="nodownload"
                  onLoadedData={handleVideoLoaded}
                  onError={handleVideoError}
                  preload="metadata"
                  poster={item.image && item.image.length > 0 ? item.image[0] : ''}
                />
              </div>
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="relative">
                    <Loader className="w-6 h-6 text-white animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-white">Loading</span>
                    </div>
                  </div>
                </div>
              )}
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                  <div className="text-center p-4">
                    <p className="text-white text-sm mb-2">Video could not be loaded</p>
                    {item.image && item.image.length > 0 && (
                      <img
                        src={item.image[0]}
                        alt={item.name || "Product"}
                        className="max-h-[200px] mx-auto object-contain"
                      />
                    )}
                  </div>
                </div>
              )}


            </>
          )}

          {/* Video Preview for Mobile: actual video with play button overlay */}
          {item?.video && isMobile && !isMobileCard && (
            <div
              className="w-full h-full bg-gray-100 relative overflow-hidden"
              onContextMenu={(e) => e.preventDefault()}
            >
              <video
                ref={(el) => {
                  videoRef.current = el;
                  ref(el);
                }}
                className="w-full h-full object-cover"
                src={item.video}
                loop
                muted
                playsInline
                controlsList="nodownload"
                onLoadedData={handleVideoLoaded}
                onError={handleVideoError}
                preload="metadata"
                poster={item.image && item.image.length > 0 ? item.image[0] : ''}
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-70 flex items-center justify-center">
                  <Play className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>
          )}

          {/* Fallback to image if no video */}
          {!item?.video && (
            <div className="w-full h-full">
              {item?.image && item.image.length > 0 ? (
                <img
                  src={item.image[0]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No image</p>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Texture Layer with Gradient Overlay */}
          <div
            className={classNames(
              "inset-0 opacity-25 duration-500 md:absolute md:transition-opacity",
              isStripeOpen ? "md:opacity-40" : "md:opacity-0"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/30 z-5"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/40 z-5"></div>
          </div>

          {/* Overlay for Desktop */}
          <div className="hidden md:absolute inset-0 bg-black opacity-35"></div>

          {/* Enhanced Text Content for Desktop */}
          <div
            className={classNames(
              "left-8 top-8 w-[590px] p-4 transition-all duration-500 md:absolute md:p-0",
              isStripeOpen
                ? "md:translate-x-0 md:opacity-100"
                : "md:translate-x-4 md:opacity-0"
            )}
          >
            <h2 className="leading-tight text-white text-lg font-bold md:text-4xl mb-2">
              {item?.name || item?.title}
            </h2>


          </div>

          {/* Action Area for Desktop */}
          {isStripeOpen && !isMobile && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[240px] shadow-xl overflow-hidden backdrop-blur-md bg-black/80 border border-white/10 group-hover:scale-105 transition-all duration-300 rounded-lg">
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(item?._id);
                  }}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="View Details"
                >
                  <ExternalLink className="text-white w-4 h-4" />
                </button>
              </div>

              <div className="p-3 flex items-center justify-center gap-4">
                <div className="w-1/3">
                  {item?.image && item.image.length > 0 ? (
                    <div className="relative overflow-hidden rounded-md border border-white/10 shadow-lg">
                      <img
                        src={item.image[0]}
                        alt={item.name || item.title}
                        className="w-16 h-20 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 items-center w-2/3">
                  <div className="flex items-baseline">
                    <span className="text-xs text-white/70 mr-1">₹</span>
                    <p className="text-lg font-bold text-white">{item?.price || item?.salePrice}</p>
                  </div>

                  <button
                    onClick={(e) => handleAddToCartClick(e)}
                    className="w-full px-4 py-1.5 text-sm text-white rounded-md bg-black hover:bg-gray-800 border border-white/20 transform transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                     <ShoppingBag size={18} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Video Modal for Mobile */}
      {modalOpen && item?.video && (
        <div className="fast-moving-video-modal">
          {/* Close button */}
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={handleCloseModal}
              className="p-2 rounded-full bg-black/50 text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Full screen video player */}
          <div className="w-full h-full flex items-center justify-center">
            <video
              className="w-full h-full object-cover"
              src={item.video}
              autoPlay
              loop
              playsInline
              controls
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>

          {/* Product info overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-white text-lg font-semibold mb-2">{item?.name || item?.title}</h3>
            <div className="flex justify-between items-center">
              <p className="text-white font-bold">₹{item?.price || item?.salePrice}</p>
              <button
                onClick={(e) => handleAddToCartClick(e)}
                className="px-4 py-2 bg-white text-black rounded-full flex items-center gap-2 text-sm font-medium"
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FastMovingCard;