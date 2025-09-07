import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetPassword } from "@/store/auth-slice";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const initialState = {
  newPassword: "",
  confirmPassword: "",
};

function AuthResetPassword() {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // Check if token exists on component mount
  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or has expired.",
        variant: "destructive",
      });
      navigate("/auth/forgot-password");
    }
  }, [token, navigate, toast]);

  function onSubmit(event) {
    event.preventDefault();

    if (!token) {
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or has expired.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    dispatch(resetPassword({ token, newPassword: formData.newPassword }))
      .then((data) => {
        if (data?.payload?.success) {
          toast({
            title: "Password reset successful!",
            description: "You can now log in with your new password.",
          });

          // Redirect to login page after a short delay
          setTimeout(() => navigate("/auth/login"), 1500);
        } else {
          toast({
            title: "Failed to reset password.",
            description: data?.payload?.message || "Please try again.",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Reset password error:", error);
        toast({
          title: "An error occurred",
          description: "Please try again or request a new reset link.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  // Show loading or error state if no token
  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Invalid Reset Link
          </h1>
          <p className="mt-2 text-red-600">
            The password reset link is invalid or has expired.
          </p>
          <div className="mt-4">
            <Link
              className="text-sm text-primary hover:underline"
              to="/auth/forgot-password"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reset Your Password
        </h1>
        <p className="mt-2">
          Enter your new password below to reset your account.
        </p>
      </div>
      <CommonForm
        formControls={[
          {
            name: "newPassword",
            type: "password",
            componentType: "password",
            label: "New Password",
            placeholder: "Enter your new password",
            required: true,
          },
          {
            name: "confirmPassword",
            type: "password",
            label: "Confirm Password",
            componentType: "password",
            placeholder: "Re-enter your new password",
            required: true,
          },
        ]}
        buttonText={isLoading ? "Resetting Password..." : "Reset Password"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        disabled={isLoading}
      />
      <div className="text-center space-y-2">
        <div>
          <Link
            className="text-sm text-primary hover:underline"
            to="/auth/login"
          >
            Back to Login
          </Link>
        </div>
        <div>
          <Link
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            to="/shop/home"
          >
            ← Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthResetPassword;
