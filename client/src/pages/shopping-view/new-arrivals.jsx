import ShoppingProductTile from "@/components/shopping-view/product-tile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon, ShoppingBag } from "lucide-react";
import Breadcrumb from "@/components/shopping-view/breadcrumb";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader } from "@/components/ui/loader";
import { Helmet } from "react-helmet-async";
import newArrivalsBanner from "@/assets/newarrivals.png";

function NewArrivals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, productDetails, isLoading } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const categorySearchParam = searchParams.get("category");

  // Initialize sort and filters from sessionStorage (when category changes)
  useEffect(() => {
    setSort("price-lowtohigh");
    const storedFilters = sessionStorage.getItem("filters");
    setFilters(storedFilters ? JSON.parse(storedFilters) : {});
  }, [categorySearchParam]);

  // Dispatch the fetch action only when sort and filters are available.
  useEffect(() => {
    if (sort !== null) {
      dispatch(
        fetchAllFilteredProducts({ filterParams: filters, sortParams: sort })
      );
    }
  }, [dispatch, sort, filters]);

  function handleSort(value) {
    setSort(value);
  }

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/shop/product/${getCurrentProductId}`);
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
    let currentCartItems = cartItems.items || [];

    if (currentCartItems.length) {
      const indexOfCurrentItem = currentCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = currentCartItems[indexOfCurrentItem].quantity;
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
        colorId: productList.find(
          (product) => product._id === getCurrentProductId
        )?.colors[0]?._id,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Product is added to cart" });
      }
    });
  } */

  // Filter products for new arrivals (isNewArrival === true)
  const newArrivalProducts = productList
    ? productList.filter((product) => product.isNewArrival === true)
    : [];

  // Create structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "New Arrivals",
    "description": "Discover our latest arrivals - fresh designs and styles just added to our collection at Rachana Boutique.",
    "url": "https://rachanaboutique.in/shop/new-arrivals",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://rachanaboutique.in/shop/home"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "New Arrivals",
          "item": "https://rachanaboutique.in/shop/new-arrivals"
        }
      ]
    }
  };

  // Show loader only when the product list is not yet available
  if (isLoading && productList.length === 0) return <Loader />;

  return (
    <>
      <Helmet>
        <title>New Arrivals | Rachana Boutique</title>
        <meta name="description" content="Discover our latest arrivals - fresh designs and styles just added to our collection at Rachana Boutique." />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="bg-white">
        {/* Banner */}
        <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
          <img
            src={newArrivalsBanner}
            alt="New Arrivals"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-35 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-light uppercase tracking-wide text-white mb-4">
                New Arrivals
              </h1>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", path: "/shop/home" },
            { label: "New Arrivals", path: "/shop/new-arrivals" }
          ]}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4">
          <div className="bg-white">
            <div className="hidden md:flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-light uppercase tracking-wide mb-2">
                  New Arrivals
                </h2>
                <p className="text-gray-500">
                  Showing {newArrivalProducts.length} products
                </p>
              </div>
              <div className="mt-4 md:mt-0">
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
              <div className="flex items-center w-full justify-between">
                <h2 className="text-2xl font-light uppercase tracking-wide mb-2">
                  New Arrivals
                </h2>
                <DropdownMenu >
                  <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <ArrowUpDownIcon className="h-4 w-4" />
                    <span>{sortOptions.find(option => option.id === sort)?.label || 'Default'}</span>
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
              <p className="text-gray-500">
                  Showing {newArrivalProducts.length} products
                </p>


            </div>

            {/* Products Grid - Using Original ShoppingProductTile */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivalProducts && newArrivalProducts.length > 0 ? (
                newArrivalProducts.map((productItem) => (
                  <ShoppingProductTile
                    key={productItem._id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No New Arrivals Found</h3>
                  <p className="text-gray-500 mb-6">Check back soon for our latest products</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewArrivals;