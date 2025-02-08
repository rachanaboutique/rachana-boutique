import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fetchCategories } from "@/store/shop/categories-slice";
import { useToast } from "../../components/ui/use-toast";
import {addProductFormElements} from "@/config";
import { addNewProduct, deleteProduct, editProduct } from "@/store/admin/products-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";



const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  isNewArrival: "",
  isFeatured: "",
  isFastMoving: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList } = useSelector((state) => state.adminProducts);
  console.log(productList);
  const { categoriesList } = useSelector((state) => state.shopCategories); // Get categories from Redux
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchCategories()); // Fetch categories (if not already loaded)
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Updated form elements with dynamic categories
  const dynamicAddProductFormElements = addProductFormElements.map((element) =>
    element.name === "category"
      ? {
          ...element,
          options: categoriesList.map((category) => ({
            id: category._id,
            label: category.name,
          })), // Map categories to options
        }
      : element
  );

  function onSubmit(event) {
    event.preventDefault();

    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData: {
              ...formData,
              image: uploadedImageUrl || formData.image, 
            },
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            image: uploadedImageUrl,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            setImageFile(null);
            setFormData(initialFormData);
            toast({
              title: "Product added successfully",
            });
          }
        });
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  function handleEdit(product) {
    setCurrentEditedId(product.id);
    setFormData({
      image: product.image,
      title: product.title,
      description: product.description,
      category: product.category,
      isNewArrival: product.isNewArrival,
      isFeatured: product.isFeatured,
      isFastMoving: product.isFastMoving,
      price: product.price,
      salePrice: product.salePrice,
      totalStock: product.totalStock,
      averageReview: product.averageReview || 0,
    });
    setUploadedImageUrl(product.image || ""); // Set existing image URL
    setOpenCreateProductsDialog(true);
  }

  function isFormValid() {
    return Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview")
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button
          className="bg-primary hover:bg-accent"
          onClick={() => {
            setFormData(initialFormData);
            setUploadedImageUrl("");
            setOpenCreateProductsDialog(true);
          }}
        >
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                key={productItem.id}
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleEdit={() => handleEdit(productItem)}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={dynamicAddProductFormElements} // Use updated form controls
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
