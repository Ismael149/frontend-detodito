// frontend/src/pages/SettingsPage.tsx (COMPLETO)
import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonText,
    IonAlert,
    IonLoading,
    IonGrid,
    IonRow,
    IonCol,
    IonRange,
    IonBadge,
    IonNote
} from '@ionic/react';
import {
    settings, notifications,
    eye,
    cloud, refresh, shield,
    chevronForward,
    informationCircle, person, mail,
    bag, card, sync,
    checkmarkCircle, chatbubbleEllipses,
    download, trash
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { userService } from '../services/userService';
import { settingsService } from '../services/settingsService';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [theme, setTheme] = useState('light');
    const [settingsData, setSettingsData] = useState({
        // Notificaciones
        pushNotifications: true,
        emailNotifications: true,
        promotionalEmails: false,
        orderUpdates: true,
        priceAlerts: true,
        chatNotifications: true,

        // Privacidad
        showOnlineStatus: true,
        allowTracking: false,
        showInSearch: true,
        shareUsageData: false,

        // Cuenta
        syncData: true,
        backupFrequency: 'weekly',
        autoBackup: true,
        twoFactorAuth: false
    });

    const backupFrequencies = [
        { value: 'daily', label: 'Diario' },
        { value: 'weekly', label: 'Semanal' },
        { value: 'monthly', label: 'Mensual' },
        { value: 'never', label: 'Nunca' }
    ];

    useEffect(() => {
        loadSettings();
        // Load theme
        const appTheme = localStorage.getItem('app_theme');
        const adminTheme = localStorage.getItem('admin_theme');
        const themeToApply = appTheme || adminTheme || 'light';

        setTheme(themeToApply);
        if (themeToApply === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);

            // Intentar cargar desde API primero
            try {
                const response = await settingsService.getSettings();
                if (response.success && response.settings) {
                    setSettingsData(prev => ({
                        ...prev,
                        ...response.settings
                    }));
                    // Aplicar configuraciones visuales
                    settingsService.applyVisualSettings(response.settings);
                    return;
                }
            } catch (apiError) {
                console.log('API not available, using localStorage');
            }

            // Fallback a localStorage si API no está disponible
            const savedSettings = localStorage.getItem('app_settings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                setSettingsData(prev => ({
                    ...prev,
                    ...parsedSettings
                }));
            }

        } catch (error) {
            console.error('Error loading settings:', error);
            setAlertMessage('Error al cargar la configuración');
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            setLoading(true);

            // Intentar guardar en API primero
            try {
                const response = await settingsService.updateSettings(settingsData);
                if (response.success) {
                    setAlertMessage('✅ Configuración guardada exitosamente');
                    setShowAlert(true);
                    return;
                }
            } catch (apiError) {
                console.log('API not available, using localStorage');
            }

            // Fallback a localStorage
            localStorage.setItem('app_settings', JSON.stringify(settingsData));
            setAlertMessage('✅ Configuración guardada localmente');
            setShowAlert(true);

        } catch (error) {
            console.error('Error saving settings:', error);
            setAlertMessage('❌ Error al guardar configuración');
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (setting: string, value: any) => {
        setSettingsData(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    const clearCache = () => {
        setLoading(true);

        // Limpieza real de datos temporales en localStorage
        const itemsToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !['token', 'app_settings', 'user'].includes(key)) {
                itemsToRemove.push(key);
            }
        }

        itemsToRemove.forEach(key => localStorage.removeItem(key));

        setTimeout(() => {
            setAlertMessage('🗑️ Caché y datos temporales limpiados exitosamente');
            setShowAlert(true);
            setLoading(false);
        }, 1000);
    };

    const resetSettings = () => {
        setShowConfirmReset(true);
    };

    const confirmReset = () => {
        setSettingsData({
            pushNotifications: true,
            emailNotifications: true,
            promotionalEmails: false,
            orderUpdates: true,
            priceAlerts: true,
            chatNotifications: true,
            showOnlineStatus: true,
            allowTracking: false,
            showInSearch: true,
            shareUsageData: false,
            syncData: true,
            backupFrequency: 'weekly',
            autoBackup: true,
            twoFactorAuth: false
        });

        setAlertMessage('⚙️ Configuración restaurada a valores predeterminados');
        setShowAlert(true);
        setShowConfirmReset(false);
    };


    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('app_theme', newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    };

    const renderAppearanceSettings = () => (
        <div className="settings-section">
            <h3 className="section-title">
                <IonIcon icon={eye} />
                Apariencia
            </h3>

            <IonList lines="none" className="settings-list">
                <IonItem>
                    <IonIcon icon={eye} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Modo oscuro</h4>
                        <p>Tema oscuro para toda la aplicación</p>
                    </IonLabel>
                    <IonToggle
                        checked={theme === 'dark'}
                        onIonChange={toggleTheme}
                    />
                </IonItem>
            </IonList>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="settings-section">
            <h3 className="section-title">
                <IonIcon icon={notifications} />
                Notificaciones
            </h3>

            <IonList lines="none" className="settings-list">
                <IonItem>
                    <IonIcon icon={notifications} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Notificaciones push</h4>
                        <p>Recibir notificaciones en el dispositivo</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.pushNotifications}
                        onIonChange={(e) => handleSettingChange('pushNotifications', e.detail.checked)}
                    />
                </IonItem>

                <IonItem>
                    <IonIcon icon={mail} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Notificaciones por email</h4>
                        <p>Recibir actualizaciones por correo</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.emailNotifications}
                        onIonChange={(e) => handleSettingChange('emailNotifications', e.detail.checked)}
                    />
                </IonItem>

                <IonItem>
                    <IonIcon icon={bag} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Actualizaciones de pedidos</h4>
                        <p>Notificaciones sobre tus compras</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.orderUpdates}
                        onIonChange={(e) => handleSettingChange('orderUpdates', e.detail.checked)}
                    />
                </IonItem>

                <IonItem>
                    <IonIcon icon={card} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Alertas de precio</h4>
                        <p>Notificaciones cuando bajan precios</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.priceAlerts}
                        onIonChange={(e) => handleSettingChange('priceAlerts', e.detail.checked)}
                    />
                </IonItem>

                <IonItem>
                    <IonIcon icon={chatbubbleEllipses} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Notificaciones de chat</h4>
                        <p>Mensajes del asistente y otros usuarios</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.chatNotifications}
                        onIonChange={(e) => handleSettingChange('chatNotifications', e.detail.checked)}
                    />
                </IonItem>

                <IonItem>
                    <IonIcon icon={mail} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Emails promocionales</h4>
                        <p>Ofertas y promociones especiales</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.promotionalEmails}
                        onIonChange={(e) => handleSettingChange('promotionalEmails', e.detail.checked)}
                    />
                </IonItem>
            </IonList>
        </div>
    );

    const renderPrivacySettings = () => (
        <div className="settings-section">
            <h3 className="section-title">
                <IonIcon icon={shield} />
                Privacidad
            </h3>

            <IonList lines="none" className="settings-list">
                <IonItem>
                    <IonIcon icon={eye} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Mostrar estado en línea</h4>
                        <p>Mostrar cuando estás activo</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.showOnlineStatus}
                        onIonChange={(e) => handleSettingChange('showOnlineStatus', e.detail.checked)}
                    />
                </IonItem>

                <IonItem>
                    <IonIcon icon={person} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Aparecer en búsquedas</h4>
                        <p>Permitir que otros te encuentren</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.showInSearch}
                        onIonChange={(e) => handleSettingChange('showInSearch', e.detail.checked)}
                    />
                </IonItem>

                <IonItem>
                    <IonIcon icon={shield} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Permitir seguimiento</h4>
                        <p>Compartir datos de uso anónimos</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.allowTracking}
                        onIonChange={(e) => handleSettingChange('allowTracking', e.detail.checked)}
                    />
                </IonItem>

                <IonItem>
                    <IonIcon icon={cloud} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Compartir datos de uso</h4>
                        <p>Mejorar la app con datos anónimos</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.shareUsageData}
                        onIonChange={(e) => handleSettingChange('shareUsageData', e.detail.checked)}
                    />
                </IonItem>

                <IonItem button onClick={() => history.push('/privacy')}>
                    <IonIcon icon={informationCircle} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Configuración de privacidad</h4>
                        <p>Gestiona toda tu privacidad</p>
                    </IonLabel>
                    <IonIcon icon={chevronForward} slot="end" color="medium" />
                </IonItem>
            </IonList>
        </div>
    );

    const renderAccountSettings = () => (
        <div className="settings-section">
            <h3 className="section-title">
                <IonIcon icon={person} />
                Cuenta y Datos
            </h3>

            <IonList lines="none" className="settings-list">
                <IonItem>
                    <IonIcon icon={sync} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Sincronizar datos</h4>
                        <p>Mantener datos actualizados en la nube</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.syncData}
                        onIonChange={(e) => handleSettingChange('syncData', e.detail.checked)}
                    />
                </IonItem>

                <IonItem>
                    <IonIcon icon={shield} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Autenticación de dos factores</h4>
                        <p>Protección adicional para tu cuenta</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.twoFactorAuth}
                        onIonChange={(e) => handleSettingChange('twoFactorAuth', e.detail.checked)}
                    />
                </IonItem>

                <IonItem>
                    <IonIcon icon={download} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Frecuencia de respaldo</h4>
                        <p>Cada cuánto hacer respaldo automático</p>
                    </IonLabel>
                    <IonSelect
                        value={settingsData.backupFrequency}
                        onIonChange={(e) => handleSettingChange('backupFrequency', e.detail.value)}
                    >
                        {backupFrequencies.map(freq => (
                            <IonSelectOption key={freq.value} value={freq.value}>
                                {freq.label}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>

                <IonItem>
                    <IonIcon icon={cloud} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Respaldo automático</h4>
                        <p>Realizar respaldos sin confirmación</p>
                    </IonLabel>
                    <IonToggle
                        checked={settingsData.autoBackup}
                        onIonChange={(e) => handleSettingChange('autoBackup', e.detail.checked)}
                    />
                </IonItem>

                <IonItem button onClick={clearCache}>
                    <IonIcon icon={trash} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Limpiar caché</h4>
                        <p>Liberar espacio de almacenamiento</p>
                    </IonLabel>
                </IonItem>

                <IonItem button onClick={() => history.push('/security')}>
                    <IonIcon icon={shield} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Configuración de seguridad</h4>
                        <p>Gestiona la seguridad de tu cuenta</p>
                    </IonLabel>
                    <IonIcon icon={chevronForward} slot="end" color="medium" />
                </IonItem>
            </IonList>
        </div>
    );

    const renderAdvancedSettings = () => (
        <div className="settings-section">
            <h3 className="section-title">
                <IonIcon icon={settings} />
                Avanzado
            </h3>

            <IonList lines="none" className="settings-list">
                <IonItem button onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }}>
                    <IonIcon icon={refresh} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Reiniciar aplicación</h4>
                        <p>Recarga todos los componentes</p>
                    </IonLabel>
                </IonItem>

                <IonItem button onClick={() => {
                    const info = {
                        userAgent: navigator.userAgent,
                        platform: navigator.platform,
                        language: navigator.language,
                        screen: `${window.screen.width}x${window.screen.height}`,
                        localStorage: Object.keys(localStorage).length,
                        timestamp: new Date().toISOString()
                    };
                    navigator.clipboard.writeText(JSON.stringify(info, null, 2));
                    setAlertMessage('📋 Información técnica copiada al portapapeles');
                    setShowAlert(true);
                }}>
                    <IonIcon icon={informationCircle} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Información técnica</h4>
                        <p>Copia detalles del sistema al portapapeles</p>
                    </IonLabel>
                </IonItem>

                <IonItem button onClick={() => history.push('/feedback')}>
                    <IonIcon icon={chatbubbleEllipses} slot="start" color="medium" />
                    <IonLabel>
                        <h4>Enviar feedback</h4>
                        <p>Reportar problemas o sugerir mejoras</p>
                    </IonLabel>
                </IonItem>
            </IonList>
        </div>
    );

    if (loading && !showAlert) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/more" text="" />
                        </IonButtons>
                        <IonTitle>Configuración</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonLoading isOpen={true} message="Cargando configuración..." />
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/more" text="" />
                    </IonButtons>
                    <IonTitle>Configuración</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={saveSettings} disabled={loading}>
                            <IonIcon icon={checkmarkCircle} slot="start" />
                            {loading ? 'Guardando...' : 'Guardar'}
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="settings-content">
                {/* Apariencia */}
                {renderAppearanceSettings()}

                {/* Notificaciones */}
                {renderNotificationSettings()}


                {/* Privacidad */}
                {renderPrivacySettings()}

                {/* Cuenta y Datos */}
                {renderAccountSettings()}

                {/* Avanzado */}
                {renderAdvancedSettings()}

                {/* Acciones */}
                <div className="settings-actions">
                    <IonButton
                        expand="block"
                        color="medium"
                        fill="outline"
                        onClick={resetSettings}
                    >
                        <IonIcon icon={refresh} slot="start" />
                        Restaurar predeterminados
                    </IonButton>

                    <IonButton
                        expand="block"
                        color="primary"
                        onClick={saveSettings}
                        disabled={loading}
                    >
                        <IonIcon icon={cloud} slot="start" />
                        {loading ? 'Guardando...' : 'Guardar cambios'}
                    </IonButton>

                    <IonButton
                        expand="block"
                        color="light"
                        fill="clear"
                        onClick={() => history.push('/about')}
                    >
                        <IonIcon icon={informationCircle} slot="start" />
                        Acerca de la aplicación
                    </IonButton>
                </div>

                {/* Información de versión */}
                <div className="version-info">
                    <IonText color="medium">
                        <small>
                            App Version 1.0.0 • Build 2024.01<br />
                            Última actualización: Enero 2024
                        </small>
                    </IonText>
                </div>

                {/* Loading */}
                <IonLoading isOpen={loading} message={loading ? 'Guardando cambios...' : 'Cargando...'} />

                {/* Alertas */}
                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header={'Configuración'}
                    message={alertMessage}
                    buttons={['OK']}
                />

                {/* Confirmación de reset */}
                <IonAlert
                    isOpen={showConfirmReset}
                    onDidDismiss={() => setShowConfirmReset(false)}
                    header={'¿Restaurar configuración?'}
                    message={'Se restaurarán todos los ajustes a sus valores predeterminados. Esta acción no se puede deshacer.'}
                    buttons={[
                        {
                            text: 'Cancelar',
                            role: 'cancel'
                        },
                        {
                            text: 'Restaurar',
                            role: 'destructive',
                            handler: confirmReset
                        }
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default SettingsPage;