// import { Minus, Plus, Trash } from "lucide-react";
// import { Button } from "../ui/button";
// import { useDispatch, useSelector } from "react-redux";
// import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
// import { useToast } from "../ui/use-toast";

// function UserCartItemsContent({ cartItem }) {
//   const { user } = useSelector((state) => state.auth);
//   const { cartItems } = useSelector((state) => state.shopCart);
//   const { productList } = useSelector((state) => state.shopProducts);
//   const dispatch = useDispatch();
//   const { toast } = useToast();

//   const handleUpdateQuantity = (getCartItem, typeOfAction) => {
//     if (typeOfAction === "plus") {
//       let getCartItems = cartItems.items || [];
//       if (getCartItems.length) {
//         const indexOfCurrentCartItem = getCartItems.findIndex(
//           (item) =>
//             item.productId === getCartItem?.productId &&
//             item.colorId === getCartItem?.colorId
//         );

//         const getCurrentProductIndex = productList.findIndex(
//           (product) => product._id === getCartItem?.productId
//         );
//         const getTotalStock =
//           productList[getCurrentProductIndex]?.totalStock || 0;

//         if (indexOfCurrentCartItem > -1) {
//           const getQuantity =
//             getCartItems[indexOfCurrentCartItem]?.quantity || 0;
//           if (getQuantity + 1 > getTotalStock) {
//             toast({
//               title: `Only ${getTotalStock} items available in stock`,
//               variant: "destructive",
//             });
//             return;
//           }
//         }
//       }
//     }

//     dispatch(
//       updateCartQuantity({
//         userId: user?.id,
//         productId: getCartItem?.productId,
//         quantity:
//           typeOfAction === "plus"
//             ? getCartItem?.quantity + 1
//             : getCartItem?.quantity - 1,
//       })
//     ).then((data) => {
//       if (data?.payload?.success) {
//         toast({
//           title: "Cart item updated successfully",
//         });
//       }
//     });
//   };

//   const handleCartItemDelete = (getCartItem) => {
//     dispatch(
//       deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
//     ).then((data) => {
//       if (data?.payload?.success) {
//         toast({
//           title: "Cart item deleted successfully",
//         });
//       }
//     });
//   };

//   return (
//     <div className="flex items-center gap-6 p-4 bg-white shadow-lg rounded-xl">
//       {/* Product Image */}
//       <div className="w-24 h-24 flex-shrink-0">
//         <img
//           src={cartItem?.image[0]}
//           alt={cartItem?.title}
//           className="w-full h-full rounded-lg object-cover"
//         />
//       </div>

//       {/* Product Details */}
//       <div className="flex-1 space-y-2">
//         <h3 className="text-lg font-semibold">{cartItem?.title}</h3>

//         {/* Color Selection */}
//         <div className="flex items-center space-x-2">
//           <span className="text-sm text-gray-500">Color:</span>
//           <div className="flex items-center gap-2 p-1 rounded-lg shadow-sm bg-gray-100">
//             <img
//               src={cartItem?.colors?.image}
//               alt={cartItem?.colors?.title}
//               className="w-6 h-6 rounded-md object-cover"
//             />
//             <span className="text-xs">{cartItem?.colors?.title || "N/A"}</span>
//           </div>
//         </div>

//         {/* Quantity Controls */}
//         <div className="flex items-center gap-3">
//           <Button
//             variant="outline"
//             className="h-9 w-9 rounded-full flex items-center justify-center"
//             size="icon"
//             disabled={cartItem?.quantity === 1}
//             onClick={() => handleUpdateQuantity(cartItem, "minus")}
//           >
//             <Minus className="w-5 h-5" />
//           </Button>
//           <span className="text-lg font-medium">{cartItem?.quantity}</span>
//           <Button
//             variant="outline"
//             className="h-9 w-9 rounded-full flex items-center justify-center"
//             size="icon"
//             onClick={() => handleUpdateQuantity(cartItem, "plus")}
//           >
//             <Plus className="w-5 h-5" />
//           </Button>
//         </div>
//       </div>

//       {/* Price and Delete */}
//       <div className="flex flex-col items-end space-y-2">
//         <p className="text-lg font-semibold">
//           ₹
//           {(
//             (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
//             cartItem?.quantity
//           ).toFixed(2)}
//         </p>
//         <Button
//           variant="destructive"
//           className="p-2 rounded-full"
//           onClick={() => handleCartItemDelete(cartItem)}
//         >
//           <Trash className="w-5 h-5" />
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default UserCartItemsContent;



