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
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonLoading,
  IonAlert,
  IonIcon,
  IonToast
} from '@ionic/react';
import { lockClosed, checkmarkCircle, eye, eyeOff, alertCircle, key } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { authService } from '../../services/authService';
import './ResetPasswordPage.css';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Real-time requirements check (matching ChangePassword.tsx)
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  useEffect(() => {
    if (token) {
      validateToken(token);
    } else {
      setError('Token de recuperación no proporcionado');
      setValidating(false);
    }
  }, [token]);

  const validateToken = async (resetToken: string) => {
    try {
      setValidating(true);
      const response = await authService.validateResetToken(resetToken);
      setTokenValid(true);
      setEmail(response.email);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Token inválido o expirado');
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string, fieldName: string) => {
    setter(value);

    // Clear specific field error
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    if (error) setError('');
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
      isValid = false;
    } else {
      if (!hasMinLength) {
        errors.newPassword = 'Debe tener al menos 8 caracteres';
        isValid = false;
      }
      if (!hasUpperCase) {
        errors.newPassword = 'Debe incluir una mayúscula';
        isValid = false;
      }
      if (!hasNumber) {
        errors.newPassword = 'Debe incluir un número';
        isValid = false;
      }
      if (!hasSpecialChar) {
        errors.newPassword = 'Debe incluir un carácter especial (!@#...)';
        isValid = false;
      }
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      setError('Por favor, corrige los errores');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.resetPassword(token!, newPassword);
      setSuccess(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Restablecer Contraseña</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={true} message="Validando enlace..." />
        </IonContent>
      </IonPage>
    );
  }

  if (!tokenValid) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/login" text="" />
            </IonButtons>
            <IonTitle>Enlace Inválido</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="reset-password-page">
          <div className="container">
            <IonCard className="auth-card-unified">
              <IonCardContent className="ion-padding">
                <div style={{ textAlign: 'center' }}>
                  <IonIcon icon={alertCircle} color="danger" style={{ fontSize: '64px', marginBottom: '16px' }} />
                  <IonText color="danger">
                    <h2 style={{ fontWeight: 800 }}>Enlace Inválido</h2>
                  </IonText>
                  <p style={{ color: '#666', marginBottom: '24px' }}>{error || 'Este enlace de recuperación ha expirado o es inválido.'}</p>

                  <div className="action-buttons-unified">
                    <IonButton
                      expand="block"
                      routerLink="/forgot-password"
                      className="submit-button-unified"
                    >
                      Solicitar Nuevo Enlace
                    </IonButton>
                    <IonButton
                      expand="block"
                      fill="clear"
                      routerLink="/login"
                      style={{ marginTop: '12px' }}
                    >
                      Volver al Inicio de Sesión
                    </IonButton>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (success) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Contraseña Restablecida</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="reset-password-page">
          <div className="container">
            <IonCard className="auth-card-unified">
              <IonCardContent className="ion-padding">
                <div style={{ textAlign: 'center' }}>
                  <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '64px', marginBottom: '16px' }} />
                  <IonText color="success">
                    <h2 style={{ fontWeight: 800 }}>¡Contraseña Actualizada!</h2>
                  </IonText>
                  <p style={{ color: '#666', marginBottom: '8px' }}>Tu contraseña ha sido restablecida exitosamente.</p>
                  <p style={{ color: '#666', marginBottom: '24px' }}>Ahora puedes iniciar sesión con tus nuevas credenciales.</p>

                  <div className="action-buttons-unified">
                    <IonButton
                      expand="block"
                      routerLink="/login"
                      className="submit-button-unified"
                    >
                      Iniciar Sesión
                    </IonButton>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
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
          <IonTitle>Nueva Contraseña</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="reset-password-page">
        <div className="container">
          <IonCard className="auth-card-unified">
            <IonCardContent className="ion-padding">

              <div className="form-header" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontWeight: 800, margin: '0' }}>Crear Nueva Contraseña</h2>
                <p style={{ color: '#666', marginTop: '8px' }}>
                  Restableciendo cuenta: <strong style={{ color: 'var(--ion-color-primary)' }}>{email}</strong>
                </p>
              </div>

              {/* Global Error Box */}
              {error && (
                <div style={{
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid #ef9a9a',
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="field-wrapper">
                  <IonItem className={`form-item-unified ${fieldErrors.newPassword ? 'item-has-error' : ''}`} lines="none">
                    <IonIcon icon={lockClosed} slot="start" />
                    <IonInput
                      type={showNew ? 'text' : 'password'}
                      placeholder="Nueva Contraseña"
                      value={newPassword}
                      onIonInput={e => handleInputChange(setNewPassword, e.detail.value!, 'newPassword')}
                    />
                    <IonIcon
                      icon={showNew ? eyeOff : eye}
                      slot="end"
                      onClick={() => setShowNew(!showNew)}
                      style={{ cursor: 'pointer', zIndex: 10 }}
                    />
                  </IonItem>
                  {fieldErrors.newPassword && (
                    <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '12px', marginTop: '4px', display: 'block' }}>
                      <small>{fieldErrors.newPassword}</small>
                    </IonText>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="field-wrapper">
                  <IonItem className={`form-item-unified ${fieldErrors.confirmPassword ? 'item-has-error' : ''}`} lines="none">
                    <IonIcon icon={lockClosed} slot="start" />
                    <IonInput
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirmar Contraseña"
                      value={confirmPassword}
                      onIonInput={e => handleInputChange(setConfirmPassword, e.detail.value!, 'confirmPassword')}
                    />
                    <IonIcon
                      icon={showConfirm ? eyeOff : eye}
                      slot="end"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ cursor: 'pointer', zIndex: 10 }}
                    />
                  </IonItem>
                  {fieldErrors.confirmPassword && (
                    <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '12px', marginTop: '4px', display: 'block' }}>
                      <small>{fieldErrors.confirmPassword}</small>
                    </IonText>
                  )}
                </div>

                {/* Requirements List */}
                <div className="requirements-section">
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#888', marginBottom: '12px' }}>REQUISITOS</h4>
                  <ul className="requirements-list">
                    <li className={hasMinLength ? 'met' : ''}>
                      <IonIcon icon={checkmarkCircle} />
                      Mínimo 8 caracteres
                    </li>
                    <li className={hasUpperCase ? 'met' : ''}>
                      <IonIcon icon={checkmarkCircle} />
                      Al menos una mayúscula
                    </li>
                    <li className={hasNumber ? 'met' : ''}>
                      <IonIcon icon={checkmarkCircle} />
                      Al menos un número
                    </li>
                    <li className={hasSpecialChar ? 'met' : ''}>
                      <IonIcon icon={checkmarkCircle} />
                      Un carácter especial (!@#...)
                    </li>
                    <li className={passwordsMatch && newPassword.length > 0 ? 'met' : ''}>
                      <IonIcon icon={checkmarkCircle} />
                      Las contraseñas coinciden
                    </li>
                  </ul>
                </div>

                <IonButton
                  type="submit"
                  expand="block"
                  className="submit-button-unified"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Restablecer Contraseña'}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading isOpen={loading} message="Actualizando contraseña..." />
      </IonContent>
    </IonPage>
  );
};

export default ResetPasswordPage;