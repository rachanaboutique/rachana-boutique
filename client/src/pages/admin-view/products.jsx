import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fetchCategories } from "@/store/shop/categories-slice";
import { useToast } from "../../components/ui/use-toast";
import { addProductFormElements } from "@/config";
import { addNewProduct, deleteProduct, editProduct, fetchAllProducts } from "@/store/admin/products-slice";

// Updated initial form data with "image" as an array.
const initialFormData = {
  image: [],
  title: "",
  description: "",
  category: "",
  isNewArrival: false,
  isFeatured: false,
  isFastMoving: false,
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  // Changed from "imageFile" to "imageFiles" to support multiple files.
  const [imageFiles, setImageFiles] = useState([]);
  // Changed "uploadedImageUrl" to "uploadedImageUrls" as an array.
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState([]); 

  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList } = useSelector((state) => state.adminProducts);
  const { categoriesList } = useSelector((state) => state.shopCategories);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  useEffect(() => {
    setImageLoadingStates((prevStates) =>
      Array.isArray(prevStates)
        ? imageFiles.map((_, index) => prevStates[index] || false)
        : imageFiles.map(() => false)
    );
  }, [imageFiles]);
  
  // Update the dynamic form controls with fetched categories.
  const dynamicAddProductFormElements = addProductFormElements.map((element) =>
    element.name === "category"
      ? {
          ...element,
          options: categoriesList.map((category) => ({
            id: category._id,
            label: category.name,
          })),
        }
      : element
  );

  function onSubmit(event) {
    event.preventDefault();
    // Ensure the formData image field is updated with the array of uploaded image URLs.
    const updatedFormData = {
      ...formData,
      image: uploadedImageUrls.length > 0 ? uploadedImageUrls : formData.image,
    };

    if (currentEditedId !== null) {
      dispatch(editProduct({ id: currentEditedId, formData: updatedFormData })).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setFormData(initialFormData);
          setUploadedImageUrls([]);
          setImageFiles([]);
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
        }
      });
    } else {
      dispatch(addNewProduct(updatedFormData)).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setOpenCreateProductsDialog(false);
          setImageFiles([]);
          setUploadedImageUrls([]);
          setFormData(initialFormData);
          toast({
            title: "Product added successfully",
          });
        }
      });
    }
  }

  function handleDelete(productId) {
    dispatch(deleteProduct(productId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  function handleEdit(product) {
    setCurrentEditedId(product._id);
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
    setUploadedImageUrls(product.image || []);
    setOpenCreateProductsDialog(true);
  }

  function isFormValid() {
    const optionalFields = ["isNewArrival", "isFeatured", "isFastMoving"];
    if (imageLoadingStates?.includes(true)) return false;
    
    return Object.keys(formData)
      .filter((key) => !["averageReview", ...optionalFields].includes(key))
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
            setUploadedImageUrls([]);
            setImageFiles([]);
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
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                setFormData={() => handleEdit(productItem)}
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
          setUploadedImageUrls([]);
          setImageFiles([]);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            imageLoadingState={imageLoadingState}
            imageLoadingStates={imageLoadingStates} 
            setImageLoadingStates={setImageLoadingStates}
            setImageLoadingState={setImageLoadingState}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={dynamicAddProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;