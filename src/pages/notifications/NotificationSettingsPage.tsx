import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonIcon,
  IonNote,
  IonLoading,
  IonCard,
  IonCardContent,
  IonText
} from '@ionic/react';
import {
  notifications,
  cart,
  megaphone,
  shield,
  chatbubble,
  mail,
  phonePortrait,
  apps,
  chevronForward
} from 'ionicons/icons';
import { notificationService } from '../../services/notificationService';
import './NotificationSettingsPage.css';

interface NotificationSetting {
  id: number;
  category: string;
  via_email: boolean;
  via_push: boolean;
  via_in_app: boolean;
  is_active: boolean;
}

const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (category: string, field: string, value: boolean) => {
    try {
      setSavingCategory(category);

      // Optimistic update
      const currentSettings = [...settings];
      const settingIndex = currentSettings.findIndex(s => s.category === category);

      if (settingIndex === -1) return;

      const updatedSetting = { ...currentSettings[settingIndex], [field]: value };

      // Logic: If deactivating main toggle, turn off channels? 
      // Or if activating channel, turn on main toggle?
      // Keeping it simple: Just update the field requested.
      // Logic from previous version: 
      if (field === 'is_active' && !value) {
        updatedSetting.via_email = false;
        updatedSetting.via_push = false;
        updatedSetting.via_in_app = false;
      }
      if (field !== 'is_active' && value) {
        updatedSetting.is_active = true;
      }

      setSettings(prev => prev.map(s => s.category === category ? updatedSetting : s));

      await notificationService.updateSetting(category, updatedSetting);

    } catch (error) {
      console.error('Error updating setting:', error);
      // Revert on error would go here
      await loadSettings(); // Reload to be safe
    } finally {
      setSavingCategory(null);
    }
  };

  const getCategoryMeta = (category: string) => {
    const meta: any = {
      orders: {
        icon: cart,
        title: 'Mis Compras y Ventas',
        desc: 'Actualizaciones de pedidos y envíos'
      },
      promotions: {
        icon: megaphone,
        title: 'Ofertas y Promociones',
        desc: 'Descuentos exclusivos para ti'
      },
      security: {
        icon: shield,
        title: 'Seguridad',
        desc: 'Alertas de inicio de sesión y cuenta'
      },
      messages: {
        icon: chatbubble,
        title: 'Mensajes',
        desc: 'Chats con vendedores o compradores'
      }
    };
    return meta[category] || { icon: notifications, title: category, desc: '' };
  };

  if (loading) {
    return (
      <IonPage className="notification-settings-page">
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton defaultHref="/notifications" text="" /></IonButtons>
            <IonTitle>Configuración</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }}>
            <IonLoading isOpen={true} message="Cargando..." />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="notification-settings-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/notifications" text="" />
          </IonButtons>
          <IonTitle>Configuración</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="settings-container">

          <div className="settings-intro">
            <h2>Gestiona tus alertas</h2>
            <p>Elige qué quieres recibir y dónde.</p>
          </div>

          {settings.map((setting) => {
            const meta = getCategoryMeta(setting.category);
            const isSaving = savingCategory === setting.category;

            return (
              <div key={setting.category} className={`settings-card ${!setting.is_active ? 'inactive' : ''}`}>

                {/* Main Category Toggle */}
                <div className="card-header-row">
                  <div className="header-icon">
                    <IonIcon icon={meta.icon} />
                  </div>
                  <div className="header-info">
                    <h3>{meta.title}</h3>
                    <p>{meta.desc}</p>
                  </div>
                  <div className="header-toggle">
                    <IonToggle
                      checked={setting.is_active}
                      onIonChange={e => updateSetting(setting.category, 'is_active', e.detail.checked)}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                {/* Sub-options (only if active) */}
                {setting.is_active && (
                  <div className="card-options-list">
                    <div className="option-row">
                      <div className="option-label">
                        <IonIcon icon={phonePortrait} />
                        <span>Notificaciones Push</span>
                      </div>
                      <IonToggle
                        checked={setting.via_push}
                        onIonChange={e => updateSetting(setting.category, 'via_push', e.detail.checked)}
                      />
                    </div>

                    <div className="option-row">
                      <div className="option-label">
                        <IonIcon icon={mail} />
                        <span>Correo Electrónico</span>
                      </div>
                      <IonToggle
                        checked={setting.via_email}
                        onIonChange={e => updateSetting(setting.category, 'via_email', e.detail.checked)}
                      />
                    </div>

                    <div className="option-row">
                      <div className="option-label">
                        <IonIcon icon={apps} />
                        <span>En la Aplicación</span>
                      </div>
                      <IonToggle
                        checked={setting.via_in_app}
                        onIonChange={e => updateSetting(setting.category, 'via_in_app', e.detail.checked)}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="settings-footer-note">
            <IonText color="medium">
              <small>
                Algunas notificaciones de seguridad obligatorias no se pueden desactivar para proteger tu cuenta.
              </small>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotificationSettingsPage;