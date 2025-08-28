import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import classNames from "classnames";
import { Heart, ExternalLink, X, ShoppingBag, Loader, Play } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { addToTempCart } from "@/utils/tempCartManager";
import { useInView } from "react-intersection-observer";
import iosAutoplayManager from "../../utils/iosAutoplayManager";

// Cloudinary Video Player Component
const CloudinaryVideoPlayer = React.memo(function CloudinaryVideoPlayer({
  videoUrl,
  isPlaying,
  isMuted = true,
  loop = true,
  controls = false,
  className = "",
  style = {},
  onLoadedData,
  onError,
  poster,
  autoplay = false,
  playsInline = true
}) {
  const cloudinaryRef = useRef();
  const videoRef = useRef();
  const playerInstanceRef = useRef();
  const [isCloudinaryLoaded, setIsCloudinaryLoaded] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Create a unique identifier for this player instance
  const playerIdRef = useRef(`player-${Math.random().toString(36).substring(2, 11)}`);

  // Extract public ID from Cloudinary URL
  const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    try {
      // Handle different Cloudinary URL formats
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');

      if (uploadIndex === -1) return url;

      // Get everything after upload/ and before file extension
      const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');

      // Remove transformations (anything before the last segment that doesn't contain a dot)
      const segments = pathAfterUpload.split('/');
      const fileSegment = segments[segments.length - 1];

      // Remove file extension (.mp4, .mov, etc.)
      const publicId = fileSegment.replace(/\.[^/.]+$/, '');

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
        cloudinaryRef.current = window.cloudinary;
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
    if (!isCloudinaryLoaded || playerInstanceRef.current || !videoRef.current || !videoUrl || hasInitialized) return;

    try {
      // Add a small delay to stagger initializations and reduce simultaneous loads
      const initDelay = Math.random() * 500; // Random delay between 0-500ms

      const delayTimeout = setTimeout(() => {
        try {
          // console.log(`Initializing Cloudinary player ${playerIdRef.current} for video:`, extractPublicId(videoUrl));
          setHasInitialized(true);

          const initTimeout = setTimeout(() => {
            if (!videoRef.current || playerInstanceRef.current) {
              console.warn(`Video element not available or player already initialized ${playerIdRef.current}`);
              return;
            }

            const videoElement = videoRef.current;
            videoElement.preload = 'metadata';
            videoElement.playsInline = playsInline;
            videoElement.muted = isMuted;

            // Enhanced configuration for iOS compatibility
            playerInstanceRef.current = cloudinaryRef.current.videoPlayer(videoElement, {
              cloud_name: 'dxfeyj7hl',
              controls: controls,
              autoplay: false, // Always start with autoplay false for iOS compatibility
              muted: true, // Always muted for autoplay to work on iOS
              loop: loop,
              fluid: true,
              playsinline: true, // Critical for iOS
              preload: 'metadata',
              transformation: {
                quality: 'auto',
                fetch_format: 'auto'
              },
              html5: {
                vhs: {
                  overrideNative: true // Important for consistent behavior
                }
              },
              // Additional iOS-specific settings
              webkit_playsinline: true,
              allowsInlineMediaPlayback: true
            });

            // Set up event listeners
            playerInstanceRef.current.on('ready', () => {
              // console.log(`Cloudinary player ${playerIdRef.current} ready`);
              setIsPlayerReady(true);

              // Set video source when player is ready
              try {
                const publicId = extractPublicId(videoUrl);
                playerInstanceRef.current.source(publicId, {
                  transformation: {
                    quality: 'auto',
                    fetch_format: 'auto'
                  }
                });
              } catch (sourceError) {
                console.error('Error setting video source:', sourceError);
                setPlayerError(true);
                onError && onError(sourceError);
              }
            });

            playerInstanceRef.current.on('loadeddata', () => {
              onLoadedData && onLoadedData();
            });

            playerInstanceRef.current.on('error', (error) => {
              console.error('Cloudinary player error:', error);
              setPlayerError(true);
              onError && onError(error);
            });

          }, 100);

          return () => clearTimeout(initTimeout);
        } catch (error) {
          console.error('Error initializing Cloudinary player:', error);
          setPlayerError(true);
          onError && onError(error);
        }
      }, initDelay);

      return () => clearTimeout(delayTimeout);
    } catch (error) {
      console.error('Error setting up Cloudinary player initialization:', error);
      setPlayerError(true);
      onError && onError(error);
    }
  }, [isCloudinaryLoaded, videoUrl, hasInitialized]); // Removed callback dependencies to prevent re-initialization

  // Handle play/pause based on isPlaying prop with iOS autoplay handling
  useEffect(() => {
    if (!playerInstanceRef.current || !isPlayerReady) return;

    try {
      if (isPlaying) {
        // For iOS, ensure we have user interaction before attempting autoplay
        const playVideo = async () => {
          try {
            // Ensure video is muted for autoplay compatibility
            playerInstanceRef.current.mute();

            const playPromise = playerInstanceRef.current.play();
            if (playPromise !== undefined) {
              await playPromise;
              console.log('Video autoplay successful');
            }
          } catch (error) {
            console.warn('Autoplay failed, this is expected on iOS without user interaction:', error);
            // On iOS, videos won't autoplay until user interaction
            // This is normal behavior and not an error
          }
        };

        playVideo();
      } else {
        playerInstanceRef.current.pause();
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
    }
  }, [isPlaying, isPlayerReady]);

  // Handle mute/unmute
  useEffect(() => {
    if (!playerInstanceRef.current) return;

    try {
      // Use the correct Cloudinary video player API for muting
      if (isMuted) {
        playerInstanceRef.current.mute();
      } else {
        playerInstanceRef.current.unmute();
      }
    } catch (error) {
      console.error('Error controlling mute:', error);
    }
  }, [isMuted]);

  // Cleanup on unmount
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

  // Fallback to regular video if Cloudinary fails or isn't loaded
  if (playerError || !isCloudinaryLoaded) {
    return (
      <video
        ref={videoRef}
        className={className}
        style={style}
        src={videoUrl}
        loop={loop}
        muted={isMuted}
        playsInline={playsInline}
        webkit-playsinline="true"
        controls={controls}
        poster={poster}
        onLoadedData={onLoadedData}
        onError={onError}
        preload="metadata"
        x-webkit-airplay="allow"
      />
    );
  }

  return (
    <div className={className} style={style}>
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%' }}
        playsInline
        webkit-playsinline="true"
        preload="metadata"
        muted
        onContextMenu={(e) => e.preventDefault()}
        suppressHydrationWarning={true}
        poster={poster}
        // iOS-specific attributes
        x-webkit-airplay="allow"
        controls={false}
      />
      {!isPlayerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-white text-sm">Loading video...</div>
        </div>
      )}
    </div>
  );
});

