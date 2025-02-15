import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSubscription } from "@/store/shop/newsletter-slice";
import { useToast } from "@/components/ui/use-toast";

const Footer = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [email, setEmail] = useState("");

  // Access loading, success, and error states from Redux
  const { isLoading, error } = useSelector((state) => state.shopNewsLetter);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      toast({ title: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    // Dispatch the subscription action
    dispatch(createSubscription({ email }))
      .then((res) => {
        if (res.payload?.success) {
          toast({ title: res.payload.message, variant: "success" });
          setEmail(""); // Clear input field
        } else if (res.payload?.message === "This email is already subscribed to the newsletter.") {
          toast({ title: "You are already subscribed!", variant: "warning" });
        }
      })
      .catch(() => {
        toast({ title: "Subscription failed. Try again!", variant: "destructive" });
      });
  };

  return (
    <footer className="bg-background text-gray-700">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">About Us</h4>
            <p className="text-sm">
              Welcome to our boutique, where tradition meets elegance. Explore our curated
              collection of exquisite sarees designed to make every occasion special.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Home</a></li>
              <li><a href="#" className="hover:underline">Shop</a></li>
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Contact Us</h4>
            <p className="text-sm">
              <strong>Address:</strong> 123 Saree Lane, Tradition City, TC 56789
            </p>
            <p className="text-sm">
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
            <p className="text-sm">
              <strong>Email:</strong> info@sareeboutique.com
            </p>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Subscribe</h4>
            <p className="text-sm mb-4">
              Stay updated with our latest collections and offers.
            </p>
            <form onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-foreground text-white py-2 rounded-lg transition duration-300 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-rose-600"
                }`}
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-300 pt-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Saree Boutique. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
