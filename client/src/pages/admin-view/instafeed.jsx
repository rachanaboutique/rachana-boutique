import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InstafeedTile from "@/components/admin-view/instafeed-tile";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import CommonForm from "@/components/common/form";
import { addInstafeedFormElements } from "@/config";
import {
    addNewInstaFeedPost,
    deleteInstaFeedPost,
    fetchAllInstaFeedPosts,
} from "@/store/admin/instafeed-slice";

const initialFormData = {
    postUrl: "",
};

function AdminInstafeed() {
    const [openCreatePostDialog, setOpenCreatePostDialog] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [currentEditedId, setCurrentEditedId] = useState(null);

    const { instaFeedPosts } = useSelector((state) => state.adminInstaFeed);

    const dispatch = useDispatch();
    const { toast } = useToast();



    function onSubmit(event) {
        event.preventDefault();

        const payload = {
            posts: [formData.postUrl], // Wrap the postUrl in an array under the `posts` key
        };


        dispatch(addNewInstaFeedPost(payload)).then((data) => {
            if (data?.payload?.success) {
                dispatch(fetchAllInstaFeedPosts());
                resetForm();
                toast({
                    title: "Post added successfully",
                });
            }
        });

    }


    function resetForm() {
        setFormData(initialFormData);
        setCurrentEditedId(null);
        setOpenCreatePostDialog(false);
    }

    function handleDelete(postId) {
        dispatch(deleteInstaFeedPost(postId)).then((data) => {
            if (data?.payload?.success) {
                dispatch(fetchAllInstaFeedPosts());
            }
        });
    }

    function isFormValid() {
        return formData.postUrl.trim() !== "";
    }
    useEffect(() => {
        dispatch(fetchAllInstaFeedPosts());
    }, [dispatch]);

    return (
        <Fragment>
            <div className="mb-5 w-full flex justify-end">
                <Button className="bg-primary hover:bg-accent" onClick={() => setOpenCreatePostDialog(true)}>
                    Add New Post
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instaFeedPosts && instaFeedPosts.posts && instaFeedPosts.posts.length > 0
                    ? instaFeedPosts.posts.map((postUrl, index) => (
                        <InstafeedTile
                            key={index}
                            postUrl={postUrl}
                            handleDelete={() => handleDelete(postUrl)}
                        />
                    ))
                    : null}

            </div>
            <Sheet
                open={openCreatePostDialog}
                onOpenChange={() => {
                    setOpenCreatePostDialog(false);
                    resetForm();
                }}
            >
                <SheetContent side="right" className="overflow-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {currentEditedId !== null ? "Edit Post" : "Add New Post"}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="py-6">
                        <CommonForm
                            onSubmit={onSubmit}
                            formData={formData}
                            setFormData={setFormData}
                            buttonText={currentEditedId !== null ? "Edit" : "Add"}
                            formControls={addInstafeedFormElements}
                            isBtnDisabled={!isFormValid()}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </Fragment>
    );
}

export default AdminInstafeed;
