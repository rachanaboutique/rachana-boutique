import { AlignJustify, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";
import { resetCart } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function AdminHeader({ setOpen }) {
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleLogout() {
    // First explicitly reset the cart
    dispatch(resetCart());

    // Then logout the user
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

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
      <Button onClick={() => setOpen(true)} className="lg:hidden sm:block">
        <AlignJustify />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex flex-1 justify-end">
        <Button
          onClick={handleLogout}
          className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow"
        >
          <LogOut />
          Logout
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
