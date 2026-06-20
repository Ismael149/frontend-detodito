import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonAlert,
  IonText,
  IonIcon,
  IonCardContent,
  IonCard,
  IonCheckbox,
  IonLoading,
  IonToast
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  arrowBack, person, people, at, mail, location, lockClosed,
  globe, call, calendar, maleFemale, eye, eyeOff
} from 'ionicons/icons';
import { Country, countries } from '../data/countries';
import './Auth.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    country: '',
    date_of_birth: '',
    gender: '',
    password: '',
    confirm_password: '',
    acceptTerms: false
  });
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  // Actualizar el código de teléfono cuando se selecciona un país
  useEffect(() => {
    if (selectedCountry) {
      setPhoneCode(selectedCountry.phone);
      setFormData(prev => ({ ...prev, country: selectedCountry.name }));
    }
  }, [selectedCountry]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    // Combinar código de país y número de teléfono
    const fullPhone = phoneCode ? `${phoneCode} ${value}` : value;
    setFormData(prev => ({ ...prev, phone: fullPhone }));
  };

  const handleDateChange = (value: string) => {
    // Formatear la fecha a YYYY-MM-DD para la base de datos
    const date = new Date(value);
    const formattedDate = date.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date_of_birth: formattedDate }));
  };

  // Función para validar todos los campos
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    // Validar campos obligatorios
    if (!formData.first_name.trim()) {
      errors.first_name = 'El nombre es obligatorio';
      isValid = false;
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'El apellido es obligatorio';
      isValid = false;
    }

    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es obligatorio';
      isValid = false;
    } else if (formData.username.length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es obligatorio';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El formato del correo electrónico no es válido';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    } else if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/\d/.test(formData.password) || !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      errors.password = 'La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales';
      isValid = false;
    }

    if (!formData.confirm_password) {
      errors.confirm_password = 'Debes confirmar tu contraseña';
      isValid = false;
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Las contraseñas no coinciden';
      isValid = false;
    }

    if (!formData.acceptTerms) {
      setToastMessage('Debes aceptar los términos y condiciones');
      setShowToast(true);
      isValid = false;
    }

    // Validar campos opcionales pero con formato
    if (phoneNumber && !/^\d+$/.test(phoneNumber)) {
      errors.phone = 'El número de teléfono solo puede contener dígitos';
      isValid = false;
    }

    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 13) {
        errors.date_of_birth = 'Debes tener al menos 13 años';
        isValid = false;
      }
    } else {
      errors.date_of_birth = 'La fecha de nacimiento es obligatoria';
      isValid = false;
    }

    if (!formData.country) {
      errors.country = 'El país es obligatorio';
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      errors.phone = 'El número de teléfono es obligatorio';
      isValid = false;
    }

    if (!formData.gender) {
      errors.gender = 'El género es obligatorio';
      isValid = false;
    }

    setFieldErrors(errors);
    return { isValid, errors };
  };

  // Función para mostrar alerta de campo vacío
  const showFieldAlert = (fieldName: string) => {
    const fieldLabels: { [key: string]: string } = {
      phone: 'Número de teléfono',
      date_of_birth: 'Fecha de nacimiento',
      country: 'País',
      gender: 'Género'
    };

    const label = fieldLabels[fieldName] || fieldName;
    setAlertMessage(`El campo "${label}" es obligatorio`);
    setShowAlert(true);
  };

  // Función para validar campo individual al perder el foco
  const validateField = (field: string) => {
    const errors = { ...fieldErrors };
    const value = formData[field as keyof typeof formData] as string;

    switch (field) {
      case 'first_name':
        if (!value.trim()) {
          errors.first_name = 'El nombre es obligatorio';
        } else {
          delete errors.first_name;
        }
        break;

      case 'last_name':
        if (!value.trim()) {
          errors.last_name = 'El apellido es obligatorio';
        } else {
          delete errors.last_name;
        }
        break;

      case 'username':
        if (!value.trim()) {
          errors.username = 'El nombre de usuario es obligatorio';
        } else if (value.length < 3) {
          errors.username = 'Mínimo 3 caracteres';
        } else {
          delete errors.username;
        }
        break;

      case 'email':
        if (!value.trim()) {
          errors.email = 'El correo electrónico es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = 'Formato de email inválido';
        } else {
          delete errors.email;
        }
        break;

      case 'password':
        if (!value) {
          errors.password = 'La contraseña es obligatoria';
        } else if (value.length < 6) {
          errors.password = 'Mínimo 6 caracteres';
        } else if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          errors.password = 'Debe incluir Mayúsculas, Minúsculas, Números y caracteres especiales';
        } else {
          delete errors.password;
        }
        break;

      case 'confirm_password':
        if (!value) {
          errors.confirm_password = 'Confirma tu contraseña';
        } else if (value !== formData.password) {
          errors.confirm_password = 'Las contraseñas no coinciden';
        } else {
          delete errors.confirm_password;
        }
        break;

      case 'country':
        if (!value) {
          errors.country = 'El país es obligatorio';
        } else {
          delete errors.country;
        }
        break;

      case 'phone':
        if (!phoneNumber.trim()) {
          errors.phone = 'El teléfono es obligatorio';
        } else {
          delete errors.phone;
        }
        break;

      case 'date_of_birth':
        if (!value) {
          errors.date_of_birth = 'La fecha es obligatoria';
        } else {
          delete errors.date_of_birth;
        }
        break;

      case 'gender':
        if (!value) {
          errors.gender = 'El género es obligatorio';
        } else {
          delete errors.gender;
        }
        break;
    }

    setFieldErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos antes de enviar
    const { isValid, errors } = validateForm();

    if (!isValid) {
      if (!formData.acceptTerms) {
        setToastMessage('Debes aceptar los términos y condiciones');
        setShowToast(true);
        return;
      }

      // Encontrar el primer campo con error y mostrar alerta
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        showFieldAlert(firstErrorField);
      }
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { confirm_password, acceptTerms, ...registerData } = formData;

      const response = await authService.register(registerData);

      if (response.requires_verification) {
        setRegisteredEmail(formData.email);
        setSuccess(true);
      } else {
        setError('Error inesperado en el registro');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const triggerDatePicker = () => {
    const input = document.querySelector('.date-input-with-button input') as HTMLInputElement;
    if (input && 'showPicker' in input) {
      input.showPicker();
    }
  };

  if (success) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Verifica tu Email</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="register-page">
          <div className="container">
            <IonCard className="success-card">
              <IonCardContent>
                <div className="success-content">
                  <IonIcon icon={mail} color="primary" size="large" />
                  <IonText color="primary">
                    <h2>¡Registro Exitoso!</h2>
                  </IonText>

                  <p>Te has registrado correctamente en nuestra plataforma.</p>
                  <p><strong>Antes de poder iniciar sesión, debes verificar tu email.</strong></p>

                  <p>Hemos enviado un email de verificación a:</p>

                  <p className="email-display">{registeredEmail}</p>

                  <p>Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.</p>

                  <div className="verification-info">
                    <IonText color="medium">
                      <small>
                        <strong>¿No recibiste el email?</strong><br />
                        • Revisa tu carpeta de spam<br />
                        • Asegúrate de que el email sea correcto<br />
                        • Espera unos minutos<br />
                        • <a href="/resend-verification">Solicitar nuevo enlace</a>
                      </small>
                    </IonText>
                  </div>

                  <div className="action-buttons">
                    <IonButton
                      expand="block"
                      routerLink="/login"
                      className="success-button"
                    >
                      Ir al Login
                    </IonButton>
                    <IonButton
                      expand="block"
                      fill="clear"
                      routerLink="/resend-verification"
                    >
                      Reenviar Email de Verificación
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
          <IonTitle>Crear Cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding auth-content">
        <div className="auth-container">
          <h2>Crear una cuenta</h2>
          <p>Completa el formulario para registrarte</p>

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              {/* Campo Nombre */}
              <IonItem className={`icono ${fieldErrors.first_name ? 'item-has-error' : ''}`} lines="none">
                <IonIcon icon={person} slot="start" />
                <IonInput
                  value={formData.first_name}
                  onIonInput={(e) => handleInputChange('first_name', e.detail.value!)}
                  onIonBlur={() => validateField('first_name')}
                  placeholder="Nombre *"
                  required
                />
              </IonItem>
              {fieldErrors.first_name && (
                <div className="error-message">
                  <IonText color="danger">
                    <small>{fieldErrors.first_name}</small>
                  </IonText>
                </div>
              )}

              {/* Campo Apellido */}
              <IonItem className={`icono ${fieldErrors.last_name ? 'item-has-error' : ''}`} lines="none">
                <IonIcon icon={people} slot="start" />
                <IonInput
                  value={formData.last_name}
                  onIonInput={(e) => handleInputChange('last_name', e.detail.value!)}
                  onIonBlur={() => validateField('last_name')}
                  placeholder="Apellido *"
                  required
                />
              </IonItem>
              {fieldErrors.last_name && (
                <div className="error-message">
                  <IonText color="danger">
                    <small>{fieldErrors.last_name}</small>
                  </IonText>
                </div>
              )}

              {/* Campo Username */}
              <IonItem className={`icono ${fieldErrors.username ? 'item-has-error' : ''}`} lines="none">
                <IonIcon icon={at} slot="start" />
                <IonInput
                  value={formData.username}
                  onIonInput={(e) => handleInputChange('username', e.detail.value!)}
                  onIonBlur={() => validateField('username')}
                  placeholder="Nombre de usuario *"
                  required
                />
              </IonItem>
              {fieldErrors.username && (
                <div className="error-message">
                  <IonText color="danger">
                    <small>{fieldErrors.username}</small>
                  </IonText>
                </div>
              )}

              {/* Campo Email */}
              <IonItem className={`icono ${fieldErrors.email ? 'item-has-error' : ''}`} lines="none">
                <IonIcon icon={mail} slot="start" />
                <IonInput
                  type="email"
                  value={formData.email}
                  onIonInput={(e) => handleInputChange('email', e.detail.value!)}
                  onIonBlur={() => validateField('email')}
                  placeholder="Correo electrónico *"
                  required
                />
              </IonItem>
              {fieldErrors.email && (
                <div className="error-message">
                  <IonText color="danger">
                    <small>{fieldErrors.email}</small>
                  </IonText>
                </div>
              )}

              {/* Campo País */}
              <IonItem className={`icono ${fieldErrors.country ? 'item-has-error' : ''}`} lines="none">
                <IonIcon icon={globe} slot="start" />
                <IonSelect
                  value={selectedCountry}
                  placeholder="País *"
                  onIonChange={(e) => {
                    setSelectedCountry(e.detail.value);
                    if (fieldErrors.country) setFieldErrors(prev => ({ ...prev, country: '' }));
                  }}
                  onIonBlur={() => validateField('country')}
                  interface="action-sheet"
                >
                  {countries.map((country) => (
                    <IonSelectOption key={country.code} value={country}>
                      {country.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              {fieldErrors.country && (
                <div className="error-message">
                  <IonText color="danger">
                    <small>{fieldErrors.country}</small>
                  </IonText>
                </div>
              )}

              {/* Campo Teléfono */}
              <IonItem className={`icono ${fieldErrors.phone ? 'item-has-error' : ''}`} lines="none">
                <IonIcon icon={call} slot="start" />
                <div className="phone-input-container">
                  {phoneCode && (
                    <IonText color="medium" className="phone-prefix">
                      {phoneCode}
                    </IonText>
                  )}
                  <IonInput
                    type="tel"
                    value={phoneNumber}
                    onIonInput={(e) => handlePhoneNumberChange(e.detail.value!)}
                    onIonBlur={() => validateField('phone')}
                    placeholder="Número de teléfono *"
                    className="phone-number-input"
                  />
                </div>
              </IonItem>
              {fieldErrors.phone && (
                <div className="error-message">
                  <IonText color="danger">
                    <small>{fieldErrors.phone}</small>
                  </IonText>
                </div>
              )}

              {/* Campo Fecha de Nacimiento */}
              <IonItem className={`icono ${fieldErrors.date_of_birth ? 'item-has-error' : ''}`} lines="none">
                <IonIcon
                  icon={calendar}
                  slot="start"
                  onClick={triggerDatePicker}
                  style={{ cursor: 'pointer' }}
                />
                <IonInput
                  type="date"
                  onIonChange={(e) => {
                    handleInputChange('date_of_birth', e.detail.value!);
                    if (fieldErrors.date_of_birth) setFieldErrors(prev => ({ ...prev, date_of_birth: '' }));
                  }}
                  onIonBlur={() => validateField('date_of_birth')}
                  placeholder="Fecha de nacimiento *"
                  className="date-input-with-button"
                />
                <IonIcon
                  icon={calendar}
                  slot="end"
                  onClick={triggerDatePicker}
                  style={{ cursor: 'pointer', marginLeft: '8px', fontSize: '20px' }}
                />
              </IonItem>
              {fieldErrors.date_of_birth && (
                <div className="error-message">
                  <IonText color="danger">
                    <small>{fieldErrors.date_of_birth}</small>
                  </IonText>
                </div>
              )}

              {/* Campo Género */}
              <IonItem className={`icono ${fieldErrors.gender ? 'item-has-error' : ''}`} lines="none">
                <IonIcon icon={maleFemale} slot="start" />
                <IonSelect
                  value={formData.gender}
                  placeholder="Género *"
                  onIonChange={(e) => {
                    handleInputChange('gender', e.detail.value);
                    if (fieldErrors.gender) setFieldErrors(prev => ({ ...prev, gender: '' }));
                  }}
                  onIonBlur={() => validateField('gender')}
                >
                  <IonSelectOption value="masculino">Masculino</IonSelectOption>
                  <IonSelectOption value="femenino">Femenino</IonSelectOption>
                  <IonSelectOption value="otro">Otro</IonSelectOption>
                  <IonSelectOption value="prefiero_no_decirlo">Prefiero no decirlo</IonSelectOption>
                </IonSelect>
              </IonItem>
              {fieldErrors.gender && (
                <div className="error-message">
                  <IonText color="danger">
                    <small>{fieldErrors.gender}</small>
                  </IonText>
                </div>
              )}

              {/* Campo Contraseña */}
              <IonItem className={`icono ${fieldErrors.password ? 'item-has-error' : ''}`} lines="none">
                <IonIcon icon={lockClosed} slot="start" />
                <IonInput
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onIonInput={(e) => handleInputChange('password', e.detail.value!)}
                  onIonBlur={() => validateField('password')}
                  placeholder="Contraseña *"
                  required
                />
                <IonIcon
                  icon={showPassword ? eyeOff : eye}
                  slot="end"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer', zIndex: 10 }}
                />
              </IonItem>

              {/* Requisitos de Contraseña (Feedback Visual) */}
              <div className="password-requirements" style={{ padding: '0 16px', marginBottom: '10px' }}>
                <IonText color="medium" style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>
                  La contraseña debe contener:
                </IonText>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {[
                    { label: '6+ carac.', met: formData.password.length >= 6 },
                    { label: 'Mayúscula', met: /[A-Z]/.test(formData.password) },
                    { label: 'Minúscula', met: /[a-z]/.test(formData.password) },
                    { label: 'Número', met: /\d/.test(formData.password) },
                    { label: 'Especial (!@#)', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
                  ].map((req, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: req.met ? 'var(--ion-color-success)' : 'var(--ion-color-step-300)',
                        transition: 'background-color 0.3s'
                      }}></div>
                      <IonText color={req.met ? 'success' : 'medium'}>{req.label}</IonText>
                    </div>
                  ))}
                </div>
              </div>

              {fieldErrors.password && (
                <div className="error-message">
                  <IonText color="danger">
                    <small>{fieldErrors.password}</small>
                  </IonText>
                </div>
              )}

              {/* Campo Confirmar Contraseña */}
              <IonItem className={`icono ${fieldErrors.confirm_password ? 'item-has-error' : ''}`} lines="none">
                <IonIcon icon={lockClosed} slot="start" />
                <IonInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onIonInput={(e) => handleInputChange('confirm_password', e.detail.value!)}
                  onIonBlur={() => validateField('confirm_password')}
                  placeholder="Confirmar contraseña *"
                  required
                />
                <IonIcon
                  icon={showConfirmPassword ? eyeOff : eye}
                  slot="end"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ cursor: 'pointer', zIndex: 10 }}
                />
              </IonItem>
              {fieldErrors.confirm_password && (
                <div className="error-message">
                  <IonText color="danger">
                    <small>{fieldErrors.confirm_password}</small>
                  </IonText>
                </div>
              )}

              {/* Checkbox Términos */}
              <IonItem>
                <IonCheckbox
                  slot="start"
                  checked={formData.acceptTerms}
                  onIonChange={(e) => setFormData({
                    ...formData,
                    acceptTerms: e.detail.checked
                  })}
                />
                <IonLabel>
                  Acepto los <a href="/terms" target="_blank">términos y condiciones</a>
                  y la <a href="/privacy" target="_blank">política de privacidad</a>
                </IonLabel>
              </IonItem>

              <IonButton expand="block" type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </IonButton>
            </div>
          </form>

          <div className="auth-links">
            <p>
              ¿Ya tienes cuenta?{' '}
              <IonButton fill="clear" routerLink="/login">
                Inicia sesión aquí
              </IonButton>
            </p>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Registrando usuario..." />

        {/* Alert para campos obligatorios */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Campo Requerido'}
          message={alertMessage}
          buttons={['Entendido']}
        />

        {/* Toast para mensajes generales */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
          color="warning"
        />

        {/* Alert para errores generales */}
        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError('')}
          header={'Error de Registro'}
          message={error}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;