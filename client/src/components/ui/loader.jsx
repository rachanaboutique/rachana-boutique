import { motion } from "framer-motion";

function Loader({ className }) {
  // Petal animation variants
  const petalAnimation = {
    initial: { y: "-10%", opacity: 0 },
    animate: {
      y: "110%",
      opacity: [0.8, 0.5, 0],
      rotate: [0, 30, -30, 0],
    },
    transition: {
      repeat: Infinity,
      duration: 6,
      ease: "easeInOut",
    },
  };

  return (
    <div
      className={`z-50 w-screen h-screen bg-background fixed inset-0 bg-gradient-to-b from-pastel-pink to-pastel-cream flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Outer Bloom Aura */}
      <motion.div
        className="absolute h-[250px] w-[250px] rounded-full bg-gradient-to-r from-pink-300 via-pastel-gold to-transparent blur-2xl opacity-50"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Rotating Floral Spinner */}
      <motion.div
        className="relative h-16 w-16 md:h-24 md:w-24 rounded-full border-[6px] border-t-gold-500 border-b-pink-500 shadow-xl"
        animate={{
          rotate: 360,
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "linear",
        }}
      >
        {/* Inner Floral Glow */}
        <motion.div
          className="absolute inset-0 m-auto h-12 w-12 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-pastel-gold via-white to-pink-100 shadow-lg"
          animate={{
            scale: [0.9, 1, 0.9],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut",
          }}
        >

          <div className="flex items-center justify-center h-full">
            <motion.span
              className="text-pink-500 text-xl md:text-3xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
              }}
            >
              🌸
            </motion.span>
          </div>
        </motion.div>
      </motion.div>

      {/* Loader Text */}
      <div className="absolute top-2/3 text-xl font-semibold text-maroon-600 animate-pulse">
        Loading boutique elegance...
      </div>

     {/* Floating Petals Effect */}
     <div className="absolute inset-0 -z-20">
  {[...Array(12)].map((_, i) => {
    // Define safe zone boundaries
    const safeZone = {
      topMin: 30, // 30% from the top
      topMax: 70, // 70% from the top
      leftMin: 30, // 30% from the left
      leftMax: 70, // 70% from the left
    };

    let top, left;

    // Generate random positions that avoid the safe zone
    do {
      top = Math.random() * 100;
      left = Math.random() * 100;
    } while (
      top > safeZone.topMin &&
      top < safeZone.topMax &&
      left > safeZone.leftMin &&
      left < safeZone.leftMax
    );

    return (
      <motion.div
        key={i}
        className="absolute w-6 h-6 text-pink-400"
        style={{
          top: `${top}%`,
          left: `${left}%`,
        }}
        animate={{
          y: ["0%", "-50%", "0%"],
          rotate: [0, 360, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: Math.random() * 3 + 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🌸
      </motion.div>
    );
  })}
</div>

    </div>
  );
}

export { Loader };
