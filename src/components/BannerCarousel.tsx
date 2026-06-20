import React, { useState, useEffect, useRef } from 'react';
import {
  IonCard,
  IonCardContent,
  IonSpinner
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { environment } from '../environments/environment';
import { Banner } from '../data/banners';
import { getImageUrl } from '../utils/imageUtils';
import './BannerCarousel.css';

interface BannerCarouselProps {
  banners: Banner[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  height?: string;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  autoPlay = true,
  autoPlayInterval = 5000,
  height = '160px'
}) => {
  // Estados con valores iniciales explícitos
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  /* Removed duplicate declaration */
  const history = useHistory();

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Función para siguiente slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === banners.length - 1) {
        return 0;
      } else {
        return prevIndex + 1;
      }
    });
  };

  // Función para slide anterior
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return banners.length - 1;
      } else {
        return prevIndex - 1;
      }
    });
  };

  // Auto-play
  useEffect(() => {
    if (autoPlay && banners.length > 1) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, banners.length]);

  // Pausar auto-play
  const pauseAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  // Reanudar auto-play
  const resumeAutoPlay = () => {
    if (autoPlay && banners.length > 1 && !autoPlayRef.current) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
    }
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    pauseAutoPlay();
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !trackRef.current) return;

    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;

    // Aplicar transformación durante el arrastre
    trackRef.current.style.transform = `translateX(calc(-${currentIndex * 100}% - ${diff}px))`;
    trackRef.current.style.transition = 'none';
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    const threshold = 50;

    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }

    // Restaurar transformación normal
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
      trackRef.current.style.transition = 'transform 0.4s ease';
    }

    setIsDragging(false);
    resumeAutoPlay();
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    pauseAutoPlay();
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;

    const currentX = e.clientX;
    const diff = startX - currentX;

    trackRef.current.style.transform = `translateX(calc(-${currentIndex * 100}% - ${diff}px))`;
    trackRef.current.style.transition = 'none';
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const endX = e.clientX;
    const diff = startX - endX;
    const threshold = 50;

    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
      trackRef.current.style.transition = 'transform 0.4s ease';
    }

    setIsDragging(false);
    resumeAutoPlay();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
        trackRef.current.style.transition = 'transform 0.4s ease';
      }
      resumeAutoPlay();
    }
  };

  // Manejar carga de imagen
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleBannerClick = (banner: Banner) => {
    // Si se estaba arrastrando, no procesar el click
    if (isDragging) return;

    // Si no tiene link, no hacer nada
    if (!banner.link) return;

    let targetLink = banner.link;

    // Si es una URL absoluta pero apunta a nuestra app, convertirla a relativa
    if (targetLink.startsWith('http') && targetLink.includes(window.location.host)) {
      try {
        const url = new URL(targetLink);
        targetLink = url.pathname + url.search + url.hash;
      } catch (e) {
        console.error('Invalid URL:', targetLink);
      }
    }

    if (targetLink.startsWith('http')) {
      window.open(targetLink, '_blank');
    } else {
      history.push(targetLink);
    }
  };

  const handleImageError = () => {
    setIsLoading(false);
    console.error('Error loading banner image');
  };

  if (banners.length === 0) {
    return (
      <div className="banner-carousel empty" style={{ height }}>
        <IonCard>
          <IonCardContent>
            <p>No hay banners disponibles</p>
          </IonCardContent>
        </IonCard>
      </div>
    );
  }

  return (
    <div
      className="banner-carousel"
      style={{ height }}
    >
      <div
        ref={trackRef}
        className="banner-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="banner-slide"
            style={{
              background: banner.backgroundColor || '#f0f0f0',
              cursor: banner.link ? 'pointer' : 'default'
            }}
            onClick={() => handleBannerClick(banner)}
          >
            <div className="banner-content">
              {(() => {
                const finalUrl = getImageUrl(banner.image);
                return (
                  <>
                    {isLoading && index === currentIndex && (
                      <div className="banner-loading">
                        <IonSpinner />
                      </div>
                    )}
                    <img
                      src={finalUrl}
                      alt={banner.title}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      className={`banner-image ${isLoading && index === currentIndex ? 'loading' : 'loaded'}`}
                    />
                  </>
                );
              })()}

              <div className="banner-overlay">
                <h3 className="banner-title">{banner.title}</h3>
                {banner.category && (
                  <p className="banner-category">{banner.category}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores */}
      {banners.length > 1 && (
        <div className="carousel-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentIndex(index);
                pauseAutoPlay();
                setTimeout(resumeAutoPlay, 100);
              }}
              onMouseEnter={pauseAutoPlay}
              onMouseLeave={resumeAutoPlay}
            >
              <div className="indicator-progress">
                {index === currentIndex && autoPlay && (
                  <div
                    className="indicator-progress-bar"
                    style={{
                      animationDuration: `${autoPlayInterval}ms`,
                      animationPlayState: isDragging ? 'paused' : 'running'
                    }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;