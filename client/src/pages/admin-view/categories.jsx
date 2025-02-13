import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminCategoryTile from "@/components/admin-view/category-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addCategoryFormElements } from "@/config";
import {
  addNewCategory,
  deleteCategory,
  editCategory,
  fetchAllCategories,
} from "@/store/admin/categories-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  name: "",
  description: "",
};

function AdminCategories() {
  const [openCreateCategoriesDialog, setOpenCreateCategoriesDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
   const [imageFiles, setImageFiles] = useState([]);
   const [imageLoadingStates, setImageLoadingStates] = useState([]); 
   const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  console.log(currentEditedId, "currentEditedId");

  const { categoryList } = useSelector((state) => state.adminCategories);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Set formData and uploadedImageUrl when editing
  function handleEditCategory(category) {
    setCurrentEditedId(category._id);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setUploadedImageUrls([category.image]); 

    setOpenCreateCategoriesDialog(true);
  }

  function onSubmit(event) {
    event.preventDefault();

    if (currentEditedId !== null) {
      // Editing a category
      dispatch(
        editCategory({
          id: currentEditedId,
          formData: {
            ...formData,
            image: uploadedImageUrls[0],
          },
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllCategories());
          resetForm();
        }
      });
    } else {
      // Adding a new category
      dispatch(
        addNewCategory({
          ...formData,
          image: uploadedImageUrls[0],
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllCategories());
          resetForm();
          toast({
            title: "Category added successfully",
          });
        }
      });
    }
  }

  function resetForm() {
    setFormData(initialFormData);
    setUploadedImageUrls("");
    setImageFiles(null);
    setCurrentEditedId(null);
    setOpenCreateCategoriesDialog(false);
  }

  function handleDelete(categoryId) {
    dispatch(deleteCategory(categoryId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllCategories());
      }
    });
  }

  function isFormValid() {
    if (imageLoadingStates?.includes(true)) return false;
    return formData.name !== "" && formData.description !== "";
  }

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

    useEffect(() => {
      // Sync the loading states array size with the image files
      setImageLoadingStates((prevStates) =>
        imageFiles?.map((_, index) => prevStates[index] || false)
      );
    }, [imageFiles]);

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button className="bg-primary hover:bg-accent" onClick={() => setOpenCreateCategoriesDialog(true)}>
          Add New Category
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categoryList && categoryList.length > 0
          ? categoryList.map((categoryItem) => (
              <AdminCategoryTile
                key={categoryItem._id}
                category={categoryItem}
                setFormData={() => handleEditCategory(categoryItem)} // Update logic for edit
                setOpenCreateCategoriesDialog={setOpenCreateCategoriesDialog}
                setCurrentEditedId={setCurrentEditedId}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateCategoriesDialog}
        onOpenChange={() => {
          setOpenCreateCategoriesDialog(false);
          resetForm();
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Category" : "Add New Category"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            setImageLoadingStates={setImageLoadingStates}
            imageLoadingState={imageLoadingState}
            imageLoadingStates={imageLoadingStates} 
            isSingleImage = {true}
            isEditMode={currentEditedId !== null || currentEditedId === null}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addCategoryFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}


export default AdminCategories;