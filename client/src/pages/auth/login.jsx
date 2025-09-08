import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "@/assets/main-logo.png";
import { getTempCartItems, copyTempCartToUser } from "@/utils/tempCartManager";
import { addToCart } from "@/store/shop/cart-slice";
import { startCartCopy, completeCartCopy, hasCartCopyCompleted } from "@/utils/cartCopyManager";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Flag to prevent duplicate cart copying
  const hasCopiedCart = useRef(false);

  // Validate the form: both email and password must be provided
  useEffect(() => {
    if (formData.email.trim() && formData.password.trim()) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [formData.email, formData.password]);

  async function onSubmit(event) {
    event.preventDefault();

    // Ensure both fields are filled before dispatching
    if (!isFormValid) {
      toast({
        title: "Missing Fields",
        description: "Please fill out both email and password.",
        variant: "destructive",
      });
      return;
    }

    // Check if there are temporary cart items before login
    const tempCartItems = getTempCartItems();
    const hasTempItems = tempCartItems.length > 0;

    dispatch(loginUser(formData)).then(async (data) => {
      if (data?.payload?.success) {
        const user = data?.payload?.user;

        // Show initial login success message
        toast({
          title: data?.payload?.message,
        });

        // Copy temporary cart items if they exist and haven't been copied yet
        if (hasTempItems && user?.id && !hasCartCopyCompleted(user.id)) {
          // Use global state manager to prevent duplicate copying
          if (startCartCopy(user.id)) {
            setIsCopying(true);

            try {
              const copyResult = await copyTempCartToUser(
                (cartData) => dispatch(addToCart(cartData)),
                user.id
              );

              if (copyResult.success) {
                completeCartCopy(user.id, true);
                if (copyResult.copied > 0) {
                  toast({
                    title: "Cart items copied!",
                    description: `${copyResult.copied} item${copyResult.copied > 1 ? 's' : ''} added to your cart.`,
                  });
                }
              } else {
                completeCartCopy(user.id, false);
                toast({
                  title: "Some items couldn't be copied",
                  description: `${copyResult.copied || 0} items copied, ${copyResult.failed || 0} failed.`,
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error('Error copying cart:', error);
              completeCartCopy(user.id, false);
              toast({
                title: "Cart copy failed",
                description: "Your temporary cart items couldn't be copied. Please add them again.",
                variant: "destructive",
              });
            } finally {
              setIsCopying(false);
            }
          }
        }

        // Navigate based on user role and redirect context
        const redirectParam = searchParams.get('redirect');

        if (user?.role === 'admin') {
          // Admin users always go to admin dashboard
          navigate('/admin/dashboard');
        } else {
          // Regular users: check redirect parameter first, then fallback to current path
          if (redirectParam === 'checkout') {
            // User came from checkout page - redirect back to checkout
            navigate('/shop/checkout');
          } else {
            // Normal login from header or other places - go to home
            navigate('/shop/home');
          }
        }
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mt-8 md:-mt-20 w-full max-w-xs space-y-6">
      <div className="w-52 h-52 md:w-72 md:h-72 flex items-center justify-center mx-auto">
        <img src={logo} alt="Logo" className="w-full h-full" />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-medium tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2">
          Don't have an account?
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to={`/auth/register${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
          >
            Register
          </Link>
        </p>
      </div>

      <CommonForm
        formControls={loginFormControls}
        buttonText={isCopying ? "Copying Cart..." : "Sign In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        // Disable the submit/login button if the form isn't valid or if copying
        disabled={!isFormValid || isCopying}
      />
      <div className="text-center space-y-2">
        <Link className="text-sm text-primary hover:underline" to="/auth/forgot-password">
          Forgot Password?
        </Link>
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

export default AuthLogin;