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
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  console.log(currentEditedId, "currentEditedId");

  const { categoryList } = useSelector((state) => state.adminCategories);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Set formData and uploadedImageUrl when editing
  function handleEditCategory(category) {
    setFormData({
      name: category.name,
      description: category.description,
    });
    setUploadedImageUrl(category.image); // Set the existing image URL
    setCurrentEditedId(category._id);
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
            image: uploadedImageUrl, // Ensure the updated image URL is included
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
          image: uploadedImageUrl,
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
    setUploadedImageUrl("");
    setImageFile(null);
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
    return formData.name !== "" && formData.description !== "";
  }

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

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
                key={categoryItem.id}
                category={categoryItem}
                setFormData={(formData) => handleEditCategory(categoryItem)} // Update logic for edit
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
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
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