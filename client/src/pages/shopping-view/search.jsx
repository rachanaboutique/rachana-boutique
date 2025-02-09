import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function SearchProducts() {
  const [keyword, setKeyword] = useState("");
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Create separate refs for the input box and suggestions container
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);

  const { toast } = useToast();

  // Compute suggestions based on the search keyword
  const suggestions =
    keyword.trim().length > 0
      ? productList.filter((product) =>
          product.title.toLowerCase().includes(keyword.toLowerCase())
        )
      : [];

  // Detect clicks outside the input and suggestions to hide the suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        inputRef.current && 
        suggestionsRef.current &&
        !inputRef.current.contains(event.target) &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setOpenSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
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
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Product is added to cart" });
      }
    });
  }

  const handleViewDetails = (productId) => {
    // Hide suggestions when navigating away
    setOpenSuggestions(false);
    navigate(`/shop/details/${productId}`);
  };

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (event.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    } else if (event.key === "Enter") {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleViewDetails(suggestions[highlightedIndex]._id);
      }
      setOpenSuggestions(false);
    }
  }

  return (
    <div className="container mx-auto md:px-6 px-4 py-8">
      <div className="relative mb-8">
        <Input
          ref={inputRef}
          value={keyword}
          name="keyword"
          onChange={(event) => {
            setKeyword(event.target.value);
            setOpenSuggestions(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className="py-6"
          placeholder="Search Products..."
        />

        {/* Suggestions Dropdown */}
        {openSuggestions && keyword.trim().length > 0 && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
          >
            {suggestions.map((product, index) => (
              <div
                key={product._id}
                className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer ${
                  index === highlightedIndex ? "bg-gray-200" : ""
                }`}
                onMouseDown={() => handleViewDetails(product._id)}
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{product.title}</h4>
                  <p className="text-sm text-gray-500">
                    ${product.salePrice || product.price}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="ml-auto bg-primary hover:bg-accent text-white"
                  onMouseDown={() => handleAddtoCart(product._id, product.stock)}
                >
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {keyword.trim().length > 0 && suggestions.length === 0 ? (
        <h1 className="text-5xl font-extrabold">No result found!</h1>
      ) : null}
      {keyword.trim().length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {suggestions.map((item) => (
            <ShoppingProductTile
              key={item._id}
              handleAddtoCart={handleAddtoCart}
              product={item}
              handleGetProductDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchProducts;