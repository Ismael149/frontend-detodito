// frontend/src/pages/SecuritySettings.tsx
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
  IonButton,
  IonAlert,
  IonLoading,
  IonCard,
  IonCardContent,
  IonModal,
  IonText
} from '@ionic/react';
import {
  shield, lockClosed, mail, key,
  fingerPrint, alertCircle, checkmarkCircle,
  logOut, desktop, globe, shieldCheckmark,
  chevronForward
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import './SecuritySettings.css';

const SecuritySettings: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showTwoFAModal, setShowTwoFAModal] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    emailNotifications: true,
    loginAlerts: true,
    deviceManagement: true,
    biometricLogin: false
  });

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      setActiveSessions([
        {
          id: 1,
          device: 'iPhone 13',
          browser: 'Safari',
          location: 'Caracas, Venezuela',
          ip: '192.168.1.1',
          lastActive: 'Hace 2 horas',
          current: true
        },
        {
          id: 2,
          device: 'Windows PC',
          browser: 'Chrome',
          location: 'Miami, USA',
          ip: '104.28.245.63',
          lastActive: 'Hace 5 días',
          current: false
        }
      ]);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingToggle = (setting: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleTwoFASetup = () => {
    if (!securitySettings.twoFactorAuth) {
      setShowTwoFAModal(true);
    } else {
      setSecuritySettings(prev => ({ ...prev, twoFactorAuth: false }));
      setAlertMessage('Autenticación de dos factores desactivada');
      setShowAlert(true);
    }
  };

  const confirmTwoFA = () => {
    if (twoFACode === '123456') {
      setSecuritySettings(prev => ({ ...prev, twoFactorAuth: true }));
      setAlertMessage('Autenticación de dos factores activada correctamente');
      setShowAlert(true);
      setShowTwoFAModal(false);
      setTwoFACode('');
    } else {
      setAlertMessage('Código inválido. Usa el 123456 para la demo.');
      setShowAlert(true);
    }
  };

  const terminateSession = (sessionId: number) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    setAlertMessage('Sesión cerrada');
    setShowAlert(true);
  };

  const scoreValue = (() => {
    let s = 50;
    if (securitySettings.twoFactorAuth) s += 30;
    if (securitySettings.biometricLogin) s += 10;
    if (securitySettings.loginAlerts) s += 5;
    if (securitySettings.emailNotifications) s += 5;
    return s;
  })();

  return (
    <IonPage className="security-page-container">
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" text="" />
          </IonButtons>
          <IonTitle>Seguridad</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="security-content-area">
        <IonLoading isOpen={loading} message="Cargando..." />

        <div className="security-scroll-container">
          {/* Header Card */}
          <IonCard className="security-score-card">
            <IonCardContent>
              <div className="score-wrapper">
                <div className="circular-score">
                  <span className="val">{scoreValue}</span>
                  <span className="pct">%</span>
                </div>
                <div className="score-info">
                  <h3>Puntuación de Seguridad</h3>
                  <Badge score={scoreValue} />
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          <div className="v4-section-header">CONFIGURACIÓN DE ESCUDO</div>

          <div className="v4-options-group">
            <OptionItem
              icon={lockClosed}
              title="Doble Factor (2FA)"
              subtitle="Protección extra al entrar"
              checked={securitySettings.twoFactorAuth}
              onToggle={handleTwoFASetup}
              type="toggle"
            />
            <OptionItem
              icon={fingerPrint}
              title="Acceso Biométrico"
              subtitle="Usa tu huella dactilar"
              checked={securitySettings.biometricLogin}
              onToggle={() => handleSettingToggle('biometricLogin')}
              type="toggle"
            />
            <OptionItem
              icon={alertCircle}
              title="Alertas de Inicio"
              subtitle="Avisos de nuevos accesos"
              checked={securitySettings.loginAlerts}
              onToggle={() => handleSettingToggle('loginAlerts')}
              type="toggle"
            />
            <OptionItem
              icon={mail}
              title="Avisos al Correo"
              subtitle="Reportes críticos por email"
              checked={securitySettings.emailNotifications}
              onToggle={() => handleSettingToggle('emailNotifications')}
              type="toggle"
            />
          </div>

          <div className="v4-section-header">SESIONES ACTIVAS</div>

          <div className="v4-options-group">
            {activeSessions.map(session => (
              <div key={session.id} className="v4-list-card session-card">
                <div className={`v4-icon-box ${session.current ? 'active' : ''}`}>
                  <IonIcon
                    icon={session.current ? shieldCheckmark : desktop}
                  />
                </div>
                <div className="v4-content">
                  <h4>{session.device} • {session.browser}</h4>
                  <p>{session.location}</p>
                </div>
                {!session.current && (
                  <button onClick={() => terminateSession(session.id)} className="v4-close-btn">
                    Cerrar
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="v4-section-header">ACCIONES RÁPIDAS</div>

          <div className="v4-options-group">
            <div className="v4-list-card action-card" onClick={() => history.push('/change-password')}>
              <div className="v4-icon-box blue">
                <IonIcon icon={key} />
              </div>
              <div className="v4-content">
                <h4>Cambiar Contraseña</h4>
                <p>Actualizar clave de acceso</p>
              </div>
              <IonIcon icon={chevronForward} className="v4-chevron" />
            </div>

            <div className="v4-list-card action-card danger" onClick={() => { authService.logout(); history.push('/login'); }}>
              <div className="v4-icon-box red">
                <IonIcon icon={logOut} />
              </div>
              <div className="v4-content">
                <h4 className="danger-text">Cerrar en Todo</h4>
                <p>Salir de todos los equipos</p>
              </div>
              <IonIcon icon={chevronForward} className="v4-chevron danger-text" />
            </div>
          </div>

          {/* Tips block */}
          <div className="v4-tips-panel">
            <div className="tips-title">
              <IonIcon icon={globe} />
              <span>Consejos de Seguridad</span>
            </div>
            <ul className="tips-body">
              <li>Usa contraseñas únicas y robustas.</li>
              <li>Nunca compartas tus códigos de verificación.</li>
              <li>Revisa tus sesiones periódicamente.</li>
            </ul>
          </div>
        </div>

        {/* Modal 2FA */}
        <IonModal isOpen={showTwoFAModal} onDidDismiss={() => setShowTwoFAModal(false)} className="v4-security-modal">
          <div className="v4-modal-content">
            <div className="v4-modal-head">
              <h2>Activar 2FA</h2>
              <p>Código de 6 dígitos</p>
            </div>

            <div className="v4-modal-body">
              <input
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                placeholder="000 000"
                maxLength={6}
                className="v4-html-input"
              />
              <p className="v4-hint">Demo: <strong>123456</strong></p>
            </div>

            <div className="v4-modal-foot">
              <button onClick={() => setShowTwoFAModal(false)} className="btn-v4-cancel">Cancelar</button>
              <button onClick={confirmTwoFA} className="btn-v4-confirm">Confirmar</button>
            </div>
          </div>
        </IonModal>

        <IonAlert
          isOpen={showAlert}
          header="Seguridad"
          message={alertMessage}
          buttons={['Aceptar']}
        />
      </IonContent>
    </IonPage>
  );
};

// Sub-Items
const OptionItem: React.FC<{ icon: any, title: string, subtitle: string, checked?: boolean, onToggle?: () => void, type: 'toggle' | 'link' }> = ({ icon, title, subtitle, checked, onToggle, type }) => (
  <div className="v4-list-card">
    <div className="v4-icon-box">
      <IonIcon icon={icon} />
    </div>
    <div className="v4-content">
      <h4>{title}</h4>
      <p>{subtitle}</p>
    </div>
    {type === 'toggle' ? (
      <IonToggle checked={checked} onIonChange={onToggle} color="primary" />
    ) : (
      <IonIcon icon={chevronForward} className="v4-chevron" />
    )}
  </div>
);

const Badge: React.FC<{ score: number }> = ({ score }) => {
  let label = 'Baja';
  let color = 'danger';
  if (score >= 85) { label = 'Óptima'; color = 'success'; }
  else if (score >= 65) { label = 'Media'; color = 'warning'; }
  return <span className={`v4-badge ${color}`}>{label}</span>;
};

export default SecuritySettings;