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

  // Enhanced category descriptions with more detailed content
  const getCategoryDescription = useMemo(() => {
    if (!currentCategory) return "";

    // Return detailed description based on category ID
    switch (currentCategory._id) {
      case "67a4cedeb03c04a4eaa7d75d": // Tussar
        return "Discover our exquisite Tussar saree collection featuring luxurious and lightweight designs with rich texture and natural sheen. Each Tussar saree is handcrafted with meticulous attention to detail, showcasing authentic craftsmanship and traditional techniques. Perfect for festive occasions, weddings, and elegant events, our Tussar sarees bring timeless charm and sophistication to your wardrobe. Browse our complete collection to find the perfect Tussar saree that reflects your personal style and elegance.";
      case "67a702e745c9ad11e043ca74": // Banaras
        return "Explore our premium Banaras saree collection featuring handwoven designs with intricate zari work that reflects royal heritage and tradition. Each Banaras saree in our collection is crafted by skilled artisans using time-honored techniques, resulting in exquisite drapes that showcase unparalleled craftsmanship. Perfect for weddings, grand celebrations, and special occasions, our Banaras sarees add a touch of regal elegance to your ensemble. Discover the rich cultural heritage embodied in every piece of our carefully curated Banaras collection.";
      case "67a4e2b19baa2e6f977087a3": // Cotton
        return "Browse our exclusive Cotton saree collection featuring soft, breathable, and effortlessly stylish designs that blend comfort with elegance. Each Cotton saree is carefully selected for its premium quality, beautiful patterns, and exquisite craftsmanship. Ideal for daily wear, office settings, casual outings, and formal occasions, our Cotton sarees keep you cool, comfortable, and graceful all day long. Discover the perfect balance of tradition and contemporary style in our diverse range of handpicked Cotton sarees suitable for every season and occasion.";
      case "67ae15fcee205890c3cd5f98": // Organza
        return "Indulge in our delicate and dreamy Organza saree collection that exudes sheer elegance with its lightweight flow and translucent beauty. Each Organza saree features intricate embroidery, delicate prints, or stunning embellishments that showcase exceptional craftsmanship and attention to detail. A perfect choice for modern women who love a blend of sophistication and charm, our Organza sarees are ideal for receptions, cocktail parties, and special celebrations. Explore our carefully curated collection to find the perfect Organza saree that makes a statement wherever you go.";
      case "67ae17d5ee205890c3cd5faf": // Georgette
        return "Discover our premium Georgette saree collection featuring flowy, stylish, and easy-to-drape designs created for all-day elegance and comfort. Each Georgette saree in our collection showcases beautiful prints, intricate embroidery, or delicate embellishments that highlight the fluid nature of this luxurious fabric. Whether for casual outings, office wear, or grand events, our Georgette sarees add a touch of effortless beauty and sophistication to your appearance. Browse our extensive range to find the perfect Georgette saree that complements your personal style and occasion.";
      case "67ae2128ee205890c3cd6251": // Celebrity Collection
        return "Experience the glamour of Bollywood with our exclusive Celebrity Collection featuring sarees inspired by your favorite icons and silver screen moments. Each saree in this collection is carefully designed to capture the essence of celebrity style while maintaining authentic craftsmanship and premium quality. Drape yourself in star-studded elegance and steal the spotlight at parties, events, and special occasions with these statement pieces. Our Celebrity Collection offers you the perfect opportunity to embrace the glamour and sophistication of celebrity fashion while expressing your unique personal style.";
      default:
        const mappedCategory = categoryMapping.find(cat => cat.id === currentCategory._id);
        return mappedCategory?.description || `Our ${currentCategory.name} collection features premium handcrafted sarees designed with exquisite attention to detail and authentic craftsmanship. Each piece is carefully selected to ensure the highest quality and most beautiful designs, perfect for special occasions and everyday elegance.`;
    }
  }, [currentCategory, categoryMapping]);

  // Get SEO-friendly URL for current category - Always use SEO-friendly URLs
  const getCategoryUrl = useMemo(() => {
    if (!currentCategory) return "/shop/collections";

    const mappedCategory = categoryMapping.find(cat => cat.id === currentCategory._id);
    return mappedCategory ?
      `/shop/collections/${mappedCategory.slug}` :
      `/shop/collections/${currentCategory.name.toLowerCase().replace(/\s+/g, '-')}`; // Fallback to a slug based on category name
  }, [currentCategory, categoryMapping]);

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

      data.name = `${currentCategory.name} Collection | Premium Sarees | Rachana Boutique`;
      data.url = categoryUrl;
      data.description = getCategoryDescription || `Explore our ${currentCategory.name} collection of premium handcrafted sarees featuring exquisite designs and authentic craftsmanship. Each piece is carefully selected to ensure the highest quality.`;
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
  }, [currentCategory, location.pathname, location.search, filteredProducts?.length, getCategoryDescription, getCategoryUrl]);


  // Show loader only when productList is initially loading (i.e. empty)
  if (isLoading && productList.length === 0) return <Loader />;

  return (
    <>
      <Helmet>
        <title>{currentCategory ? `${currentCategory?.name} Collection  | Rachana Boutique` : 'Collections  | Rachana Boutique'}</title>
        <meta
          name="description"
          content={currentCategory ?
            (getCategoryDescription || `Explore our exquisite ${currentCategory.name} saree collection featuring premium handcrafted designs with authentic craftsmanship. Each ${currentCategory.name} saree is carefully selected for quality and beauty. Shop now at Rachana Boutique.`) :
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
        <meta property="og:title" content={currentCategory ? `${currentCategory?.name} Collection | Premium Sarees | Rachana Boutique` : 'Premium Saree Collections | Handcrafted Ethnic Wear | Rachana Boutique'} />
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
        <meta name="twitter:title" content={currentCategory ? `${currentCategory?.name} Collection | Premium Sarees | Rachana Boutique` : 'Premium Saree Collections | Handcrafted Ethnic Wear | Rachana Boutique'} />
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

              {/* Collection Description Section - Always visible */}
              <div className="mb-12 mt-8 p-6 bg-gray-50 rounded-lg">
                <h2 className="text-2xl font-medium mb-4">{currentCategory ? `About Our ${currentCategory.name} Collection` : 'Our Premium Collections'}</h2>
                <div className="prose max-w-none">
                  {currentCategory ? (
                    <>
                      <p className="mb-4">{getCategoryDescription || `Our ${currentCategory.name} collection features premium handcrafted sarees designed with exquisite attention to detail and authentic craftsmanship.`}</p>
                      <p>Each piece in our {currentCategory.name} collection is carefully selected to ensure the highest quality and most beautiful designs. Perfect for special occasions, festivals, and everyday elegance.</p>
                    </>
                  ) : (
                    <>
                      <p className="mb-4">Discover our exquisite range of premium handcrafted sarees at Rachana Boutique. Our collections feature the finest fabrics and craftsmanship from across India.</p>
                      <p>From traditional Banarasi silk to comfortable Cotton, elegant Tussar, and glamorous Celebrity-inspired designs, we offer sarees for every occasion and preference.</p>
                    </>
                  )}
                </div>
              </div>

              {/* Empty State - Improved with more content */}
              {filteredProducts.length === 0 && (
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