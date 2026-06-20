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

const ResendVerificationPage: React.FC = () => {
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

      await authService.resendVerificationEmail(email);
      setSuccess(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al reenviar el email de verificación');
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
            <IonTitle>Email Enviado</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="auth-content">
          <div className="auth-container">
            <h2>¡Email Enviado!</h2>
            <p>Hemos enviado un nuevo enlace de verificación a:</p>
            <p className="email-display" style={{ background: 'var(--ion-color-light)', padding: '8px', borderRadius: '4px', margin: '16px auto', fontWeight: 'bold' }}>{email}</p>
            <p>Revisa tu bandeja de entrada y sigue las instrucciones para verificar tu cuenta.</p>

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
                Reenviar a otro email
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
          <IonTitle>Reenviar Verificación</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="auth-content">
        <div className="auth-container">
          <h2>Reenviar Email</h2>
          <p>Ingresa tu email para recibir un nuevo enlace de verificación</p>

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
              {loading ? 'Enviando...' : 'Enviar Email'}
            </IonButton>
          </form>

          <div className="auth-links">
            <IonText color="medium">
              <small>
                ¿No recibiste el email? Revisa tu carpeta de spam o solicita un nuevo enlace aquí.
              </small>
            </IonText>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Enviando email..." />
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

export default ResendVerificationPage;