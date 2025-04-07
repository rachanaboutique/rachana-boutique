import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { ChevronDown } from "lucide-react";
import { fetchCategories } from "@/store/shop/categories-slice";
import { categoryMapping } from "@/config";

function ProductFilter({ filters, setFilters, handleFilter }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to toggle dropdown visibility
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categoriesList } = useSelector((state) => state.shopCategories);

  // Parse query parameters
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Fetch categories on mount
    dispatch(fetchCategories());
    // Get the `category` query parameter
    const queryCategory = searchParams.get("category");
    if (queryCategory) {
      // Update the filters state with the category ID from the query
      setFilters((prevFilters) => ({
        ...prevFilters,
        category: [queryCategory],
      }));
    }
  }, [dispatch, searchParams, setFilters]);

  // Toggle dropdown on mobile
  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  // Updated handleSingleCategoryFilter to use SEO-friendly URLs
  const handleSingleCategoryFilter = (categoryId) => {
    const isSameCategorySelected =
      filters.category?.length === 1 && filters.category[0] === categoryId;

    let updatedFilters;
    if (isSameCategorySelected) {
      // Remove the category filter key if the same category is selected
      updatedFilters = { ...filters };
      delete updatedFilters.category;

      // Navigate to the collections page without category
      navigate('/shop/collections');
    } else {
      updatedFilters = { ...filters, category: [categoryId] };

      // Find the slug for this category ID
      const categoryInfo = categoryMapping.find(cat => cat.id === categoryId);

      if (categoryInfo) {
        // Navigate to the SEO-friendly URL
        navigate(`/shop/collections/${categoryInfo.slug}`);
      } else {
        // Fallback to the old URL format if mapping not found
        const newQueryParams = new URLSearchParams(searchParams);
        newQueryParams.set("category", categoryId);
        setSearchParams(newQueryParams);
      }
    }

    // Update filters state
    setFilters(updatedFilters);
  };

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm mb-4 md:mb-0 md:p-0 md:border-none md:relative">
      {/* Filter Toggle - Mobile View */}
      <div
        className="flex justify-between items-start cursor-pointer md:hidden"
        onClick={toggleDropdown}
      >
        <div>
          <h2 className="text-xl font-light uppercase tracking-wide mb-2">Filters</h2>
          <div className="w-12 h-0.5 bg-black mb-1"></div>
        </div>
        <button className="p-2">
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Filter Toggle - Desktop View */}
      <div
        className="hidden md:flex items-center justify-between cursor-pointer px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        onClick={toggleDropdown}
      >
        <span className="text-md">Filter</span>
        <ChevronDown
          size={16}
          className={`ml-2 transition-transform duration-300 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Filter options */}
      <div
        className={`space-y-4 max-h-[70vh] overflow-y-auto pr-2 ${
          isDropdownOpen ? "block" : "hidden"
        } md:absolute md:top-full md:left-0 md:mt-2 md:bg-white md:border md:border-gray-200 md:rounded-md md:shadow-lg md:p-4 md:w-64 md:max-h-[500px] md:z-10`}
      >
        {/* Dynamic Category Filter */}
        <div className="mt-4 md:mt-0 border-t border-gray-200">
          <h3 className="text-lg md:text-sm uppercase tracking-wide font-medium my-2">Category</h3>
          <div className="w-8 h-0.5 bg-black mb-4 md:mb-2"></div>
          <div className="space-y-2">
            {categoriesList.map((category) => (
              <Label
                className="flex items-center gap-2 text-base md:text-sm hover:text-black cursor-pointer group"
                key={category._id}
              >
                <Checkbox
                  className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                  checked={
                    filters.category?.length > 0 &&
                    filters.category[0] === category._id
                  }
                  onCheckedChange={() =>
                    handleSingleCategoryFilter(category._id)
                  }
                />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                  {category.name}
                </span>
              </Label>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Static Price Filter */}
        <div>
          <h3 className="text-lg md:text-sm uppercase tracking-wide font-medium mb-2">Price Range</h3>
          <div className="w-8 h-0.5 bg-black mb-4"></div>
          <div className="space-y-2">
            {[
              { id: "0-1000", label: "₹0 - ₹1,000" },
              { id: "1000-2000", label: "₹1,000 - ₹2,000" },
              { id: "2000-3000", label: "₹2,000 - ₹3,000" },
              { id: "3000-4000", label: "₹3,000 - ₹4,000" },
              { id: "4000-5000", label: "₹4,000 - ₹5,000" },
              { id: "5000-6000", label: "₹5,000 - ₹6,000" },
              { id: "6000-", label: "₹6,000 and above" }
            ].map((option) => (
              <Label
                className="flex items-center gap-2 text-base md:text-sm hover:text-black cursor-pointer group"
                key={option.id}
              >
                <Checkbox
                  className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                  checked={
                    filters.price?.length > 0 &&
                    filters.price.includes(option.id)
                  }
                  onCheckedChange={() => handleFilter("price", option.id)}
                />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                  {option.label}
                </span>
              </Label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductFilter;