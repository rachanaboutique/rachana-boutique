import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createSubscription } from "@/store/shop/newsletter-slice";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

// Updated policies data with array of points for numbered rendering
const policiesData = [
  {
    id: "terms",
    title: "Terms & Conditions",
    points: [
      "These are the terms and conditions.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    ]
  },
  {
    id: "return",
    title: "Return Policy",
    points: [
      "This is the return policy.",
      "Nulla facilisi. Praesent interdum, nunc vitae egestas ultricies, eros dolor fermentum nisl."
    ]
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    points: [
      "This is the privacy policy.",
      "Vivamus ut sem eu velit finibus placerat."
    ]
  },
  {
    id: "cancellation",
    title: "Cancellation Policy",
    points: [
      "This is the cancellation policy.",
      "Fusce porta, odio at fringilla semper, lacus justo sodales massa, a facilisis nulla orci ac lorem."
    ]
  }
];

// Quick links routes
const quickLinks = [
  { id: "home", label: "Home", path: "/shop/home" },
  { id: "collections", label: "Collections", path: "/shop/collections" },
  { id: "new-arrivals", label: "New Arrivals", path: "/shop/new-arrivals" },
  { id: "contact", label: "Contact", path: "/shop/contact" },
];

const Footer = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);

  // Access loading state from Redux
  const { isLoading } = useSelector((state) => state.shopNewsLetter);

  // Subscription handler
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    dispatch(createSubscription({ email }))
      .then((res) => {
        if (res.payload?.success) {
          toast({ title: res.payload.message, variant: "success" });
          setEmail("");
        } else if (res.payload?.message === "This email is already subscribed to the newsletter.") {
          toast({ title: "You are already subscribed!", variant: "warning" });
        }
      })
      .catch(() => {
        toast({ title: "Subscription failed. Try again!", variant: "destructive" });
      });
  };

  // Policy dialog handlers
  const openPolicyDialog = (policy) => {
    setSelectedPolicy(policy);
    setPolicyDialogOpen(true);
  };

  const closePolicyDialog = () => {
    setSelectedPolicy(null);
    setPolicyDialogOpen(false);
  };

  return (
    <footer className="bg-background text-gray-700">
    <div className="container mx-auto pt-6 pb-3 px-4">
      
      {/* Flexbox Container */}
      <div className="flex flex-col md:flex-row md:justify-between md:gap-x-12 gap-y-8">
        
        {/* About Section */}
        <div className="md:w-[35%]">
          <Link to="/shop/home" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-full md:w-3/4" />
          </Link>
          <p className="text-lg my-4">
            Welcome to our boutique, where tradition meets elegance. Explore our curated collection of exquisite sarees designed to make every occasion special.
          </p>
        </div>
  
        {/* Quick Links */}
        <div className="md:w-[15%]">
          <h4 className="text-lg font-semibold text-foreground mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.id}>
                <Link to={link.path} className="text-md hover:underline hover:text-rose-600 transition">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
  
        {/* Contact Information */}
        <div className="md:w-[25%]">
          <h4 className="text-lg font-semibold text-foreground mb-4">Contact Us</h4>
          <div className="space-y-2 text-md">
            <address className="not-italic leading-relaxed">
              Flat No: 1162, 1st Block, 16th Floor,<br />
              134 Appasamy Cerus Apts, 134 Arcot Road,<br />
              Virugambakkam, Chennai - 600092
              
            </address>
            <div>
              <strong>Phone:</strong>
              <a href="tel:+919944783389" className="ml-2 text-rose-600 hover:underline">
                +91 9944783389
              </a>
            </div>
            <div>
              <strong>Email:</strong>
              <a href="mailto:rachanaboutique@gmail.com" className="ml-2 text-rose-600 hover:underline">
                rachanaboutique@gmail.com
              </a>
            </div>
          </div>
        </div>
  
        {/* Newsletter Subscription */}
        <div className="md:w-[25%]">
          <h4 className="text-lg font-semibold text-foreground mb-4">Subscribe</h4>
          <p className="text-md mb-4">Stay updated with our latest collections and offers.</p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-rose-600 text-white py-2 rounded-lg transition duration-300 ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-rose-700"
              }`}
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>
  
      </div>
  
      {/* Bottom Section */}
      <div className="mt-8 border-t border-gray-300 pt-4 text-center text-sm flex flex-col gap-2">
        <ul className="flex flex-wrap gap-4 justify-center text-sm">
          {policiesData.map((policy) => (
            <li key={policy.id}>
              <button onClick={() => openPolicyDialog(policy)} className="hover:underline text-foreground">
                {policy.title}
              </button>
            </li>
          ))}
        </ul>
        <div>&copy; {new Date().getFullYear()} Saree Boutique. All rights reserved.</div>
      </div>
    </div>
  
    {/* Policy Dialog */}
    <Dialog open={policyDialogOpen} onOpenChange={(open) => !open && closePolicyDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedPolicy?.title}</DialogTitle>
        </DialogHeader>
        {selectedPolicy?.points && (
          <ol className="list-decimal ml-6 space-y-1 text-sm">
            {selectedPolicy.points.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  </footer>
  

  );
};

export default Footer;