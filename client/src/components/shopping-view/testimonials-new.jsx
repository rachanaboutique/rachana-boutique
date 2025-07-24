import React from 'react';
import Slider from 'react-slick';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import FeedbackCard from './feedback-card';
import { motion } from 'framer-motion';

// Updated testimonials for a clothing store

const testimonials = [
  {
    name: "Thana Malar",
    title: "Satisfied Customer",
    review:
      "I like the sarees at Rachana's Boutique and find their collection to be exquisite. I had purchased a saree and found their delivery and service were efficient. Sridevi Mam gives her personal attention in fulfilling customer satisfaction. Thank you and all the best.",
    image: "https://randomuser.me/api/portraits/women/25.jpg",
  },
  {
    name: "Bharathi",
    title: "Saree Enthusiast",
    review:
      "RACHANA BOUTIQUE having an Exclusive saree collections of Excellent combinations of colours from various places inclusive of all Traditional & Fashionable Party wear sarees ranging from daily wear to Special Occasions. A must try place to have an Elegant Saree look.",
    image: "https://randomuser.me/api/portraits/women/30.jpg",
  },
  {
    name: "Prisha",
    title: "Fashion Lover",
    review:
      "I've honestly loved the saree collection the designs feel super fresh but still have that traditional touch. The fabric quality is really good, and the colors are so well picked. You've clearly put a lot of thought into every piece, and it shows. Can't wait to see how it all looks on the website.",
    image: "https://randomuser.me/api/portraits/women/35.jpg",
  },
  {
    name: "Lynn Ernestina",
    title: "Happy Customer",
    review:
      "The service was very prompt, courteous and very professional. I am happy with the variety available and the overall experience. Definitely recommend and consider purchasing again.",
    image: "https://randomuser.me/api/portraits/women/40.jpg",
  },
  {
    name: "Shobhana",
    title: "Regular Shopper",
    review:
      "My recent saree shopping from Rachana's boutique was a great experience… lovely hand picked collections, choice of colours, good quality, and reasonable price. Overall a good shopping and satisfaction. Try Rachana's collections.",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    name: "Sumathi Puniyaseelan",
    title: "Loyal Customer",
    review:
      "RACHANA BOUTIQUE has a truly unique collection with a wide variety of beautiful designs at reasonable prices. The quality and patterns are exceptional—totally awesome experience! Highly recommended for anyone looking for stylish and affordable sarees.",
    image: "https://randomuser.me/api/portraits/women/50.jpg",
  },
];


const Testimonials = () => {
  const settings = {
    className: "testimonial-slider",
    infinite: true,
    autoplay: true,
    dots: true,
    autoplaySpeed: 5000,
    slidesToShow: 3,
    nextArrow: <NextIcon />,
    prevArrow: <PrevIcon />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    appendDots: dots => (
      <div>
        <ul className="mt-8"> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <div className="w-3 h-3 mx-1 rounded-full bg-gray-200 hover:bg-gray-400 transition-colors"></div>
    ),
  };

  return (
    <div className='relative'>
      <div className='w-full mx-auto relative pb-16'>
        <Slider {...settings}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </Slider>

        {/* Feedback button positioned at the bottom center */}
        <div className="absolute -bottom-5 left-0 right-0 flex justify-center mt-8">
          <FeedbackCard />
        </div>
      </div>
    </div>
  );
};

// Modern testimonial card component
const TestimonialCard = ({ testimonial, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 50,
      }}
      className="px-4"
    >
      <div className="bg-white p-8 border border-gray-200 shadow-sm h-full flex flex-col">
        {/* Quote icon */}
        <div className="mb-6 text-gray-300">
          <Quote size={32} />
        </div>

        {/* Review text */}
        <p className="text-justify text-gray-800 mb-8 flex-grow leading-relaxed">"{testimonial.review}"</p>

        {/* Customer info */}
        <div className="flex items-center mt-auto pt-6 border-t border-gray-100">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-20 h-20 rounded-full object-cover border border-gray-200"
          />
          <div className="ml-4">
            <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
            {/* <p className="text-sm text-gray-500">{testimonial.title}</p> */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Previous and Next arrows with updated styling
const PrevIcon = ({ onClick }) => {
  return (
    <button
      className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-colors"
      onClick={onClick}
      aria-label="Previous"
    >
      <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
    </button>
  );
};

const NextIcon = ({ onClick }) => {
  return (
    <button
      className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-colors"
      onClick={onClick}
      aria-label="Next"
    >
      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
    </button>
  );
};

export default Testimonials;