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
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonToggle,
  IonAlert,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonLoading,
  IonCard,
  IonCardContent,
  IonBadge
} from '@ionic/react';
import {
  add, location, home, business, star, trash, create,
  checkmarkCircle, navigate
} from 'ionicons/icons';
import './AddressManagementPage.css';

interface Address {
  id?: number;
  user_id: number;
  address_type: 'shipping' | 'billing';
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

const AddressManagementPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Omit<Address, 'id' | 'user_id'>>({
    address_type: 'shipping',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Venezuela',
    is_default: false
  });

  // Estados de Venezuela para el select
  const venezuelaStates = [
    'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
    'Carabobo', 'Cojedes', 'Delta Amacuro', 'Falcón', 'Guárico', 'Lara',
    'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa',
    'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
  ];

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      // Aquí iría la llamada a la API
      // const addressesData = await addressService.getUserAddresses();
      // setAddresses(addressesData);

      // Datos de ejemplo por ahora
      setAddresses([
        {
          id: 1,
          user_id: 1,
          address_type: 'shipping',
          full_name: 'Juan Pérez',
          phone: '+584123456789',
          address_line1: 'Av. Principal #123',
          city: 'Caracas',
          state: 'Miranda',
          zip_code: '1060',
          country: 'Venezuela',
          is_default: true
        }
      ]);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAddress(null);
    setFormData({
      address_type: 'shipping',
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'Venezuela',
      is_default: addresses.length === 0 // Primera dirección por defecto
    });
    setShowModal(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      address_type: address.address_type,
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      country: address.country,
      is_default: address.is_default
    });
    setShowModal(true);
  };

  const handleDelete = (address: Address) => {
    setAddressToDelete(address);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;

    try {
      // await addressService.deleteAddress(addressToDelete.id!);
      setAddresses(addresses.filter(a => a.id !== addressToDelete.id));
      setShowDeleteAlert(false);
      setAddressToDelete(null);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAddress) {
        // Actualizar dirección
        // await addressService.updateAddress(editingAddress.id!, formData);
        setAddresses(addresses.map(a =>
          a.id === editingAddress.id ? { ...a, ...formData } : a
        ));
      } else {
        // Crear nueva dirección
        // const newAddress = await addressService.createAddress(formData);
        const newAddress = {
          id: Date.now(),
          user_id: 1,
          ...formData
        };
        setAddresses([...addresses, newAddress]);
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const setDefaultAddress = async (addressId: number) => {
    try {
      // await addressService.setDefaultAddress(addressId);
      setAddresses(addresses.map(a => ({
        ...a,
        is_default: a.id === addressId
      })));
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const shippingAddresses = addresses.filter(a => a.address_type === 'shipping');
  const billingAddresses = addresses.filter(a => a.address_type === 'billing');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" text="" />
          </IonButtons>
          <IonTitle>Mis Direcciones</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleCreate}>
              <IonIcon icon={add} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="address-management">
        {/* Direcciones de Envío */}
        <div className="address-section">
          <h3 className="section-title">
            <IonIcon icon={navigate} />
            Direcciones de Envío
          </h3>

          {shippingAddresses.length === 0 ? (
            <IonCard className="empty-card">
              <IonCardContent>
                <IonIcon icon={location} size="large" />
                <p>No tienes direcciones de envío configuradas</p>
                <IonButton onClick={handleCreate}>
                  Agregar Primera Dirección
                </IonButton>
              </IonCardContent>
            </IonCard>
          ) : (
            <IonList>
              {shippingAddresses.map((address) => (
                <IonItem key={address.id} className="address-item">
                  <IonLabel>
                    <div className="address-header">
                      <IonText>
                        <h4>{address.full_name}</h4>
                      </IonText>
                      {address.is_default && (
                        <IonBadge color="success">
                          <IonIcon icon={star} />
                          Principal
                        </IonBadge>
                      )}
                    </div>

                    <p>{address.address_line1}</p>
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    <p>{address.city}, {address.state} {address.zip_code}</p>
                    <p>{address.country}</p>
                    <p>Tel: {address.phone}</p>
                  </IonLabel>

                  <div className="address-actions">
                    {!address.is_default && (
                      <IonButton
                        fill="clear"
                        size="small"
                        onClick={() => setDefaultAddress(address.id!)}
                      >
                        <IonIcon icon={star} />
                      </IonButton>
                    )}
                    <IonButton
                      fill="clear"
                      size="small"
                      onClick={() => handleEdit(address)}
                    >
                      <IonIcon icon={create} />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      size="small"
                      color="danger"
                      onClick={() => handleDelete(address)}
                    >
                      <IonIcon icon={trash} />
                    </IonButton>
                  </div>
                </IonItem>
              ))}
            </IonList>
          )}
        </div>

        {/* Modal para crear/editar dirección */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowModal(false)}>Cancelar</IonButton>
              </IonButtons>
              <IonTitle>
                {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton type="submit" form="addressForm" strong={true}>
                  Guardar
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <form id="addressForm" onSubmit={handleSubmit}>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Tipo de Dirección</IonLabel>
                  <IonSelect
                    value={formData.address_type}
                    onIonChange={(e) => setFormData({ ...formData, address_type: e.detail.value })}
                  >
                    <IonSelectOption value="shipping">Envío</IonSelectOption>
                    <IonSelectOption value="billing">Facturación</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Nombre Completo *</IonLabel>
                  <IonInput
                    value={formData.full_name}
                    onIonInput={(e) => setFormData({ ...formData, full_name: e.detail.value! })}
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Teléfono *</IonLabel>
                  <IonInput
                    type="tel"
                    value={formData.phone}
                    onIonInput={(e) => setFormData({ ...formData, phone: e.detail.value! })}
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Dirección Línea 1 *</IonLabel>
                  <IonInput
                    value={formData.address_line1}
                    onIonInput={(e) => setFormData({ ...formData, address_line1: e.detail.value! })}
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Dirección Línea 2 (Opcional)</IonLabel>
                  <IonInput
                    value={formData.address_line2}
                    onIonInput={(e) => setFormData({ ...formData, address_line2: e.detail.value! })}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Ciudad *</IonLabel>
                  <IonInput
                    value={formData.city}
                    onIonInput={(e) => setFormData({ ...formData, city: e.detail.value! })}
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Estado *</IonLabel>
                  <IonSelect
                    value={formData.state}
                    onIonChange={(e) => setFormData({ ...formData, state: e.detail.value })}
                    required
                  >
                    {venezuelaStates.map(state => (
                      <IonSelectOption key={state} value={state}>
                        {state}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Código Postal *</IonLabel>
                  <IonInput
                    value={formData.zip_code}
                    onIonInput={(e) => setFormData({ ...formData, zip_code: e.detail.value! })}
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">País</IonLabel>
                  <IonInput
                    value={formData.country}
                    disabled
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>Establecer como dirección principal</IonLabel>
                  <IonToggle
                    checked={formData.is_default}
                    onIonChange={(e) => setFormData({ ...formData, is_default: e.detail.checked })}
                    slot="end"
                  />
                </IonItem>
              </IonList>
            </form>
          </IonContent>
        </IonModal>

        {/* Alerta de confirmación para eliminar */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Eliminar Dirección'}
          message={`¿Estás seguro de que quieres eliminar esta dirección?`}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Eliminar', role: 'destructive', handler: confirmDelete }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AddressManagementPage;