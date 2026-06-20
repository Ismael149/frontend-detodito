import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonLoading,
  IonAlert,
  IonIcon,
  IonText
} from '@ionic/react';
import { card, lockClosed, alertCircle, star, checkmarkCircle, cardOutline, americanFootball } from 'ionicons/icons';
import { checkoutService } from '../../../services/checkoutService';
import { paymentService, PaymentMethod } from '../../../services/paymentService';
import './PaymentStep.css';

interface PaymentStepProps {
  orderData: any;
  onPaymentComplete: (result: any) => void;
  onPreviousStep: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  orderData,
  onPaymentComplete,
  onPreviousStep
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  React.useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await paymentService.getUserPaymentMethods();
      setPaymentMethods(methods);

      const defaultMethod = methods.find(m => m.is_default) || methods[0];
      if (defaultMethod) {
        handleCardSelect(defaultMethod);
      }
    } catch (err) {
      console.error('Error loading payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelect = (method: PaymentMethod) => {
    setSelectedMethodId(method.id || null);
    setCardData({
      cardNumber: `**** **** **** ${method.last_four}`,
      expiryDate: `${method.expiry_month.toString().padStart(2, '0')}/${method.expiry_year.toString().slice(-2)}`,
      cvv: '***',
      cardholderName: method.cardholder_name
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validar que todos los datos necesarios estén presentes
      if (!orderData?.cart_id || !orderData?.shipping_address_id) {
        setError('Información de orden incompleta. Por favor vuelve al paso anterior.');
        return;
      }

      if (!orderData.shipping_cost && orderData.shipping_cost !== 0) {
        setError('Costo de envío no calculado. Por favor vuelve al paso anterior.');
        return;
      }

      // Validar datos de tarjeta
      if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv || !cardData.cardholderName) {
        setError('Por favor completa todos los datos de la tarjeta');
        return;
      }

      // Preparar datos para el checkout
      const checkoutData = {
        cart_id: orderData.cart_id,
        shipping_address_id: orderData.shipping_address_id,
        payment_method_id: selectedMethodId || 1,
        shipping_agency: orderData.shipping_agency || 'Envíos Express VE',
        shipping_cost: orderData.shipping_cost || 6.50
      };

      // Preparar datos de pago
      const paymentData = {
        paymentMethod: 'card',
        lastFour: cardData.cardNumber.slice(-4)
      };

      console.log('Completing atomic checkout with:', { checkoutData, paymentData });

      // Completar checkout atómico (Orden + Pago en una sola transacción)
      const result = await checkoutService.completeCheckoutAtomic(checkoutData, paymentData);

      console.log('Atomic checkout completed:', result);


      onPaymentComplete({
        orderId: result.order.order.orderId,
        lastFour: paymentData.lastFour,
        total: result.order.order.total
      });

    } catch (error: any) {
      console.error('Error completing checkout:', error);
      setError(error.message || 'Error al procesar el pago. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="payment-step glass-card">
      <div className="checkout-section-header">
        <IonIcon icon={card} color="primary" />
        <h3>Método de Pago</h3>
      </div>

      <div className="payment-content-grid">
        {/* Card Selection List */}
        <div className="payment-methods-list">
          <p className="selection-label">Tus Tarjetas Guardadas</p>
          {paymentMethods.length === 0 ? (
            <div className="empty-selection-placeholder">
              <p>No tienes tarjetas registradas.</p>
              <IonButton fill="clear" onClick={() => window.open('/profile/payment', '_self')}>
                Configurar Pago
              </IonButton>
            </div>
          ) : (
            <div className="registered-items-grid">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`registered-item-card payment-card-item selectable ${selectedMethodId === method.id ? 'active-editing' : ''}`}
                  onClick={() => handleCardSelect(method)}
                >
                  <div className="item-icon-wrapper">
                    <IonIcon
                      icon={method.card_type?.toLowerCase() === 'visa' ? cardOutline : (method.card_type?.toLowerCase() === 'amex' ? americanFootball : card)}
                      className={`card-brand-icon ${method.card_type?.toLowerCase()}`}
                    />
                  </div>
                  <div className="item-info">
                    <div className="item-title-row">
                      <strong>{method.card_type} **** {method.last_four}</strong>
                      {method.is_default && <span className="default-badge"><IonIcon icon={star} /> Principal</span>}
                    </div>
                    <p className="item-details">{method.cardholder_name}</p>
                    <p className="item-sub-details">Expira: {method.expiry_month}/{String(method.expiry_year).slice(-2)}</p>
                  </div>
                  <div className="selection-indicator">
                    <div className={`radio-outer ${selectedMethodId === method.id ? 'selected' : ''}`}>
                      <div className="radio-inner" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Card Details Form (Read-onlyish) */}
        <div className="selected-card-preview">
          <IonCard className="preview-card-glass">
            <IonCardContent>
              <div className="payment-method-header" style={{ marginBottom: '20px' }}>
                <IonText color="primary">
                  <h3 style={{ margin: 0 }}>Confirmar Datos</h3>
                </IonText>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                  Verifica los detalles antes de completar
                </p>
              </div>

              <div className="card-input-group">
                <div className="modern-input-field luxe">
                  <label className="field-label">Número de Tarjeta</label>
                  <input
                    type="text"
                    className="premium-html-input disabled-field"
                    value={cardData.cardNumber}
                    readOnly
                  />
                </div>

                <div className="modern-input-field luxe">
                  <label className="field-label">Titular</label>
                  <input
                    type="text"
                    className="premium-html-input disabled-field"
                    value={cardData.cardholderName}
                    readOnly
                  />
                </div>

                <div className="form-split-row">
                  <div className="half modern-input-field luxe">
                    <label className="field-label">Expira</label>
                    <input
                      type="text"
                      className="premium-html-input disabled-field"
                      value={cardData.expiryDate}
                      readOnly
                    />
                  </div>
                  <div className="half modern-input-field luxe">
                    <label className="field-label">CVV</label>
                    <input
                      type="password"
                      className="premium-html-input disabled-field"
                      value={cardData.cvv}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </div>

      {/* Resumen de la orden */}
      <div className="order-summary-box glass-accent">
        <h4>Resumen de la Orden</h4>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${orderData?.subtotal?.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Envío:</span>
          <span>${orderData?.shipping_cost?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="summary-row total">
          <strong>Total a Pagar:</strong>
          <strong>
            ${((orderData?.subtotal || 0) + (orderData?.shipping_cost || 0)).toFixed(2)}
          </strong>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="checkout-actions">
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
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Completar Compra'}
        </IonButton>
      </div>

      <IonLoading isOpen={loading} message="Procesando pago..." />

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

export default PaymentStep;