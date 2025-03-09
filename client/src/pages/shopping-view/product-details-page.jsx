import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
import ShoppingProductTile from "@/components/shopping-view/product-tile";

function ProductDetailsPage({ open, setOpen }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const { productList, productDetails } = useSelector((state) => state.shopProducts);
  const [zoomData, setZoomData] = useState({
    isHovering: false,
    zoomPosition: { x: 0, y: 0 },
    imageSrc: productDetails?.image ? productDetails.image[0] : "",
  });
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(
    productDetails?.image ? productDetails.image[0] : null
  );
  const { toast } = useToast();
  const { id: getCurrentProductId } = useParams();
  // Using location key so that even if same productId is used, we can fetch fresh details.
  const location = useLocation();
  const dispatch = useDispatch();

  const handleZoomData = (data) => setZoomData(data);

  const handleRatingChange = (getRating) => {
    setRating(getRating);
  };

  const handleAddToCart = (currentProductId, totalStock) => {
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
        if (currentQuantity + 1 > totalStock) {
          toast({
            title: `Only ${currentQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: currentProductId,
        quantity: 1,
        colorId: selectedColor?._id,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  };



  function handleRelatedProductsAddToCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        colorId: productList.find((product) => product._id === getCurrentProductId)?.colors[0]?._id

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

  // Handle color selection
  const handleColorSelect = (colorItem, index) => {
    setSelectedColor(colorItem);
    const desiredImageIndex = index * 2;
    if (productDetails?.image && productDetails.image.length > desiredImageIndex) {
      setSelectedImage(productDetails.image[desiredImageIndex]);
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
    if (getCurrentProductId) {
      dispatch(fetchProductDetails(getCurrentProductId));
    }
  }, [getCurrentProductId, location.key, dispatch]);

  // Fetch reviews and set the default selected image when product details are updated.
  useEffect(() => {
    if (productDetails?._id) {
      dispatch(getReviews(productDetails._id));
    }
    setSelectedImage(productDetails?.image ? productDetails.image[0] : null);
  }, [productDetails?._id, dispatch]);

  // Separate useEffect to compute related products whenever productList or productDetails changes
  useEffect(() => {
    if (productList && productDetails) {
      const filteredProducts = productList.filter(
        (product) =>
          product?.category === productDetails?.category &&
          product._id !== productDetails?._id
      );
      setRelatedProducts(filteredProducts);
    }
  }, [productList, productDetails]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr] gap-8">
        <div className="flex flex-col gap-4">
          <ZoomableImage
            imageSrc={selectedImage}
            imageAlt={productDetails?.title}
            onZoomData={handleZoomData}
          />
          {/* Render all images as thumbnails - exactly 4 per row */}
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

        <div className="flex flex-col gap-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-2">
              {productDetails?.title}
            </h1>
            <h2 className="text-lg md:text-xl text-gray-600">
              Elegance Unveiled
            </h2>
            <div className="w-24 h-1 bg-black mx-auto my-4"></div>
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
          {productDetails?.colors && (
            <div className="mt-6 w-full">
              <div className="w-full">
                <Label className="text-lg font-semibold uppercase tracking-wide mb-2 block">Colors</Label>
                <div className="w-12 h-0.5 bg-black mb-4"></div>
                <div className="grid grid-cols-5 gap-3">
                  {productDetails.colors.map((colorItem, index) => (
                    <div
                      key={index}
                      onClick={() => handleColorSelect(colorItem, index)}
                      className={`cursor-pointer flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
                        selectedColor && selectedColor._id === colorItem._id
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
          <div className="mt-8 flex justify-center">
            {productDetails?.totalStock === 0 ? (
              <button className="w-full max-w-md px-8 py-3 opacity-60 cursor-not-allowed border-2 border-gray-300 text-gray-400 uppercase tracking-wider text-sm font-medium">
                Out of Stock
              </button>
            ) : (
              <button
                className="w-full max-w-md px-8 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
                onClick={() =>
                  handleAddToCart(productDetails?._id, productDetails?.totalStock)
                }
              >
                Add to Cart
              </button>
            )}
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
              className="hidden md:block absolute top-[22%] left-[50%] z-10 w-1/2 h-3/4 overflow-hidden border shadow-lg bg-white"
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
          {/* Related Products */}

        </div>

      </div>


      <Separator className="my-12" />
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-10">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-light uppercase tracking-wide mb-4">You May Also Like</h2>
            <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
            <p className="text-gray-600">Discover more items that complement your style</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((productItem) => (
              <ShoppingProductTile
                key={productItem._id}
                product={productItem}
                handleAddtoCart={handleRelatedProductsAddToCart}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailsPage;