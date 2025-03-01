import { HousePlug, LogOut, Menu, ShoppingCart, UserCog, Search, Phone } from "lucide-react";
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
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";




function ShoppingHeader() {


  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const { toast } = useToast();


  const messages = [

    "🎉 Additional 10% off on all orders this weekend!",
    "🚚 Free shipping on orders above ₹500!",
    "💳 Secure payment options available!",
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
          <Label
            onClick={() => handleNavigate(menuItem)}
            className="text-lg font-medium cursor-pointer relative group pb-1" // Added padding bottom
            key={menuItem.id}
          >
            {menuItem.label}
            {/* Bar effect with adjusted position */}
            <span className="hidden md:block absolute left-0 bottom-[-2px] w-0 h-1 bg-foreground transition-all duration-1000 group-hover:w-full group-hover:left-0"></span>
          </Label>
        ))}
      </nav>

    );
  }


  function HeaderRightContent() {
    const { user } = useSelector((state) => state.auth);
    const { cartItems } = useSelector((state) => state.shopCart);
    const [openCartSheet, setOpenCartSheet] = useState(false);
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
    useEffect(() => {
      dispatch(fetchCartItems(user?.id));
    }, [dispatch]);

    return (
      <div className="flex lg:items-center lg:flex-row flex-col gap-4">
        <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
          <Link to="/shop/search" className="hidden md:flex items-center gap-2">
            <Search className="h-6 w-6 ml-2" />
            <p className="text-md">Search</p>
          </Link>
          <button
            onClick={() => setOpenCartSheet(true)}
            className="mt-4 md:mt-0 w-6 relative flex items-center gap-2 hover:text-gray-500"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute top-[-15px] right-[-5px] font-bold text-sm">
              {cartItems?.length || 0}
            </span>
            <span className="sr-only">User cart</span>
          </button>
          <UserCartWrapper
            setOpenCartSheet={setOpenCartSheet}
            onMenuClose={() => setIsSheetOpen(false)}
            cartItems={cartItems || []}
          />
        </Sheet>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="mt-2 md:mt-0 bg-black hover:cursor-pointer">
                <AvatarFallback className="bg-black text-white font-extrabold">
                  {user && user?.userName && user?.userName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" className="-mr-12 mt-24 bg-white  w-56">
              <DropdownMenuLabel>Logged in as {user.userName}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-foreground" />
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onClick={() => {
                  navigate("/shop/account");
                  setIsSheetOpen(false);
                }}
              >
                <UserCog className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-foreground" />

              <DropdownMenuItem className="hover:cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="px-4 py-1 text-sm shadow-md">
                Join Us
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="mt-3 w-full md:w-40 bg-white border border-gray-200 shadow-lg rounded-lg p-1"
            >
              <DropdownMenuItem
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"
                onClick={() => navigate("/auth/login")}
              >
                Login
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-black" />

              <DropdownMenuItem
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"
                onClick={() => navigate("/auth/register")}
              >
                Sign Up
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        )}
      </div>
    );
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 11000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>


      <header className="fixed top-0 z-40 w-full border-b bg-background">
        <div className="announcement-bar">
          <p className="w-64 text-sm text-center flex items-center justify-center">


            <Phone className="h-4 w-4 mr-2" />
            <a href="tel:+919944783389">
              Contact: +91 9944783389
            </a>
          </p>
          <div className="message-container">
            <span key={currentMessageIndex} className="animate-scroll">
              {messages[currentMessageIndex]}
            </span>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <Link to="/shop/home" className=" flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-[180px] md:w-full  h-11" />
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/shop/search" className="block md:hidden items-center gap-2">
              <Search className="h-6 w-6 ml-2" />
            </Link>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle header menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-full max-w-xs">
                <MenuItems onCloseSheet={() => setIsSheetOpen(false)} />
                <HeaderRightContent />
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden lg:block">
            <MenuItems onCloseSheet={() => setIsSheetOpen(false)} />
          </div>

          <div className="hidden lg:block">
            <HeaderRightContent />
          </div>
        </div>
      </header>
    </>
  );
}

export default ShoppingHeader;
