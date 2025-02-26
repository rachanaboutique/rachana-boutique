import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createFeedback } from "@/store/shop/feedback-slice";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// Import the custom Textarea component
import { Textarea } from "@/components/ui/textarea";

const FeedbackCard = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Access user and authentication state
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to submit feedback.",
      });
      return;
    }

    try {
      // Dispatch the createFeedback action with feedback, username, and email
      await dispatch(
        createFeedback({
          feedback,
          userName: user.userName,
          email: user.email,
        })
      ).unwrap();

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      setFeedback("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your feedback.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Share your feedback</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Textarea
            name="feedback"
            placeholder="Enter your feedback here"
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            rows={6}
          />
          <DialogFooter>
            <Button className="mt-4" type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackCard;