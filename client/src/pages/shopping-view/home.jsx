import React, { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import classNames from "classnames";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "@/styles/masonry.css";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { fetchCategories } from "@/store/shop/categories-slice";
import { fetchBanners } from "@/store/shop/banners-slice";
import { fetchInstaFeed } from "@/store/shop/instafeed-slice";
import CategoryCard from "@/components/shopping-view/categoryCard";
import Carousel from "@/components/shopping-view/carousel";
import FastMovingCard from "@/components/shopping-view/fast-moving-card";
import InstagramFeed from "@/components/shopping-view/instagramFeed";
import Testimonials from "@/components/shopping-view/testimonials-new";
import Banner from "@/components/shopping-view/banner";
import ProductSlider from "@/components/shopping-view/product-slider";
import bannerThree from "../../assets/saree.png";
import { Loader } from "../../components/ui/loader";

function ShoppingHome() {
  const [activeItem, setActiveItem] = useState(0);
  let screenWidth = window.innerWidth;
  const navigate = useNavigate();
  const { productList, isLoading: productsLoading } = useSelector((state) => state.shopProducts);
  const { bannersList, isLoading: bannersLoading } = useSelector((state) => state.shopBanners);
  const { categoriesList, isLoading: categoriesLoading } = useSelector((state) => state.shopCategories);
  const { instaFeedPosts, isLoading: instaFeedLoading } = useSelector((state) => state.shopInstaFeed);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.shopCart);

  const dispatch = useDispatch();
  const { toast } = useToast();

  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);

  const { ref, inView } = useInView({
    rootMargin: screenWidth <= 768 ? "3100px" : "0px",
    threshold: 0.2,
  });


  useEffect(() => {
    if (!wrapperRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    wrapperRef.current.style.setProperty(
      "--transition",
      "600ms cubic-bezier(0.22, 0.61, 0.36, 1)"
    );

    timeoutRef.current = setTimeout(() => {
      wrapperRef.current?.style.removeProperty("--transition");
    }, 900);

    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, [activeItem]);

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

  const isAnyLoading = productsLoading || bannersLoading || categoriesLoading || instaFeedLoading;
  if (isAnyLoading) return <Loader />;
  return (
    <>

      <Helmet>
        <title>Best Sarees Online - Buy Now | Rachana Boutique</title>
        <meta name="description" content="Discover the finest sarees with exclusive designs. Shop now for the best collections at Rachana Boutique!" />
        <meta name="keywords" content="sarees, buy sarees online, silk sarees, wedding sarees, designer sarees, traditional sarees" />
        <meta name="author" content="Mohan Raj A" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Best Sarees Online - Buy Now | Rachana Boutique" />
        <meta property="og:description" content="Explore a wide range of premium sarees at Rachana Boutique. Perfect for every occasion!" />
        <meta property="og:image" content="https://example.com/path-to-your-saree-image.jpg" />
        <meta property="og:url" content="https://rachana-boutique.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best Sarees Online - Buy Now | Rachana Boutique" />
        <meta name="twitter:description" content="Shop the best sarees online with exclusive offers at Rachana Boutique!" />
        <meta name="twitter:image" content="https://example.com/path-to-your-saree-image.jpg" />
      </Helmet>


      <div className="flex flex-col min-h-screen">
        <div className="relative w-full h-[400px] md:h-[700px] mb-0">
          <Carousel bannersList={bannersList} />
        </div>
        {/* <section className="py-8 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-2 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">Shop by Category</h2>
              <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
            <p className="text-gray-600">Discover our curated collections designed for every style and occasion</p>
            </div>

           
            <div
              className="masonry-grid"
              style={{
                columnCount: screenWidth < 640 ? 1 : screenWidth < 1024 ? 2 : 3,
                columnGap: '24px'
              }}
            >
              {categoriesList.map((categoryItem, index) => (
                <div
                  key={categoryItem._id || index}
                  className="masonry-item mb-4 md:mb-6 break-inside-avoid"
                  style={{
          
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 50,
                    }}
                  >
                    <CategoryCard
                      categoryItem={categoryItem}
                      index={index}
                      variant="masonry"
                    />
                  </motion.div>
                </div>
              ))}
            </div>

           
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/shop/collections')}
                className="inline-block px-8 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
              >
                View All Collections
              </button>
            </div>
          </div>
        </section> */}

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

        {/* <section className="py-6 md:py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Watch And Buy</h2>
          </div>
          <div className="flex h-full w-full items-center justify-center px-2">
            <div className="container mx-auto px-4">
              <ul
                ref={wrapperRef}
                className="group flex flex-col gap-3 md:h-[640px] md:flex-row md:gap-[1.5%]"
              >
                {productList &&
                  productList.length > 0 &&
                  productList
                    .filter((productItem) => productItem?.isWatchAndBuy)
                    .map((productItem, index) => (
                      <motion.li
                        key={productItem._id}
                        ref={ref}
                        onClick={() => setActiveItem(index)}
                        aria-current={activeItem === index}
                        initial={{ x: -100, opacity: 0 }}
                        animate={{
                          x: inView ? 0 : -100,
                          opacity: inView ? 1 : 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 50,
                          damping: 25,
                        }}
                        className={classNames(
                          "relative cursor-pointer md:w-[16%] md:first:w-[16%] md:last:w-[16%] md:[&[aria-current='true']]:w-[40%]",
                          "md:[transition:width_var(--transition,200ms_ease-in)]",
                          "md:before-block before:absolute before:bottom-0 before:left-[-10px] before:right-[-10px] before:top-0 before:hidden before:bg-white",
                          "md:[&:not(:hover),&:not(:first),&:not(:last)]:group-hover:w-[14%] md:hover:w-[20%]",
                          "first:pointer-events-auto last:pointer-events-auto",
                          "md:[&_img]:opacity-100"
                        )}
                      >
                        <FastMovingCard
                          item={productItem}
                          index={index}
                          activeItem={activeItem}
                          handleAddtoCart={handleAddtoCart}
                        />
                      </motion.li>
                    ))}
              </ul>
            </div>
          </div>
        </section> */}

        <section>
          <Banner
            imageUrl={bannerThree}
            altText="Banner 3"
            description="Exciting Offers & Discounts. Don't miss out! Shop now and save big. Best deals on your favorite products."
          />
        </section>

        <section className="py-8 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">Follow Our Style</h2>
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
              <p className="text-gray-600">Hear what our customers have to say about their experience</p>
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