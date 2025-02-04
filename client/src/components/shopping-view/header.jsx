import { HousePlug, LogOut, Menu, ShoppingCart, UserCog, Search, Phone } from "lucide-react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
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



function ShoppingHeader() {


  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const messages = [

    "🎉 Additional 10% off on all orders this weekend!",
    "🚚 Free shipping on orders above ₹500!",
    "💳 Secure payment options available!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 8000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, []);

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
            className="text-md font-medium cursor-pointer relative group pb-1" // Added padding bottom
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
      dispatch(logoutUser());
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
              {cartItems?.items?.length || 0}
            </span>
            <span className="sr-only">User cart</span>
          </button>
          <UserCartWrapper
            setOpenCartSheet={setOpenCartSheet}
            onMenuClose={() => setIsSheetOpen(false)}
            cartItems={cartItems?.items || []}
          />
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="bg-black">
              <AvatarFallback className="bg-black text-white font-extrabold">
                {user?.userName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="mt-24 bg-background w-56" >
            <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => (navigate("/shop/account"), setIsSheetOpen(false))}>
              <UserCog className="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <>


      <header className="fixed top-0 z-40 w-full border-b bg-background">
        <div className="announcement-bar">
          <p className="w-64 text-sm text-center flex items-center justify-center">
            <Phone className="h-4 w-4 mr-2" />
            Contact: +91 98765 43210
          </p>
          <div className="message-container">
            <span key={currentMessageIndex} className="animate-scroll">
              {messages[currentMessageIndex]}
            </span>
          </div>
        </div>
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <Link to="/shop/home" className="flex items-center gap-2">
            <span className="font-bold text-sm md:text-lg">Rachana Boutique</span>
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
