// CookiesPolicyPage.tsx - Reconstruido desde cero
import React from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton
} from '@ionic/react';
import './LegalPages.css';

const CookiesPolicyPage: React.FC = () => {
    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="premium-toolbar">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/about" text="" />
                    </IonButtons>
                    <IonTitle>Cookies</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="legal-content">
                <div className="legal-container">
                    <div className="legal-premium-card">
                        <div className="legal-header-section">
                            <h1>Cookies</h1>
                            <p className="legal-last-updated">Actualizado: Feb 2026</p>
                        </div>

                        <div className="legal-body">
                            <div className="legal-section-v5">
                                <h2>1. ¿Qué son?</h2>
                                <p>
                                    Las cookies son pequeños fragmentos de datos que nos permiten recordar sus preferencias y mantener su sesión activa de forma segura.
                                </p>
                            </div>

                            <div className="legal-section-v5">
                                <h2>2. Cookies Técnicas</h2>
                                <p>
                                    Son esenciales para el funcionamiento del carrito de compras y la autenticación. Sin ellas, la plataforma no podría funcionar correctamente.
                                </p>
                            </div>

                            <div className="legal-section-v5">
                                <h2>3. Cookies de Análisis</h2>
                                <p>
                                    Nos ayudan a entender cómo interactúan los usuarios con la app para mejorar el diseño y la velocidad de carga de los productos.
                                </p>
                            </div>

                            <div className="legal-section-v5">
                                <h2>4. Control</h2>
                                <p>
                                    Usted puede gestionar o desactivar las cookies desde la configuración de su navegador o dispositivo móvil, aunque esto podría afectar la experiencia de compra.
                                </p>
                            </div>

                            <div className="legal-footer">
                                <div className="contact-info-legal">
                                    <strong>Transparencia</strong>
                                    <span>Actualizamos nuestra política anualmente para cumplir con las normativas vigentes.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default CookiesPolicyPage;
