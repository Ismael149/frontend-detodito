import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonLoading,
    IonToast,
    IonIcon,
    IonText,
    IonButton
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { card, lockClosed, alertCircle, trash, create, star, add, cardOutline, americanFootball } from 'ionicons/icons';
import { paymentService, PaymentMethod, PaymentMethodCreate } from '../../services/paymentService';
import './PaymentConfigPage.css';

const PaymentConfigPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const initialFormState: any = {
        card_number: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
        cardholder_name: '',
        is_default: false
    };

    const [formData, setFormData] = useState<any>(initialFormState);

    // Validation State
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadAllPaymentMethods();
        if (id) {
            loadPaymentMethod(parseInt(id));
        }
    }, [id]);

    const loadAllPaymentMethods = async () => {
        try {
            const data = await paymentService.getUserPaymentMethods();
            setPaymentMethods(data);
        } catch (err) {
            console.error('Error loading payment methods:', err);
        }
    };

    const loadPaymentMethod = async (methodId: number) => {
        try {
            setLoading(true);
            const data = await paymentService.getPaymentMethodById(methodId);
            // Sensitive data like number and CVV won't be returned by backend for security
            setFormData({
                ...initialFormState,
                cardholder_name: data.cardholder_name,
                expiry_month: data.expiry_month.toString().padStart(2, '0'),
                expiry_year: data.expiry_year.toString(),
                is_default: data.is_default
            });
            setEditingId(methodId);
        } catch (err) {
            console.error(err);
            setError('Error al cargar el método de pago');
        } finally {
            setLoading(false);
        }
    };

    const handleEditFromList = (method: PaymentMethod) => {
        setFormData({
            ...initialFormState,
            cardholder_name: method.cardholder_name,
            expiry_month: method.expiry_month.toString().padStart(2, '0'),
            expiry_year: method.expiry_year.toString(),
            is_default: method.is_default
        });
        setEditingId(method.id || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (methodId: number) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este método de pago?')) return;

        setLoading(true);
        try {
            await paymentService.deletePaymentMethod(methodId);
            setToastMessage('Método de pago eliminado');
            setShowToast(true);
            loadAllPaymentMethods();
            if (editingId === methodId) {
                resetForm();
            }
        } catch (err) {
            console.error(err);
            setError('Error al eliminar el método de pago');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setFieldErrors({});
        setError('');
    };

    const detectCardType = (number: string) => {
        if (number.startsWith('4')) return 'Visa';
        if (number.startsWith('5')) return 'Mastercard';
        if (number.startsWith('3')) return 'Amex';
        return '';
    };

    const formatCardNumber = (value: string) => {
        // Remove chars
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        // Split in 4 
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const handleInputChange = (field: string, value: any) => {
        let finalValue = value;

        if (field === 'card_number') {
            // No action needed for format in this simple implementation
        }

        setFormData((prev: any) => ({ ...prev, [field]: finalValue }));

        // Clear field error
        if (fieldErrors[field]) {
            setFieldErrors((prev: any) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        if (error) setError('');
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        let isValid = true;

        if (!formData.cardholder_name.trim()) {
            errors.cardholder_name = 'El nombre del titular es obligatorio';
            isValid = false;
        }

        if (!formData.card_number.trim() || formData.card_number.replace(/\s/g, '').length < 13) {
            errors.card_number = 'Número de tarjeta inválido';
            isValid = false;
        }

        if (!formData.expiry_month || !formData.expiry_year) {
            errors.expiry_date = 'Fecha de expiración requerida';
            isValid = false;
        } else {
            // Simple expiry check
            const today = new Date();
            const expDate = new Date(parseInt(formData.expiry_year), parseInt(formData.expiry_month));
            if (expDate < today) {
                errors.expiry_date = 'La tarjeta ha expirado';
                isValid = false;
            }
        }

        if (!formData.cvv.trim() || formData.cvv.length < 3) {
            errors.cvv = 'CVV inválido';
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleSave = async () => {
        if (!validate()) {
            setError('Verifica los datos de la tarjeta');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                // When editing, we usually only update cardholder_name and is_default unless backend supports more
                await paymentService.updatePaymentMethod(editingId, {
                    cardholder_name: formData.cardholder_name,
                    is_default: formData.is_default
                });
                setToastMessage('Método de pago actualizado');
            } else {
                await paymentService.createPaymentMethod({
                    card_number: formData.card_number.replace(/\s/g, ''),
                    expiry_month: parseInt(formData.expiry_month),
                    expiry_year: parseInt(formData.expiry_year),
                    cvv: formData.cvv,
                    cardholder_name: formData.cardholder_name,
                    is_default: formData.is_default
                });
                setToastMessage('Método de pago guardado');
            }

            setShowToast(true);
            resetForm();
            loadAllPaymentMethods();

            if (id) {
                setTimeout(() => history.push('/profile/payment'), 1500);
            }
        } catch (err: any) {
            console.error(err);
            const serverMessage = err.response?.data?.message;
            setError(serverMessage || 'Error al guardar el método de pago');
        } finally {
            setLoading(false);
        }
    };

    // Generate years
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar className="premium-toolbar">
                    <IonButtons slot="start">
                        <IonBackButton text="" defaultHref="/profile" />
                    </IonButtons>
                    <IonTitle>{editingId ? 'Editar Tarjeta' : 'Nueva Tarjeta'}</IonTitle>
                    <IonButtons slot="end">
                        {editingId && (
                            <IonButton onClick={resetForm} color="medium">
                                Limpiar
                            </IonButton>
                        )}
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="payment-config-page-container">
                <div className="payment-content-area">
                    <div className="form-wrapper-universal">

                        <div className="form-intro-compact">
                            <IonIcon icon={card} className="intro-icon-premium" />
                            <div className="intro-text-group">
                                <h2>Información de Pago</h2>
                                <p>Tus datos están protegidos y encriptados</p>
                            </div>
                        </div>

                        {/* Error Box */}
                        {error && (
                            <div style={{
                                backgroundColor: '#ffebee',
                                color: '#c62828',
                                padding: '12px',
                                borderRadius: '8px',
                                margin: '0 16px 16px 16px',
                                border: '1px solid #ef9a9a',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="glass-form-card">
                            <div className="modern-form-grid">

                                {/* Number */}
                                <div className="modern-input-field">
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label className="field-label">Número de Tarjeta</label>
                                        <span className="card-type-label">{detectCardType(formData.card_number)}</span>
                                    </div>
                                    <input
                                        type="tel"
                                        className={`premium-html-input ${fieldErrors.card_number ? 'has-error' : ''} ${editingId ? 'disabled-field' : ''}`}
                                        value={editingId ? '**** **** **** ****' : formData.card_number}
                                        onChange={(e) => handleInputChange('card_number', e.target.value)}
                                        placeholder="0000 0000 0000 0000"
                                        maxLength={19}
                                        disabled={!!editingId}
                                    />
                                    {fieldErrors.card_number && (
                                        <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                                            <small>{fieldErrors.card_number}</small>
                                        </IonText>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="modern-input-field">
                                    <label className="field-label">Titular de la Tarjeta</label>
                                    <input
                                        type="text"
                                        className={`premium-html-input ${fieldErrors.cardholder_name ? 'has-error' : ''}`}
                                        value={formData.cardholder_name}
                                        onChange={(e) => handleInputChange('cardholder_name', e.target.value)}
                                        placeholder="Como aparece en la tarjeta"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    {fieldErrors.cardholder_name && (
                                        <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                                            <small>{fieldErrors.cardholder_name}</small>
                                        </IonText>
                                    )}
                                </div>

                                {/* Expiry & CVV */}
                                <div className="form-split-row">
                                    <div className="half modern-input-field">
                                        <label className="field-label">Expiración</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <select
                                                className={`premium-html-select ${fieldErrors.expiry_date ? 'has-error' : ''}`}
                                                value={formData.expiry_month}
                                                onChange={(e) => handleInputChange('expiry_month', e.target.value)}
                                            >
                                                <option value="">MM</option>
                                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <select
                                                className={`premium-html-select ${fieldErrors.expiry_date ? 'has-error' : ''}`}
                                                value={formData.expiry_year}
                                                onChange={(e) => handleInputChange('expiry_year', e.target.value)}
                                            >
                                                <option value="">AA</option>
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        {fieldErrors.expiry_date && (
                                            <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                                                <small>{fieldErrors.expiry_date}</small>
                                            </IonText>
                                        )}
                                    </div>

                                    <div className="half modern-input-field">
                                        <label className="field-label">CVV / CVC</label>
                                        <input
                                            type="tel"
                                            className={`premium-html-input ${fieldErrors.cvv ? 'has-error' : ''} ${editingId ? 'disabled-field' : ''}`}
                                            value={editingId ? '***' : formData.cvv}
                                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                                            placeholder="123"
                                            maxLength={4}
                                            disabled={!!editingId}
                                        />
                                        {fieldErrors.cvv && (
                                            <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                                                <small>{fieldErrors.cvv}</small>
                                            </IonText>
                                        )}
                                    </div>
                                </div>

                            </div>

                            <div className="security-notice-simple">
                                <IonIcon icon={lockClosed} className="lock-icon" />
                                <span>Transacción segura encriptada con SSL de 256 bits</span>
                            </div>
                        </div>

                        {/* Default Toggle */}
                        <div className="premium-toggle-section">
                            <div className="toggle-info">
                                <h3>Método Principal</h3>
                                <p>Usar para cobros automáticos</p>
                            </div>
                            <div className="toggle-control">
                                <input
                                    type="checkbox"
                                    checked={formData.is_default}
                                    onChange={(e) => handleInputChange('is_default', e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </div>
                        </div>

                        <button
                            className="premium-submit-button-html"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : (editingId ? 'Actualizar Información' : 'Guardar Tarjeta')}
                        </button>

                        {/* Registered Items List */}
                        <div className="registered-items-section">
                            <div className="section-header-premium">
                                <IonIcon icon={card} color="primary" />
                                <h3>Tus Métodos de Pago</h3>
                            </div>

                            {paymentMethods.length === 0 ? (
                                <div className="empty-items-placeholder">
                                    <p>No tienes tarjetas registradas aún.</p>
                                </div>
                            ) : (
                                <div className="registered-items-grid">
                                    {paymentMethods.map((method) => (
                                        <div key={method.id} className={`registered-item-card payment-card-item ${editingId === method.id ? 'active-editing' : ''}`}>
                                            <div className="item-icon-wrapper">
                                                <IonIcon
                                                    icon={method.card_type?.toLowerCase() === 'visa' ? cardOutline : (method.card_type?.toLowerCase() === 'amex' ? americanFootball : card)}
                                                    className={`card-brand-icon ${method.card_type?.toLowerCase()}`}
                                                />
                                            </div>
                                            <div className="item-info">
                                                <div className="item-title-row">
                                                    <strong>{method.card_type} **** {method.last_four}</strong>
                                                    {method.is_default && (
                                                        <span className="default-badge">
                                                            <IonIcon icon={star} /> Principal
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="item-details">{method.cardholder_name}</p>
                                                <p className="item-sub-details">Expira: {method.expiry_month}/{String(method.expiry_year).slice(-2)}</p>
                                            </div>
                                            <div className="item-actions">
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => handleEditFromList(method)}
                                                    title="Editar"
                                                >
                                                    <IonIcon icon={create} />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDelete(method.id!)}
                                                    title="Eliminar"
                                                >
                                                    <IonIcon icon={trash} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

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

export default PaymentConfigPage;
