import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
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
import { ArrowUpDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {Loader} from "@/components/ui/loader";

function NewArrivals() {
  const dispatch = useDispatch();
  const { productList, productDetails, isLoading } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [searchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
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

  // Open the product details dialog when productDetails is available.
  useEffect(() => {
    if (productDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);

  function handleSort(value) {
    setSort(value);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
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
  }

  // Filter products for new arrivals (isNewArrival === true)
  const newArrivalProducts = productList
    ? productList.filter((product) => product.isNewArrival === true)
    : [];

  // Show loader only when the product list is not yet available 
  if (isLoading && productList.length === 0) return <Loader />;

  return (
    <div className="container py-4 md:py-6">
      <div className="bg-playground w-full rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-extrabold">New Arrivals</h2>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {newArrivalProducts.length} Products
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 hover:bg-muted"
                >
                  <ArrowUpDownIcon className="h-4 w-4" />
                  <span>Sort by</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mt-2 bg-gray-100 p-2 rounded-md shadow-[200px]">
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem className="hover:cursor-pointer" value={sortItem.id} key={sortItem.id}>
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {newArrivalProducts && newArrivalProducts.length > 0 ? (
            newArrivalProducts.map((productItem) => (
              <ShoppingProductTile
                key={productItem.id}
                handleGetProductDetails={handleGetProductDetails}
                product={productItem}
                handleAddtoCart={handleAddtoCart}
              />
            ))
          ) : (
            <div className="col-span-full text-center">No new arrivals found</div>
          )}
        </div>
      </div>
      {/* 
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      /> 
      */}
    </div>
  );
}

export default NewArrivals;