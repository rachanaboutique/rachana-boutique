import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
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
import { useMetaPixelCart } from "@/hooks/useMetaPixelCart";
import { addToTempCart } from "@/utils/tempCartManager";
import { addToCartEvent } from "@/utils/metaPixelEvents";

function ShoppingListing({ categorySlug }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { productList, isLoading: productsLoading } = useSelector((state) => state.shopProducts);
  const { categoriesList, isLoading: categoriesLoading } = useSelector((state) => state.shopCategories);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const { toast } = useToast();
  const categorySearchParam = searchParams.get("category");
  const [currentCategory, setCurrentCategory] = useState(null);
  const { trackAddToCart } = useMetaPixelCart();


  // Use category mapping from config imported at the top

  // Find current category details from either URL param or slug prop
  // Also handle redirects from old URL format to SEO-friendly URLs
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
      // Otherwise use the category from URL search params and redirect to SEO-friendly URL
      else if (categorySearchParam) {
        const category = categoriesList.find(cat => cat._id === categorySearchParam);
        setCurrentCategory(category);

        // Find the SEO-friendly slug for this category ID and redirect
        const mappedCategory = categoryMapping.find(cat => cat.id === categorySearchParam);
        if (mappedCategory) {
          // Use replace instead of navigate to avoid adding to history
          navigate(`/shop/collections/${mappedCategory.slug}`, { replace: true });
        }
      } else {
        setCurrentCategory(null);
      }
    }
  }, [categorySearchParam, categoriesList, categorySlug, navigate]);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Initial product fetch when component mounts
  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: null,
        sortParams: null,
      })
    );
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

    // Apply sorting only if backend sorting is not working properly
    // Backend sorting is applied via fetchAllFilteredProducts with sortParams
    // Frontend sorting is kept as fallback for client-side filtering
    if (sort === "price-lowtohigh") {
      updatedProducts.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sort === "price-hightolow") {
      updatedProducts.sort((a, b) => b.salePrice - a.salePrice);
    }

    // For product code sorting, let's rely primarily on backend sorting
    // and only apply frontend sorting if needed for client-side filtering
    if (sort === "productcode-atoz" || sort === "productcode-ztoa") {
      // Check if products are already sorted by backend
      const isAlreadySorted = updatedProducts.length > 1 &&
        updatedProducts.every((product, index) => {
          if (index === 0) return true;
          const currentCode = (product.productCode || '').toString().trim();
          const prevCode = (updatedProducts[index - 1].productCode || '').toString().trim();

          if (sort === "productcode-atoz") {
            return !currentCode || !prevCode || currentCode >= prevCode;
          } else {
            return !currentCode || !prevCode || currentCode <= prevCode;
          }
        });

      // Only apply frontend sorting if backend sorting didn't work
      if (!isAlreadySorted) {
        console.log('Applying frontend product code sorting as fallback');

        if (sort === "productcode-atoz") {
          updatedProducts.sort((a, b) => {
            const codeA = (a.productCode || '').toString().trim();
            const codeB = (b.productCode || '').toString().trim();

            if (!codeA && !codeB) return 0;
            if (!codeA) return 1;
            if (!codeB) return -1;

            return codeA.localeCompare(codeB, 'en', { numeric: true });
          });
        } else if (sort === "productcode-ztoa") {
          updatedProducts.sort((a, b) => {
            const codeA = (a.productCode || '').toString().trim();
            const codeB = (b.productCode || '').toString().trim();

            if (!codeA && !codeB) return 0;
            if (!codeA) return 1;
            if (!codeB) return -1;

            return codeB.localeCompare(codeA, 'en', { numeric: true });
          });
        }
      } else {
        console.log('Backend product code sorting is working correctly');
      }
    }

    return updatedProducts;
  }, [productList, filters, sort, currentCategory]);



  const handleFilter = useCallback((filterKey, filterValue) => {
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
  }, [filters]);

  const handleSort = useCallback((value) => {
    setSort(value);
  }, []);



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

  // Fetch products when filters, sort, or category changes (but not on initial mount)
  useEffect(() => {
    // Skip if this is the initial render and no filters/sort are applied
    if (!currentCategory && Object.keys(filters).length === 0 && !sort) {
      return;
    }

    const filterParams = {};
    // Use currentCategory instead of categorySearchParam
    if (currentCategory?._id) {
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
  }, [dispatch, currentCategory?._id, filters, sort]);

  // Enhanced category descriptions with more detailed content
  const getCategoryDescription = useMemo(() => {
    if (!currentCategory) return "";

    const mappedCategory = categoryMapping.find(cat => cat.id === currentCategory._id);
    console.log(mappedCategory);
    return mappedCategory?.description || "";
  }, [currentCategory]);

  // Get SEO-friendly URL for current category - Always use SEO-friendly URLs
  const getCategoryUrl = useMemo(() => {
    if (!currentCategory) return "/shop/collections";

    const mappedCategory = categoryMapping.find(cat => cat.id === currentCategory._id);
    return mappedCategory ?
      `/shop/collections/${mappedCategory.slug}` :
      `/shop/collections/${currentCategory.name.toLowerCase().replace(/\s+/g, '-')}`; // Fallback to a slug based on category name
  }, [currentCategory]);

  // Memoize the handleAddtoCart function to prevent unnecessary re-renders
  const handleAddtoCart = useCallback((product) => {
    const productId = product._id;
    const totalStock = product.totalStock;

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Add to temporary cart and redirect to checkout
      const tempCartItem = {
        productId: productId,
        colorId: product?.colors?.[0]?._id || null,
        quantity: 1,
        productDetails: {
          title: product?.title,
          price: product?.price,
          salePrice: product?.salePrice,
          image: product?.image?.[0] || '',
          category: product?.category,
          productCode: product?.productCode || null
        }
      };

      const success = addToTempCart(tempCartItem);

      if (success) {
        // Track Meta Pixel AddToCart event
        setTimeout(() => {
          addToCartEvent({
            content_ids: [productId],
            content_type: 'product',
            value: product?.salePrice || product?.price || 0,
            currency: 'INR',
            content_name: product?.title,
            content_category: product?.category,
            num_items: 1
          });

          console.log('Meta Pixel: AddToCart tracked from Listing (temp cart)', {
            productId: productId,
            productName: product?.title,
            value: product?.salePrice || product?.price || 0
          });
        }, 100);

        toast({
          title: "Item added to cart!",
          variant: "default",
        });

        return Promise.resolve({ success: true });
      } else {
        toast({
          title: "Failed to add item to cart. Please try again.",
          variant: "destructive",
        });
        return Promise.reject("Failed to add to temp cart");
      }
    }

    // Check if product is in stock
    if (totalStock <= 0) {
      toast({
        title: "This product is out of stock",
        variant: "destructive",
      });
      return Promise.reject("Out of stock");
    }

    // Get the first available color (with inventory > 0) if product has colors
    let colorId = undefined;
    let selectedColor = null;

    if (product?.colors && product.colors.length > 0) {
      selectedColor = product.colors.find(color => color.inventory > 0);

      if (!selectedColor) {
        toast({
          title: "All colors are out of stock",
          variant: "destructive",
        });
        return Promise.reject("All colors out of stock");
      }

      colorId = selectedColor._id;

      // Check color inventory
      let currentCartItems = cartItems.items || [];
      const itemIndex = currentCartItems.findIndex(
        (item) => item.productId === productId &&
                  item.colors &&
                  item.colors._id === colorId
      );

      if (itemIndex > -1) {
        const currentQuantity = currentCartItems[itemIndex].quantity;
        if (currentQuantity + 1 > selectedColor.inventory) {
          toast({
            title: `Only ${selectedColor.inventory} quantity available for ${selectedColor.title}`,
            variant: "destructive",
          });
          return Promise.reject("Exceeds color stock limit");
        }
      }
    } else {
      // Check total stock for products without colors
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
    }

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
        // Track Meta Pixel AddToCart event
        trackAddToCart(productId, colorId, 1);

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
  }, [isAuthenticated, cartItems.items, dispatch, user?.id, toast, trackAddToCart]);

  // Memoize the handleGetProductDetails function
  const handleGetProductDetails = useCallback((getCurrentProductId) => {
    navigate(`/shop/details/${getCurrentProductId}`);
  }, [navigate]);

  const structuredData = useMemo(() => {
    const baseUrl = 'https://rachanaboutique.in';
    const currentDate = new Date().toISOString();

    // Base structured data for all collection pages
    let data = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Collections | Rachana Boutique",
      "description": "Explore our exclusive collection of premium handcrafted sarees featuring the finest fabrics and authentic craftsmanship from across India.",
      "url": `${baseUrl}${location.pathname}`,
      "lastReviewed": currentDate,
      "dateModified": currentDate,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": filteredProducts.slice(0, 10).map((product, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": product.title,
            "image": product.image && product.image.length > 0 ? product.image[0] : '',
            "description": product.description,
            "url": `${baseUrl}/shop/details/${product._id}`,
            "brand": {
              "@type": "Brand",
              "name": "Rachana Boutique"
            },
            "offers": {
              "@type": "Offer",
              "price": product.salePrice > 0 ? product.salePrice : product.price,
              "priceCurrency": "INR",
              "availability": product.totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          }
        }))
      },
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
      },
      "publisher": {
        "@type": "Organization",
        "name": "Rachana Boutique",
        "logo": {
          "@type": "ImageObject",
          "url": "https://res.cloudinary.com/dhkdsvdvr/image/upload/v1740216697/logo2_wtwqkr.png"
        }
      }
    };

    // Add category-specific data if a category is selected
    if (currentCategory) {
      const categoryUrl = getCategoryUrl.startsWith('/') ?
        `${baseUrl}${getCategoryUrl}` :
        `${baseUrl}/shop/collections/${categoryMapping.find(cat => cat.id === currentCategory._id)?.slug || ''}`;

      data.name = `${currentCategory.name} Collection | Rachana Boutique`;
      data.url = categoryUrl;
      data.description = getCategoryDescription || "";
      data.image = currentCategory.image || banner;

      // Add this category to the breadcrumb
      data.breadcrumb.itemListElement.push({
        "@type": "ListItem",
        "position": 3,
        "name": currentCategory.name,
        "item": categoryUrl
      });

      // Add specific category metadata
      data.mainEntity = {
        "@type": "Product",
        "name": `${currentCategory.name} Saree Collection`,
        "description": getCategoryDescription || `Our premium ${currentCategory.name} saree collection features exquisite designs and authentic craftsmanship.`,
        "image": currentCategory.image || banner,
        "brand": {
          "@type": "Brand",
          "name": "Rachana Boutique"
        },
        "offers": {
          "@type": "AggregateOffer",
          "offerCount": filteredProducts.length,
          "lowPrice": filteredProducts.length > 0 ? Math.min(...filteredProducts.map(p => p.salePrice > 0 ? p.salePrice : p.price)) : 0,
          "highPrice": filteredProducts.length > 0 ? Math.max(...filteredProducts.map(p => p.salePrice > 0 ? p.salePrice : p.price)) : 0,
          "priceCurrency": "INR",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": filteredProducts.length > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder"
        }
      };
    }

    return data;
  }, [currentCategory, location.pathname, filteredProducts?.length, getCategoryDescription, getCategoryUrl]);


  // Show loader when either products or categories are loading and we don't have initial data
  const isInitialLoading = (productsLoading && productList.length === 0) || (categoriesLoading && categoriesList.length === 0);

  if (isInitialLoading) return (
<div className="flex items-center justify-center h-screen w-screen bg-white">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
</div>

);

  return (
    <>
      <Helmet>
        <title>{currentCategory ? `${currentCategory?.name} Collection  | Rachana Boutique` : 'Collections  | Rachana Boutique'}</title>
        <meta
          name="description"
          content={currentCategory ?
            (getCategoryDescription || "") :
            `Discover our premium saree collections at Rachana Boutique featuring exquisite handcrafted designs. Browse our Tussar, Banaras, Cotton, Celebrity-inspired, and other exclusive collections. Authentic craftsmanship for every occasion.`
          }
        />
        <meta
          name="keywords"
          content={currentCategory ?
            `${currentCategory.name} sarees, buy ${currentCategory.name} sarees online, premium ${currentCategory.name} collection, handcrafted ${currentCategory.name} sarees, authentic ${currentCategory.name} designs, Rachana Boutique ${currentCategory.name}, exclusive ${currentCategory.name} sarees, traditional ${currentCategory.name} wear` :
            `premium saree collections, handcrafted sarees, designer saree collections, Tussar sarees, Banaras sarees, Cotton sarees, Celebrity Collection, ethnic wear collections, Rachana Boutique collections, authentic saree designs`
          }
        />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="Rachana Boutique" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="3 days" />
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="format-detection" content="telephone=no" />

        {/* Open Graph tags - Enhanced for better social sharing */}
        <meta property="og:title" content={currentCategory ? `${currentCategory?.name} Collection | Rachana Boutique` : 'Premium Saree Collections | Handcrafted Ethnic Wear | Rachana Boutique'} />
        <meta property="og:description" content={currentCategory ?
          `Explore our exquisite ${currentCategory.name} saree collection featuring premium handcrafted designs with authentic craftsmanship. Each piece is carefully selected for quality and beauty.` :
          `Discover our premium saree collections at Rachana Boutique featuring exquisite handcrafted designs. Browse our Tussar, Banaras, Cotton, Celebrity-inspired collections.`
        } />
        <meta property="og:image" content={currentCategory?.image || banner} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={currentCategory ?
          `https://rachanaboutique.in${getCategoryUrl}` :
          "https://rachanaboutique.in/shop/collections"} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Rachana Boutique" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card tags - Enhanced for better social sharing */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentCategory ? `${currentCategory?.name} Collection | Rachana Boutique` : 'Premium Saree Collections | Handcrafted Ethnic Wear | Rachana Boutique'} />
        <meta name="twitter:description" content={currentCategory ?
          `Explore our exquisite ${currentCategory.name} saree collection featuring premium handcrafted designs with authentic craftsmanship. Shop now at Rachana Boutique.` :
          `Discover our premium saree collections at Rachana Boutique featuring exquisite handcrafted designs. Authentic craftsmanship for every occasion.`
        } />
        <meta name="twitter:image" content={currentCategory?.image || banner} />
        <meta name="twitter:site" content="@rachanaboutique" />
        <meta name="twitter:creator" content="@rachanaboutique" />

        {/* Canonical URL - Always use SEO-friendly URLs */}
        <link rel="canonical" href={currentCategory ?
          `https://rachanaboutique.in/shop/collections/${categoryMapping.find(cat => cat.id === currentCategory._id)?.slug || ''}` :
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
                  {/* <p className="text-gray-500">
                    {productsLoading ? "Loading..." : `Showing ${filteredProducts.length} products`}
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
                  </div>

                  {/* <p className="text-gray-500 mb-3">
                    {productsLoading ? "Loading..." : `Showing ${filteredProducts.length} products`}
                  </p> */}

                  {/* Mobile Filter and Sort Controls */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {/* Mobile Filter */}
                    <ProductFilter
                      filters={filters}
                      setFilters={setFilters}
                      handleFilter={handleFilter}
                    />

                    {/* Mobile Sort Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                        <ArrowUpDownIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Sort</span>
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
              </div>


              {/* Products Grid - Using Original ShoppingProductTile */}
              {productsLoading ? (
  //               <div
  //   style={{
  //     display: "flex",
  //     justifyContent: "center",
  //     alignItems: "center",
  //     height: "90vh",
  //     color: "#333333",
  //     fontSize: 24,
  //     fontWeight: 600,
  //     letterSpacing: 1,
  //     textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
  //   }}
  // >
  //   Loading...
  // </div>
  <div className="flex items-center justify-center h-screen w-screen bg-white">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
</div>

              ) : (
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
              )}

              {/* Collection Description Section - Always visible */}
              <div className="mb-12 mt-8 p-6 bg-gray-50 rounded-lg">
                <h2 className="text-2xl text-3xl font-semibold mb-4">
                  {currentCategory ? 
                    `About Our ${currentCategory.name}${currentCategory.name.toLowerCase().includes('collection') ? '' : ' Collection'}` : 
                    ''
                  }
                </h2>
                <div className="prose max-w-none">
                  {currentCategory  &&
                      <p className="text-md md:text-lg mb-4">{getCategoryDescription || ""}</p>
                     }
                </div>
              </div>

              {/* Empty State - Improved with more content */}
              {!productsLoading && filteredProducts.length === 0 && (
                <div className="text-center py-12 border-t border-b my-8">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Currently Updating Our Collection</h3>
                  <p className="text-gray-500 mb-6">We're adding new products to this collection. Please check back soon or explore our other beautiful collections.</p>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button
                      onClick={() => {
                        setFilters({});
                        setSort(null);
                      }}
                      className="px-6 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => navigate('/shop/collections')}
                      className="px-6 py-2 bg-primary text-white hover:bg-accent transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
                    >
                      Browse All Collections
                    </button>
                  </div>
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