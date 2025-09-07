import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserPlus, X, LogOut, UserCog } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import { useToast } from "../ui/use-toast";
import { resetCart } from "@/store/shop/cart-slice";
import { resetTempCartCopyFlag } from "@/utils/tempCartManager";

function MobileUserAuth() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Reset temp cart copy flag for current user
    if (user?.id) {
      resetTempCartCopyFlag(user.id);
    }

    // First explicitly reset the cart
    dispatch(resetCart());

    // Then logout the user
    dispatch(logoutUser())
      .unwrap()
      .then((result) => {
        if (result.success) {
          // Trigger temp cart update event to refresh cart drawer
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('tempCartUpdated'));
          }, 100);

          toast({
            title: "Logged out successfully",
          });
          
          // Close the sheet
          setIsSheetOpen(false);
        }
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        toast({
          title: "Logout failed",
          description: "Please try again.",
          variant: "destructive",
        });
      });
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsSheetOpen(false);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        {user ? (
          // Show user avatar when logged in
          <button className="mobile-icon-button">
            <Avatar className="h-6 w-6 bg-gray-100 border border-gray-200">
              <AvatarFallback className="bg-gray-100 text-gray-800 font-medium text-xs">
                {user?.userName ? user.userName[0].toUpperCase() : user?.name ? user.name[0].toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          // Show user plus icon when not logged in
          <button className="mobile-icon-button">
            <UserPlus className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </SheetTrigger>

      <SheetContent side="bottom" className="h-auto max-h-[50vh] rounded-t-xl pt-6" closeButton={false}>
        <SheetHeader className="flex flex-row items-center justify-between mb-6">
          <SheetTitle className="text-lg font-medium">
            {user ? "Account" : "Welcome to Rachana Boutique!"}
          </SheetTitle>
          <button 
            onClick={() => setIsSheetOpen(false)}
            className="cart-close-button p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none "
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </SheetHeader>

        <div className="space-y-4 pb-6">
          {user ? (
            // Logged in user options
            <>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10 bg-gray-100 border border-gray-200">
                  <AvatarFallback className="bg-gray-100 text-gray-800 font-medium text-sm">
                    {user?.userName ? user.userName[0].toUpperCase() : user?.name ? user.name[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">
                    Hello, {user?.userName || user?.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={() => handleNavigation("/shop/account")}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <UserCog className="h-5 w-5 text-gray-600" />
                <span className="font-medium">My Account</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </>
          ) : (
            // Not logged in options
            <>
              <button
                onClick={() => handleNavigation("/auth/login")}
                className="w-full p-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>

              <button
                onClick={() => handleNavigation("/auth/register")}
                className="w-full p-4 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Create Account
              </button>

             
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileUserAuth;
