import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createSubscription } from "@/store/shop/newsletter-slice";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import logo from "@/assets/logo-1.png";
import { Mail, ArrowRight, Phone, MapPin } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";


// Updated policies data with structured content (text, headings, and points)
const policiesData = [
  {
    id: "terms",
    title: "Terms & Conditions",
    content: [
      { type: "text", value: "Rachana Boutique Terms & Conditions" },
      { type: "text", value: "Welcome to Rachana Boutique." },
      { type: "text", value: "These terms and conditions outline the rules and regulations for the use of our website." },
      { type: "text", value: "By accessing this website, you agree to accept these terms and conditions." },
      { 
        type: "section", 
        heading: "Interpretation and Definitions", 
        points: [
          "The terms 'we,' 'us,' and 'our' refer to Rachana Boutique. 'You' refers to the user or customer accessing our website.",
          "'Product(s)' refers to the goods available for purchase on our website."
        ]
      },
      { 
        type: "section", 
        heading: "Online Store Terms", 
        points: [
          "You may not use our products for any illegal or unauthorized purpose, nor may you violate any laws in your jurisdiction."
        ]
      },
      { 
        type: "section", 
        heading: "Products", 
        points: [
          "We reserve the right to limit the sales of our products to any person, geographic region, or jurisdiction. We may exercise this right on a case-by-case basis.",
          "We reserve the right to modify or discontinue any product at any time without notice.",
          "All descriptions of products or product pricing are subject to change at any time without notice, at our sole discretion. We reserve the right to discontinue any product at any time.",
          "We do not warrant that the quality of any products, information, or other material purchased or obtained by you will meet your expectations."
        ]
      },
      { 
        type: "section", 
        heading: "Pricing and Payment", 
        points: [
          "All prices for products are subject to change without notice.",
          "We may terminate your access to the site or services at any time, for any reason without notice.",
          "We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order.",
          "Payment must be made in full at the time of purchase. We accept various payment methods as displayed at checkout.",
          "You agree to provide accurate and complete information when placing an order."
        ]
      },
      { 
        type: "section", 
        heading: "Governing Law", 
        points: [
          "These Terms shall be governed by and construed in accordance with the laws of India."
        ]
      },
      { 
        type: "section", 
        heading: "Entire Agreement", 
        points: [
          "These terms constitute agreement between you and Rachana Boutique regarding your use of the site and services."
        ]
      },
      { type: "text", value: "If you have any questions regarding these terms please contact us through our email address rachanaboutiquechennai@gmail.com." }
    ]
  },
  {
    id: "return",
    title: "Refund & Returns Policy",
    content: [
      { type: "text", value: "Thank you for shopping at Rachana Boutique!" },
      { type: "text", value: "We truly value your support and strive to ensure a smooth and satisfying shopping experience. If your order didn't arrive as expected, we're here to make things right. Please take a moment to review our refund policy below." },
      { 
        type: "section", 
        heading: "Damaged or Wrong Items", 
        points: [
          "If you notice any damage or receive the wrong item, please record a clear unboxing video while opening the parcel. Make sure the video includes:",
          "A full view of the unopened package from all sides.",
          "The sealed parcel clearly showing the shipment label.",
          "The unpacking process without cuts or edits.",
          "Clear footage of any visible damage or errors.",
          "This video is crucial for us to process your refund smoothly."
        ]
      },
      { 
        type: "section", 
        heading: "How to Request a Refund", 
        points: [
          "Message Us: Reach out to us via WhatsApp on 9994412667 within 2 days of receiving your order. We don't accept phone calls—just drop us a message for quick assistance.",
          "What to Include: Mention your order number, the reason for your request, and attach the unboxing video. Our team will get back to you within 2 working days after reviewing the details."
        ]
      },
      { 
        type: "section", 
        heading: "Return Shipping Guidelines", 
        points: [
          "Once your refund is approved, you'll need to ship the product back to us. Please note:",
          "The return shipping cost is the customer's responsibility, unless the issue was caused by our mistake.",
          "Use India Post for the return courier.",
          "Reimbursement of up to ₹100 will be provided for the shipping cost if the return is approved.",
          "Make sure the item is packed securely in its original packaging before sending it to the address shared by our team."
        ]
      },
      { 
        type: "section", 
        heading: "Refund Process", 
        points: [
          "After we receive the product, we will inspect it to ensure it meets the return/exchange criteria.",
          "If your return is approved, we'll ship the replacement item to you. If the product is not available, we will initiate the refund process. Deduction of bank transaction charges applicable."
        ]
      },
      { 
        type: "section", 
        heading: "Please Note", 
        points: [
          "Refunds will be denied if the policy conditions aren't met.",
          "Customers are responsible for the safe return of the product. We recommend using a trackable courier service.",
          "We understand that in some cases you may not like the product you have received or feel that the product is different from what was shown. However, we have a strict 'NO RETURN' policy in such cases.",
          "No colour exchanges.",
          "Refunds/exchanges are not applicable on sale items.",
          "International orders are non-refundable, so we recommend double-checking everything before you place your order.",
          "Items with embellishments like beads or sequins may shed slightly during handling or shipping. This is normal and doesn't qualify for a refund."
        ]
      },
      { type: "text", value: "For any refund-related concerns, feel free to drop us a mail to rachanaboutiquechennai@gmail.com. We will reply to you as soon as possible. Our team is always happy to assist and ensure your shopping experience at Rachana Boutique remains delightful." }
    ]
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    content: [
      { type: "text", value: "Your privacy is our priority at Rachana Boutique." },
      { 
        type: "section", 
        heading: "Information We Collect", 
        points: [
          "We collect basic information like your name, address, contact details, and order history to process your purchases and provide customer support.",
          "We may also collect device and usage information for improving our services."
        ]
      },
      { 
        type: "section", 
        heading: "How We Use Your Information", 
        points: [
          "We do not share your personal data with third parties except trusted service providers involved in fulfilling your orders.",
          "Cookies are used to enhance your browsing experience. You can manage cookie preferences through your browser settings."
        ]
      }
    ]
  },
  {
    id: "shipping",
    title: "Shipping Policy",
    content: [
      { type: "text", value: "We offer free shipping across India and for international orders charges applicable." },
      { 
        type: "section", 
        heading: "Delivery Time Lines", 
        points: [
          "Orders are usually delivered within 15 to 20 business days based on product availability.",
          "This shipping duration will vary for each product and you can find the estimated delivery time for every product in the description.",
          "Delivery timelines may vary slightly during peak demand.",
          "International shipping is available with applicable charges."
        ]
      },
      { type: "text", value: "If you have any questions about the shipping policy, please contact us through our email address rachanaboutiquechennai@gmail.com." }
    ]
  }
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

    <>

      <div className="bg-background py-6">
        <div className="px-5 md:container flex flex-col gap-4 md:flex-row justify-between  items-center py-12">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-semibold ">Join the Elegance Club</h1>
            <p className="text-lg text-gray-600 mt-4">
              Stay updated with our latest collections and offers.
            </p>
          </div>

          <div className="w-full md:w-1/3">
            <form onSubmit={handleSubscribe} className="flex items-center border-b-2 border-gray-400 focus-within:border-rose-500">
              <Mail className="text-black mr-2" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full outline-none px-2 py-2 text-lg bg-transparent placeholder-gray-600"
              />
              <button type="submit" disabled={isLoading} className="text-rose-600 hover:text-rose-700 transition">
                <ArrowRight size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>
      <footer className="bg-white text-gray-700">
        <div className="container mx-auto pt-6 pb-3 px-4 md:px-8">
          {/* Flex Container */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">

            {/* About Section */}
            <div className="w-full md:w-1/2">
              <Link to="/shop/home" className="flex items-center">
                <img src={logo} alt="Logo" className="w-3/4 mx-auto md:mx-0" />
              </Link>
              <p className="text-justify text-md md:text-lg my-4">
                Rachana Boutique brings you a handpicked collection of sarees that blend tradition with a modern flair. Each piece is chosen for its quality, style, and craftsmanship. Draping you in timeless elegance, one saree at a time.
              </p>
            </div>

            {/* Explore Products */}
            <div className="w-full ml-0 md:ml-12 md:w-1/6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Explore Products</h4>
              <ul className="space-y-2">
                <li><Link to="/shop/home" className="text-md hover:underline hover:text-rose-600 transition">Home</Link></li>
                <li><Link to="/shop/collections" className="text-md hover:underline hover:text-rose-600 transition">Collections</Link></li>
                <li><Link to="/shop/new-arrivals" className="text-md hover:underline hover:text-rose-600 transition">New Arrivals</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div className="w-full md:w-1/5">
              <h4 className="text-lg font-semibold text-foreground mb-4">Policies</h4>
              <ul className="space-y-2">
                {policiesData.map((policy) => (
                  <li key={policy.id}>
                    <button onClick={() => openPolicyDialog(policy)} className="text-left hover:underline text-foreground">
                      {policy.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Social Media */}
            <div className="w-full md:w-1/4">
              <h4 className="text-lg font-semibold text-foreground mb-4">Contact Us</h4>
              <div className="space-y-2 text-md">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-rose-600 mr-2" />
                  <span>Chennai, Tamil Nadu, India</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-rose-600 mr-2" />
                  <a href="tel:+919994412667" className="hover:underline" onClick={(e) => { window.location.href = 'tel:+919994412667'; e.preventDefault(); }}>+91 9994412667</a>
                </div>

                {/* Email */}
                <a href="mailto:rachanaboutiquechennai@gmail.com" target="_blank" className="flex items-center gap-x-2" rel="noopener noreferrer">
                  <Mail className="w-5 h-5 text-rose-600 mr-2" />
                  <span className="text-md md:text-lg">rachanaboutiquechennai@gmail.com</span>
                </a>

                {/* Social Media Links */}
                <div className="flex gap-4 mt-3">
                  <a href="https://www.instagram.com/rachanas_boutique?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="text-gray-700 hover:text-rose-600 transition" target="_blank" rel="noopener noreferrer">
                    <FaInstagram size={24} />
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61570600405333" className="text-gray-700 hover:text-rose-600 transition" target="_blank" rel="noopener noreferrer">
                    <FaFacebook size={24} />
                  </a>
                  <a href="https://wa.me/9994412667" className="text-gray-700 hover:text-rose-600 transition" target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 border-t border-gray-300 pt-4 text-center text-sm">
            &copy; {new Date().getFullYear()} Rachana Boutique. All rights reserved.
          </div>
        </div>


        {/* Policy Dialog */}
        <Dialog open={policyDialogOpen} onOpenChange={(open) => !open && closePolicyDialog()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bold text-xl mb-4 text-center">{selectedPolicy?.title}</DialogTitle>
            </DialogHeader>
            <DialogDescription className="max-h-[70vh] overflow-y-auto">
              {selectedPolicy?.content && (
                <div className="space-y-4">
                  {selectedPolicy.content.map((item, index) => (
                    <div key={index}>
                      {item.type === "text" && (
                        <p className="text-foreground">{item.value}</p>
                      )}
                      {item.type === "section" && (
                        <div className="mt-4">
                          <h3 className="font-semibold text-lg mb-2">{item.heading}</h3>
                          <ol className="list-decimal ml-6 space-y-1">
                            {item.points.map((point, pointIndex) => (
                              <li key={pointIndex} className="text-foreground">{point}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </footer>
    </>
  );
};

export default Footer;