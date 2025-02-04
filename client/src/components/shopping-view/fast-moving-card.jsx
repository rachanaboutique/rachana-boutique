import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import classNames from "classnames";
import { ArrowRight } from "lucide-react";

const FastMovingCard = ({ item, index, activeItem }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleButtonClick = () => {
    navigate("/shop/collections");
  };

  const isStripeOpen = activeItem === index; // Determine if the stripe is open

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#2A9D8F]">
      {/* Image */}
      <img
        className="absolute right-0 top-1/2 h-auto w-24 max-w-none -translate-y-1/2 object-cover md:left-1/2 md:h-[640px] md:w-[590px] md:-translate-x-1/2"
        src={item.img}
        alt={item.name}
        width="590px"
        height="640px"
      />



      {/* Texture Layer */}
      <div
        className={classNames(
          "inset-0 opacity-25 duration-300 before:absolute before:bottom-0  before:right-0 before:top-[-148px] before:z-10 before:bg-texture after:bottom-[28px] after:left-0 after:right-[-434px] after:top-0 after:z-10 after:bg-texture md:absolute md:transition-opacity",
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
        <p className="text-sm uppercase text-white md:text-lg">{item.title}</p>
        <p className="leading-tight text-white text-lg font-bold md:text-4xl">
          {item.name}
        </p>
        <button
          onClick={handleButtonClick}
          className="mt-2 flex items-center px-3 py-2 text-sm text-white rounded-full bg-black hover:bg-accent transition-all duration-300 md:hidden"
        >
          Explore
          <ArrowRight className="w-4 h-4 inline ml-2" />
        </button>
      </div>

      {/* Transparent Button (Visible only when the stripe is open) */}
      {isStripeOpen && (
        <button
          onClick={handleButtonClick}
          className="hidden md:flex items-center absolute bottom-12 left-1/2 transform -translate-x-1/2 px-6 py-3 text-sm md:text-lg text-white rounded-full bg-black hover:bg-accent transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-accent focus:ring-opacity-50 glow-effect"
        >
          Explore
          <ArrowRight className="w-6 h-6 inline ml-2" />
        </button>

      )}
    </div>
  );
};

export default FastMovingCard;
