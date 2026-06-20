import React, { useState } from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonItem,
    IonInput,
    IonIcon,
    IonLoading,
    IonToast,
    IonText
} from '@ionic/react';
import { lockClosed, checkmarkCircle, eye, eyeOff, alertCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/authService';
import './ChangePassword.css';

const ChangePassword: React.FC = () => {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Validation State
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Real-time requirements check
    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

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

        if (!currentPassword) {
            errors.currentPassword = 'La contraseña actual es requerida';
            isValid = false;
        }

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

    const handleSubmit = async () => {
        if (!validate()) {
            setError('Por favor, corrige los errores');
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword(currentPassword, newPassword);
            setToastMessage('Contraseña actualizada exitosamente');
            setShowToast(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => history.goBack(), 1500);
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Error al cambiar contraseña';
            setError(msg);
            // If server says "Current password incorrect", map it to field
            if (msg.toLowerCase().includes('actual') || msg.toLowerCase().includes('current')) {
                setFieldErrors(prev => ({ ...prev, currentPassword: msg }));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/settings/security" text="" />
                    </IonButtons>
                    <IonTitle>Cambiar Contraseña</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="change-password-content">
                <div className="unified-password-container">

                    {/* Global Error Box */}
                    {error && (
                        <div style={{
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            border: '1px solid #ef9a9a',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="password-main-card ion-padding">
                        <div className="card-header-section">
                            <h3>Nueva Contraseña</h3>
                            <p className="instruction">
                                Crea una contraseña segura que no hayas usado antes.
                            </p>
                        </div>

                        <div className="password-form-unified">

                            {/* Current Password */}
                            <div className="field-wrapper">
                                <IonItem className={`form-item-unified ${fieldErrors.currentPassword ? 'item-has-error' : ''}`} lines="none">
                                    <IonIcon icon={lockClosed} slot="start" />
                                    <IonInput
                                        type={showCurrent ? 'text' : 'password'}
                                        placeholder="Contraseña Actual"
                                        value={currentPassword}
                                        onIonInput={e => handleInputChange(setCurrentPassword, e.detail.value!, 'currentPassword')}
                                    />
                                    <IonIcon
                                        icon={showCurrent ? eyeOff : eye}
                                        slot="end"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        style={{ cursor: 'pointer', zIndex: 10 }}
                                    />
                                </IonItem>
                                {fieldErrors.currentPassword && (
                                    <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '16px', marginTop: '4px', display: 'block' }}>
                                        <small>{fieldErrors.currentPassword}</small>
                                    </IonText>
                                )}
                            </div>

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
                                    <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '16px', marginTop: '4px', display: 'block' }}>
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
                                    <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '16px', marginTop: '4px', display: 'block' }}>
                                        <small>{fieldErrors.confirmPassword}</small>
                                    </IonText>
                                )}
                            </div>

                        </div>

                        {/* Requirements List */}
                        <div className="requirements-section">
                            <h4>REQUISITOS</h4>
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

                        <div className="action-buttons-unified">
                            <IonButton
                                expand="block"
                                className="submit-btn"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </IonButton>
                            <IonButton
                                expand="block"
                                fill="clear"
                                className="cancel-btn"
                                onClick={() => history.goBack()}
                            >
                                Cancelar
                            </IonButton>
                        </div>
                    </div>
                </div>

                <IonLoading isOpen={loading} message="Actualizando contraseña..." />
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    color="success"
                    position="bottom"
                />
            </IonContent>
        </IonPage>
    );
};

export default ChangePassword;
