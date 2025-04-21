import React, { useState, useEffect } from 'react';

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onClick?: () => void;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  className = '',
  fallback,
  onClick
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setImageOpacity(0);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
    // Use a slight delay for the fade in effect
    setTimeout(() => setImageOpacity(1), 50);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 dark:border-blue-400 animate-spin"></div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          {fallback || (
            <div className="flex flex-col items-center justify-center p-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Image could not be loaded
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
        style={{ opacity: imageOpacity }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default ImageLoader; 