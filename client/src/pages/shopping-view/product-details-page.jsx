import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useToast } from "../../components/ui/use-toast";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import StarRatingComponent from "../../components/common/star-rating";
import ZoomableImage from "../../components/ui/zoomable-dialog-box";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductSlider from "@/components/shopping-view/product-slider";
import { fetchAllProducts } from "@/store/admin/products-slice";

function ProductDetailsPage({ open, setOpen }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { productList, productDetails } = useSelector((state) => state.shopProducts);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [zoomData, setZoomData] = useState({
    isHovering: false,
    zoomPosition: { x: 0, y: 0 },
    imageSrc: "",
  });
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { toast } = useToast();
  const { id: getCurrentProductId } = useParams();
  // Using location key so that even if same productId is used, we can fetch fresh details.
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [slideDirection, setSlideDirection] = useState(null);
  const [isSliding, setIsSliding] = useState(false);
  const swipeThreshold = 50; // Minimum swipe distance to trigger navigation

  // Handle image navigation with animation
  const handleImageNavigation = (direction) => {
    if (isSliding) return;

    setSlideDirection(direction);
    setIsSliding(true);

    // Allow time for animation before changing the image
    setTimeout(() => {
      navigateImage(direction);

      // Reset animation state after transition completes
      setTimeout(() => {
        setIsSliding(false);
        setSlideDirection(null);
      }, 50);
    }, 150);
  };

  const handleZoomData = (data) => {
    setZoomData({
      ...data,
      imageSrc: selectedImage || ""
    });
  };

  const handleRatingChange = (getRating) => {
    setRating(getRating);
  };

  const handleAddToCart = (currentProductId, totalStock) => {
    setIsAddingToCart(true);
    if (!isAuthenticated) {
      toast({
        title: "Please log in to add items to the cart!",
        variant: "destructive",
      });
      return;
    }

    let currentCartItems = cartItems.items || [];
    if (currentCartItems.length) {
      const itemIndex = currentCartItems.findIndex(
        (item) => item.productId === currentProductId
      );
      if (itemIndex > -1) {
        const currentQuantity = currentCartItems[itemIndex].quantity;
        if (currentQuantity + quantity > totalStock) {
          toast({
            title: `Only ${totalStock - currentQuantity} more can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Make sure we have a selected color
    if (!selectedColor && productDetails?.colors && productDetails.colors.length > 0) {
      setSelectedColor(productDetails.colors[0]);
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: currentProductId,
        quantity: quantity,
        colorId: selectedColor?._id,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        // Force a refresh of the cart items to ensure we have the latest data
        setIsAddingToCart(false);
        dispatch(fetchCartItems(user?.id)).then(() => {
          toast({
            title: `${quantity} item${quantity > 1 ? 's' : ''} added to cart`,
          });
          // Reset quantity to 1 after adding to cart
          setQuantity(1);
        });

      }
    });
  };



  function handleRelatedProductsAddToCart(product) {
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

  // Handle adding a review for the product
  const handleAddReview = () => {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (!isAuthenticated) {
        toast({
          title: "Please log in to add a review!",
          variant: "destructive",
        });
        return;
      }

      if (data.payload?.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      } else {
        const errorMessage =
          data.payload?.message || "Failed to add review. Please try again.";
        toast({
          title: errorMessage,
        });
      }
    });
  };

  // Calculate average review value
  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) / reviews.length
      : 0;

  // Handle color selection - directly use the color's image
  const handleColorSelect = (colorItem) => {
    setSelectedColor(colorItem);
    // Directly set the color's image as the selected image
    if (colorItem?.image) {
      setSelectedImage(colorItem.image);
    }
  };

  // Handle quantity increase
  const increaseQuantity = () => {
    // Check if increasing would exceed stock
    if (productDetails?.totalStock && quantity < productDetails.totalStock) {
      setQuantity(prev => prev + 1);
    } else {
      toast({
        title: `Maximum available quantity is ${productDetails?.totalStock}`,
        variant: "destructive",
      });
    }
  };

  // Handle quantity decrease
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderDescriptionBulletPoints = (description) => {
    return description
      // Split on both literal "\n" and actual new lines
      .split(/\\n|\n/)
      .filter((point) => point.trim() !== "")
      .map((point, index) => {
        const colonIndex = point.indexOf(":");
        if (colonIndex !== -1) {
          // Extract text before and after the colon, ensuring clean formatting
          const beforeColon = point.substring(0, colonIndex).trim();
          const afterColon = point.substring(colonIndex + 1).trim();
          return (
            <li key={index} className="mb-1">
              <span className="font-bold">{beforeColon}:</span> {afterColon}
            </li>
          );
        }
        return (
          <li key={index} className="mb-1">
            {point.trim()}
          </li>
        );
      });
  };


  // Fetch product details when component mounts or when the location changes.
  useEffect(() => {
    const fetchData = async () => {
      if (getCurrentProductId) {
        await dispatch(fetchProductDetails(getCurrentProductId));
      }

      // Check if productList is empty or needs to be refreshed
      if (!productList || productList.length === 0) {
        await dispatch(fetchAllProducts()); // Make sure this action exists in your products-slice
      }
    };

    fetchData();
  }, [getCurrentProductId, location.key, dispatch]);

  // Fetch reviews and set the default selected image when product details are updated.
  useEffect(() => {
    if (productDetails?._id) {
      dispatch(getReviews(productDetails._id));

      // Set the default selected image
      if (productDetails?.image && productDetails.image.length > 0) {
        setSelectedImage(productDetails.image[0]);
      }

      // Set default selected color if available
      if (productDetails?.colors && productDetails.colors.length > 0) {
        setSelectedColor(productDetails.colors[0]);
      }

      // Reset quantity to 1 when product changes
      setQuantity(1);
    }
  }, [productDetails?._id, productDetails?.image, productDetails?.colors, dispatch]);

  // Separate useEffect to compute related products whenever productList or productDetails changes
  useEffect(() => {
    if (productList && productList.length > 0 && productDetails && productDetails._id && productDetails.category) {
      const filtered = productList.filter(
        (product) =>
          product?.category === productDetails?.category &&
          product._id !== productDetails?._id
      );
      setRelatedProducts(filtered);
    } else {
      // Reset related products if data is missing
      setRelatedProducts([]);
    }
  }, [productList, productDetails]);



  // Update zoomData.imageSrc when selectedImage changes
  useEffect(() => {
    if (selectedImage) {
      setZoomData(prevData => ({
        ...prevData,
        imageSrc: selectedImage
      }));
    }
  }, [selectedImage]);

  // Navigation functions for image carousel
  const navigateImage = (direction) => {
    if (!productDetails?.image || productDetails.image.length <= 1) return;

    const currentIndex = productDetails.image.findIndex(img => img === selectedImage);
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % productDetails.image.length;
    } else {
      newIndex = (currentIndex - 1 + productDetails.image.length) % productDetails.image.length;
    }

    setSelectedImage(productDetails.image[newIndex]);
  };

  // Get CSS class for slide animation
  const getSlideAnimationClass = () => {
    if (!slideDirection) return '';

    return slideDirection === 'next'
      ? 'animate-slide-left'
      : 'animate-slide-right';
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr] gap-12 md:gap-16">

        <div className="flex items-start gap-4">
          {/* Left Arrow - Desktop Only */}
          {productDetails?.image && productDetails.image.length > 1 && (
            <button
              onClick={() => handleImageNavigation('prev')}
              className="mt-72 hidden md:block bg-white hover:bg-gray-100 rounded-full p-2 shadow-md transition-all duration-300 hover:scale-110 border border-gray-200"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
          )}

          <div className="flex flex-col gap-4">

            {/* Main Image Container */}
            <div className="flex-1 relative">
              <div className={`${getSlideAnimationClass()}`}>
                <ZoomableImage
                  imageSrc={selectedImage}
                  imageAlt={productDetails?.title}
                  onZoomData={handleZoomData}
                  onNavigate={handleImageNavigation}
                  images={productDetails?.image}
                />
              </div>

              {/* Mobile Arrows - Only visible on mobile */}
              {productDetails?.image && productDetails.image.length > 1 && (
                <div className="md:hidden">
                  <button
                    onClick={() => handleImageNavigation("prev")}
                    className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-300"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-800" />
                  </button>
                  <button
                    onClick={() => handleImageNavigation("next")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-300"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-800" />
                  </button>
                </div>
              )}
            </div>
            {/* Render all images as thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {productDetails?.image?.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index}`}
                  className={`w-full h-24 md:h-32 object-cover cursor-pointer transition-all duration-300 ${selectedImage === image ? "border-4 border-black" : "border border-gray-200 hover:border-gray-400"}`}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          </div>

          {/* Right Arrow - Desktop Only */}
          {productDetails?.image && productDetails.image.length > 1 && (
            <button
              onClick={() => handleImageNavigation('next')}
              className="mt-72 hidden md:block bg-white hover:bg-gray-100 rounded-full p-2 shadow-md transition-all duration-300 hover:scale-110 border border-gray-200"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          )}
        </div>




        <div className="flex flex-col  gap-4">
          <div className="text-center flex flex-col items-center mb-4">
            <h1 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-2">
              {productDetails?.title}
            </h1>
            <h2 className="text-lg md:text-xl text-gray-500">
              {productDetails?.secondTitle}
            </h2>
            <div className="w-24 h-1 bg-black mx-auto my-4"></div>
            {productDetails?.productCode && (
              <div className="bg-gray-100 py-2 px-4 w-1/3 rounded-md text-lg md:text-xl text-gray-800">
                Code: {productDetails?.productCode}
              </div>
            )}
          </div>

          <div>
            {productDetails?.description && (
              <ul className="list-disc list-inside text-gray-600 text-lg mt-4 space-y-2">
                {renderDescriptionBulletPoints(productDetails.description)}
              </ul>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <p
              className={`text-2xl md:text-3xl font-medium ${productDetails?.salePrice > 0 ? "line-through text-gray-500" : ""}`}
            >
              ₹{productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 && (
              <p className="text-2xl md:text-3xl font-medium">
                ₹{productDetails?.salePrice}
              </p>
            )}
          </div>
          {/* Color Selection with Image Cards - 5 per row */}
          {productDetails?.colors && productDetails.colors.length > 0 && (
            <div className="mt-6 w-full">
              <div className="w-full text-center">
                <Label className="text-lg font-semibold uppercase tracking-wide mb-2 block">Colors</Label>
                <div className="w-12 h-0.5 bg-black mb-4 mx-auto"></div>
                <div className="flex justify-center gap-4 mx-auto">
                  {productDetails.colors.map((colorItem, index) => (
                    <div
                      key={index}
                      onClick={() => handleColorSelect(colorItem)}
                      className={`cursor-pointer flex flex-col items-center p-2 rounded-lg transition-all duration-300 w-24 ${selectedColor && selectedColor._id === colorItem._id
                        ? "border-2 border-black shadow-md"
                        : "border border-gray-200 hover:border-gray-400"
                        }`}
                    >
                      <img
                        src={colorItem.image}
                        alt={colorItem.title}
                        className="w-full h-16 object-cover rounded-md"
                      />
                      <p className="mt-2 text-sm font-medium text-center">
                        {colorItem.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Quantity Control and Add to Cart Button */}
          <div className="mt-8 flex flex-col gap-4">


            {/* Add to Cart Button */}
            <div className="flex justify-center">
              {productDetails?.totalStock === 0 ? (
                <button className="w-full max-w-md px-8 py-3 opacity-60 cursor-not-allowed border-2 border-gray-300 text-gray-400 uppercase tracking-wider text-sm font-medium">
                  Out of Stock
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  {productDetails?.totalStock > 0 && (
                    <div className="flex justify-center items-center">
                      <div className="flex items-center border-2 border-black">
                        <button
                          onClick={decreaseQuantity}
                          className="px-4 py-3 border-r-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="bg-gray-100 text-black px-6 py-2 font-medium text-center min-w-[60px]">
                          {quantity}
                        </div>
                        <button
                          onClick={increaseQuantity}
                          className="px-4 py-3 border-l-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    className="w-full max-w-md px-8 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
                    onClick={() =>
                      handleAddToCart(productDetails?._id, productDetails?.totalStock)
                    }
                  >
                   {isAddingToCart ? (<p>Adding...</p>) : (<p> Add to Cart </p>)}
                  </button>
                </div>

              )}
            </div>
          </div>

        </div>




        <div className="flex flex-col justify-between">



          {/* <div className="flex items-center gap-2 mt-4">
              <StarRatingComponent disableHover={true} rating={averageReview} />
              <span className="text-muted-foreground">
                ({averageReview.toFixed(2)})
              </span>
            </div> */}
          {zoomData.isHovering && (
            <div
              className="hidden md:block absolute top-[24%] left-[51%] z-10 w-[40%] h-3/4 overflow-hidden border shadow-lg bg-white"
              style={{
                backgroundImage: `url(${zoomData.imageSrc})`,
                backgroundPosition: `${zoomData.zoomPosition.x}% ${zoomData.zoomPosition.y}%`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "300%",
              }}
            ></div>
          )}



          {/* <div>
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="grid gap-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem) => (
                  <div className="flex gap-4" key={reviewItem._id}>
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback>
                        {reviewItem?.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">
                          {reviewItem?.userName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent disableHover rating={reviewItem?.reviewValue} />
                      </div>
                      <p className="text-muted-foreground">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <h1>No Reviews</h1>
              )}
            </div>
     
            <div className="mt-10 flex-col flex gap-2">
              <Label>Write a review</Label>
              <div className="flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                />
              </div>
              <Textarea
                name="reviewMsg"
                value={reviewMsg}
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder="Write a review..."
              />
              <Button className="w-24" onClick={handleAddReview} disabled={reviewMsg.trim() === ""}>
                Submit
              </Button>
            </div>
          </div> */}


        </div>

      </div>


      <Separator />
      {/* Related Products */}
      <div className="-mx-3.5">
        {relatedProducts && relatedProducts.length > 0 && (
          <ProductSlider
            products={relatedProducts}
            handleGetProductDetails={(productId) => navigate(`/shop/product/${productId}`)}
            handleAddtoCart={handleRelatedProductsAddToCart}
            title="You May Also Like"
            description="Discover more items that complement your style"
            bgColor="bg-white"
          />
        )}
      </div>
    </div>
  );
}

export default ProductDetailsPage;