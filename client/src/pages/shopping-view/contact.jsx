import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"; // Social media icons
import banner from "../../assets/kora.png";

const Contact = () => {
  return (
    <section className="bg-background text-foreground px-6 py-12 md:py-24">
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
              We're Here to Help
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
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-md p-6 md:p-10 relative">
  <h3 className="text-3xl font-bold mb-6 text-center">Contact Us</h3>
  <p className="text-sm text-muted-foreground text-center mb-8">
    Have a question? Let us know, and we'll get back to you as soon as possible.
  </p>
  <form className="grid grid-cols-1 gap-6">
    <div>
      <label htmlFor="name" className="block text-sm font-medium mb-2">
        Full Name
      </label>
      <Input id="name" type="text" placeholder="Enter your name" className="w-full" />
    </div>
    <div>
      <label htmlFor="email" className="block text-sm font-medium mb-2">
        Email Address
      </label>
      <Input id="email" type="email" placeholder="Enter your email" className="w-full" />
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
      />
    </div>
    <div className="text-center">
      <Button
        type="submit"
        className="px-6 py-2 rounded-lg text-white text-lg font-medium shadow hover:shadow-lg transition"
      >
        Send Message
      </Button>
    </div>
  </form>

  {/* Additional Elements for Filling Space */}
  <div className="absolute -top-8 -right-8 k">
    <div className="w-20 h-20 bg-pink-500 rounded-full opacity-50"></div>
    <div className="w-16 h-16 bg-yellow-400 rounded-full opacity-75 absolute top-8 right-8"></div>
  </div>
  <div className="absolute -bottom-8 -left-8 k">
    <div className="w-24 h-24 bg-blue-400 rounded-full opacity-50"></div>
    <div className="w-16 h-16 bg-green-500 rounded-full opacity-75 absolute bottom-8 left-8"></div>
  </div>
</div>

      </div>
    </section>
  );
};

export default Contact;
