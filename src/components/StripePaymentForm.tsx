import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonLoading,
  IonAlert,
  IonText,
  IonRow,
  IonCol
} from '@ionic/react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeService } from '../services/stripeService';
import { environment } from '../environments/environment';
import './StripePaymentForm.css';

interface StripePaymentFormProps {
  amount: number;
  orderId: number;
  onSuccess: (paymentResult: any) => void;
  onError: (error: string) => void;
}

// Componente de carga para cuando Stripe no está listo
const StripeLoading: React.FC = () => (
  <div className="stripe-loading">
    <IonText color="medium">
      <p>Cargando sistema de pagos...</p>
    </IonText>
  </div>
);

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  orderId,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripeReady, setStripeReady] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'VE'
    }
  });

  useEffect(() => {
    checkStripeAvailability();
    loadUserData();
  }, []);

  const checkStripeAvailability = async () => {
    const isReady = await stripeService.checkStripeStatus();
    setStripeReady(isReady);
  };

  const loadUserData = async () => {
    try {
      // Simular carga de datos del usuario
      // En una app real, esto vendría de tu contexto o API
      const userData = {
        first_name: 'Usuario',
        last_name: 'Ejemplo',
        email: 'usuario@ejemplo.com',
        phone: '+584123456789',
        address: 'Av. Principal #123',
        city: 'Caracas',
        state: 'Miranda',
        zip_code: '1060'
      };

      setBillingDetails({
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        address: {
          line1: userData.address,
          city: userData.city,
          state: userData.state,
          postal_code: userData.zip_code,
          country: 'VE'
        }
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('El sistema de pagos no está disponible');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('No se pudo cargar el formulario de tarjeta');
      }

      // Procesar pago
      const result = await stripeService.processPayment(amount, cardElement, billingDetails);
      
      if (result.success) {
        // Actualizar orden en la base de datos
        await updateOrderStatus(orderId, 'completed', result.paymentIntentId);
        onSuccess(result);
      } else {
        throw new Error(result.message || 'Error en el pago');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al procesar el pago';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string, paymentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${environment.apiUrl}/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          payment_method: 'stripe',
          payment_id: paymentId
        })
      });

      if (!response.ok) {
        throw new Error('Error updating order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true
  };

  if (!stripeReady) {
    return <StripeLoading />;
  }

  return (
    <div className="stripe-payment-form">
      <IonCard>
        <IonCardContent>
          <h3>Pago con Tarjeta</h3>
          
          {/* Información de la compra */}
          <div className="payment-summary">
            <IonText color="medium">
              <p>Total a pagar: <strong>${amount.toFixed(2)}</strong></p>
            </IonText>
          </div>

          {/* Formulario de Stripe */}
          <form onSubmit={handleSubmit} className="stripe-form">
            <div className="form-section">
              <IonItem>
                <IonLabel position="stacked">Nombre en la Tarjeta</IonLabel>
                <IonInput
                  value={billingDetails.name}
                  onIonInput={(e) => setBillingDetails({
                    ...billingDetails,
                    name: e.detail.value!
                  })}
                  required
                  placeholder="Como aparece en la tarjeta"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  value={billingDetails.email}
                  onIonInput={(e) => setBillingDetails({
                    ...billingDetails,
                    email: e.detail.value!
                  })}
                  required
                  placeholder="para recibir el comprobante"
                />
              </IonItem>
            </div>

            <div className="card-element-section">
              <IonLabel>Datos de la Tarjeta</IonLabel>
              <div className="card-element-wrapper">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            {/* Información de seguridad */}
            <div className="security-info">
              <IonText color="medium">
                <small>
                  <strong>Pago seguro con Stripe</strong> - Tu información está encriptada y protegida
                </small>
              </IonText>
            </div>

            {/* Botón de pago */}
            <IonButton
              type="submit"
              expand="block"
              disabled={!stripe || loading}
              className="payment-button"
            >
              {loading ? 'Procesando...' : `Pagar $${amount.toFixed(2)}`}
            </IonButton>
          </form>
        </IonCardContent>
      </IonCard>

      <IonLoading isOpen={loading} message="Procesando pago..." />
      <IonAlert
        isOpen={!!error}
        onDidDismiss={() => setError('')}
        header="Error de Pago"
        message={error}
        buttons={['Entendido']}
      />
    </div>
  );
};

export default StripePaymentForm;