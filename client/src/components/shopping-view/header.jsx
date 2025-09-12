import {
  LogOut,
  Menu,
  ShoppingBag,
  UserCog,
  Search,
  Phone,
  ChevronDown,
  UserPlus,
  Instagram,
  Facebook,
  X,
} from "lucide-react";
import MobileUserAuth from "./mobile-user-auth";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import logo from "@/assets/logo-4.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser, fetchUserProfile } from "@/store/auth-slice";
import CustomCartDrawer from "./custom-cart-drawer";
import { useState, useRef, useEffect } from "react";
import RotatingMessages from "./rotating-messages";
import { fetchCartItems, resetCart } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { FaWhatsapp } from "react-icons/fa";
import { useToast } from "../ui/use-toast";
import { getTempCartCount, resetTempCartCopyFlag } from "@/utils/tempCartManager";

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems, isLoading: cartIsLoading } = useSelector((state) => state.shopCart);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [tempCartCount, setTempCartCount] = useState(0);
  // Use a ref to track the last time the cart sheet state was changed
  const lastCartSheetToggleTime = useRef(0);
  const { toast } = useToast();
  const navigate = useNavigate(); // Add navigate at the component level
  const location = useLocation(); // Add location to track route changes

const messages = [
  "Luxury looks at affordable prices",
  "Free shipping on orders over ₹1000",
  "Unveil your true beauty"
];


  function MenuItems({ onCloseSheet }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    function handleNavigate(getCurrentMenuItem) {
      sessionStorage.removeItem("filters");
      const currentFilter =
        getCurrentMenuItem.id !== "home" &&
          getCurrentMenuItem.id !== "collections" &&
          getCurrentMenuItem.id !== "new-arrivals" &&
          getCurrentMenuItem.id !== "contact"
          ? {
            category: [getCurrentMenuItem.id],
          }
          : null;

      sessionStorage.setItem("filters", JSON.stringify(currentFilter));

      location.pathname.includes("collections") && currentFilter !== null
        ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
        : navigate(getCurrentMenuItem.path);

      onCloseSheet(); // Close the sheet when a menu item is clicked
    }

    return (
      <nav className="pr-32 flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
        {shoppingViewHeaderMenuItems.map((menuItem) => (
          <div className="relative group" key={menuItem.id}>
            <Label
              onClick={() => handleNavigate(menuItem)}
              className="text-base uppercase tracking-wider font-medium cursor-pointer flex items-center"
            >
              {menuItem.label}
              {menuItem.hasSubmenu && <ChevronDown className="ml-1 h-4 w-4" />}
            </Label>
            {/* Underline effect */}
            <span className="hidden md:block absolute left-0 bottom-[-4px] w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
          </div>
        ))}
      </nav>
    );
  }


  // Mobile sidebar content without user authentication
  function MobileSidebarContent() {
    const navigate = useNavigate();

    return (
      <div className="flex flex-col gap-4">
        {/* Search option for mobile sidebar */}
        <button
          onClick={() => {
            navigate('/shop/search');
            setIsSheetOpen(false);
          }}
          className="flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Search className="h-5 w-5 text-gray-600" />
          <span className="font-medium">Search Products</span>
        </button>
      </div>
    );
  }

  function HeaderRightContent() {
    // Get both isAuthenticated and user from the auth state
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Fetch user profile when authenticated but no user data
    useEffect(() => {
      if (isAuthenticated && !user) {
        console.log('Fetching user profile...');
        dispatch(fetchUserProfile());
      }
    }, [isAuthenticated, user, dispatch]);

    function handleLogout() {
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
            // Reset hasInitiallyFetchedCart ref to ensure cart is refetched on next login
            hasInitiallyFetchedCart.current = false;

            // Trigger temp cart update event to refresh cart drawer
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('tempCartUpdated'));
            }, 100);

            toast({
              title: "Logged out successfully",
            });
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
    }

    // Cart items are now fetched in the parent component

    return (
      <div className="flex lg:items-center lg:flex-row flex-col gap-4">
        <div className="flex items-center gap-4">
          {/* Search icon */}
          <button
            onClick={() => navigate('/shop/search')}
            className="hidden md:block relative group"
          >
            <Search className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
            <span className="sr-only">Search</span>
          </button>

          {/* Cart icon */}
          <button
            className="hidden md:block relative group flex items-center"
            onClick={(e) => {
              // Prevent multiple rapid clicks or clicks while already fetching
              if (isFetchingCart.current || cartIsLoading) {
                e.preventDefault();
                return;
              }

              // Prevent rapid toggling of the cart drawer
              const now = Date.now();
              if (now - lastCartSheetToggleTime.current > 300) {
                lastCartSheetToggleTime.current = now;

                // Simply open the drawer - the useEffect will handle fetching
                setOpenCartSheet(true);
              }
            }}
          >
            <ShoppingBag className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
            {((cartItems?.length || 0) + tempCartCount) > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {(cartItems?.length || 0) + tempCartCount}
              </span>
            )}
            <span className="sr-only">Shopping Bag</span>
          </button>
          {/* Custom Cart Drawer */}
          <CustomCartDrawer
            isOpen={openCartSheet}
            onClose={() => setOpenCartSheet(false)}
            cartItems={cartItems || []}
            isLoading={cartIsLoading && isFetchingCart.current}
          />
        </div>

        {/* User account */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="-mt-6 md:mt-0 flex items-center gap-2 cursor-pointer">
                <Avatar className="h-8 w-8 bg-gray-100 border border-gray-200">
                  <AvatarFallback className="bg-gray-100 text-gray-800 font-medium text-sm">
                    {user?.userName ? user.userName[0].toUpperCase() : user?.name ? user.name[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm hidden md:block">My Account</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 bg-white shadow-lg rounded-md border border-gray-100">
              <DropdownMenuLabel className="text-sm text-gray-500">Hello, {user?.userName || user?.name || 'User'}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 my-1" />
              <DropdownMenuItem
                className="flex items-center py-2 px-2 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  navigate("/shop/account");
                  setIsSheetOpen(false);
                }}
              >
                <UserCog className="mr-2 h-4 w-4" />
                <span>My Account</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-200 my-1" />
              <DropdownMenuItem
                className="flex items-center py-2 px-2 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UserPlus className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors hover:cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-2 bg-white shadow-lg rounded-md border border-gray-100"
            >
              <DropdownMenuItem
                className="flex items-center py-2 px-2 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  navigate("/auth/login");
                  setIsSheetOpen(false); // Close the mobile sheet when navigating to auth
                }}
              >
                Sign In
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 my-1" />
              <DropdownMenuItem
                className="flex items-center py-2 px-2 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  navigate("/auth/register");
                  setIsSheetOpen(false); // Close the mobile sheet when navigating to auth
                }}
              >
                Create Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }

  // Search functionality is now handled by the search.jsx page

  // Fetch cart items when component mounts and when user changes
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Using refs to track fetch operations
  const hasInitiallyFetchedCart = useRef(false);
  const isFetchingCart = useRef(false);
  const lastFetchTime = useRef(0);

  // Fetch cart items when the component mounts or when user changes
  useEffect(() => {
    if (user?.id && !hasInitiallyFetchedCart.current) {
      hasInitiallyFetchedCart.current = true;
      dispatch(fetchCartItems(user.id));
    }
  }, [user?.id, dispatch]);

  // Close mobile sheet when location changes (navigation occurs)
  useEffect(() => {
    setIsSheetOpen(false);
    // Force cleanup of any lingering overlays or event listeners
    document.body.classList.remove('sheet-open');
    // Remove any potential pointer-events blocking
    document.body.style.pointerEvents = 'auto';
  }, [location.pathname]);

  // Add escape key handler for mobile sheet
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isSheetOpen) {
        setIsSheetOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isSheetOpen]);

  // Manage body scroll when sheet is open/closed
  useEffect(() => {
    if (isSheetOpen) {
      // Add class to prevent body scroll when sheet is open
      document.body.classList.add('sheet-open');
    } else {
      // Remove class to restore body scroll when sheet is closed
      document.body.classList.remove('sheet-open');
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.classList.remove('sheet-open');
      document.body.style.pointerEvents = 'auto';
    };
  }, [isSheetOpen]);

  // Global cleanup effect on component unmount
  useEffect(() => {
    return () => {
      // Ensure complete cleanup when header component unmounts
      document.body.classList.remove('sheet-open');
      document.body.style.pointerEvents = 'auto';
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Update temporary cart count for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const updateTempCartCount = () => {
        const count = getTempCartCount();
        setTempCartCount(count);
      };

      // Update count initially
      updateTempCartCount();

      // Listen for localStorage changes (when items are added/removed)
      const handleStorageChange = (e) => {
        if (e.key === 'tempCart') {
          updateTempCartCount();
        }
      };

      // Listen for custom temp cart update events
      const handleTempCartUpdate = () => {
        updateTempCartCount();
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('tempCartUpdated', handleTempCartUpdate);

      // Also update on focus (in case user modified cart in another tab)
      window.addEventListener('focus', updateTempCartCount);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('tempCartUpdated', handleTempCartUpdate);
        window.removeEventListener('focus', updateTempCartCount);
      };
    } else {

      setTempCartCount(0);
    }
  }, [isAuthenticated]);

  // Separate effect to handle cart drawer opening
  useEffect(() => {
    if (user?.id && openCartSheet) {
      // Prevent multiple fetches within a short time period (500ms)
      const now = Date.now();
      if (!isFetchingCart.current && now - lastFetchTime.current > 500) {
        isFetchingCart.current = true;
        lastFetchTime.current = now;

        // Fetch cart items when the drawer opens
        dispatch(fetchCartItems(user.id))
          .finally(() => {
            // Reset the fetching flag after a short delay
            // This prevents rapid re-fetching while still allowing updates
            setTimeout(() => {
              isFetchingCart.current = false;
            }, 500);
          });
      }
    } else {
      // If the cart drawer is closed, we can reset the fetching flag
      // This ensures we'll fetch fresh data next time it opens
      isFetchingCart.current = false;
    }
  }, [openCartSheet, user?.id, dispatch]);

  // Messages are now handled by the RotatingMessages component

  return (
    <>
      <header className="fixed top-0 z-40 w-full bg-white shadow-sm">
        {/* Top announcement bar */}
        <div className="bg-black text-white py-2 px-4">
          <div className="max-w-[1440px] mx-auto flex justify-between items-center">
            <div className="hidden md:flex items-center space-x-4">
              <a href="tel:+919994412667" className="text-xs flex items-center hover:text-gray-300 transition-colors">
                <Phone className="h-3 w-3 mr-1" />
                +91 9994412667
              </a>
              <div className="text-xs">|</div>
              <a href="mailto:rachanaboutiquechennai@gmail.com" className="text-xs hover:text-gray-300 transition-colors md:hidden">
                rachanaboutiquechennai@gmail.com
              </a>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=rachanaboutiquechennai@gmail.com" target="_blank" className="hidden md:block text-xs hover:text-gray-300 transition-colors">
                rachanaboutiquechennai@gmail.com
              </a>
            </div>

            <div className="w-full md:w-auto flex justify-center">
              <RotatingMessages
                messages={messages}
                interval={5000}
                className="w-full"
              />
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <a href="https://www.instagram.com/rachanas_boutique?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61570600405333" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://wa.me/9994412667" className="hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
                <FaWhatsapp size={17} />
              </a>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="h-16 pl-3 pr-3.5 md:pt-2 md:px-16">
            {/* Mobile Layout */}
            <div className="flex items-center justify-between lg:hidden h-full">
              {/* Mobile left side - hamburger + logo (grouped together) */}
              <div className="flex items-center">
                <Sheet open={isSheetOpen} onOpenChange={(open) => {
                  setIsSheetOpen(open);
                  // Ensure body scroll is properly managed
                  if (!open) {
                    document.body.classList.remove('sheet-open');
                    // Force cleanup of any lingering overlays
                    document.body.style.pointerEvents = 'auto';
                    document.body.style.overflow = '';
                  }
                }}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="-ml-3 text-gray-700">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>

                  <SheetContent side="left" className="w-full max-w-xs p-0" closeButton={false}>
                    <div className="p-6">
                      {/* Header with logo and close button */}
                      <div className="flex items-center justify-between mb-6">
                        <Link
                          to="/shop/home"
                          className="block"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <img src={logo} alt="Rachana Boutique Logo" className="h-8" />
                        </Link>
                        <button
                          onClick={() => setIsSheetOpen(false)}
                          className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 "
                          aria-label="Close menu"
                        >
                          <X className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                      <MenuItems onCloseSheet={() => setIsSheetOpen(false)} />
                      <div className="mt-8 pt-6 border-t">
                        <MobileSidebarContent />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Logo - close to hamburger */}
                <Link to="/shop/home" className="ml-1 flex items-center">
                  <img src={logo} alt="Rachana Boutique Logo" className="mt-1 h-[36px]" />
                </Link>
              </div>

              {/* Mobile right icons - grouped together */}
              <div className="flex items-center -space-x-2">
                  <button
                    onClick={() => navigate('/shop/search')}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors relative group  flex items-center justify-center"
                  >
                    <Search className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
                    <span className="sr-only">Search</span>
                  </button>

                  {/* Mobile User Authentication */}
                  <MobileUserAuth />

                  <button
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors relative group flex items-center justify-center"
                    onClick={(e) => {
                      // Prevent multiple rapid clicks or clicks while already fetching
                      if (isFetchingCart.current || cartIsLoading) {
                        e.preventDefault();
                        return;
                      }

                      // Prevent rapid toggling of the cart drawer
                      const now = Date.now();
                      if (now - lastCartSheetToggleTime.current > 300) {
                        lastCartSheetToggleTime.current = now;

                        // Simply open the drawer - the useEffect will handle fetching
                        setOpenCartSheet(true);
                      }
                    }}
                  >
                    <ShoppingBag className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
                    {((cartItems?.length || 0) + tempCartCount) > 0 && (
                      <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {(cartItems?.length || 0) + tempCartCount}
                      </span>
                    )}
                    <span className="sr-only">Shopping Bag</span>
                  </button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex lg:items-center lg:justify-between lg:w-full">
              {/* Desktop Logo */}
              <Link to="/shop/home" className="md:-ml-8 flex items-center">
                <img src={logo} alt="Rachana Boutique Logo" className="md:h-12" />
              </Link>

              {/* Desktop navigation */}
              <div>
                <MenuItems onCloseSheet={() => { }} />
              </div>

              {/* Desktop right side icons */}
              <div>
                <HeaderRightContent />
              </div>
            </div>

            {/* Custom Cart Drawer */}
            <CustomCartDrawer
              isOpen={openCartSheet}
              onClose={() => setOpenCartSheet(false)}
              cartItems={cartItems || []}
              isLoading={cartIsLoading && isFetchingCart.current}
            />
          </div>
        </div>
      </header>
      <div className="h-[calc(4.9rem)]"></div>
    </>
  );
}

export default ShoppingHeader;
