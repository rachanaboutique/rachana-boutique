import { filterOptions } from "@/config";
import { Fragment, useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { ChevronDown } from "lucide-react"; // Import the down arrow icon

function ProductFilter({ filters, handleFilter }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to toggle dropdown visibility

  // Toggle dropdown on mobile
  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  return (
    <div className="bg-background rounded-lg shadow-sm">
      {/* Filter Title & Dropdown Toggle on Mobile */}
      <div className="p-4 border-b flex justify-between items-center" onClick={toggleDropdown}>
        <h2 className="text-lg font-extrabold">Filters</h2>
        {/* Dropdown icon on mobile */}
        <button
          className="md:hidden p-2 rounded-md"
        >
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
        className={`p-4 space-y-4 md:block ${isDropdownOpen ? "block" : "hidden md:block"}`}
      >
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-base text-lg font-bold">{keyItem}</h3>
              <div className="grid gap-2 mt-2">
                {filterOptions[keyItem].map((option) => (
                  <Label className="flex text-md font-medium items-center gap-2 " key={option.id}>
                    <Checkbox
                      checked={
                        filters &&
                        Object.keys(filters).length > 0 &&
                        filters[keyItem] &&
                        filters[keyItem].indexOf(option.id) > -1
                      }
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </div>
            <Separator />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