import { Minus, Plus, Trash, ChevronDown } from "lucide-react";
  import { Button } from "../ui/button";
  import { useDispatch, useSelector } from "react-redux";
  import { deleteCartItem, updateCartQuantity, fetchCartItems } from "@/store/shop/cart-slice";
  import { useToast } from "../ui/use-toast";
  import { useState } from "react";

  // Helper function to compute initial selection based on cartItem and available colors
  const getInitialSelection = (cartItem, availableColors) => {
    if (availableColors.length > 0) {
      const matchingColor = availableColors.find(
        (color) => color._id === cartItem.colors?._id
      );
      const colorIndex = matchingColor ? availableColors.indexOf(matchingColor) : 0;
      const defaultColor = matchingColor || availableColors[0];
      // Calculate image index using provided formula: index * 2
      const desiredImageIndex = colorIndex * 2;
      const defaultImage =
        cartItem?.image && cartItem.image.length > desiredImageIndex
          ? cartItem.image[desiredImageIndex]
          : cartItem?.image?.[0] || "default-image-url.jpg";
      return { defaultColor, defaultImage };
    }
    return { defaultColor: null, defaultImage: cartItem?.image?.[0] || "default-image-url.jpg" };
  };

  function UserCartItemsContent({ cartItem }) {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { user } = useSelector((state) => state.auth);
    const { productList } = useSelector((state) => state.shopProducts);

    // Find the product in productList to get available colors
    const currentProduct = productList.find(
      (product) => product._id === cartItem.productId
    );
    const availableColors = currentProduct?.colors || [];

    // Initialize state by computing defaults using our helper function
    const { defaultColor, defaultImage } = getInitialSelection(cartItem, availableColors);
    const [selectedColor, setSelectedColor] = useState(defaultColor);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(defaultImage);

    // Handle color change from dropdown selection
    const handleColorChange = (color, index) => {
      setSelectedColor(color);
      setDropdownOpen(false);

      // Calculate desired image index based on the index of the selected color
      const desiredImageIndex = index * 2;
      if (cartItem?.image && cartItem.image.length > desiredImageIndex) {
        setSelectedImage(cartItem.image[desiredImageIndex]);
      } else {
        setSelectedImage(cartItem?.image?.[0] || "default-image-url.jpg");
      }

      // Update cart with the selected color 
      dispatch(
        updateCartQuantity({
          userId: user?.id,
          productId: cartItem?.productId,
          quantity: cartItem?.quantity,
          colorId: color._id,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          toast({ title: "Cart updated successfully" });
          dispatch(fetchCartItems(user?.id)); 
        }
      });
    };

    const handleQuantityChange = (newQuantity) => {
      dispatch(
        updateCartQuantity({
          userId: user?.id,
          productId: cartItem?.productId,
          quantity: newQuantity,
          colorId: selectedColor?._id,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          toast({ title: "Cart updated successfully" });
          dispatch(fetchCartItems(user?.id)); // Fetch updated cart
        }
      });
    };

    const handleCartItemDelete = () => {
      dispatch(deleteCartItem({ userId: user?.id, productId: cartItem?.productId })).then((data) => {
        if (data?.payload?.success) {
          toast({ title: "Cart item deleted successfully" });
          dispatch(fetchCartItems(user?.id)); // Fetch updated cart
        }
      });
    };

    return (
      <div className="flex items-center gap-6 p-4 bg-white shadow-lg rounded-xl">
        {/* Product Image */}
        <div className="w-24 h-24 flex-shrink-0">
          <img
            src={selectedImage || "default-image-url.jpg"}
            alt={cartItem?.title || "Product"}
            className="w-full h-full rounded-lg object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold">{cartItem?.title}</h3>

          {/* Color Selection */}
          {availableColors.length > 0 && selectedColor && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between w-32 px-3 py-2 border rounded-md bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <img src={selectedColor?.image} alt={selectedColor?.title} className="w-6 h-6 rounded-full" />
                  <span className="text-sm">{selectedColor?.title}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 w-40 mt-2 bg-white border rounded-md shadow-lg z-10">
                  {availableColors.map((color, index) => (
                    <div
                      key={color._id}
                      onClick={() => handleColorChange(color, index)}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      <img src={color.image} alt={color.title} className="w-6 h-6 rounded-full" />
                      <span className="text-sm">{color.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-9 w-9 rounded-full flex items-center justify-center"
              size="icon"
              disabled={cartItem?.quantity === 1}
              onClick={() => handleQuantityChange(cartItem?.quantity - 1)}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="text-lg font-medium">{cartItem?.quantity}</span>
            <Button
              variant="outline"
              className="h-9 w-9 rounded-full flex items-center justify-center"
              size="icon"
              onClick={() => handleQuantityChange(cartItem?.quantity + 1)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Price and Delete */}
        <div className="flex flex-col items-end space-y-2">
          <p className="text-lg font-semibold">
            ₹
            {(
              (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price || 0) *
              cartItem?.quantity
            ).toFixed(2)}
          </p>
          <Button variant="destructive" className="p-2 rounded-full" onClick={handleCartItemDelete}>
            <Trash className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  export default UserCartItemsContent;

