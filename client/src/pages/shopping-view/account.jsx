import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import { useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Package, MapPin, ChevronRight } from "lucide-react";

function ShoppingAccount() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast({
        title: "Please login to view your account.",
        variant: "destructive",
      });
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate, toast]);

  if (!isAuthenticated) {
    return null; // Avoid rendering the component if the user is not authenticated
  }

  return (
    <>
      <Helmet>
        <title>My Account | Rachana Boutique</title>
        <meta name="description" content="Manage your orders and addresses at Rachana Boutique." />
      </Helmet>

      <div className="bg-white">
        {/* Banner */}
        <div className="relative w-full h-[250px] md:h-[300px] overflow-hidden">
          <img
            src={accImg}
            alt="My Account"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-light uppercase tracking-wide text-white mb-4">
                My Account
              </h1>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>
          </div>
        </div>

     

        {/* Account Content */}
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-light uppercase tracking-wide mb-4">Welcome, {user?.userName || 'Customer'}</h2>
              <div className="w-16 h-0.5 bg-black mb-6"></div>
              <p className="text-gray-600">Manage your orders and shipping addresses.</p>
            </div>

            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="flex items-center w-full mb-8 border-b border-gray-200 overflow-x-auto">
                <TabsTrigger
                  value="orders"
                  className="flex items-center gap-2 px-6 py-3 text-sm uppercase tracking-wide font-medium data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-white rounded-none"
                >
                  <Package className="h-4 w-4" />
                  <span>Orders</span>
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  className="flex items-center gap-2 px-6 py-3 text-sm uppercase tracking-wide font-medium data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-white rounded-none"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Addresses</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-0">
                <ShoppingOrders />
              </TabsContent>

              <TabsContent value="address" className="mt-0">
                <Address />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}

export default ShoppingAccount;
