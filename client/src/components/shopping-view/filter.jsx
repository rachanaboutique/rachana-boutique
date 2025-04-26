import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { fetchCategories } from "@/store/shop/categories-slice";
import { categoryMapping } from "@/config";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Badge } from "../ui/badge";

function ProductFilter({ filters, setFilters, handleFilter }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to toggle dropdown visibility
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for mobile sheet
  const dropdownRef = useRef(null); // Ref for dropdown container
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categoriesList } = useSelector((state) => state.shopCategories);

  // Parse query parameters
  const [searchParams] = useSearchParams();

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

  // Add click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    // Add event listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Toggle dropdown on desktop
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
        // If no mapping is found, just go to the main collections page
        // We no longer use the old URL format with query parameters
        navigate('/shop/collections');
        console.warn(`No SEO-friendly slug found for category ID: ${categoryId}`);
      }
    }

    // Update filters state
    setFilters(updatedFilters);
  };

  // Count active filters
  const activeFilterCount = Object.keys(filters).reduce((count, key) => {
    return count + (filters[key]?.length || 0);
  }, 0);

  return (
    <div className="md:relative" ref={dropdownRef}>
      {/* Mobile Filter Button - Minimalistic */}
      <div className="md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={14} />
              <span className="text-sm font-medium">Filter</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-black text-white text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-xl pt-6" closeButton={false}>
            <SheetHeader className="flex flex-row items-center justify-between mb-4">
              <SheetTitle className="text-lg font-medium">Filters</SheetTitle>
              <button 
                onClick={() => setIsSheetOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </SheetHeader>
            
            <div className="space-y-6 overflow-y-auto h-[calc(100%-60px)] pb-20">
              {/* Dynamic Category Filter */}
              <div>
                <h3 className="text-sm uppercase tracking-wide font-medium mb-3">Category</h3>
                <div className="space-y-2">
                  {categoriesList.map((category) => (
                    <Label
                      className="flex items-center gap-2 text-sm hover:text-black cursor-pointer group"
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
                <h3 className="text-sm uppercase tracking-wide font-medium mb-3">Price Range</h3>
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
                      className="flex items-center gap-2 text-sm hover:text-black cursor-pointer group"
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
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter Toggle */}
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

      {/* Desktop Filter Options */}
      <div
        className={`hidden ${
          isDropdownOpen ? "md:block" : "md:hidden"
        } space-y-4 md:absolute md:top-full md:left-0 md:mt-2 md:bg-white md:border md:border-gray-200 md:rounded-md md:shadow-lg md:p-4 md:w-64 md:max-h-[500px] md:z-10 md:overflow-y-auto`}
      >
        {/* Dynamic Category Filter */}
        <div>
          <h3 className="text-sm uppercase tracking-wide font-medium mb-2">Category</h3>
          <div className="w-8 h-0.5 bg-black mb-2"></div>
          <div className="space-y-2">
            {categoriesList.map((category) => (
              <Label
                className="flex items-center gap-2 text-sm hover:text-black cursor-pointer group"
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
          <h3 className="text-sm uppercase tracking-wide font-medium mb-2">Price Range</h3>
          <div className="w-8 h-0.5 bg-black mb-2"></div>
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
                className="flex items-center gap-2 text-sm hover:text-black cursor-pointer group"
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