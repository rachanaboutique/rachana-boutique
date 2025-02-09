import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { ChevronDown } from "lucide-react";
import { fetchCategories } from "@/store/shop/categories-slice";

function ProductFilter({ filters, setFilters, handleFilter }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to toggle dropdown visibility
  const dispatch = useDispatch();
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

  // Updated handleSingleCategoryFilter for proper removal of the key
  const handleSingleCategoryFilter = (categoryId) => {
    const isSameCategorySelected =
      filters.category?.length === 1 && filters.category[0] === categoryId;

    let updatedFilters;
    if (isSameCategorySelected) {
      // Remove the category filter key if the same category is selected
      updatedFilters = { ...filters };
      delete updatedFilters.category;
    } else {
      updatedFilters = { ...filters, category: [categoryId] };
    }
    setFilters(updatedFilters);

    // Update query parameters
    const newQueryParams = new URLSearchParams(searchParams);
    if (isSameCategorySelected) {
      newQueryParams.delete("category");
    } else {
      newQueryParams.set("category", categoryId);
    }
    setSearchParams(newQueryParams);
  };

  return (
    <div className="bg-background rounded-lg shadow-sm">
      {/* Filter Title & Dropdown Toggle on Mobile */}
      <div
        className="p-4 border-b flex justify-between items-center"
        onClick={toggleDropdown}
      >
        <h2 className="text-lg font-extrabold">Filters</h2>
        <button className="md:hidden p-2 rounded-md">
          <ChevronDown
            size={20}
            className={`transition-transform duration-300 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {/* Filter options */}
      <div
        className={`p-4 space-y-4 md:block ${
          isDropdownOpen ? "block" : "hidden md:block"
        }`}
      >
        {/* Dynamic Category Filter */}
        <div>
          <h3 className="text-base text-lg font-bold">Category</h3>
          <div className="grid gap-2 mt-2">
            {categoriesList.map((category) => (
              <Label
                className="flex text-md font-medium items-center gap-2"
                key={category._id}
              >
                <Checkbox
                  checked={
                    filters.category?.length > 0 &&
                    filters.category[0] === category._id
                  }
                  onCheckedChange={() =>
                    handleSingleCategoryFilter(category._id)
                  }
                />
                {category.name}
              </Label>
            ))}
          </div>
        </div>
        <Separator />
        {/* Static Price Filter */}
        <div>
          <h3 className="text-base text-lg font-bold">Price</h3>
          <div className="grid gap-2 mt-2">
            {[
              { id: "0-1000", label: "0 - 1000" },
              { id: "1000-2000", label: "1000 - 2000" },
              { id: "2000-3000", label: "2000 - 3000" },
              { id: "3000-4000", label: "3000 - 4000" },
              { id: "4000-5000", label: "4000 - 5000" },
              { id: "5000-6000", label: "5000 - 6000" },
              { id: "6000-", label: "6000 and above" }
            ].map((option) => (
              <Label
                className="flex text-md font-medium items-center gap-2"
                key={option.id}
              >
                <Checkbox
                  checked={
                    filters.price?.length > 0 &&
                    filters.price.includes(option.id)
                  }
                  onCheckedChange={() => handleFilter("price", option.id)}
                />
                {option.label}
              </Label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductFilter;