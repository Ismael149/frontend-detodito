// PrivacyPolicyPage.tsx - Reconstruido desde cero
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

const PrivacyPolicyPage: React.FC = () => {
    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="premium-toolbar">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/about" text="" />
                    </IonButtons>
                    <IonTitle>Privacidad</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="legal-content">
                <div className="legal-container">
                    <div className="legal-premium-card">
                        <div className="legal-header-section">
                            <h1>Privacidad</h1>
                            <p className="legal-last-updated">Actualizado: Feb 2026</p>
                        </div>

                        <div className="legal-body">
                            <div className="legal-section-v5">
                                <h2>1. Recolección</h2>
                                <p>
                                    Recopilamos información básica para procesar sus pedidos: nombre, dirección y contacto. Estos datos se guardan de forma encriptada en nuestros servidores.
                                </p>
                            </div>

                            <div className="legal-section-v5">
                                <h2>2. Uso de Datos</h2>
                                <p>
                                    Sus datos solo se utilizan para:
                                </p>
                                <ul className="legal-list-v5">
                                    <li>Completar transacciones de compra.</li>
                                    <li>Mejorar la experiencia de usuario.</li>
                                    <li>Notificar sobre cambios en sus pedidos.</li>
                                </ul>
                            </div>

                            <div className="legal-section-v5">
                                <h2>3. Derechos (ARCO)</h2>
                                <p>
                                    Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales. Puede hacerlo desde la sección de Configuración de Privacidad dentro de la App.
                                </p>
                            </div>

                            <div className="legal-section-v5">
                                <h2>4. Seguridad</h2>
                                <p>
                                    Implementamos certificados SSL y protocolos de seguridad nivel bancario para proteger su información financiera y personal de accesos no autorizados.
                                </p>
                            </div>

                            <div className="legal-footer">
                                <div className="contact-info-legal">
                                    <strong>Oficial de Privacidad</strong>
                                    <span>Email: privacidad@detodito.com</span>
                                    <span>Soporte: 24/7 vía app</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default PrivacyPolicyPage;