const FastMovingCard = ({ item, index, activeItem, handleAddtoCart, isMobileCard = false }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useSelector((state) => state.auth);

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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Video states
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // iOS detection and autoplay handling using centralized manager
  const [isIOS] = useState(iosAutoplayManager.isIOS);
  const [hasUserInteracted, setHasUserInteracted] = useState(iosAutoplayManager.hasUserInteracted);

  // Listen for resize events to update mobile flag
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Subscribe to iOS autoplay manager updates
  useEffect(() => {
    const unsubscribe = iosAutoplayManager.subscribe((interacted) => {
      setHasUserInteracted(interacted);
    });

    return unsubscribe;
  }, []);

  // When opening modal, reset video loading state
  const handleCardClick = () => {
    if (isMobile && item?.video && !isMobileCard) {
      setVideoLoading(true);
      setVideoError(false);
      // Prevent body scroll when modal opens
      document.body.classList.add('modal-open');
    }
  };


  const handleViewDetails = (productId) => {
    navigate(`/shop/details/${productId}`);
  };

  const handleAddToCartClick = (e) => {
    if (e) {
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      // Add to temporary cart for non-authenticated users
      const tempCartItem = {
        productId: item._id,
        colorId: item?.colors?.[0]?._id || null,
        quantity: 1,
        productDetails: {
          title: item?.title,
          price: item?.price,
          salePrice: item?.salePrice,
          image: item?.image?.[0] || '',
          category: item?.category,
          productCode: item?.productCode || null
        }
      };

      const success = addToTempCart(tempCartItem);

      if (success) {
        toast({
          title: "Item added to cart!",
          variant: "default",
        });
      } else {
        toast({
          title: "Failed to add item to cart",
          variant: "destructive",
        });
      }
    } else {
      // Pass the entire item to the handler for authenticated users
      handleAddtoCart(item);
    }
  };

  // Handle video loaded data event
  const handleVideoLoaded = () => {
    setVideoLoading(false);
    setVideoReady(true);
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
                ref={ref}
              >
                <CloudinaryVideoPlayer
                  videoUrl={item.video}
                  isPlaying={inView && videoReady && (hasUserInteracted || !isIOS)}
                  isMuted={true}
                  loop={true}
                  controls={false}
                  className="w-full h-full object-cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onLoadedData={handleVideoLoaded}
                  onError={handleVideoError}
                  poster={item.images && item.images.length > 0 ? item.images[0] : ''}
                  playsInline={true}
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

            {/* iOS Autoplay Notice */}
            {isIOS && !hasUserInteracted && item?.video && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-20"
                onClick={() => {
                  iosAutoplayManager.forceEnable();
                 
                }}
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 text-center shadow-lg">
                  <div className="text-sm text-gray-800 font-medium mb-1">Tap to enable videos</div>
                  <div className="text-xs text-gray-600">Videos will autoplay after this</div>
                </div>
              </div>
            )}

            {/* No product info overlay - handled in parent component */}
          </div>
        </div>
      ) : (
        // Enhanced Desktop Card Style
        <div
          className="relative h-full w-full overflow-hidden group cursor-pointer"
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
                ref={ref}
              >
                <CloudinaryVideoPlayer
                  videoUrl={item.video}
                  isPlaying={inView && videoReady && (hasUserInteracted || !isIOS)}
                  isMuted={true}
                  loop={true}
                  controls={false}
                  className="w-full h-full object-cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onLoadedData={handleVideoLoaded}
                  onError={handleVideoError}
                  poster={item.images && item.images.length > 0 ? item.images[0] : ''}
                  playsInline={true}
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
                    {item.images && item.images.length > 0 && (
                      <img
                        src={item.images[0]}
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
              ref={ref}
            >
              <CloudinaryVideoPlayer
                videoUrl={item.video}
                isPlaying={false} // Don't autoplay on mobile preview
                isMuted={true}
                loop={true}
                controls={false}
                className="w-full h-full object-cover"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onLoadedData={handleVideoLoaded}
                onError={handleVideoError}
                poster={item.images && item.images.length > 0 ? item.images[0] : ''}
                playsInline={true}
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-70 flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-black ml-1" />
                </div>
              </div>
              {/* Loading indicator */}
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                  <Loader className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
          )}

          {/* Fallback to image if no video */}
          {!item?.video && (
            <div className="w-full h-full">
              {item?.images && item.images.length > 0 ? (
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

          {/* Overlay for Desktop - Removed to show cards without black border */}
          {/* <div className="hidden md:absolute inset-0 bg-black opacity-35"></div> */}

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
                  {item?.images && item.images.length > 0 ? (
                    <div className="relative overflow-hidden rounded-md border border-white/10 shadow-lg">
                      <img
                        src={item.images[0]}
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




    </>
  );
};

export default FastMovingCard;