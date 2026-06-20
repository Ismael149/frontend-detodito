import React, { useState, useEffect, useRef } from 'react';
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
  IonText,
  IonButton,
  IonLoading
} from '@ionic/react';
import { checkmarkCircle, closeCircle, mail } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { authService } from '../../services/authService';
import './VerifyEmailPage.css';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [message, setMessage] = useState('');

  // 🔥 REF para prevenir múltiples ejecuciones
  const hasVerified = useRef(false);

  useEffect(() => {
    console.log('🔍 [FRONTEND] Token recibido:', token);
    console.log('🔍 [FRONTEND] ¿Ya se verificó?:', hasVerified.current);

    if (token && !hasVerified.current) {
      hasVerified.current = true;
      verifyEmail(token);
    } else if (!token) {
      setVerificationStatus('error');
      setMessage('Token de verificación no proporcionado');
      setLoading(false);
    } else {
      console.log('ℹ️ [FRONTEND] Ya se intentó verificar, ignorando...');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setLoading(true);
      console.log('🔍 [FRONTEND] Llamando API con token:', verificationToken);

      const response = await authService.verifyEmail(verificationToken);

      console.log('✅ [FRONTEND] Verificación exitosa:', response);
      setVerificationStatus('success');
      setMessage(response.message);
    } catch (error: any) {
      console.error('❌ [FRONTEND] Error en verificación:', error);
      setVerificationStatus('error');

      // Mostrar detalles del error
      if (error.response) {
        console.log('📊 [FRONTEND] Detalles del error:', {
          status: error.response.status,
          data: error.response.data,
          message: error.response.data?.message
        });
        setMessage(error.response.data?.message || 'Error al verificar el email');
      } else {
        setMessage('Error de conexión al verificar el email');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    history.push('/resend-verification');
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="verification-status loading">
            <IonIcon icon={mail} className="status-icon" />
            <h2>Verificando tu email...</h2>
            <p>Estamos procesando tu solicitud</p>
          </div>
        );

      case 'success':
        return (
          <div className="verification-status success">
            <IonIcon icon={checkmarkCircle} className="status-icon" />
            <h2>¡Email Verificado!</h2>
            <p>{message}</p>
            <div className="action-buttons">
              <IonButton
                expand="block"
                routerLink="/login"
                className="success-button"
              >
                Iniciar Sesión
              </IonButton>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="verification-status error">
            <IonIcon icon={closeCircle} className="status-icon" />
            <h2>Error de Verificación</h2>
            <p>{message}</p>
            <div className="action-buttons">
              <IonButton
                expand="block"
                onClick={handleResendEmail}
                fill="outline"
              >
                Reenviar Email de Verificación
              </IonButton>
              <IonButton
                expand="block"
                routerLink="/login"
                fill="clear"
              >
                Volver al Login
              </IonButton>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" text="" />
          </IonButtons>
          <IonTitle>Verificar Email</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="verify-email-page">
        <div className="container">
          <IonCard className="verification-card">
            <IonCardContent>
              {renderContent()}
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading isOpen={loading} message="Verificando email..." />
      </IonContent>
    </IonPage>
  );
};

export default VerifyEmailPage;