import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonLoading,
  IonToast,
  IonIcon,
  IonText
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { navigate, checkmarkCircle, trash, create, star, add } from 'ionicons/icons';
import { addressService, Address } from '../../services/addressService';
import './AddressConfigPage.css';

const AddressConfigPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const initialFormState: Address = {
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Venezuela',
    is_default: false,
    address_type: 'shipping'
  };

  const [formData, setFormData] = useState<Address>(initialFormState);

  // Validation State
  const [error, setError] = useState(''); // Global error
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const venezuelaStates = [
    'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
    'Carabobo', 'Cojedes', 'Delta Amacuro', 'Falcón', 'Guárico', 'Lara',
    'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa',
    'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
  ];

  useEffect(() => {
    loadAllAddresses();
    if (id) {
      loadAddress(parseInt(id));
    }
  }, [id]);

  const loadAllAddresses = async () => {
    try {
      const data = await addressService.getUserAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Error loading all addresses:', err);
    }
  };

  const loadAddress = async (addressId: number) => {
    try {
      setLoading(true);
      const data = await addressService.getAddressById(addressId);
      setFormData(data);
      setEditingId(addressId);
    } catch (err) {
      console.error(err);
      setError('Error al cargar la dirección');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFromList = (addr: Address) => {
    setFormData({ ...addr });
    setEditingId(addr.id || null);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (addressId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) return;

    setLoading(true);
    try {
      await addressService.deleteAddress(addressId);
      setToastMessage('Dirección eliminada');
      setShowToast(true);
      loadAllAddresses();
      if (editingId === addressId) {
        setFormData(initialFormState);
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
      setError('Error al eliminar la dirección');
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

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.full_name.trim()) {
      errors.full_name = 'El nombre completo es obligatorio';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono es obligatorio';
      isValid = false;
    }

    if (!formData.address_line1.trim()) {
      errors.address_line1 = 'La dirección es obligatoria';
      isValid = false;
    }

    if (!formData.city.trim()) {
      errors.city = 'La ciudad es obligatoria';
      isValid = false;
    }

    if (!formData.state.trim()) {
      errors.state = 'El estado es obligatorio';
      isValid = false;
    }

    if (!formData.zip_code.trim()) {
      errors.zip_code = 'El código postal es obligatorio';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleInputChange = (field: keyof Address, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear specific field error
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear global error
    if (error) setError('');
  };

  const handleSave = async () => {
    if (!validate()) {
      setError('Por favor, corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await addressService.updateAddress(editingId, formData);
        setToastMessage('Dirección actualizada exitosamente');
      } else {
        await addressService.createAddress(formData);
        setToastMessage('Dirección guardada exitosamente');
      }

      setShowToast(true);
      resetForm();
      loadAllAddresses();

      if (id) {
        setTimeout(() => history.push('/profile/address'), 1500);
      }
    } catch (err) {
      console.error(err);
      setError('Error al guardar la dirección');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="premium-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="" defaultHref="/profile" />
          </IonButtons>
          <IonTitle>{editingId ? 'Editar Dirección' : 'Nueva Dirección'}</IonTitle>
          <IonButtons slot="end">
            {editingId && (
              <IonButton onClick={resetForm} color="medium">
                Limpiar
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="address-config-page-container">
        <div className="address-content-area">
          <div className="form-wrapper-universal">

            <div className="form-intro-compact">
              <IonIcon icon={navigate} className="intro-icon-premium" />
              <div className="intro-text-group">
                <h2>Detalles de Envío</h2>
                <p>Ingresa la información para tus entregas</p>
              </div>
            </div>

            {/* Global Error Box */}
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

                {/* Full Name */}
                <div className="modern-input-field">
                  <label className="field-label">Nombre Completo</label>
                  <input
                    type="text"
                    className={`premium-html-input ${fieldErrors.full_name ? 'has-error' : ''}`}
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Ej. Juan Pérez"
                  />
                  {fieldErrors.full_name && (
                    <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                      <small>{fieldErrors.full_name}</small>
                    </IonText>
                  )}
                </div>

                {/* Phone */}
                <div className="modern-input-field">
                  <label className="field-label">Teléfono</label>
                  <input
                    type="tel"
                    className={`premium-html-input ${fieldErrors.phone ? 'has-error' : ''}`}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+58 412 1234567"
                  />
                  {fieldErrors.phone && (
                    <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                      <small>{fieldErrors.phone}</small>
                    </IonText>
                  )}
                </div>

                {/* Address Line 1 */}
                <div className="modern-input-field">
                  <label className="field-label">Dirección (Calle, Edificio, Casa)</label>
                  <input
                    type="text"
                    className={`premium-html-input ${fieldErrors.address_line1 ? 'has-error' : ''}`}
                    value={formData.address_line1}
                    onChange={(e) => handleInputChange('address_line1', e.target.value)}
                    placeholder="Av. Principal, Edif. Central"
                  />
                  {fieldErrors.address_line1 && (
                    <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                      <small>{fieldErrors.address_line1}</small>
                    </IonText>
                  )}
                </div>

                {/* Address Line 2 */}
                <div className="modern-input-field">
                  <label className="field-label">Referencia / Punto de Control (Opcional)</label>
                  <input
                    type="text"
                    className="premium-html-input"
                    value={formData.address_line2 || ''}
                    onChange={(e) => handleInputChange('address_line2', e.target.value)}
                    placeholder="Frente a la plaza..."
                  />
                </div>

                {/* Split Row: City & State */}
                <div className="form-split-row">
                  <div className="half modern-input-field">
                    <label className="field-label">Ciudad</label>
                    <input
                      type="text"
                      className={`premium-html-input ${fieldErrors.city ? 'has-error' : ''}`}
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Caracas"
                    />
                    {fieldErrors.city && (
                      <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                        <small>{fieldErrors.city}</small>
                      </IonText>
                    )}
                  </div>

                  <div className="half modern-input-field">
                    <label className="field-label">Estado</label>
                    <select
                      className={`premium-html-select ${fieldErrors.state ? 'has-error' : ''}`}
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    >
                      <option value="">Seleccionar</option>
                      {venezuelaStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {fieldErrors.state && (
                      <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                        <small>{fieldErrors.state}</small>
                      </IonText>
                    )}
                  </div>
                </div>

                {/* Split Row: Zip & Country */}
                <div className="form-split-row">
                  <div className="half modern-input-field">
                    <label className="field-label">Código Postal</label>
                    <input
                      type="text"
                      className={`premium-html-input ${fieldErrors.zip_code ? 'has-error' : ''}`}
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      placeholder="1010"
                    />
                    {fieldErrors.zip_code && (
                      <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                        <small>{fieldErrors.zip_code}</small>
                      </IonText>
                    )}
                  </div>

                  <div className="half modern-input-field">
                    <label className="field-label">País</label>
                    <input
                      type="text"
                      className="premium-html-input disabled-field"
                      value={formData.country}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Default Toggle */}
            <div className="premium-toggle-section">
              <div className="toggle-info">
                <h3>Dirección Principal</h3>
                <p>Usar esta dirección por defecto</p>
              </div>
              <div className="toggle-control">
                {/* Visual Fake Toggle or IonToggle if visible. Using checkbox for HTML purity or IonToggle */}
                {/* Using standard checkbox styled as switch is complex, let's use a simple checkbox or IonToggle if compatible */}
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
              {loading ? 'Guardando...' : (editingId ? 'Actualizar Dirección' : 'Guardar Dirección')}
            </button>

            {/* List Section */}
            <div className="registered-items-section">
              <div className="section-header-premium">
                <IonIcon icon={navigate} color="primary" />
                <h3>Tus Direcciones Guardadas</h3>
              </div>

              {addresses.length === 0 ? (
                <div className="empty-items-placeholder">
                  <p>No tienes direcciones registradas aún.</p>
                </div>
              ) : (
                <div className="registered-items-grid">
                  {addresses.map((addr) => (
                    <div key={addr.id} className={`registered-item-card ${editingId === addr.id ? 'active-editing' : ''}`}>
                      <div className="item-info">
                        <div className="item-title-row">
                          <strong>{addr.full_name}</strong>
                          {addr.is_default && (
                            <span className="default-badge">
                              <IonIcon icon={star} /> Principal
                            </span>
                          )}
                        </div>
                        <p className="item-details">{addr.address_line1}</p>
                        <p className="item-sub-details">{addr.city}, {addr.state}</p>
                        <p className="item-sub-details">{addr.phone}</p>
                      </div>
                      <div className="item-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEditFromList(addr)}
                          title="Editar"
                        >
                          <IonIcon icon={create} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(addr.id!)}
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

        <IonLoading isOpen={loading} message="Procesando..." />
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

export default AddressConfigPage;
