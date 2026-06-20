import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonAlert,
  IonLoading
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { checkoutService } from '../../services/checkoutService';
import { addressService } from '../../services/addressService';
import { paymentService } from '../../services/paymentService';
import { cartService } from '../../services/cartService'; // ¡Agregar este servicio!
import CheckoutSummary from './components/CheckoutSummary';
import ShippingStep from './components/ShippingStep';
import PaymentStep from './components/PaymentStep';
import ConfirmationStep from './components/ConfirmationStep';
import './CheckoutPage.css';

type CheckoutStep = 'summary' | 'shipping' | 'payment' | 'confirmation';

const CheckoutPage: React.FC = () => {
  const history = useHistory();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [cartId, setCartId] = useState<number | null>(null); // ¡Agregar estado para cartId!

  useEffect(() => {
    validateCheckout();
  }, []);

  const validateCheckout = async () => {
    try {
      setLoading(true);

      // 1. Obtener el carrito activo del usuario
      const cart = await cartService.getUserCart();
      if (!cart || !cart.id) {
        setError('No tienes un carrito activo');
        setCheckoutReady(false);
        return;
      }

      setCartId(cart.id);

      // 2. Validar dirección
      const addressValidation = await addressService.validateAddressForCheckout();

      // 3. Validar método de pago
      const paymentValidation = await paymentService.validatePaymentMethodForCheckout();

      const isReady = addressValidation.valid && paymentValidation.valid;

      if (!isReady) {
        let errorMessage = '';
        if (!addressValidation.valid) {
          errorMessage += 'Debes configurar una dirección de envío válida. ';
        }
        if (!paymentValidation.valid) {
          errorMessage += 'Debes configurar un método de pago válido.';
        }
        setError(errorMessage.trim());
        setCheckoutReady(false);
        return;
      }

      setCheckoutReady(true);

      // 4. Cargar resumen del carrito
      const summary = await checkoutService.getCheckoutSummary(cart.id);
      setOrderData({
        ...orderData,
        cart_id: cart.id, // ¡Agregar cart_id aquí!
        cartItems: summary.cartItems,
        subtotal: summary.subtotal,
        itemCount: summary.itemCount,
        shipping_cost: summary.shippingCost
      });
    } catch (error: any) {
      console.error('Error validating checkout:', error);
      setError(error.message || 'Error al validar checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (data?: any) => {
    setOrderData({
      ...orderData,
      ...data,
      cart_id: cartId // Asegurar que cart_id esté siempre presente
    });

    const steps: CheckoutStep[] = ['summary', 'shipping', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const steps: CheckoutStep[] = ['summary', 'shipping', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      history.push('/cart');
    }
  };

  const handleBackButton = () => {
    if (currentStep === 'summary') {
      history.push('/cart');
    } else {
      handlePreviousStep();
    }
  };

  const handlePaymentComplete = (result: any) => {
    setPaymentResult(result);
    setCurrentStep('confirmation');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'summary':
        return (
          <CheckoutSummary
            orderData={orderData}
            onNextStep={handleNextStep}
          />
        );

      case 'shipping':
        return (
          <ShippingStep
            orderData={orderData}
            onNextStep={handleNextStep}
            onPreviousStep={handlePreviousStep}
          />
        );

      case 'payment':
        return (
          <PaymentStep
            orderData={orderData}
            onPaymentComplete={handlePaymentComplete}
            onPreviousStep={handlePreviousStep}
          />
        );

      case 'confirmation':
        return (
          <ConfirmationStep
            orderData={orderData}
            paymentResult={paymentResult}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <IonLoading isOpen={true} message="Validando datos..." />
    );
  }

  if (!checkoutReady) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/cart" text="" />
            </IonButtons>
            <IonTitle>Proceso de Pago</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="checkout-error">
          <div className="error-container">
            <h2>Configuración Requerida</h2>
            <p>{error}</p>
            <div className="action-buttons">
              <button
                className="btn-primary"
                onClick={() => history.push('/profile/address')}
              >
                Configurar Dirección
              </button>
              <button
                className="btn-secondary"
                onClick={() => history.push('/profile/payment')}
              >
                Configurar Pago
              </button>
            </div>
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
            <IonBackButton
              defaultHref={currentStep === 'summary' ? '/cart' : undefined}
            />
          </IonButtons>
          <IonTitle>Proceso de Pago</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="checkout-page">
        {/* Progress Bar */}
        <div className="checkout-progress">
          <div className={`progress-step ${currentStep === 'summary' ? 'active' : ''} ${['shipping', 'payment', 'confirmation'].includes(currentStep) ? 'completed' : ''}`}>
            <span>1</span>
            <label>Resumen</label>
          </div>
          <div className={`progress-step ${currentStep === 'shipping' ? 'active' : ''} ${['payment', 'confirmation'].includes(currentStep) ? 'completed' : ''}`}>
            <span>2</span>
            <label>Envío</label>
          </div>
          <div className={`progress-step ${currentStep === 'payment' ? 'active' : ''} ${['confirmation'].includes(currentStep) ? 'completed' : ''}`}>
            <span>3</span>
            <label>Pago</label>
          </div>
          <div className={`progress-step ${currentStep === 'confirmation' ? 'active' : ''}`}>
            <span>4</span>
            <label>Confirmación</label>
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Botón personalizado para retroceder en pasos intermedios */}
        {currentStep !== 'summary' && currentStep !== 'confirmation' && (
          <div className="custom-back-button">
            <button className="btn-back" onClick={handleBackButton}>
              ← Volver
            </button>
          </div>
        )}

        {/* Error Alert */}
        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError('')}
          header="Error"
          message={error}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default CheckoutPage;