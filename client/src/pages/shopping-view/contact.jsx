import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import banner from "../../assets/kora.png";
import { createContact } from "@/store/shop/contact-slice";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  // Access the shopContact state from Redux store
  const { isLoading, error } = useSelector((state) => state.shopContact);

  // Local state for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Dispatch the createContact thunk
    const resultAction = await dispatch(createContact({ name, email, message }));
    if (createContact.fulfilled.match(resultAction)) {
      // Clear the form fields
      setName("");
      setEmail("");
      setMessage("");
      // Use toast notification after a successful submission
      toast({
        title: "Success",
        description: "Your message has been sent successfully!",
      });
    }
  };

  return (
    <section className="bg-playground text-foreground px-6 py-12 md:py-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Side: Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <img
            src={banner}
            alt="Elegant Saree Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center">
              We&apos;re Here to Help
            </h2>
            <p className="text-lg text-gray-300 text-center">
              Reach out to us through our social channels
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-500 transition"
              >
                <Facebook size={30} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-pink-500 transition"
              >
                <Instagram size={30} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-400 transition"
              >
                <Twitter size={30} />
              </a>
              <a
                href="mailto:support@sarees.com"
                className="text-white hover:text-red-500 transition"
              >
                <Mail size={30} />
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="bg-background bg-opacity-90 rounded-2xl shadow-md p-6 md:p-10 relative">
          <h3 className="text-3xl font-bold mb-6 text-center">Contact Us</h3>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Have a question? Let us know, and we&apos;ll get back to you as soon as possible.
          </p>
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <Textarea
                id="message"
                rows="4"
                placeholder="Write your message here..."
                className="w-full"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-red-500 text-center">{error}</p>
            )}
            <div className="text-center">
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 rounded-lg text-white text-lg font-medium shadow hover:shadow-lg transition"
              >
                {isLoading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>

          {/* Additional Elements for Filling Space */}
          <div className="absolute -top-8 -right-8">
            <div className="w-20 h-20 bg-pink-500 rounded-full opacity-50"></div>
            <div className="w-16 h-16 bg-yellow-400 rounded-full opacity-75 absolute top-8 right-8"></div>
          </div>
          <div className="absolute -bottom-8 -left-8">
            <div className="w-24 h-24 bg-blue-400 rounded-full opacity-50"></div>
            <div className="w-16 h-16 bg-green-500 rounded-full opacity-75 absolute bottom-8 left-8"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;