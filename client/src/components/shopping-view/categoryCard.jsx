import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const CategoryCard = ({ categoryItem }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/shop/collections?category=${categoryItem._id}`);
  };

  return (
    <Card
      className="rounded-none w-full max-w-lg shadow-lg border border-gray-300 transition-all duration-300 overflow-hidden hover:cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative group">
        {/* Category Image */}
        <img
          src={categoryItem?.image}
          alt={categoryItem?.name}
          className="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105 z-0"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-40 transition duration-700"></div>

        {/* Category Name */}
        <div className="absolute bottom-0 left-0 p-4">
          <span className="text-2xl font-extrabold text-white uppercase tracking-widest shadow-lg z-10">
            {categoryItem?.name}
          </span>
        </div>

        {/* View Collection Button */}
        <button className="absolute inset-0 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500">
          <div className="bg-white/90 px-6 py-2 rounded-full flex items-center gap-2 text-gray-900 font-semibold text-lg shadow-md hover:bg-white transition">
            View Collection <ArrowRight className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Description */}
      <div className="relative z-20 p-6 bg-gradient-to-r from-white via-gray-50 to-white text-center border-t border-gray-300">
        <p className="text-md italic text-gray-700 leading-relaxed">{categoryItem?.description}</p>
      </div>
    </Card>
  );
};

export default CategoryCard;
