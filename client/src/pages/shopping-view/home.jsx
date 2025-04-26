import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "@/styles/masonry.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";

import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { fetchCategories } from "@/store/shop/categories-slice";
import { fetchBanners } from "@/store/shop/banners-slice";
import { fetchInstaFeed } from "@/store/shop/instafeed-slice";
import CategoryCard from "@/components/shopping-view/categoryCard";
import Carousel from "@/components/shopping-view/carousel";

import InstagramFeed from "@/components/shopping-view/instagramFeed";
import Testimonials from "@/components/shopping-view/testimonials-new";
import Banner from "@/components/shopping-view/banner";
import ProductSlider from "@/components/shopping-view/product-slider";
import WatchAndBuy from "@/components/shopping-view/watch-and-buy-desktop";
import WatchAndBuyMobile from "@/components/shopping-view/watch-and-buy-mobile";
import bannerThree from "../../assets/saree.png";
import { Loader } from "../../components/ui/loader";

function ShoppingHome() {
  const [, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust the breakpoint if needed
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigate = useNavigate();
  const { productList, isLoading: productsLoading } = useSelector((state) => state.shopProducts);
  const { bannersList, isLoading: bannersLoading } = useSelector((state) => state.shopBanners);
  const { categoriesList, isLoading: categoriesLoading } = useSelector((state) => state.shopCategories);
  const { instaFeedPosts, isLoading: instaFeedLoading } = useSelector((state) => state.shopInstaFeed);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.shopCart);

  const dispatch = useDispatch();
  const { toast } = useToast();



  // Fetch all required data once
  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
    dispatch(fetchBanners());
    dispatch(fetchCategories());
    dispatch(fetchInstaFeed());
  }, [dispatch]);

  function handleGetProductDetails(productId) {
    dispatch(fetchProductDetails(productId));
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
  // Filter products with isWatchAndBuy flag
  const filteredProducts = productList && productList.length > 0
    ? productList.filter((productItem) => productItem?.isWatchAndBuy)
    : [];

  // Make sure we have products to display
  const hasWatchAndBuyProducts = filteredProducts.length > 0;

  // Add a class to the body when the component mounts to ensure proper slider styling
  useEffect(() => {
    // Add a class to help with mobile slider styling
    document.body.classList.add('has-product-slider');

    return () => {
      document.body.classList.remove('has-product-slider');
    };
  }, []);



  const isAnyLoading = productsLoading || bannersLoading || categoriesLoading || instaFeedLoading;
  if (isAnyLoading) return <Loader />;
  return (
    <>

      <Helmet>
        <title>Rachana Boutique</title>
        <meta name="description" content="Discover the finest handcrafted sarees and ethnic wear at Rachana Boutique. Exclusive designs, premium quality, and authentic craftsmanship for every occasion. Shop now!" />
        <meta name="keywords" content="Rachana Boutique, sarees online, buy sarees, silk sarees, wedding sarees, designer sarees, traditional sarees, ethnic wear, Indian fashion, premium sarees, handcrafted sarees, Banarasi sarees, Tussar sarees, Cotton sarees, Organza sarees, Kora sarees" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph tags for better social media sharing */}
        <meta property="og:title" content="Rachana Boutique" />
        <meta property="og:description" content="Discover the finest handcrafted sarees and ethnic wear at Rachana Boutique. Exclusive designs, premium quality, and authentic craftsmanship for every occasion." />
        <meta property="og:image" content={bannersList && bannersList.length > 0 ? bannersList[0].image : ''} />
        <meta property="og:url" content="https://rachanaboutique.in" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Rachana Boutique" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rachana Boutique" />
        <meta name="twitter:description" content="Discover the finest handcrafted sarees and ethnic wear at Rachana Boutique. Exclusive designs for every occasion." />
        <meta name="twitter:image" content={bannersList && bannersList.length > 0 ? bannersList[0].image : ''} />
        <meta name="twitter:site" content="@rachanaboutique" />

        {/* Additional SEO meta tags */}
        <meta name="author" content="Rachana Boutique" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="geo.region" content="IN" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://rachanaboutique.in" />

        {/* Structured data for organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Rachana Boutique",
            "url": "https://rachanaboutique.in",
            "logo": "https://rachanaboutique.in/logo.png",
            "sameAs": [
              "https://www.facebook.com/rachanaboutique",
              "https://www.instagram.com/rachanaboutique"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-XXXXXXXXXX",
              "contactType": "customer service"
            }
          })}
        </script>

        {/* Structured data for website */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://rachanaboutique.in",
            "name": "Rachana Boutique",
            "description": "Premium sarees and ethnic wear collection",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://rachanaboutique.in/shop/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>


      <div className="flex flex-col min-h-screen">
        <div className="relative w-full h-[400px] md:h-[700px] mb-0">
          <Carousel bannersList={bannersList} />
        </div>

        {/* Masonry layout desktop */}
        <section className="hidden md:block py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">Shop by Category</h2>
              <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
              <p className="text-gray-600">Discover our curated collections designed for every style and occasion</p>
            </div>

            {/* Masonry layout container */}
            <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
              {categoriesList &&
                categoriesList.map((categoryItem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 50,
                    }}
                    className="break-inside-avoid mb-4"
                  >
                    <CategoryCard
                      categoryItem={categoryItem}
                      index={index}
                      variant="masonry"
                    />
                  </motion.div>
                ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => navigate("/shop/collections")}
                className="inline-block px-8 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
              >
                View All Collections
              </button>
            </div>
          </div>
        </section>
        {/* Mobile layout */}
        <section className="py-8 bg-white md:hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">Shop by Category</h2>
              <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
              <p className="text-gray-600">Discover our curated collections designed for every style and occasion</p>
            </div>

            {/* Custom layout container - mobile: first card full width, rest in 2 columns; desktop: masonry */}
            <div className="hidden sm:block columns-2 md:columns-3 gap-4">
              {categoriesList &&
                categoriesList.map((categoryItem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 50,
                    }}
                    className="break-inside-avoid mb-4"
                  >
                    <CategoryCard
                      categoryItem={categoryItem}
                      index={index}
                      variant="masonry"
                    />
                  </motion.div>
                ))}
            </div>

            {/* Mobile layout - first card full width, rest in 2 columns, pattern repeats every 5 cards */}
            <div className="sm:hidden">
              {categoriesList && categoriesList.length > 0 &&
                Array.from({ length: Math.ceil(categoriesList.length / 5) }).map((_, groupIndex) => {
                  const startIndex = groupIndex * 5;
                  const groupItems = categoriesList.slice(startIndex, startIndex + 5);

                  return (
                    <div key={`group-${groupIndex}`} className="mb-4">
                      {/* First item in group - full width */}
                      {groupItems[0] && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: false, amount: 0.1 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.1,
                            type: "spring",
                            stiffness: 50,
                          }}
                          className="mb-4"
                        >
                          <CategoryCard
                            categoryItem={groupItems[0]}
                            index={startIndex}
                            variant="masonry"
                          />
                        </motion.div>
                      )}

                      {/* Remaining items in group - 2 column grid */}
                      {groupItems.length > 1 && (
                        <div className="grid grid-cols-2 gap-4">
                          {groupItems.slice(1).map((categoryItem, idx) => (
                            <motion.div
                              key={startIndex + idx + 1}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: false, amount: 0.1 }}
                              transition={{
                                duration: 0.5,
                                delay: (idx + 1) * 0.1,
                                type: "spring",
                                stiffness: 50,
                              }}
                            >
                              <CategoryCard
                                categoryItem={categoryItem}
                                index={startIndex + idx + 1}
                                variant="masonry"
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              }
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => navigate("/shop/collections")}
                className="inline-block px-8 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
              >
                View All Collections
              </button>
            </div>
          </div>
        </section>




        {/* New Arrivals Slider */}
        {productList && productList.filter(product => product?.isNewArrival).length > 0 && (
          <ProductSlider
            products={productList.filter(product => product?.isNewArrival)}
            handleGetProductDetails={handleGetProductDetails}
            handleAddtoCart={handleAddtoCart}
            title="New Arrivals"
            description="Explore our latest additions and be the first to wear them"
            bgColor="bg-white"
            isNewArrival={true}
          />
        )}

        {/* Featured Products Slider */}
        {productList && productList.filter(product => product?.isFeatured).length > 0 && (
          <ProductSlider
            products={productList.filter(product => product?.isFeatured)}
            handleGetProductDetails={handleGetProductDetails}
            handleAddtoCart={handleAddtoCart}
            title="Featured Picks"
            description="Discover our most popular styles and seasonal favorites"
            bgColor="bg-gray-50"
          />
        )}



        {/* Watch and Buy Section - Desktop and Mobile versions */}
        {hasWatchAndBuyProducts && (
          <>
            {/* Desktop version */}
            <div className="hidden md:block">
              <WatchAndBuy products={filteredProducts} handleAddtoCart={handleAddtoCart} />
            </div>

            {/* Mobile version */}
            <div className="md:hidden">
              <WatchAndBuyMobile products={filteredProducts} handleAddtoCart={handleAddtoCart} />
            </div>
          </>
        )}

        <section className="py-8">
          <Banner
            imageUrl={bannerThree}
            altText="Banner 3"
            description="Exciting Offers & Discounts. Don't miss out! Shop now and save big. Best deals on your favorite products."
          />
        </section>

        <section className="py-8 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">THE RACHANA LOOKBOOK</h2>
              <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
              <p className="text-gray-600">Get inspired by our Instagram feed and share your looks with #OurFashionStyle</p>
            </div>
            <InstagramFeed posts={instaFeedPosts} />

            <div className="text-center mt-10">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-wider font-medium hover:underline"
              >
                Follow us on Instagram
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">Customer Stories</h2>
              <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
              <p className="text-gray-600">Discover the heartfelt experiences of our customers, woven with the beauty of our sarees</p>
            </div>
            <Testimonials />
          </div>
        </section>
        <div className="mt-4">

        </div>
      </div>
    </>
  );
}

export default ShoppingHome;