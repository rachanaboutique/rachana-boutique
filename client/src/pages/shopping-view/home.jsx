import { Button } from "@/components/ui/button";
import React, { useRef } from "react";
import classNames from "classnames";
import { motion } from "framer-motion"
import bannerOne from "../../assets/banner-1.webp";
import bannerTwo from "../../assets/banner-2.webp";
import bannerThree from "../../assets/saree.png";
import { useInView } from "react-intersection-observer";

import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";
import CategoryCard from "@/components/shopping-view/categoryCard";
import img1 from "../../assets/kora.png";
import img2 from "../../assets/jamandi.png";
import Carousel from "@/components/shopping-view/carousel";
import FastMovingCard from "@/components/shopping-view/fast-moving-card";
import InstagramFeed from "@/components/shopping-view/instagramFeed";
import Testimonials from "@/components/shopping-view/testimonials";
import Banner from "@/components/shopping-view/banner";

const categoriesWithIcon = [
  { id: "kanjivaram", label: "Kanjivaram", image: img1, description: "Kanjivaram silk sarees are made in Kanchipuram" },
  { id: "satin", label: "Satin", image: img1, description: "Satin sarees are made from silk" },
  { id: "gadwal", label: "Gadwal", image: img1, description: "Gadwal sarees are made in Gadwal" },
  { id: "jamdani", label: "Jamdani", image: img1, description: "Jamdani sarees are made in Bangladesh" },
  { id: "kora", label: "Kora", image: img1, description: "Kora sarees are made in Kora" },
  { id: "silk", label: "Silk", image: img1, description: "Silk sarees are made from silk" },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];




const sarees = [
  {
    title: 'Sarees 1',
    name: 'Red Silk Saree',
    img: img1,

  },
  {
    title: 'Sarees',
    name: 'Blue Cotton Saree',
    img: img1,

  },
  {
    name: 'Golden Banarasi Saree',
    img: img2,
    title: 'Sarees',
  },
  {
    name: 'Golden Banarasi Saree',
    img: img2,
    title: 'Sarees',
  },
  {
    name: 'Golden Banarasi Saree',
    img: img2,
    title: 'Sarees',
  },
  {
    name: 'Golden Banarasi Saree',
    img: img2,
    title: 'Sarees',
  },
];

const posts = [
  "https://www.instagram.com/reel/DFfVJZaS4fN/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  "https://www.instagram.com/reel/DE3jtv2z14O/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  "https://www.instagram.com/reel/DD4uGbbSyl8/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
];
function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  // const { featureImageList } = useSelector((state) => state.commonFeature);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const formattedFeatureImageList = () => {
    const { featureImageList } = useSelector((state) => state.commonFeature);

    // Define titles and text for the images
    const additionalData = [
      {
        title: "Everyday is a fashion show and the world is your runway",
        text: "Coco Chanel",
      },
      {
        title: "Explore wide range of sarees from different regions",
        text: "Coco Chanel",
      },
      {
        title: "Everyday is a fashion show and the world is your runway",
        text: "Coco Chanel",
      },
    ];

    console.log("openDetailsDialog", openDetailsDialog);


    // Map and format the featureImageList
    return featureImageList.map((image, index) => ({
      ...image,
      title: additionalData[index % additionalData.length]?.title || "Default Title",
      text: additionalData[index % additionalData.length]?.text || "Default Text",
    }));
  };
  const featureImageList = formattedFeatureImageList();


  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeItem, setActiveItem] = useState(0);
  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);
  const { ref, inView } = useInView({
    rootMargin: window.innerWidth <= 768 ? "2100px" : "100px",
    threshold: 0.2,
  });

  const { fastMovingRef, fastMovingInView } = useInView({
    rootMargin: window.innerWidth <= 768 ? "1750px" : "200px",
    threshold: 0.2,
  });

  useEffect(() => {
    if (!wrapperRef.current) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    wrapperRef.current.style.setProperty(
      "--transition",
      "600ms cubic-bezier(0.22, 0.61, 0.36, 1)"
    );

    timeoutRef.current = setTimeout(() => {
      wrapperRef.current?.style.removeProperty("--transition");
    }, 900);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeItem]);
  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/collections`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
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

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  console.log(productList, "productList");

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full h-[600px]">
        <Carousel featureImageList={featureImageList} />

      </div>
      <section className="py-12 -mt-10 md:mt-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoriesWithIcon.map((categoryItem, index) => (
              <motion.div
                key={categoryItem.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }} // Trigger the animation when 30% of the card is in view
                transition={{
                  duration: 0.5,
                  delay: index * 0.3, // Delay between each card based on its index
                  type: "spring", // Smooth spring animation
                  stiffness: 100,
                }}
              >
                <CategoryCard categoryItem={categoryItem} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandsWithIcon.map((brandItem) => (
              <Card
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <brandItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{brandItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Feature Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.map((productItem) => (
                <ShoppingProductTile
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                />
              ))
              : null}
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Fast Moving Products
          </h2>

        </div>
        <div className="flex h-full w-full items-center justify-center px-2">
          <div className="container mx-auto px-4">
            <ul
              ref={wrapperRef}
              className="group flex flex-col gap-3 md:h-[640px] md:flex-row md:gap-[1.5%]"
            >
              {sarees.map((item, index) => (
                <motion.li
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
                  key={item.name}
                >
                  <FastMovingCard item={item} index={index} activeItem={activeItem} />
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Checkout our Instagram Feed
          </h2>

          <InstagramFeed posts={posts} />

        </div>
      </section>
      <section>

      <Banner
        imageUrl={bannerThree}
        altText="Banner 3"
        description="Exciting Offers & Discounts. Don't miss out! Shop now and save big. Best deals on your favorite products."
      />
      </section>


      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            What Our Customers Say
          </h2>

          <Testimonials />
        </div>
      </section>



      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;
