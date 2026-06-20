// frontend/src/components/DebugImage.tsx
import React, { useState, useEffect } from 'react';
import { environment } from '../environments/environment';

const DebugImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (src) {
      const url = src.startsWith('/uploads')
        ? `${environment.apiUrl.replace('/api', '')}${src}`
        : src;
      setImageUrl(url);

      // Testear la imagen
      const testImg = new Image();
      testImg.onload = () => console.log('✅ Image loaded:', url);
      testImg.onerror = () => console.log('❌ Image failed:', url);
      testImg.src = url;
    }
  }, [src]);

  return (
    <div style={{ border: '2px solid blue', padding: '10px', margin: '10px' }}>
      <p>URL: {imageUrl}</p>
      <img
        src={imageUrl}
        alt={alt}
        style={{ maxWidth: '200px', display: 'block' }}
        onLoad={() => console.log('✅ Component image loaded')}
        onError={() => console.log('❌ Component image failed')}
      />
    </div>
  );
};

export default DebugImage;