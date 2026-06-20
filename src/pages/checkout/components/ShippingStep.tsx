import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText,
  IonLoading,
  IonAlert,
  IonList,
  IonRadioGroup,
  IonRadio,
  IonBadge,
  IonIcon
} from '@ionic/react';
import { location, calculator, checkmarkCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { addressService, Address } from '../../../services/addressService';
import { checkoutService } from '../../../services/checkoutService';
import './ShippingStep.css';

interface ShippingStepProps {
  orderData: any;
  onNextStep: (data: any) => void;
  onPreviousStep: () => void;
}

interface ShippingInfo {
  success: boolean;
  shipping_cost: number;
  estimated_days: number;
  shipping_agency: string;
  address?: string;
  error?: string;
}

const ShippingStep: React.FC<ShippingStepProps> = ({ 
  orderData, 
  onNextStep, 
  onPreviousStep 
}) => {
  const history = useHistory();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const userAddresses = await addressService.getUserAddresses();
      setAddresses(userAddresses);
      
      // Seleccionar dirección por defecto
      const defaultAddress = userAddresses.find(addr => addr.is_default);
      if (defaultAddress && defaultAddress.id) {
        setSelectedAddress(defaultAddress.id);
        calculateShipping(defaultAddress.id);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setError('Error al cargar las direcciones');
    } finally {
      setLoading(false);
    }
  };

  const calculateShipping = async (addressId: number) => {
    try {
      setCalculating(true);
      setError('');
      
      if (!orderData?.cart_id) {
        setError('No se encontró información del carrito');
        return;
      }

      const shippingData = await checkoutService.calculateShipping(
        addressId, 
        orderData.cart_id
      );
      
      setShippingInfo(shippingData);
    } catch (error: any) {
      console.error('Error calculating shipping:', error);
      setError(error.message || 'Error al calcular el envío');
      setShippingInfo(null);
    } finally {
      setCalculating(false);
    }
  };

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddress(addressId);
    calculateShipping(addressId);
  };

  const handleContinue = () => {
    if (!selectedAddress) {
      setError('Por favor selecciona una dirección de envío');
      return;
    }

    if (!shippingInfo) {
      setError('Por favor calcula el costo de envío primero');
      return;
    }

    const selectedAddressObj = addresses.find(addr => addr.id === selectedAddress);
    
    if (!selectedAddressObj) {
      setError('Dirección seleccionada no encontrada');
      return;
    }

    onNextStep({
      shipping_address_id: selectedAddress,
      shipping_address: selectedAddressObj,
      shipping_cost: shippingInfo.shipping_cost,
      shipping_agency: shippingInfo.shipping_agency,
      estimated_days: shippingInfo.estimated_days
    });
  };

  const formatAddress = (address: Address) => {
    return `${address.address_line1}, ${address.city}, ${address.state}, ${address.zip_code}`;
  };

  return (
    <div className="shipping-step">
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Dirección de Envío</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {addresses.length === 0 ? (
            <div className="empty-addresses">
              <IonText color="medium">
                <p>No tienes direcciones guardadas</p>
              </IonText>
              <IonButton 
                expand="block" 
                color="primary"
                onClick={() => history.push('/profile/address')}
              >
                Agregar Dirección
              </IonButton>
            </div>
          ) : (
            <IonList>
              <IonRadioGroup 
                value={selectedAddress} 
                onIonChange={(e) => handleAddressSelect(e.detail.value)}
              >
                {addresses.map((address) => (
                  <IonItem key={address.id}>
                    <IonRadio value={address.id} slot="start" />
                    <IonLabel>
                      <h3>{address.full_name}</h3>
                      <p>{formatAddress(address)}</p>
                      <p>{address.phone}</p>
                      {address.is_default && (
                        <IonBadge color="primary">Principal</IonBadge>
                      )}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonRadioGroup>
            </IonList>
          )}
        </IonCardContent>
      </IonCard>

      {/* Información de Envío */}
      {selectedAddress && (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Costo de Envío</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {calculating ? (
              <div className="calculating-shipping">
                <IonText>
                  <p>Calculando costo de envío...</p>
                </IonText>
              </div>
            ) : shippingInfo ? (
              <div className="shipping-details">
                <div className="shipping-row">
                  <IonText>
                    <strong>Agencia:</strong> {shippingInfo.shipping_agency}
                  </IonText>
                </div>
                <div className="shipping-row">
                  <IonText>
                    <strong>Costo:</strong> ${shippingInfo.shipping_cost.toFixed(2)}
                  </IonText>
                </div>
                <div className="shipping-row">
                  <IonText>
                    <strong>Tiempo estimado:</strong> {shippingInfo.estimated_days} días
                  </IonText>
                </div>
                <div className="shipping-row">
                  <IonText color="success">
                    <IonIcon icon={checkmarkCircle} />
                    Envío disponible para esta dirección
                  </IonText>
                </div>
              </div>
            ) : (
              <div className="no-shipping-info">
                <IonText color="medium">
                  <p>Selecciona una dirección para calcular el envío</p>
                </IonText>
              </div>
            )}
          </IonCardContent>
        </IonCard>
      )}

      {/* Resumen de Costos */}
      {(shippingInfo && orderData) && (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Resumen de Costos</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="cost-summary">
              <div className="cost-row">
                <span>Subtotal:</span>
                <span>${orderData.subtotal?.toFixed(2)}</span>
              </div>
              <div className="cost-row">
                <span>Envío:</span>
                <span>${shippingInfo.shipping_cost.toFixed(2)}</span>
              </div>
              <div className="cost-row total">
                <strong>Total:</strong>
                <strong>
                  ${((orderData.subtotal || 0) + shippingInfo.shipping_cost).toFixed(2)}
                </strong>
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      )}

      {/* Botones de acción */}
      <div className="shipping-actions">
        <IonButton 
          expand="block" 
          color="medium" 
          fill="outline"
          onClick={onPreviousStep}
        >
          Volver
        </IonButton>
        
        <IonButton 
          expand="block" 
          color="primary"
          onClick={handleContinue}
          disabled={!selectedAddress || !shippingInfo || calculating}
        >
          Continuar al Pago
        </IonButton>
      </div>

      <IonLoading isOpen={loading} message="Cargando direcciones..." />
      <IonLoading isOpen={calculating} message="Calculando envío..." />
      
      <IonAlert
        isOpen={!!error}
        onDidDismiss={() => setError('')}
        header="Error"
        message={error}
        buttons={['OK']}
      />
    </div>
  );
};

export default ShippingStep;