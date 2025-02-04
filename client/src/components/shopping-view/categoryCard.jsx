import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils"; // Utility function for conditional classNames
import { Card } from "@/components/ui/card";

const CategoryCard = ({ categoryItem }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/shop/collections?category=${categoryItem.label}`);
  };

  return (
    <Card
      className="w-full max-w-lg rounded-3xl shadow-lg border border-gray-300 transition-all duration-300 overflow-hidden hover:cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative group">
        <img
          src={categoryItem.image}
          alt={categoryItem.label}
          className="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105 z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-70 group-hover:opacity-60 transition duration-700 z-10">
          <div className="absolute bottom-0 left-0 p-4">
            <span className="text-2xl font-extrabold text-white uppercase tracking-widest shadow-lg">
              {categoryItem.label}
            </span>
          </div>
        </div>
      </div>
      <div className="relative z-20 p-6 bg-gradient-to-r from-white via-gray-50 to-white text-center border-t border-gray-300">
        <p className="text-md italic text-gray-700 leading-relaxed">{categoryItem.description}</p>
      </div>
    </Card>
  );
};

export default CategoryCard;
