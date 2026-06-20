import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonLoading,
  IonAlert
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { authService } from '../../services/authService';
import '../Auth.css'; // Use shared Auth CSS

const ForgotPasswordPage: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al solicitar recuperación de contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/login" text="" />
            </IonButtons>
            <IonTitle>Recuperar Contraseña</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="auth-content">
          <div className="auth-container">
            <h2>¡Email Enviado!</h2>
            <p>Si el email <strong>{email}</strong> existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.</p>
            <p>Revisa tu bandeja de entrada y sigue las instrucciones.</p>

            <div style={{ background: 'var(--ion-color-light)', padding: '12px', borderRadius: '8px', margin: '16px 0', textAlign: 'left' }}>
              <IonText color="medium">
                <small>
                  <strong>Nota de seguridad:</strong> Por privacidad, no revelamos si un email está registrado en nuestro sistema.
                </small>
              </IonText>
            </div>

            <IonButton
              expand="block"
              routerLink="/login"
              className="auth-button"
            >
              Volver al Login
            </IonButton>
            <div className="auth-links">
              <IonButton
                fill="clear"
                onClick={() => setSuccess(false)}
              >
                Intentar con otro email
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" text="" />
          </IonButtons>
          <IonTitle>Recuperar Contraseña</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="auth-content">
        <div className="auth-container">
          <h2>¿Olvidaste tu contraseña?</h2>
          <p>Ingresa tu email y te enviaremos un enlace para restablecerla</p>

          <form onSubmit={handleSubmit}>
            <IonItem>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
                placeholder="tu@email.com"
                required
              />
            </IonItem>

            <IonButton
              type="submit"
              expand="block"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Enlace'}
            </IonButton>
          </form>

          <div className="auth-links">
            <IonButton
              fill="clear"
              routerLink="/login"
            >
              ← Volver al Login
            </IonButton>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Enviando enlace..." />
        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError('')}
          header="Error"
          message={error}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default ForgotPasswordPage;