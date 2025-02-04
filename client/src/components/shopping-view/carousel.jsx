import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Carousel = ({ featureImageList }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featureImageList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featureImageList.length]);

  return (
    <div className="relative w-full h-[85vh] overflow-hidden bg-gray-900">
      {featureImageList.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <img
            src={item?.image}
            alt={item?.title}
            className="w-full h-full object-fit md:object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>

          {/* Text Content */}
          <div className="absolute bottom-16 md:bottom-24 left-8 md:left-16 text-white max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-bold leading-snug tracking-wide drop-shadow-md animate-fade-slide-up ">
              {item?.title}
            </h2>
            <p className="mt-4 text-lg md:text-2xl font-light drop-shadow-md animate-fade-slide-up delay-300">
              {item?.description}
            </p>
            <button className="mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white text-lg rounded-lg shadow-lg transform transition-all hover:scale-105 animate-fade-slide-up delay-500" onClick={() => navigate("/shop/collections")}>
              Shop Now
            </button>
          </div>
        </div>
      ))}

      {/* Dots (Always Visible) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {featureImageList.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-foreground border-2 border-white scale-125"
                : "bg-gray-500"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
