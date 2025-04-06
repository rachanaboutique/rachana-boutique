import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import classNames from "classnames";
import { Heart, ExternalLink, X, ShoppingBag, Loader } from "lucide-react";
import { useToast } from "../ui/use-toast";

const FastMovingCard = ({ item, index, activeItem, handleAddtoCart, isMobileCard = false }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Determine if the card is currently active (desktop slider logic)
  const isStripeOpen = activeItem === index;

  // State to track liked status for the heart icon
  const [liked, setLiked] = useState(false);

  // State to track mobile modal visibility and mobile detection
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // State to manage video loading for mobile modal
  const [videoLoading, setVideoLoading] = useState(true);
  // State to manage video loading for desktop video element
  const [desktopVideoLoading, setDesktopVideoLoading] = useState(true);

  // Listen for resize events to update mobile flag
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When opening modal, reset video loading state
  const handleCardClick = () => {
    if (isMobile && item?.video && !isMobileCard) {
      setModalOpen(true);
      setVideoLoading(true);
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
  return (
    <>
      {/* Mobile Card Style for the new Instagram-like UI */}
      {isMobileCard ? (
        <div className="relative h-full w-full overflow-hidden">
          {/* Product Image or Video Thumbnail */}
          <div className="relative w-full h-full">
            {item?.video ? (
              <video
                className="w-full h-full object-cover"
                src={item.video}
                autoPlay
                loop
                muted
                playsInline
              />
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
              <video
                className="absolute right-0 top-1/2 h-auto w-24 max-w-none -translate-y-1/2 object-cover md:left-1/2 md:h-[640px] md:w-[590px] md:-translate-x-1/2 transition-transform duration-700 group-hover:scale-105"
                src={item.video}
                autoPlay
                loop
                muted
                playsInline
                onLoadedData={() => setDesktopVideoLoading(false)}
              />
              {desktopVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="relative">
                    <Loader className="w-6 h-6 text-white animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-white">Loading</span>
                    </div>
                  </div>
                </div>
              )}


            </>
          )}

          {/* Video Preview for Mobile: each small div shows autoplay preview */}
          {item?.video && isMobile && !isMobileCard && (
            <video
              className="w-full h-32 object-cover"
              src={item.video}
              autoPlay
              loop
              muted
              playsInline
            />
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
                     <ShoppingBag size={18} className={isAddingToCart ? "opacity-20" : ""} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legacy Mobile Modal - We're not using this anymore as we've implemented a better modal in the parent component */}
      {modalOpen && isMobile && !isMobileCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-2">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden w-full max-w-md max-h-[90vh] m-4 flex flex-col">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-white z-10 p-1 bg-gray-800 rounded-full"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Section (Limited Height) */}
            <div className="relative w-full">
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <svg
                    className="animate-spin h-10 w-10 text-[#EC003F] drop-shadow-lg"
                    xmlns="https://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-20 stroke-current"
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-90 fill-current"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                </div>
              )}
              {item?.video ? (
                <video
                  className="w-full max-h-[70vh] h-auto object-cover rounded-t-lg"
                  src={item.video}
                  preload="auto"
                  poster={item?.poster || ""}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onLoadedData={() => setVideoLoading(false)}
                />
              ) : (
                <div className="p-4">
                  <p className="text-white">Video not available</p>
                </div>
              )}
            </div>

            {/* Text & Add to Cart Section */}
            <div className="p-4 bg-gray-800 overflow-y-auto flex-grow">
              <p className="text-white text-lg font-bold mb-2">{item?.name || item?.title}</p>
              <p className="text-white text-lg font-bold mb-4">₹ {item?.price || item?.salePrice}</p>
              <button
                onClick={handleAddToCartClick}
                className="w-full px-4 py-2 text-sm text-white rounded-md bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-800 transform transition-all hover:scale-105 shadow-lg"
              >
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