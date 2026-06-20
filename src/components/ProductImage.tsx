import React, { useState, useEffect } from 'react';
import { environment } from '../environments/environment';
import { getImageUrl } from '../utils/imageUtils';

interface ProductImageProps {
  imageUrl?: string;
  images?: any[];
  alt?: string;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ imageUrl, images, alt = '', className = '' }) => {
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let urlToUse = imageUrl;

    if (!urlToUse && images && images.length > 0) {
      urlToUse = images[0].image_url || images[0];
    }

    const finalUrl = getImageUrl(urlToUse);
    if (finalUrl) {
      setFinalImageUrl(finalUrl);
      setError(false);
    } else {
      setError(true);
    }
  }, [imageUrl, images]);

  if (error || !finalImageUrl) {
    return (
      <div className={`product-image placeholder ${className}`} style={{
        background: '#eee', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <small>Sin imagen</small>
      </div>
    );
  }

  return (
    <img
      src={finalImageUrl}
      alt={alt}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        transition: 'transform 0.5s ease' // Preparado para el efecto de zoom del Admin
      }}
      onError={() => {
        setError(true);
      }}
      onLoad={(e) => {
        // Carga exitosa
      }}
    />
  );
};

export default ProductImage;