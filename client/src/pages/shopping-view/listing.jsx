import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import ProductFilter from "@/components/shopping-view/filter";
import { fetchProductDetails, fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDownIcon, ShoppingBag, ChevronRight } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { sortOptions } from "@/config";
import { Helmet } from "react-helmet-async";
import { fetchCategories } from "@/store/shop/categories-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import banner from '@/assets/allproducts.png';

function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, productDetails, isLoading } = useSelector((state) => state.shopProducts);
  const { categoriesList } = useSelector((state) => state.shopCategories);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const { toast } = useToast();
  const categorySearchParam = searchParams.get("category");
  const [currentCategory, setCurrentCategory] = useState(null);

  // Find current category details
  useEffect(() => {
    if (categorySearchParam && categoriesList.length > 0) {
      const category = categoriesList.find(cat => cat._id === categorySearchParam);
      setCurrentCategory(category);
    } else {
      setCurrentCategory(null);
    }
  }, [categorySearchParam, categoriesList]);

  // Fetch categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    let updatedProducts = [...productList];

    // Apply category filter from URL parameters
    if (categorySearchParam) {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === categorySearchParam
      );
    }

    // Apply additional filters from the filters state
    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, values]) => {
        if (key === "price") {
          // Handle price filter, including "6000 and above"
          updatedProducts = updatedProducts.filter((product) =>
            values.some((range) => {
              const [minStr, maxStr] = range.split("-");
              const min = Number(minStr);
              const max = maxStr ? Number(maxStr) : Infinity;
              return product.salePrice >= min && product.salePrice <= max;
            })
          );
        } else {
          // Handle other filters
          updatedProducts = updatedProducts.filter((product) =>
            values.some((value) => product[key] === value)
          );
        }
      });
    }

    // Apply sorting
    if (sort === "price-lowtohigh") {
      updatedProducts.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sort === "price-hightolow") {
      updatedProducts.sort((a, b) => b.salePrice - a.salePrice);
    }

    return updatedProducts;
  }, [productList, filters, sort, categorySearchParam]);

  const handleFilter = (filterKey, filterValue) => {
    const updatedFilters = { ...filters };

    // Add or remove filter value
    if (!updatedFilters[filterKey]) {
      updatedFilters[filterKey] = [filterValue];
    } else {
      const index = updatedFilters[filterKey].indexOf(filterValue);
      if (index === -1) {
        updatedFilters[filterKey].push(filterValue);
      } else {
        updatedFilters[filterKey].splice(index, 1);
      }
    }

    // Remove filter if empty after removal
    if (updatedFilters[filterKey]?.length === 0) {
      delete updatedFilters[filterKey];
    }

    setFilters(updatedFilters);
  };

  function handleSort(value) {
    setSort(value);
  }

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    const getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        colorId: productList.find((product) => product._id === getCurrentProductId)?.colors[0]?._id,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  // Optimize fetching by using a single useEffect for filter/sort changes
  useEffect(() => {
    const filterParams = {};
    if (categorySearchParam) {
      filterParams.category = categorySearchParam;
    }
    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, values]) => {
        filterParams[key] = values;
      });
    }
    dispatch(
      fetchAllFilteredProducts({
        filterParams: Object.keys(filterParams).length > 0 ? filterParams : null,
        sortParams: sort,
      })
    );
  }, [dispatch, categorySearchParam, filters, sort]);

  // Show loader only when productList is initially loading (i.e. empty)
  if (isLoading && productList.length === 0) return <Loader />;

  return (
    <>
      <Helmet>
        <title>{currentCategory ? `${currentCategory?.name} Collection` : 'All Products'} | Rachana Boutique</title>
        <meta name="description" content={`Explore our ${currentCategory ? currentCategory.title : 'exclusive'} collection of premium sarees and ethnic wear at Rachana Boutique.`} />
      </Helmet>

      <div className="bg-white">
        {/* Category Banner */}
        <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
          <img
            src={currentCategory?.image || banner}
            alt={currentCategory?.name || "All Products"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-35 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-light uppercase tracking-wide text-white mb-4">
                {currentCategory?.name || "All Products"}
              </h1>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>
          </div>
        </div>

      

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4 md:py-8 ">
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
            {/* Filter Component */}
            <div className="hidden md:block bg-white p-6 border border-gray-200 rounded-md shadow-sm">
              <h2 className="text-xl font-light uppercase tracking-wide mb-4">Filters</h2>
              <div className="w-12 h-0.5 bg-black mb-6"></div>
              <ProductFilter
                filters={filters}
                setFilters={setFilters}
                handleFilter={handleFilter}
              />
            </div>

            {/* Product Listing */}
            <div className="bg-white">
              <div className="hidden md:flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-light uppercase tracking-wide mb-2">
                    {currentCategory?.title || "All Products"}
                  </h2>
                  <p className="text-gray-500">
                    Showing {filteredProducts.length} products
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <ArrowUpDownIcon className="h-4 w-4" />
                      <span>Sort by: {sortOptions.find(option => option.id === sort)?.label || 'Default'}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="mt-2 bg-white p-2 rounded-md shadow-lg border border-gray-200">
                      <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                        {sortOptions.map((sortItem) => (
                          <DropdownMenuRadioItem
                            className="hover:bg-gray-100 cursor-pointer px-4 py-2 rounded-md"
                            value={sortItem.id}
                            key={sortItem.id}
                          >
                            {sortItem.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b md:hidden">
                <div className="w-full flex items-center justify-between">
                  <h2 className="text-2xl font-light uppercase tracking-wide mb-2">
                    {currentCategory?.title || "All Products"}
                  </h2>
                
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <ArrowUpDownIcon className="h-4 w-4" />
                      <span>{sortOptions.find(option => option.id === sort)?.label || 'Default'}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="mt-2 bg-white p-2 rounded-md shadow-lg border border-gray-200">
                      <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                        {sortOptions.map((sortItem) => (
                          <DropdownMenuRadioItem
                            className="hover:bg-gray-100 cursor-pointer px-4 py-2 rounded-md"
                            value={sortItem.id}
                            key={sortItem.id}
                          >
                            {sortItem.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
           
                 
                </div>
                <p className="text-gray-500">
                    Showing {filteredProducts.length} products
                  </p>
               
              </div>

              <div className="md:hidden">
              
              <ProductFilter
                filters={filters}
                setFilters={setFilters}
                handleFilter={handleFilter}
              />
            </div>


              {/* Products Grid - Using Original ShoppingProductTile */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((productItem) => (
                  <ShoppingProductTile
                    key={productItem._id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Products Found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or browse our other collections</p>
                  <button
                    onClick={() => {
                      setFilters({});
                      setSort(null);
                    }}
                    className="px-6 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ShoppingListing;