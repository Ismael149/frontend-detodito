import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonCard,
    IonCardContent,
    IonIcon,
    IonText,
    IonNote
} from '@ionic/react';
import { moon, sunny, settings, person, shieldCheckmark } from 'ionicons/icons';
import './AdminSettings.css';

const AdminSettings: React.FC = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Comprobar el tema inicial desde localStorage
        const isAdminPath = window.location.pathname.includes('/admin');
        const adminTheme = localStorage.getItem('admin_theme');
        const appTheme = localStorage.getItem('app_theme');

        // Si estamos en admin, SOLAMENTE usar admin_theme (por defecto dark)
        const themeToApply = isAdminPath ? (adminTheme || 'dark') : (appTheme || 'light');

        if (themeToApply === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    }, []);

    const toggleTheme = (enableDark: boolean) => {
        const newTheme = enableDark ? 'dark' : 'light';
        setIsDark(enableDark);
        localStorage.setItem('admin_theme', newTheme);

        // Also update class immediately
        if (enableDark) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/admin/dashboard" text="" />
                    </IonButtons>
                    <IonTitle>Configuración del Administrador</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="admin-settings-content admin-settings-page">
                <div className="settings-container">
                    <IonText className="section-header">
                        <h2>Apariencia del Panel</h2>
                        <p>Personaliza cómo se ve tu interfaz administrativa</p>
                    </IonText>

                    <IonCard className="settings-card">
                        <IonCardContent>
                            <IonList lines="none">
                                <IonItem className="theme-toggle-item">
                                    <IonIcon
                                        icon={isDark ? moon : sunny}
                                        slot="start"
                                        color={isDark ? "tertiary" : "warning"}
                                        className="settings-icon"
                                    />
                                    <IonLabel>
                                        <h3>Modo Oscuro</h3>
                                        <p>Activar para reducir la fatiga visual</p>
                                    </IonLabel>
                                    <IonToggle
                                        checked={isDark}
                                        onIonChange={e => toggleTheme(e.detail.checked)}
                                    />
                                </IonItem>
                            </IonList>

                            <div className="theme-preview">
                                <IonText color="medium">
                                    <small>
                                        Este cambio se aplica actualmente a todas las ventanas del panel de administrador.
                                    </small>
                                </IonText>
                            </div>
                        </IonCardContent>
                    </IonCard>

                    <IonText className="section-header">
                        <h2>Perfil de Administrador</h2>
                    </IonText>

                    <IonCard className="settings-card">
                        <IonCardContent>
                            <IonList lines="full">
                                <IonItem>
                                    <IonIcon icon={person} slot="start" color="primary" />
                                    <IonLabel>
                                        <h3>Seguridad de Cuenta</h3>
                                        <p>Gestionar contraseñas y accesos</p>
                                    </IonLabel>
                                </IonItem>
                                <IonItem>
                                    <IonIcon icon={shieldCheckmark} slot="start" color="success" />
                                    <IonLabel>
                                        <h3>Permisos de Rol</h3>
                                        <p>Ver tus privilegios de administrador</p>
                                    </IonLabel>
                                    <IonNote slot="end">SuperAdmin</IonNote>
                                </IonItem>
                            </IonList>
                        </IonCardContent>
                    </IonCard>

                    <div className="settings-info">
                        <IonIcon icon={settings} />
                        <IonText color="medium">
                            <p>Versión del Panel Administrativo 2.1.0</p>
                        </IonText>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AdminSettings;
