// TermsOfServicePage.tsx - Reconstruido desde cero
import React from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonCard
} from '@ionic/react';
import './LegalPages.css';

const TermsOfServicePage: React.FC = () => {
    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="premium-toolbar">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/about" text="" />
                    </IonButtons>
                    <IonTitle>Términos de Servicio</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="legal-content">
                <div className="legal-container">
                    <div className="legal-premium-card">
                        <div className="legal-header-section">
                            <h1>Términos y Condiciones</h1>
                            <p className="legal-last-updated">Actualizado: Feb 2026</p>
                        </div>

                        <div className="legal-body">
                            <div className="legal-section-v5">
                                <h2>1. Aceptación</h2>
                                <p>
                                    Al utilizar DeTodito, usted acepta plenamente estos términos. Si no está de acuerdo, le solicitamos abstenerse de usar la plataforma.
                                </p>
                            </div>

                            <div className="legal-section-v5">
                                <h2>2. Registro</h2>
                                <p>
                                    Para vender o comprar, debe ser mayor de edad y proporcionar datos reales. Usted es el único responsable de la seguridad de sus credenciales de acceso.
                                </p>
                            </div>

                            <div className="legal-section-v5">
                                <h2>3. Comercialización</h2>
                                <p>
                                    Como plataforma intermediaria, DeTodito no garantiza la calidad final de los productos, la cual es responsabilidad directa del vendedor. Sin embargo, velamos por la seguridad de las transacciones.
                                </p>
                                <ul className="legal-list-v5">
                                    <li>Las descripciones deben ser honestas.</li>
                                    <li>Los precios deben incluir impuestos si aplica.</li>
                                    <li>Se prohíbe la venta de artículos ilegales.</li>
                                </ul>
                            </div>

                            <div className="legal-section-v5">
                                <h2>4. Pagos y Comisiones</h2>
                                <p>
                                    DeTodito utiliza pasarelas de pago seguras. Las comisiones por venta se descuentan automáticamente según el plan vigente del vendedor.
                                </p>
                            </div>

                            <div className="legal-section-v5">
                                <h2>5. Conducta</h2>
                                <p>
                                    Se prohíbe el uso de spam, bots o cualquier intento de vulnerar la seguridad del sistema. El incumplimiento resultará en la eliminación permanente de la cuenta.
                                </p>
                            </div>

                            <div className="legal-footer">
                                <div className="contact-info-legal">
                                    <strong>¿Dudas legales?</strong>
                                    <span>Email: legal@detodito.com</span>
                                    <span>Dir: Caracas, Venezuela</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default TermsOfServicePage;
