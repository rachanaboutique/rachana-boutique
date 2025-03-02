import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import ProductFilter from "@/components/shopping-view/filter";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { fetchProductDetails, fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon } from "lucide-react";
import {Loader} from "@/components/ui/loader";
import { sortOptions } from "@/config";

function ShoppingListing() {
  const dispatch = useDispatch();
  const { productList, productDetails, isLoading } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { toast } = useToast();
  const categorySearchParam = searchParams.get("category");

  const filteredProducts = useMemo(() => {
    let updatedProducts = [...productList];

    // Apply category filter from URL parameters
    if (categorySearchParam) {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === categorySearchParam
      );
    }

    // Apply additional filters from the filters state
    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, values]) => {
        if (key === "price") {
          // Handle price filter, including "6000 and above"
          updatedProducts = updatedProducts.filter((product) =>
            values.some((range) => {
              const [minStr, maxStr] = range.split("-");
              const min = Number(minStr);
              const max = maxStr ? Number(maxStr) : Infinity;
              return product.salePrice >= min && product.salePrice <= max;
            })
          );
        } else {
          // Handle other filters
          updatedProducts = updatedProducts.filter((product) =>
            values.some((value) => product[key] === value)
          );
        }
      });
    }

    // Apply sorting
    if (sort === "price-lowtohigh") {
      updatedProducts.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sort === "price-hightolow") {
      updatedProducts.sort((a, b) => b.salePrice - a.salePrice);
    }

    return updatedProducts;
  }, [productList, filters, sort, categorySearchParam]);

  const handleFilter = (filterKey, filterValue) => {
    const updatedFilters = { ...filters };

    // Add or remove filter value
    if (!updatedFilters[filterKey]) {
      updatedFilters[filterKey] = [filterValue];
    } else {
      const index = updatedFilters[filterKey].indexOf(filterValue);
      if (index === -1) {
        updatedFilters[filterKey].push(filterValue);
      } else {
        updatedFilters[filterKey].splice(index, 1);
      }
    }

    // Remove filter if empty after removal
    if (updatedFilters[filterKey]?.length === 0) {
      delete updatedFilters[filterKey];
    }

    setFilters(updatedFilters);
  };

  function handleSort(value) {
    setSort(value);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

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
        colorId: productList.find((product) => product._id === getCurrentProductId)?.colors[0]?._id,
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

  // Optimize fetching by using a single useEffect for filter/sort changes
  useEffect(() => {
    const filterParams = {};
    if (categorySearchParam) {
      filterParams.category = categorySearchParam;
    }
    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, values]) => {
        filterParams[key] = values;
      });
    }
    dispatch(
      fetchAllFilteredProducts({
        filterParams: Object.keys(filterParams).length > 0 ? filterParams : null,
        sortParams: sort,
      })
    );
  }, [dispatch, categorySearchParam, filters, sort]);

  // Show loader only when productList is initially loading (i.e. empty) 
  if (isLoading && productList.length === 0) return <Loader />;

  return (
    <div className="container grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-4 md:py-6">
      {/* Filter Component */}
      <ProductFilter
        filters={filters}
        setFilters={setFilters}
        handleFilter={handleFilter}
      />

      {/* Product Listing */}
      <div className="bg-playground w-full rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-extrabold">All Products</h2>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {filteredProducts.length} Products
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
                    <DropdownMenuRadioItem
                    className="hover:cursor-pointer"
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-0 md:p-4">
          {filteredProducts.map((productItem) => (
            <ShoppingProductTile
              key={productItem.id}
              handleGetProductDetails={handleGetProductDetails}
              product={productItem}
              handleAddtoCart={handleAddtoCart}
            />
          ))}
        </div>
      </div>

      {/* Product Details Dialog */}
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

export default ShoppingListing;