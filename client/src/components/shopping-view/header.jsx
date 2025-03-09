import {
  LogOut,
  Menu,
  ShoppingBag,
  UserCog,
  Search,
  Phone,
  ChevronDown,
  Instagram,
  Facebook,
  Twitter
} from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useState, useEffect, useRef } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate(); // Add navigate at the component level

  const messages = [
    "🔥 NEW ARRIVALS: Summer Collection 2024 is here!",
    "👗 EXCLUSIVE: 20% off all dresses with code SUMMER24",
    "✨ FREE SHIPPING on orders over ₹1000",
    "🎁 Buy 2 Get 1 Free on all accessories this week",
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
      <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
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

  function HeaderRightContent() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    function handleLogout() {
      dispatch(logoutUser())
        .unwrap()
        .then((result) => {
          if (result.success) {
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
            className="relative group"
          >
            <Search className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
            <span className="sr-only">Search</span>
          </button>

          {/* Cart icon */}
          <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
            <SheetTrigger asChild>
              <button
                className="relative group flex items-center"
              >
                <ShoppingBag className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
                {cartItems?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
                <span className="sr-only">Shopping Bag</span>
              </button>
            </SheetTrigger>
            <UserCartWrapper
              setOpenCartSheet={setOpenCartSheet}
              onMenuClose={() => setIsSheetOpen(false)}
              cartItems={cartItems || []}
            />
          </Sheet>
        </div>

        {/* User account */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar className="h-8 w-8 bg-gray-100 border border-gray-200">
                  <AvatarFallback className="bg-gray-100 text-gray-800 font-medium text-sm">
                    {user?.userName && user.userName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm hidden md:block">My Account</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 bg-white shadow-lg rounded-md border border-gray-100">
              <DropdownMenuLabel className="text-sm text-gray-500">Hello, {user.userName}</DropdownMenuLabel>
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
              <DropdownMenuItem
                className="flex items-center py-2 px-2 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  navigate("/shop/orders");
                  setIsSheetOpen(false);
                }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>My Orders</span>
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
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white transition-colors px-4 py-1 text-sm rounded-none">
                Sign In
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-2 bg-white shadow-lg rounded-md border border-gray-100"
            >
              <DropdownMenuItem
                className="flex items-center py-2 px-2 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate("/auth/login")}
              >
                Sign In
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 my-1" />
              <DropdownMenuItem
                className="flex items-center py-2 px-2 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate("/auth/register")}
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

  // Using a ref to track if cart items have been fetched
  const hasInitiallyFetchedCart = useRef(false);

  // Manually fetch cart items once without using useEffect
  if (user?.id && !hasInitiallyFetchedCart.current) {
    hasInitiallyFetchedCart.current = true;
    // Use setTimeout to defer the dispatch until after the initial render
    setTimeout(() => {
      dispatch(fetchCartItems(user.id));
    }, 0);
  }

  // For announcement messages, use a ref to store the interval ID
  const messageIntervalRef = useRef(null);

  // Set up the message rotation when the component mounts
  // and clean it up when the component unmounts
  useEffect(() => {
    // Only set up if we don't already have an interval
    if (!messageIntervalRef.current) {
      messageIntervalRef.current = setInterval(() => {
        // Use a functional update to avoid dependencies on currentMessageIndex
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
      }, 5000);
    }

    // Clean up on unmount
    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  return (
    <>
      <header className="fixed top-0 z-40 w-full bg-white shadow-sm">
        {/* Top announcement bar */}
        <div className="bg-black text-white py-2 px-4">
          <div className="max-w-[1440px] mx-auto flex justify-between items-center">
            <div className="hidden md:flex items-center space-x-4">
              <a href="tel:+919944783389" className="text-xs flex items-center hover:text-gray-300 transition-colors">
                <Phone className="h-3 w-3 mr-1" />
                +91 9944783389
              </a>
              <div className="text-xs">|</div>
              <a href="mailto:support@fashionstore.com" className="text-xs hover:text-gray-300 transition-colors">
                support@fashionstore.com
              </a>
            </div>

            <div className="w-full md:w-auto flex justify-center">
              <div className="overflow-hidden h-5">
                <div
                  key={currentMessageIndex}
                  className="text-xs md:text-sm font-medium text-center animate-fade-in"
                  style={{
                    animation: 'fadeIn 0.5s ease-in-out',
                    opacity: 1,
                  }}
                >
                  {messages[currentMessageIndex]}
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>

            <div className="hidden md:flex items-center space-x-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-full max-w-xs p-0">
                  <div className="p-6">
                    <Link to="/shop/home" className="block mb-6">
                      <img src={logo} alt="Fashion Store Logo" className="h-8" />
                    </Link>
                    <MenuItems onCloseSheet={() => setIsSheetOpen(false)} />
                    <div className="mt-8 pt-6 border-t">
                      <HeaderRightContent />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <Link to="/shop/home" className="flex items-center">
              <img src={logo} alt="Fashion Store Logo" className="h-8 md:h-10" />
            </Link>

            {/* Desktop navigation */}
            <div className="hidden lg:block">
              <MenuItems onCloseSheet={() => {}} />
            </div>

            {/* Right side icons */}
            <div className="hidden lg:block">
              <HeaderRightContent />
            </div>

            {/* Mobile right icons */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => navigate('/shop/search')}
                className="relative group p-2"
              >
                <Search className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
                <span className="sr-only">Search</span>
              </button>
              <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
                <SheetTrigger asChild>
                  <button className="relative group">
                    <ShoppingBag className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
                    {cartItems?.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                    <span className="sr-only">Shopping Bag</span>
                  </button>
                </SheetTrigger>
                <UserCartWrapper
                  setOpenCartSheet={setOpenCartSheet}
                  onMenuClose={() => setIsSheetOpen(false)}
                  cartItems={cartItems || []}
                />
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-[calc(4rem+2.5rem)]"></div>
    </>
  );
}

export default ShoppingHeader;
