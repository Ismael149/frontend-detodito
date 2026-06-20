import React, { useRef, useState } from 'react';
import { IonContent, IonPage, IonButton, IonIcon, IonText, useIonRouter } from '@ionic/react';
import { arrowForward, checkmarkCircle } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { Preferences } from '@capacitor/preferences';
import './OnboardingPage.css';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const OnboardingPage: React.FC = () => {
    const router = useIonRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const swiperRef = useRef<any>(null);

    const finishOnboarding = async () => {
        await Preferences.set({
            key: 'hasSeenOnboarding',
            value: 'true',
        });
        router.push('/login', 'root', 'replace');
    };

    const nextSlide = () => {
        if (swiperRef.current && swiperRef.current.swiper) {
            swiperRef.current.swiper.slideNext();
        }
    };

    const slides = [
        {
            title: 'Bienvenido a DeTodito',
            description: 'Tu plataforma favorita para comprar y vender productos de manera fácil y segura.',
            image: '/assets/img/logo_dark.png', // Placeholder path
            altImage: '/assets/img/logo_white.png', // For dark mode maybe? Or just one logo adaptivity.
            icon: null
        },
        {
            title: 'Compra Seguro',
            description: 'Encuentra miles de productos verificados. Paga con seguridad y recibe tu pedido rápido.',
            image: null,
            icon: 'secure'
        },
        {
            title: 'Vende Más',
            description: 'Crea tu tienda, gestiona tus productos y llega a miles de clientes potenciales.',
            image: null,
            icon: 'sell'
        }
    ];

    return (
        <IonPage>
            <IonContent fullscreen className="onboarding-content">
                <Swiper
                    modules={[Pagination, Navigation]}
                    pagination={{ clickable: true }}
                    className="onboarding-swiper"
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    ref={swiperRef}
                >
                    {slides.map((slide, index) => (
                        <SwiperSlide key={index}>
                            <div className="slide-container">
                                <div className="slide-content glass-card">
                                    {index === 0 ? (
                                        <div className="logo-container">
                                            {/* Logic to show provided logo. Since user didn't place files yet, we use a placeholder or text */}
                                            {/* Assuming user will place logo.png at /assets/img/logo.png */}
                                            <img
                                                src="/assets/img/logo-onboarding.svg"
                                                alt="DeTodito Logo"
                                                className="onboarding-logo dark-hidden"
                                                onError={(e) => {
                                                    // Fallback if image not found
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).parentElement!.classList.add('show-text');
                                                }}
                                            />
                                            <img
                                                src="/assets/img/logo-onboarding-white.svg"
                                                alt="DeTodito Logo"
                                                className="onboarding-logo light-hidden"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).parentElement!.classList.add('show-text');
                                                }}
                                            />
                                            <div className="fallback-text">
                                                <h1>DT</h1>
                                                <h2>DeTodito</h2>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="illustration-container">
                                            {/* Visuals for other slides */}
                                            <div className={`onboarding-icon-circle accent-${index}`}>
                                                {index === 1 && <IonIcon icon={checkmarkCircle} />}
                                                {index === 2 && <IonIcon icon={arrowForward} />}
                                            </div>
                                        </div>
                                    )}

                                    <h2 className="slide-title">{slide.title}</h2>
                                    <p className="slide-description">{slide.description}</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="onboarding-footer">
                    <div className="dots-container">
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                className={`dot ${activeIndex === idx ? 'active' : ''}`}
                            />
                        ))}
                    </div>

                    <div className="buttons-container">
                        {activeIndex === slides.length - 1 ? (
                            <IonButton
                                expand="block"
                                className="premium-button"
                                onClick={finishOnboarding}
                            >
                                Comenzar
                                <IonIcon slot="end" icon={arrowForward} />
                            </IonButton>
                        ) : (
                            <div className="nav-buttons">
                                <IonButton
                                    fill="clear"
                                    color="medium"
                                    onClick={finishOnboarding}
                                >
                                    Saltar
                                </IonButton>
                                <IonButton
                                    className="next-button"
                                    onClick={nextSlide}
                                >
                                    Siguiente
                                </IonButton>
                            </div>
                        )}
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default OnboardingPage;
