// PrivacySettings.tsx - Reconstruido desde cero con soporte para dispositivos
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonToggle,
  IonIcon,
  IonAlert,
  IonLoading,
  IonModal,
  IonTextarea,
  IonNote
} from '@ionic/react';
import {
  shieldCheckmark, eye, shareSocial, analytics,
  download, trash, chevronForward, informationCircle,
  checkmarkCircle, closeCircle
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import './PrivacySettings.css';

const PrivacySettings: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ header: '', message: '' });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    showLocation: false,
    dataCollection: true,
    personalizedAds: false,
    analyticsSharing: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      if (response && response.user && response.user.privacy_settings) {
        setPrivacySettings(response.user.privacy_settings);
      } else {
        // Fallback to localStorage if backend is not set
        const saved = localStorage.getItem('privacy_settings');
        if (saved) setPrivacySettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof typeof privacySettings, value: boolean) => {
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettings(updated);

    // Save to localStorage for persistence
    localStorage.setItem('privacy_settings', JSON.stringify(updated));

    try {
      // Intentar persistir en backend si existe el método
      if (userService.updatePrivacySettings) {
        await userService.updatePrivacySettings(updated);
      }
    } catch (error) {
      console.warn('Backend update failed, using local storage');
    }
  };

  const downloadUserData = async () => {
    try {
      setLoading(true);
      const user = await userService.getProfile();
      const dataToDownload = {
        profile: user,
        settings: privacySettings,
        timestamp: new Date().toISOString(),
        app: "DeTodito V18"
      };

      const fileName = `mis-datos-detodito-${Date.now()}.json`;
      const dataString = JSON.stringify(dataToDownload, null, 2);

      // Metodo para descargar en dispositivo movil (Capacitor)
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: dataString,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });

        // Compartir el archivo para que el usuario pueda guardarlo donde quiera
        await Share.share({
          title: 'Mis Datos - DeTodito',
          text: 'Aquí tienes la copia de tus datos solicitada.',
          url: result.uri,
          dialogTitle: 'Guardar copia de datos',
        });

        setShowDownloadModal(false);
        setAlertConfig({
          header: 'Descarga Lista',
          message: 'Tus datos se han generado correctamente.'
        });
        setShowAlert(true);

      } catch (mobileError) {
        console.error('Mobile download failed, falling back to browser:', mobileError);
        // Fallback for browser
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setShowDownloadModal(false);
        setAlertConfig({
          header: 'Descarga Iniciada',
          message: 'El archivo se está descargando en tu navegador.'
        });
        setShowAlert(true);
      }

    } catch (error) {
      setAlertConfig({
        header: 'Error',
        message: 'No pudimos generar tus datos en este momento.'
      });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const executeAccountDeletion = async () => {
    try {
      setShowDeleteModal(false);
      setLoading(true);
      const response = await userService.deleteAccount(deleteReason);

      setAlertConfig({
        header: 'Cuenta Eliminada',
        message: response.message || 'Tu cuenta ha sido borrada exitosamente.'
      });
      setShowAlert(true);

      setTimeout(() => {
        authService.logout();
        history.push('/home');
        window.location.reload();
      }, 3000);

    } catch (error: any) {
      console.error('Error al eliminar cuenta:', error);
      setAlertConfig({
        header: 'No se pudo eliminar',
        message: error.message || 'Hubo un problema al eliminar la cuenta. Verifica que no tengas productos publicados o pedidos pendientes.'
      });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage className="privacy-page-v5">
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="" />
          </IonButtons>
          <IonTitle>Privacidad</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="privacy-container">

          <div className="privacy-section-title">VISIBILIDAD DEL PERFIL</div>
          <div className="privacy-option-card">
            <div className="privacy-option-content">
              <div className="privacy-icon-wrapper">
                <IonIcon icon={eye} />
              </div>
              <div className="privacy-text-info">
                <h3>Mostrar mi Email</h3>
                <p>Permitir que otros usuarios vean tu correo en tu perfil público.</p>
              </div>
              <IonToggle
                checked={privacySettings.showEmail}
                onIonChange={e => handleToggle('showEmail', e.detail.checked)}
              />
            </div>
          </div>

          <div className="privacy-option-card">
            <div className="privacy-option-content">
              <div className="privacy-icon-wrapper">
                <IonIcon icon={shieldCheckmark} />
              </div>
              <div className="privacy-text-info">
                <h3>Mostrar mi Teléfono</h3>
                <p>Mostrar tu número de contacto para facilitar ventas directas.</p>
              </div>
              <IonToggle
                checked={privacySettings.showPhone}
                onIonChange={e => handleToggle('showPhone', e.detail.checked)}
              />
            </div>
          </div>

          <div className="privacy-section-title">DATOS Y ACTIVIDAD</div>
          <div className="privacy-option-card">
            <div className="privacy-option-content">
              <div className="privacy-icon-wrapper">
                <IonIcon icon={analytics} />
              </div>
              <div className="privacy-text-info">
                <h3>Analíticas y Mejora</h3>
                <p>Ayúdanos a mejorar compartiendo datos anónimos de uso de la app.</p>
              </div>
              <IonToggle
                checked={privacySettings.dataCollection}
                onIonChange={e => handleToggle('dataCollection', e.detail.checked)}
              />
            </div>
          </div>

          <div className="privacy-option-card">
            <div className="privacy-option-content">
              <div className="privacy-icon-wrapper">
                <IonIcon icon={shareSocial} />
              </div>
              <div className="privacy-text-info">
                <h3>Publicidad Relevante</h3>
                <p>Ver ofertas basadas en tus intereses y búsquedas recientes.</p>
              </div>
              <IonToggle
                checked={privacySettings.personalizedAds}
                onIonChange={e => handleToggle('personalizedAds', e.detail.checked)}
              />
            </div>
          </div>

          <div className="privacy-section-title">GESTIÓN DE INFORMACIÓN</div>
          <div className="privacy-option-card clickable" onClick={() => setShowDownloadModal(true)}>
            <div className="privacy-option-content">
              <div className="privacy-icon-wrapper success">
                <IonIcon icon={download} />
              </div>
              <div className="privacy-text-info">
                <h3>Descargar mis Datos</h3>
                <p>Obtén una copia de toda tu información en un archivo comprimido.</p>
              </div>
              <IonIcon icon={chevronForward} color="medium" />
            </div>
          </div>

          <div className="privacy-option-card clickable" onClick={() => setShowDeleteModal(true)}>
            <div className="privacy-option-content">
              <div className="privacy-icon-wrapper danger">
                <IonIcon icon={trash} />
              </div>
              <div className="privacy-text-info">
                <h3 className="danger-text">Eliminar mi Cuenta</h3>
                <p>Borrar de forma permanente tu perfil, productos y historial.</p>
              </div>
              <IonIcon icon={chevronForward} color="danger" />
            </div>
          </div>

          <div className="ion-text-center ion-padding-top">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.6 }}>
              <IonIcon icon={informationCircle} />
              <IonNote style={{ fontSize: '12px' }}>Tus datos están protegidos por encriptación avanzada</IonNote>
            </div>
          </div>

        </div>

        {/* MODAL DOWNLOAD */}
        <IonModal isOpen={showDownloadModal} onDidDismiss={() => setShowDownloadModal(false)} className="privacy-settings-modal">
          <div className="privacy-modal-content">
            <div className="privacy-modal-header">
              <IonIcon icon={download} style={{ fontSize: '48px', color: 'var(--ion-color-success)' }} />
              <h2>Preparar Descarga</h2>
              <p>Generaremos un archivo con toda tu información personal, historial de compras y preferencias.</p>
            </div>
            <div className="privacy-modal-footer">
              <button className="btn-privacy cancel" onClick={() => setShowDownloadModal(false)}>Cancelar</button>
              <button className="btn-privacy confirm" onClick={downloadUserData}>Iniciar</button>
            </div>
          </div>
        </IonModal>

        {/* MODAL DELETE */}
        <IonModal isOpen={showDeleteModal} onDidDismiss={() => setShowDeleteModal(false)} className="privacy-settings-modal">
          <div className="privacy-modal-content">
            <div className="privacy-modal-header">
              <IonIcon icon={closeCircle} style={{ fontSize: '48px', color: 'var(--ion-color-danger)' }} />
              <h2 className="danger-text">¿Deseas eliminarnos?</h2>
              <p>Esta acción es irreversible y perderás acceso a tus compras y reputación.</p>
              <IonTextarea
                className="privacy-textarea"
                placeholder="Razón de salida (opcional)"
                rows={3}
                value={deleteReason}
                onIonInput={e => setDeleteReason(e.detail.value!)}
              />
            </div>
            <div className="privacy-modal-footer">
              <button className="btn-privacy cancel" onClick={() => setShowDeleteModal(false)}>Volver</button>
              <button className="btn-privacy danger-bg" onClick={() => setShowConfirmDelete(true)}>Eliminar todo</button>
            </div>
          </div>
        </IonModal>

        {/* ALERTS */}
        <IonAlert
          isOpen={showConfirmDelete}
          onDidDismiss={() => setShowConfirmDelete(false)}
          header="Confirmación Final"
          message="¿Estás completamente seguro? No podrás recuperar tu cuenta una vez aceptes."
          buttons={[
            { text: 'No, esperar', role: 'cancel' },
            { text: 'Sí, borrar', handler: executeAccountDeletion }
          ]}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertConfig.header}
          message={alertConfig.message}
          buttons={['Aceptar']}
        />

        <IonLoading isOpen={loading} message="Procesando solicitud..." />

      </IonContent>
    </IonPage>
  );
};

export default PrivacySettings;