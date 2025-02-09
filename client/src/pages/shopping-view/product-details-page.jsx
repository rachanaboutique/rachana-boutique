import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "../../components/ui/use-toast";
import { fetchProductDetails, setProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import StarRatingComponent from "../../components/common/star-rating";
import ZoomableImage from "../../components/ui/zoomable-dialog-box";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { ExternalLink, StarIcon } from "lucide-react";

function ProductDetailsPage({ open, setOpen }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [zoomData, setZoomData] = useState({
    isHovering: false,
    zoomPosition: { x: 0, y: 0 },
    imageSrc: "",
  });
  const { isAuthenticated } = useSelector((state) => state.auth); // Get authentication status
  
  // For image handling (if applicable)
  const [selectedImage, setSelectedImage] = useState("");
  const [openZoomDialog, setOpenZoomDialog] = useState(false);

  // Handles zoom data updates
  const handleZoomData = (data) => setZoomData(data);

  const { id: getCurrentProductId } = useParams();
  console.log(getCurrentProductId);
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productDetails, relatedProducts } = useSelector((state) => state.shopProducts);
  const { reviews } = useSelector((state) => state.shopReview);
  console.log(reviews, "reviews");

  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle rating change for the review
  const handleRatingChange = (getRating) => {
    setRating(getRating);
  };

  // Handle adding product to cart 
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
  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  // Handle image hover for zoom functionality
  const handleImageHover = (image) => {
    setSelectedImage(image);
    setOpenZoomDialog(true);
  };

  // Fetch product details when the component mounts or the product ID changes
  useEffect(() => {
    if (getCurrentProductId) {
      dispatch(fetchProductDetails(getCurrentProductId));
    }
  }, [getCurrentProductId, dispatch]);

  // New useEffect to fetch reviews when product details (id) are available
  useEffect(() => {
    if (productDetails?._id) {
      dispatch(getReviews(productDetails._id));
    }
  }, [productDetails?._id, dispatch]);


  return (
    <div className="p-4 px-4 md:p-8 md:px-32">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8">
        <div className="relative overflow-hidden rounded-lg">

        <ZoomableImage
            imageSrc={productDetails?.image}
            imageAlt={productDetails?.title}
            onZoomData={handleZoomData}
          />
         
          <div className="mt-4 flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300">
            {productDetails?.additionalImages?.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Additional Image ${index}`}
                className="w-16 h-16 cursor-pointer rounded-lg"
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center">
              {productDetails?.title}
             
            </h1>
            <p className="text-muted-foreground text-xl mt-4">
              {productDetails?.description}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <StarRatingComponent rating={averageReview} />
              <span className="text-muted-foreground">({averageReview.toFixed(2)})</span>
            </div>
          </div>
             {/* Zoom Card */}
             {zoomData.isHovering && (
            <div
              className="hidden md:block absolute top-[14%] left-[42%] z-10 w-1/2 h-3/4 overflow-hidden border shadow-lg bg-white"
              style={{
                backgroundImage: `url(${zoomData.imageSrc})`,
                backgroundPosition: `${zoomData.zoomPosition.x}% ${zoomData.zoomPosition.y}%`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "300%",
              }}
            ></div>
          )}

          <div className="flex items-center gap-4 mt-6">
            <p
              className={`text-3xl font-bold text-primary ${productDetails?.salePrice > 0 ? "line-through" : ""}`}
            >
              ₹{productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 && (
              <p className="text-2xl font-bold text-muted-foreground">
                ₹{productDetails?.salePrice}
              </p>
            )}
          </div>

          <div className="mt-5">
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full opacity-60 cursor-not-allowed">
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() =>
                  handleAddToCart(productDetails?._id, productDetails?.totalStock)
                }
              >
                Add to Cart
              </Button>
            )}
          </div>

          {/* Color Selection */}
          {productDetails?.colors && (
            <div className="mt-6">
              <Label>Colors</Label>
              <div className="flex gap-2 flex-wrap">
                {productDetails?.colors.map((color, index) => (
                  <div
                    key={index}
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded-full cursor-pointer ${
                      color === selectedColor ? "border-4 border-blue-500" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          <Separator className="my-6" />

          <div className="max-h-[300px] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="grid gap-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem) => (
                  <div className="flex gap-4" key={reviewItem._id}>
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback>{reviewItem?.userName[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{reviewItem?.userName}</h3>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={reviewItem?.reviewValue} />
                      </div>
                      <p className="text-muted-foreground">{reviewItem.reviewMessage}</p>
                    </div>
                  </div>
                ))
              ) : (
                <h1>No Reviews</h1>
              )}
            </div>

            {/* Write a review */}
            <div className="mt-10 flex-col flex gap-2">
              <Label>Write a review</Label>
              <div className="flex gap-1">
                <StarRatingComponent rating={rating} handleRatingChange={handleRatingChange} />
              </div>
              <Input
                name="reviewMsg"
                value={reviewMsg}
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder="Write a review..."
              />
              <Button onClick={handleAddReview} disabled={reviewMsg.trim() === ""}>
                Submit
              </Button>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">Related Products</h2>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((product) => (
                  <div key={product._id} className="border p-4 rounded-lg">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <h3 className="text-lg font-semibold mt-2">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                   
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
