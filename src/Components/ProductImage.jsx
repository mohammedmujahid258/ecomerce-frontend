import { useState } from "react";

function ImagePlaceholder({ className = "", text = "Product" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-stone-100 text-stone-400 select-none ${className}`}
      aria-label={`${text} image placeholder`}
    >
      <svg
        className="w-8 h-8 opacity-40 mb-1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
      <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-400">
        No Image
      </span>
    </div>
  );
}

function ProductImage({ src, alt = "Product", className = "" }) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!src || hasError) {
    return <ImagePlaceholder className={className} text={alt} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-stone-100 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`h-full w-full object-contain transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export default ProductImage;
