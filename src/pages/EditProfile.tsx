// frontend/src/pages/EditProfile.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonAlert,
  IonLoading,
  IonToast,
  IonAvatar,
  IonNote,
  IonSpinner,
  IonText
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  save,
  person,
  people,
  at,
  mail,
  call,
  location,
  globe,
  calendar,
  maleFemale,
  camera,
  checkmarkCircle,
  closeCircle,
  chevronForward
} from 'ionicons/icons';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { countries } from '../data/countries';
import { getImageUrl } from '../utils/imageUtils';
import './EditProfile.css';

const EditProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const triggerDatePicker = () => {
    if (dateInputRef.current && typeof (dateInputRef.current as any).showPicker === 'function') {
      (dateInputRef.current as any).showPicker();
    } else {
      (dateInputRef.current as any)?.focus();
    }
  };

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    date_of_birth: '',
    gender: ''
  });

  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const history = useHistory();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      if (!authService.isAuthenticated()) {
        history.push('/login');
        return;
      }
      const response = await userService.getProfile();
      setUser(response.user);
      parseUserData(response.user);
    } catch (error: any) {
      console.error('❌ Error cargando perfil:', error);
      const userData = userService.getCurrentUser();
      if (userData) {
        setUser(userData);
        parseUserData(userData);
      } else {
        setAlertMessage('No se pudieron cargar los datos del perfil.');
        setShowAlert(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const parseUserData = (userData: any) => {
    let rawPhone = userData.phone || '';
    let countryObj = null;
    let code = '';

    if (rawPhone && typeof rawPhone === 'string') {
      for (const country of countries) {
        if (rawPhone.startsWith(country.phone)) {
          countryObj = country;
          code = country.phone;
          rawPhone = rawPhone.replace(country.phone, '').trim();
          break;
        }
      }
    }

    let birthDate = userData.date_of_birth || '';
    if (birthDate) {
      const date = new Date(birthDate);
      if (!isNaN(date.getTime())) {
        birthDate = date.toISOString().split('T')[0];
      }
    }

    setSelectedCountry(countryObj);
    setPhoneCode(code);
    setPhoneNumber(rawPhone);

    setFormData({
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      username: userData.username || '',
      email: userData.email || '',
      phone: userData.phone || '',
      country: userData.country || '',
      address: userData.address || '',
      date_of_birth: birthDate,
      gender: userData.gender || ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCountryChange = (country: any) => {
    setSelectedCountry(country);
    if (country) {
      setPhoneCode(country.phone);
      setFormData(prev => ({ ...prev, country: country.name }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    const fullPhone = phoneCode ? `${phoneCode} ${value}`.trim() : value;
    setFormData(prev => ({ ...prev, phone: fullPhone }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file: File) => {
    try {
      setUploadingAvatar(true);
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);
      const response = await userService.updateAvatar(formDataUpload);
      if (response.user) {
        setUser(response.user);
        setToastMessage('✅ Foto de perfil actualizada');
        setShowToast(true);
      }
    } catch (error: any) {
      setAlertMessage(error.message || 'Error al subir la imagen');
      setShowAlert(true);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const validateField = (field: string) => {
    const errors = { ...fieldErrors };
    const value = formData[field as keyof typeof formData] as string;
    switch (field) {
      case 'first_name':
        if (!value.trim()) errors.first_name = 'Obligatorio';
        else delete errors.first_name;
        break;
      case 'last_name':
        if (!value.trim()) errors.last_name = 'Obligatorio';
        else delete errors.last_name;
        break;
      case 'email':
        if (!value.trim()) errors.email = 'Obligatorio';
        else if (!/\S+@\S+\.\S+/.test(value)) errors.email = 'Email inválido';
        else delete errors.email;
        break;
    }
    setFieldErrors(errors);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;
    if (!formData.first_name.trim()) { errors.first_name = 'Obligatorio'; isValid = false; }
    if (!formData.last_name.trim()) { errors.last_name = 'Obligatorio'; isValid = false; }
    if (!formData.email.trim()) { errors.email = 'Obligatorio'; isValid = false; }
    setFieldErrors(errors);
    return isValid;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      setToastMessage('Por favor, corrige los errores');
      setShowToast(true);
      return;
    }
    try {
      setSaving(true);
      await userService.updateProfile({
        ...formData,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null
      });
      setToastMessage('✅ Perfil actualizado');
      setShowToast(true);
      setTimeout(() => history.push('/profile'), 1500);
    } catch (error: any) {
      setAlertMessage(error.message || 'Error al actualizar perfil');
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => history.push('/profile');

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <IonLoading isOpen={loading} message="Cargando..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="edit-profile-v6">
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" text="" />
          </IonButtons>
          <IonTitle>Editar Perfil</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSaveProfile} disabled={saving} color="primary" strong>
              <IonIcon icon={save} slot="start" />
              Guardar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="edit-profile-content-v6">
        <IonList lines="none" className="more-list">

          {/* Header style User-Header consistent with More.tsx */}
          <IonItem className="user-header edit-profile-hero" button onClick={() => fileInputRef.current?.click()}>
            <IonAvatar slot="start" className="edit-avatar-v6">
              {uploadingAvatar ? (
                <IonSpinner name="crescent" color="primary" />
              ) : user?.profile_picture ? (
                <img src={getImageUrl(user.profile_picture)} alt={formData.first_name} />
              ) : (
                <IonIcon icon={person} size="large" color="primary" />
              )}
              <div className="camera-overlay">
                <IonIcon icon={camera} />
              </div>
            </IonAvatar>
            <IonLabel>
              <h2>{formData.first_name} {formData.last_name}</h2>
              <IonNote color="medium">Toca para cambiar foto</IonNote>
            </IonLabel>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileSelect}
            />
          </IonItem>

          <div className="section-title">
            <IonNote color="medium"><small>INFORMACIÓN PERSONAL</small></IonNote>
          </div>

          <IonItem className="edit-item-v6">
            <IonIcon icon={person} slot="start" color="medium" />
            <div className={`v6-input-field ${fieldErrors.first_name ? 'has-error' : ''}`}>
              <label>Nombre *</label>
              <input
                type="text"
                value={formData.first_name}
                onInput={(e: any) => handleInputChange('first_name', e.target.value)}
                onBlur={() => validateField('first_name')}
                placeholder="Tu nombre"
                className={fieldErrors.first_name ? 'input-error' : ''}
              />
              {fieldErrors.first_name && (
                <IonText color="danger" style={{
                  fontSize: '0.8rem',
                  paddingLeft: '4px',
                  marginTop: '4px',
                  display: 'block'
                }}>
                  <small>{fieldErrors.first_name}</small>
                </IonText>
              )}
            </div>
          </IonItem>

          <IonItem className="edit-item-v6">
            <IonIcon icon={people} slot="start" color="medium" />
            <div className={`v6-input-field ${fieldErrors.last_name ? 'has-error' : ''}`}>
              <label>Apellido *</label>
              <input
                type="text"
                value={formData.last_name}
                onInput={(e: any) => handleInputChange('last_name', e.target.value)}
                onBlur={() => validateField('last_name')}
                placeholder="Tu apellido"
                className={fieldErrors.last_name ? 'input-error' : ''}
              />
              {fieldErrors.last_name && (
                <div className="v6-error-container">
                  <small className="v6-error-txt">{fieldErrors.last_name}</small>
                </div>
              )}
            </div>
          </IonItem>

          <IonItem className="edit-item-v6">
            <IonIcon icon={at} slot="start" color="medium" />
            <div className="v6-input-field">
              <label>Nombre de usuario</label>
              <input
                type="text"
                value={formData.username}
                onInput={(e: any) => handleInputChange('username', e.target.value)}
                placeholder="@usuario"
              />
            </div>
          </IonItem>

          <IonItem className="edit-item-v6">
            <IonIcon icon={mail} slot="start" color="medium" />
            <div className={`v6-input-field ${fieldErrors.email ? 'has-error' : ''}`}>
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onInput={(e: any) => handleInputChange('email', e.target.value)}
                onBlur={() => validateField('email')}
                placeholder="ejemplo@correo.com"
                className={fieldErrors.email ? 'input-error' : ''}
              />
              {fieldErrors.email && (
                <div className="v6-error-container">
                  <small className="v6-error-txt">{fieldErrors.email}</small>
                </div>
              )}
            </div>
          </IonItem>

          <div className="section-title">
            <IonNote color="medium"><small>CONTACTO Y UBICACIÓN</small></IonNote>
          </div>

          <IonItem className="edit-item-v6 clickable-v6">
            <IonIcon icon={globe} slot="start" color="medium" />
            <IonLabel>
              <p className="v6-label-mini">País</p>
              <h3>{selectedCountry ? selectedCountry.name : 'Seleccionar país'}</h3>
            </IonLabel>
            <IonSelect
              value={selectedCountry}
              interface="popover"
              onIonChange={(e) => handleCountryChange(e.detail.value)}
              className="v6-absolute-select"
            >
              {countries.map((c) => (
                <IonSelectOption key={c.code} value={c}>
                  {c.name} ({c.phone})
                </IonSelectOption>
              ))}
            </IonSelect>
            <IonIcon icon={chevronForward} slot="end" className="v6-chevron" />
          </IonItem>

          <IonItem className="edit-item-v6">
            <IonIcon icon={call} slot="start" color="medium" />
            <div className="v6-input-field">
              <label>Teléfono</label>
              <div className="v6-phone-row">
                {phoneCode && <span className="v6-code-badge">{phoneCode}</span>}
                <input
                  type="tel"
                  value={phoneNumber}
                  onInput={(e: any) => handlePhoneChange(e.target.value)}
                  placeholder="Número telefónico"
                />
              </div>
            </div>
          </IonItem>

          <IonItem className="edit-item-v6">
            <IonIcon icon={location} slot="start" color="medium" />
            <div className="v6-input-field">
              <label>Dirección</label>
              <input
                type="text"
                value={formData.address}
                onInput={(e: any) => handleInputChange('address', e.target.value)}
                placeholder="Av. Bolívar, Caracas..."
              />
            </div>
          </IonItem>

          <div className="section-title">
            <IonNote color="medium"><small>OTROS DETALLES</small></IonNote>
          </div>

          <IonItem className="edit-item-v6">
            <IonIcon
              icon={calendar}
              slot="start"
              color="medium"
              onClick={triggerDatePicker}
              style={{ cursor: 'pointer' }}
            />
            <div className="v6-input-field">
              <label>Fecha de Nacimiento</label>
              <input
                ref={dateInputRef}
                type="date"
                value={formData.date_of_birth}
                onInput={(e: any) => handleInputChange('date_of_birth', e.target.value)}
                className="v6-date-input"
              />
            </div>
            <IonIcon
              icon={calendar}
              slot="end"
              onClick={triggerDatePicker}
              style={{ cursor: 'pointer', marginLeft: '8px', fontSize: '20px', color: '#666' }}
            />
          </IonItem>

          <IonItem className="edit-item-v6 clickable-v6">
            <IonIcon icon={maleFemale} slot="start" color="medium" />
            <IonLabel>
              <p className="v6-label-mini">Género</p>
              <h3 className="capitalize">{formData.gender || 'No especificado'}</h3>
            </IonLabel>
            <IonSelect
              value={formData.gender}
              interface="popover"
              onIonChange={(e) => handleInputChange('gender', e.detail.value)}
              className="v6-absolute-select"
            >
              <IonSelectOption value="masculino">Masculino</IonSelectOption>
              <IonSelectOption value="femenino">Femenino</IonSelectOption>
              <IonSelectOption value="otro">Otro</IonSelectOption>
            </IonSelect>
            <IonIcon icon={chevronForward} slot="end" className="v6-chevron" />
          </IonItem>

          <div className="edit-actions-v6">
            <IonButton expand="block" className="v6-save-btn" onClick={handleSaveProfile} disabled={saving}>
              Guardar Cambios
            </IonButton>
            <IonButton expand="block" fill="clear" color="medium" onClick={handleCancel}>
              Cancelar
            </IonButton>
          </div>

        </IonList>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color="dark"
        />
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Aviso"
          message={alertMessage}
          buttons={['OK']}
        />
        <IonLoading isOpen={saving} message="Guardando..." />
      </IonContent>
    </IonPage>
  );
};

export default EditProfile;