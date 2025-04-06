import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * Breadcrumb component for navigation
 * @param {Object[]} items - Array of breadcrumb items
 * @param {string} items[].label - Label for the breadcrumb item
 * @param {string} items[].path - Path for the breadcrumb item
 */
function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="container mx-auto px-4 pt-3" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap text-md">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
              )}
              
              {isLast ? (
                <span className="text-gray-600 font-medium">{item.label}</span>
              ) : (
                <Link 
                  to={item.path} 
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
