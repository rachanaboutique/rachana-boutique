import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import classNames from "classnames";
import { ArrowRight, X } from "lucide-react";
import { useToast } from "../ui/use-toast";

const VideoModal = ({ videoSrc, onClose }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="relative w-[80%] max-w-3xl bg-black rounded-lg overflow-hidden">
        <button
          className="absolute top-2 right-2 text-white"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <video src={videoSrc} className="w-full h-auto" controls autoPlay />
      </div>
    </div>,
    document.body
  );
};

const FastMovingCard = ({ item, index, activeItem, handleAddtoCart }) => {
  const navigate = useNavigate();
  const isStripeOpen = activeItem === index;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const handleViewDetails = (productId) => {
    navigate(`/shop/details/${productId}`);
  };

  const handleAddToCartClick = (productId, totalStock) => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in to add items to the cart!",
        variant: "destructive",
      });
    } else {
      handleAddtoCart(productId, totalStock);
    }
  };

  const handleVideoClick = () => {
    console.log("Video clicked, opening modal...");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    console.log("Closing modal...");
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#2A9D8F] group">
        {/* Video */}
        {item?.video ? (
          <video
            className="absolute right-0 top-1/2 h-auto w-24 max-w-none -translate-y-1/2 object-cover md:left-1/2 md:h-[640px] md:w-[590px] md:-translate-x-1/2 cursor-pointer"
            src={item?.video}
            autoPlay
            loop
            muted
            onClick={handleVideoClick}
          />
        ) : null}

        {/* Texture Layer */}
        <div
          className={classNames(
            "inset-0 opacity-25 duration-300 before:absolute before:bottom-0 before:right-0 before:top-[-148px] before:z-10 before:bg-texture after:bottom-[28px] after:left-0 after:right-[-434px] after:top-0 after:z-10 after:bg-texture md:absolute md:transition-opacity",
            isStripeOpen ? "md:opacity-25" : "md:opacity-0"
          )}
        />
        <div className="hidden md:absolute inset-0 bg-black opacity-35"></div>

        {/* Text Content */}
        <div
          className={classNames(
            "left-8 top-8 w-[590px] p-4 transition-[transform,opacity] md:absolute md:p-0",
            isStripeOpen
              ? "md:translate-x-0 md:opacity-100"
              : "md:translate-x-4 md:opacity-0"
          )}
        >
          <p className="leading-tight text-white text-lg font-bold md:text-4xl">
            {item?.title}
          </p>
        </div>

        {isStripeOpen && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[180px] rounded-xl shadow-xl overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 group-hover:scale-105 transition-transform duration-300">
            {/* <div className="py-2 bg-gradient-to-r from-black to-gray-800 text-white flex items-center justify-center text-sm font-semibold">
              Quick Buy
            </div> */}
            <div className="p-2 flex items-center justify-center gap-4">
              <div className="1/3">
                {item?.image && (
                  <img
                    src={item.image[0]}
                    alt={item.title}
                    className="w-16 h-20 object-cover shadow-md border border-gray-200"
                  />
                )}

              </div>
             <div className="flex flex-col gap-2 items-center w-2/3">
             <p className="text-lg font-bold text-white">₹ {item?.salePrice}</p>
              <button
                onClick={() =>
                  handleAddToCartClick(item?._id, item?.totalStock)
                }
                className="px-3 py-1 text-xs text-white rounded-full bg-rose-600 hover:bg-rose-500 transition-all duration-300 shadow-md transform hover:scale-105"
              >
                Add to Cart
              </button>
             </div>
            </div>
            <button
              onClick={() => handleViewDetails(item?._id)}
              className="w-full px-3 py-2 text-xs font-medium text-white bg-foreground hover:bg-accent transition-all duration-300 flex items-center justify-center gap-2"
            >
              Explore
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Video Modal via Portal */}
      {isModalOpen && item?.video && (
        <VideoModal videoSrc={item.video} onClose={closeModal} />
      )}
    </>
  );
};

export default FastMovingCard;