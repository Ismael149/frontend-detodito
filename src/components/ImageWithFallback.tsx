import React, { useState } from 'react';
import { environment } from '../environments/environment';
import './ImageWithFallback.css';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  onError
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setImageLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setImageLoading(false);
    onLoad?.();
  };

  // Función para obtener la URL completa de la imagen
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/assets/images/placeholder.png';

    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }

    if (imagePath.startsWith('/uploads')) {
      const baseUrl = environment.apiUrl.replace('/api', '');
      return `${baseUrl}${imagePath}`;
    }

    return imagePath;
  };

  const imageUrl = getImageUrl(src);

  if (imageError) {
    return (
      <div className={`image-fallback ${className}`}>
        <div className="fallback-content">
          <span>📷</span>
          <p>Imagen no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`image-container ${className}`}>
      {imageLoading && (
        <div className="image-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`actual-image ${imageLoading ? 'hidden' : 'visible'}`}
        loading="lazy"
      />
    </div>
  );
};

export default ImageWithFallback;