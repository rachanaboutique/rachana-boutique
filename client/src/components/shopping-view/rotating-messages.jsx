import { useState, useEffect } from "react";

function RotatingMessages({
  messages,
  interval = 4000,
  className = "",
  variant = "dark", // new variant for dark theme
  showDots = true,
}) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (messages.length <= 1) return;

    const intervalId = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setIsAnimating(false);
      }, 300);
    }, interval);

    return () => clearInterval(intervalId);
  }, [messages, interval]);

  if (!messages.length) return null;

  const getVariantClasses = () => {
    switch (variant) {
      case "solid":
        return "bg-primary text-primary-foreground";
      case "bordered":
        return "bg-background border-t border-b border-border";
      case "dark":
      default:
        return "";
    }
  };

  return (
    <div
      className={`relative overflow-hidden h-10 md:h-5 flex items-center justify-center px-4 select-none ${getVariantClasses()} ${className}`}
      style={{ fontFeatureSettings: '"liga" 0' }} // subtle font smoothing (optional)
    >
      {/* subtle overlay for depth */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

      <div className="relative flex items-center space-x-3 w-full max-w-6xl">
        <div className="relative overflow-hidden  flex items-center flex-1">
          <div
            key={currentMessageIndex}
            className={`text-xs md:text-sm font-semibold text-center w-full tracking-wide uppercase text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out ${
              isAnimating ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionProperty: "opacity, transform" }}
          >
            {messages[currentMessageIndex]}
          </div>
        </div>

        {showDots && messages.length > 1 && (
          <div className="flex items-center space-x-1 flex-shrink-0">
            {messages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentMessageIndex
                    ? "bg-white shadow-[0_0_5px_2px_rgba(255,255,255,0.6)] scale-110"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RotatingMessages;