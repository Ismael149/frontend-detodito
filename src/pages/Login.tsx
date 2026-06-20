import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonItem,
  IonInput,
  IonIcon,
  IonButton,
  IonAlert,
  IonLoading,
  IonToast,
  IonText
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/authService';
import { mail, lockClosed, eye, eyeOff } from 'ionicons/icons';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const history = useHistory();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);

    // Clear errors when user types
    if (error) {
      setError('');
      localStorage.removeItem('login_error_persist');
    }

    if (setter === setEmail) {
      setEmailError('');
    } else if (setter === setPassword) {
      setPasswordError('');
    }
  };

  useEffect(() => {
    // Check for persisted error from reload
    const savedError = localStorage.getItem('login_error_persist');
    if (savedError) {
      setError(savedError);
    }
  }, []);

  const handleLogin = async () => {
    let hasError = false;

    // 1. Validation Logic
    if (!email) {
      setEmailError('El correo es obligatorio');
      hasError = true;
    } else if (!email.includes('@')) {
      setEmailError('Ingresa un correo válido (ej: nombre@correo.com)');
      hasError = true;
    }

    if (!password) {
      setPasswordError('La contraseña es obligatoria');
      hasError = true;
    }

    if (hasError) return;

    // 2. Clear previous errors/states
    setError('');
    setLoading(true);

    try {
      // 3. Attempt Login
      const response = await authService.login({ email, password });

      // 4. On Success
      console.log('✅ [LOGIN] Exitoso', response);
      if (response && response.token) {
        // Clear error persist on success
        localStorage.removeItem('login_error_persist');

        // Redirigir según el rol (usamos los datos de la respuesta directamente para mayor seguridad)
        const user = response.user || response;
        const isAdmin = user.is_admin === true ||
          user.is_admin === 1 ||
          user.is_admin === 'true' ||
          user.role === 'admin' ||
          user.user_type === 'admin';

        if (isAdmin) {
          console.log('👑 [LOGIN] Admin detected (response data), redirecting to dashboard');
          history.replace('/admin/dashboard');
        } else {
          console.log('👤 [LOGIN] User detected, redirecting to store');
          history.replace('/store');
        }
      } else {
        throw new Error('No se recibió token de sesión');
      }

    } catch (err: any) {
      // 5. On Error
      console.error('❌ [LOGIN] Error:', err);

      // Extract specific message from backend if available
      let errorMessage = 'Error al iniciar sesión';

      if (err.response) {
        // Server responded with non-2xx code
        // Priority: err.response.data.message -> err.response.data -> err.message
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        // Network error or client side error
        errorMessage = err.message;
      }

      // PERSIST ERROR: If page reloads, we read this back
      localStorage.setItem('login_error_persist', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper to trigger login on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // STOP PROPAGATION
      e.stopPropagation();
      handleLogin();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/store" text="" />
          </IonButtons>
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="auth-content ion-padding">
        <div className="auth-container">
          <h2>Bienvenido de nuevo</h2>
          <p>Ingresa a tu cuenta para continuar</p>

          {/* Error Message Box - Top Position */}
          {error && (
            <div className="error-message-box" style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #ef9a9a',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              {error}
            </div>
          )}

          {/* NO FORM TAG - Pure Divs to prevent auto-reload */}
          <div className="auth-input-group" style={{ padding: '24px 20px' }}>

            {/* Email Input */}
            <IonItem className={`icono ${emailError ? 'item-has-error' : ''}`} lines="none">
              <IonIcon icon={mail} slot="start" />
              <IonInput
                type="email"
                value={email}
                placeholder="Correo electrónico"
                onIonInput={(e) => handleInputChange(setEmail, e.detail.value!)}
                onKeyDown={handleKeyDown}
              />
            </IonItem>
            {emailError && (
              <IonText color="danger" style={{
                fontSize: '0.8rem',
                paddingLeft: '16px',
                marginTop: '4px',
                display: 'block'
              }}>
                {emailError}
              </IonText>
            )}

            <div style={{ height: '12px' }}></div> {/* Spacer */}

            {/* Password Input */}
            <IonItem className={`icono ${passwordError ? 'item-has-error' : ''}`} lines="none">
              <IonIcon icon={lockClosed} slot="start" />
              <IonInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                placeholder="Contraseña"
                onIonInput={(e) => handleInputChange(setPassword, e.detail.value!)}
                onKeyDown={handleKeyDown}
              />
              <IonIcon
                icon={showPassword ? eyeOff : eye}
                slot="end"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer', zIndex: 10 }}
              />
            </IonItem>
            {passwordError && (
              <IonText color="danger" style={{
                fontSize: '0.8rem',
                paddingLeft: '16px',
                marginTop: '4px',
                display: 'block'
              }}>
                {passwordError}
              </IonText>
            )}

            <div style={{ height: '12px' }}></div> {/* Spacer */}

            {/* Login Button */}
            <IonButton
              className="auth-button"
              expand="block"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </IonButton>

          </div>

          <div className="auth-links">
            <p className="ion-margin-top">
              ¿No tienes cuenta? <span onClick={() => history.push('/register')} style={{ color: 'var(--ion-color-primary)', fontWeight: 'bold', cursor: 'pointer' }}>Regístrate aquí</span>
            </p>
            <p>
              <span onClick={() => history.push('/forgot-password')} style={{ color: 'var(--ion-color-medium)', cursor: 'pointer', textDecoration: 'underline' }}>¿Olvidaste tu contraseña?</span>
            </p>
            <p>
              <small onClick={() => history.push('/resend-verification')} style={{ color: 'var(--ion-color-medium)', cursor: 'pointer' }}>
                ¿No recibiste el email de verificación?
              </small>
            </p>
          </div>
        </div>

        {/* Loading Indicator */}
        <IonLoading
          isOpen={loading}
          message={'Iniciando sesión...'}
        />

        {/* Info Toast */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
          color="warning"
        />



      </IonContent>
    </IonPage>
  );
};

export default Login;