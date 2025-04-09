import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDownIcon, ShoppingBag } from "lucide-react";
import ProductFilter from "@/components/shopping-view/filter";
import Breadcrumb from "@/components/shopping-view/breadcrumb";
import { Loader } from "@/components/ui/loader";
import { sortOptions, categoryMapping } from "@/config";
import { Helmet } from "react-helmet-async";
import { fetchCategories } from "@/store/shop/categories-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import banner from '@/assets/allproducts.png';

function ShoppingListing({ categorySlug }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, isLoading } = useSelector((state) => state.shopProducts);
  const { categoriesList } = useSelector((state) => state.shopCategories);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const { toast } = useToast();
  const categorySearchParam = searchParams.get("category");
  const [currentCategory, setCurrentCategory] = useState(null);


  // Use category mapping from config imported at the top

  // Find current category details from either URL param or slug prop
  useEffect(() => {
    if (categoriesList.length > 0) {
      // If we have a categorySlug prop (from the route), use that
      if (categorySlug) {
        const mappedCategory = categoryMapping.find(cat => cat.slug === categorySlug);
        if (mappedCategory) {
          const category = categoriesList.find(cat => cat._id === mappedCategory.id);
          setCurrentCategory(category);
        } else {
          setCurrentCategory(null);
        }
      }
      // Otherwise use the category from URL search params
      else if (categorySearchParam) {
        const category = categoriesList.find(cat => cat._id === categorySearchParam);
        setCurrentCategory(category);
      } else {
        setCurrentCategory(null);
      }
    }
  }, [categorySearchParam, categoriesList, categorySlug]);

  // Fetch categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    let updatedProducts = [...productList];

    // Apply category filter from currentCategory (which can come from either URL parameters or categorySlug)
    if (currentCategory) {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === currentCategory._id
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
        } else if (key === "outOfStock") {
          // Handle out of stock filter
          updatedProducts = updatedProducts.filter((product) =>
            product.totalStock <= 0
          );
        } else {
          // Handle other filters (isNewArrival, isFeatured, category)
          updatedProducts = updatedProducts.filter((product) =>
            values.some((value) => {
              // Convert string "true" to boolean true for boolean fields
              if (value === "true" && typeof product[key] === "boolean") {
                return product[key] === true;
              }
              return product[key] === value;
            })
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
    navigate(`/shop/details/${getCurrentProductId}`);
  }

    function handleAddtoCart(product) {
      const productId = product._id;
      const totalStock = product.totalStock;

      // Check if user is authenticated
      if (!isAuthenticated) {
        toast({
          title: "Please log in to add items to the cart!",
          variant: "destructive",
        });
        return Promise.reject("Not authenticated");
      }

      // Check if product is in stock
      if (totalStock <= 0) {
        toast({
          title: "This product is out of stock",
          variant: "destructive",
        });
        return Promise.reject("Out of stock");
      }

      // Check if adding one more would exceed stock limit
      let currentCartItems = cartItems.items || [];
      if (currentCartItems.length) {
        const itemIndex = currentCartItems.findIndex(
          (item) => item.productId === productId
        );
        if (itemIndex > -1) {
          const currentQuantity = currentCartItems[itemIndex].quantity;
          if (currentQuantity + 1 > totalStock) {
            toast({
              title: `Only ${totalStock} quantity available for this item`,
              variant: "destructive",
            });
            return Promise.reject("Exceeds stock limit");
          }
        }
      }

      // Get the first color if available
      const colorId = product?.colors && product.colors.length > 0
        ? product.colors[0]._id
        : undefined;

      // Add to cart
      return dispatch(
        addToCart({
          userId: user?.id,
          productId: productId,
          quantity: 1,
          colorId: colorId,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          // Force a refresh of the cart items to ensure we have the latest data
          return dispatch(fetchCartItems(user?.id)).then(() => {
            toast({
              title: "Product added to cart",
            });
            return data;
          });
        }
        return data;
      });
    }

/*   function handleAddtoCart(getCurrentProductId, getTotalStock) {
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
  } */

  // Optimize fetching by using a single useEffect for filter/sort changes
  useEffect(() => {
    const filterParams = {};
    // Use currentCategory instead of categorySearchParam
    if (currentCategory) {
      filterParams.category = currentCategory._id;
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
  }, [dispatch, currentCategory, filters, sort]);

  // Get category description from mapping
  const getCategoryDescription = useMemo(() => {
    if (!currentCategory) return "";

    const mappedCategory = categoryMapping.find(cat => cat.id === currentCategory._id);
    return mappedCategory ? mappedCategory.description : "";
  }, [currentCategory]);

  // Get SEO-friendly URL for current category
  const getCategoryUrl = useMemo(() => {
    if (!currentCategory) return "/shop/collections";

    const mappedCategory = categoryMapping.find(cat => cat.id === currentCategory._id);
    return mappedCategory ? `/shop/collections/${mappedCategory.slug}` : `/shop/collections?category=${currentCategory._id}`;
  }, [currentCategory]);

  const structuredData = useMemo(() => {
    const baseUrl = 'https://rachanaboutique.in';

    let data = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "All Products",
      "url": `${baseUrl}${location.pathname}${location.search}`,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${baseUrl}/shop/home`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Collections",
            "item": `${baseUrl}/shop/collections`
          }
        ]
      }
    };

    if (currentCategory) {
      const categoryUrl = getCategoryUrl.startsWith('/') ?
        `${baseUrl}${getCategoryUrl}` :
        `${baseUrl}/shop/collections?category=${currentCategory._id}`;

      data.name = `${currentCategory.name} Collection`;
      data.url = categoryUrl;
      data.breadcrumb.itemListElement.push({
        "@type": "ListItem",
        "position": 3,
        "name": currentCategory.name,
        "item": categoryUrl
      });

      data = {
        ...data,
        "description": getCategoryDescription || `Explore our ${currentCategory.name} collection of premium sarees and ethnic wear at Rachana Boutique.`,
        "image": currentCategory.image || banner,
        "offers": {
          "@type": "AggregateOffer",
          "offerCount": filteredProducts.length,
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock"
        }
      };
    }

    return data;
  }, [currentCategory, location.pathname, location.search, filteredProducts?.length, getCategoryDescription, getCategoryUrl]);


  // Show loader only when productList is initially loading (i.e. empty)
  if (isLoading && productList.length === 0) return <Loader />;

  return (
    <>
      <Helmet>
        <title>{currentCategory ? `${currentCategory?.name} Collection` : 'Premium Sarees Collection'} | Rachana Boutique</title>
        <meta
          name="description"
          content={getCategoryDescription || `Explore our ${currentCategory ? currentCategory.name : 'exclusive'} collection of premium handcrafted sarees and ethnic wear. Find authentic ${currentCategory?.name || 'designer'} sarees with unique designs and premium quality at Rachana Boutique.`}
        />
        <meta
          name="keywords"
          content={`${currentCategory?.name || 'premium'} sarees, ${currentCategory?.name || 'designer'} ethnic wear, ${currentCategory?.name || 'handcrafted'} sarees online, buy ${currentCategory?.name || 'authentic'} sarees, Rachana Boutique collection, Indian traditional wear, ${currentCategory?.name || 'exclusive'} saree designs`}
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Rachana Boutique" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />

        {/* Open Graph tags */}
        <meta property="og:title" content={`${currentCategory ? `${currentCategory?.name} Collection` : 'Premium Sarees Collection'} | Rachana Boutique`} />
        <meta property="og:description" content={`Explore our ${currentCategory ? currentCategory.name : 'exclusive'} collection of premium handcrafted sarees and ethnic wear. Find authentic designs at Rachana Boutique.`} />
        <meta property="og:image" content={currentCategory?.image || banner} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Rachana Boutique" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${currentCategory ? `${currentCategory?.name} Collection` : 'Premium Sarees Collection'} | Rachana Boutique`} />
        <meta name="twitter:description" content={`Explore our ${currentCategory ? currentCategory.name : 'exclusive'} collection of premium handcrafted sarees and ethnic wear. Find authentic designs at Rachana Boutique.`} />
        <meta name="twitter:image" content={currentCategory?.image || banner} />
        <meta name="twitter:site" content="@rachanaboutique" />

        {/* Canonical URL - Use SEO-friendly URLs */}
        <link rel="canonical" href={currentCategory ?
          `https://rachanaboutique.in${getCategoryUrl}` :
          "https://rachanaboutique.in/shop/collections"} />

        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>

        {/* Additional structured data for ItemList */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": filteredProducts.slice(0, 10).map((product, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": product.title,
                "image": product.image && product.image.length > 0 ? product.image[0] : '',
                "description": product.description,
                "url": `https://rachanaboutique.in/shop/details/${product._id}`,
                "offers": {
                  "@type": "Offer",
                  "price": product.salePrice > 0 ? product.salePrice : product.price,
                  "priceCurrency": "INR",
                  "availability": product.totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                }
              }
            }))
          })}
        </script>
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

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", path: "/shop/home" },
            { label: "Collections", path: "/shop/collections" },
            ...currentCategory ? [{ label: currentCategory.name, path: getCategoryUrl }] : []
          ]}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 gap-8">
            {/* Product Listing */}
            <div className="bg-white">
              <div className="hidden md:flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b">
                <div>
                 {/*  <h2 className="text-2xl font-light uppercase tracking-wide mb-2">
                    {currentCategory?.title || "All Products"}
                  </h2>
                  <p className="text-gray-500">
                    {isLoading ? "Loading..." : `Showing ${filteredProducts.length} products`}
                  </p> */}
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                  {/* Filter Component for Desktop */}
                  <div className="hidden md:block">
                    <ProductFilter
                      filters={filters}
                      setFilters={setFilters}
                      handleFilter={handleFilter}
                    />
                  </div>

                  {/* Sort Dropdown */}
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
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-light uppercase tracking-wide">
                      {currentCategory?.title || "All Products"}
                    </h2>

                    {/* Mobile Sort Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-1/4 h-8 flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        <ArrowUpDownIcon className="h-3 w-3" />
                        <span className="text-md">Sort</span>
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

                  <p className="text-gray-500 mb-3">
                    {isLoading ? "Loading..." : `Showing ${filteredProducts.length} products`}
                  </p>

                  {/* Mobile Filter */}
                  <ProductFilter
                    filters={filters}
                    setFilters={setFilters}
                    handleFilter={handleFilter}
                  />
                </div>
              </div>


              {/* Products Grid - Using Original ShoppingProductTile */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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