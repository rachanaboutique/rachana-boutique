import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { forgotPassword } from "@/store/auth-slice";

const initialState = {
  email: "",
};

function AuthForgotPassword() {
  const [formData, setFormData] = useState(initialState);
  const { toast } = useToast();
  const dispatch = useDispatch();

  function onSubmit(event) {
    event.preventDefault();

    dispatch(forgotPassword(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
          description: "Please check your email for reset instructions.",
        });
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Forgot Password?
        </h1>
        <p className="mt-2">
          Enter your email address, and we'll send you password reset instructions.
        </p>
      </div>
      <CommonForm
        formControls={[
          {
            name: "email",
            type: "email",
            label: "Email Address",
            placeholder: "Enter your email",
            required: true,
          },
        ]}
        buttonText={"Send Reset Link"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthForgotPassword;
