import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import classNames from "classnames";
import { ArrowRight, ExternalLink, Heart } from "lucide-react";
import { useToast } from "../ui/use-toast";


const FastMovingCard = ({ item, index, activeItem, handleAddtoCart }) => {
  const navigate = useNavigate();
  const isStripeOpen = activeItem === index;
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

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#2A9D8F] group">
      {/* Like Heart Icon on the Top Left */}
      <div className="absolute top-2 left-2 z-20">
        <button
          className="p-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200"
          title="Like"
        >
          <Heart className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Video Element if available; removed modal logic */}
      {item?.video ? (
        <video
          className="absolute right-0 top-1/2 h-auto w-24 max-w-none -translate-y-1/2 object-cover md:left-1/2 md:h-[640px] md:w-[590px] md:-translate-x-1/2"
          src={item?.video}
          autoPlay
          loop
          muted
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
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[200px] rounded-xl shadow-xl overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 group-hover:scale-105 transition-transform duration-300 pr-6">
          <div className="absolute top-2 right-2">
            <ExternalLink
              className="text-white w-4 h-4 hover:text-gray-400 cursor-pointer"
              onClick={() => handleViewDetails(item?._id)}
            />
          </div>

          <div className="p-2 flex items-center justify-center gap-4 ">
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
                onClick={() => handleAddToCartClick(item?._id, item?.totalStock)}
                className="px-3 py-1 text-xs text-white rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-800 text-white text-lg rounded-lg shadow-lg transform transition-all hover:scale-105 animate-fade-slide-up delay-500 text-white px-4 py-2 rounded-md shadow hover:scale-105"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FastMovingCard;