import React from 'react';
import Slider from 'react-slick';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const testimonials = [
  {
    name: "Priya Sharma",
    title: "Customer",
    review:
      "I absolutely love the sarees from Rachana Boutique! The craftsmanship is exquisite, and the fabric is so comfortable. My go-to place for every occasion!",
    image: "https://randomuser.me/api/portraits/women/25.jpg",
  },
  {
    name: "Aaradhya Patel",
    title: "Customer",
    review: "The shopping experience was fantastic! The saree I bought fits perfectly, and I got so many compliments at the wedding. Highly recommend!",
    image: "https://randomuser.me/api/portraits/women/30.jpg",
  },
  {
    name: "Shalini Reddy",
    title: "Customer",
    review: "I’ve never experienced such beautiful sarees before. The quality and colors are just mesmerizing. The team at Rachana Boutique is incredibly helpful too.",
    image: "https://randomuser.me/api/portraits/women/35.jpg",
  },
  {
    name: "Anjali Gupta",
    title: "Customer",
    review: "Amazing experience, my saree arrived on time and looked even better than I expected! The colors are vibrant and the material feels luxurious.",
    image: "https://randomuser.me/api/portraits/women/40.jpg",
  },
  {
    name: "Geetha Nair",
    title: "Customer",
    review: "The saree collection is a must-see! I bought a wedding saree and received so many compliments. Thank you, Rachana Boutique, for such an amazing collection!",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
];

const Testimonials = () => {
  const settings = {
    className: "center",
    infinite: true,
    autoplay: true,
    dots: true,
    autoplaySpeed: 3000,
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
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Main return function
  return (
    <div className='pt-10'>
      <div className='w-full md:w-3/4 m-auto'>
        <Slider {...settings}>
          {testimonials.map((testimonial, index) => {
            return renderSlide(testimonial, index);
          })}
        </Slider>
      </div>
    </div>
  );
};

// Render each slide separately
const renderSlide = (testimonial, index) => {
  return (
    <div
    key={index}
    className=" w-full bg-white rounded-lg shadow-xl p-6 "
  >
    <div className="flex justify-center items-center mb-4">
      <img
        src={testimonial.image}
        alt={testimonial.name}
        className="w-24 h-24 rounded-full border-4 border-primary"
      />
    </div>
    <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">
      {testimonial.name}
    </h3>
    <p className="text-center text-sm text-gray-600 mb-4">{testimonial.title}</p>
    <p className="text-center text-gray-500">{testimonial.review}</p>
  </div>
  );
};

// Previous and Next arrows
const PrevIcon = ({ onClick }) => {
  return (
    <div className="slick-icons slick-icons--left" onClick={onClick}>
      <ArrowLeft className="text-2xl text-primary" />
    </div>
  );
};

const NextIcon = ({ onClick }) => {
  return (
    <div className="slick-icons slick-icons--right" onClick={onClick}>
      <ArrowRight className="text-2xl text-primary" />
    </div>
  );
};

export default Testimonials;
