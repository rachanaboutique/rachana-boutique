import React from 'react';
import WatchAndBuy from '../components/shopping-view/watch-and-buy-direct';
import '../styles/video-swipe-direct.css';

// Sample product data
const sampleProducts = [
  {
    _id: '1',
    title: 'Product 1',
    price: 1999,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    _id: '2',
    title: 'Product 2',
    price: 2999,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    _id: '3',
    title: 'Product 3',
    price: 3999,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    _id: '4',
    title: 'Product 4',
    price: 4999,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    _id: '5',
    title: 'Product 5',
    price: 5999,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
];

const TestVideoSwipeDirect = () => {
  const handleAddToCart = (product) => {
    console.log('Added to cart:', product);
    alert(`Added ${product.title} to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Direct Video Swipe Test</h1>
        <p className="text-center mb-8">Click on a product to open the video modal, then swipe up/down to navigate between videos. The speed of your swipe controls the transition speed.</p>
        
        <WatchAndBuy products={sampleProducts} handleAddtoCart={handleAddToCart} />
      </div>
    </div>
  );
};

export default TestVideoSwipeDirect;
