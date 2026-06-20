import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../environments/environment';

// Inicializar Stripe
let stripePromise: Promise<Stripe | null>;

export const initializeStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(environment.stripePublishableKey);
  }
  return stripePromise;
};

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentMethodData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export const stripeService = {
  // Crear Payment Intent en el servidor
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntentResult> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${environment.apiUrl}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          amount: Math.round(amount * 100), // Convertir a centavos
          currency 
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('No se pudo conectar con el servicio de pagos');
    }
  },

  // Confirmar pago con tarjeta
  async confirmCardPayment(clientSecret: string, paymentMethodId: string): Promise<any> {
    try {
      const stripe = await initializeStripe();
      if (!stripe) {
        throw new Error('Stripe no está inicializado');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });

      if (error) {
        throw new Error(error.message || 'Error al procesar el pago');
      }
      
      return paymentIntent;
    } catch (error) {
      console.error('Error confirming card payment:', error);
      throw error;
    }
  },

  // Crear método de pago
  async createPaymentMethod(cardElement: any, billingDetails: any): Promise<string> {
    try {
      const stripe = await initializeStripe();
      if (!stripe) {
        throw new Error('Stripe no está inicializado');
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails
      });

      if (error) {
        throw new Error(error.message || 'Error al crear método de pago');
      }
      
      if (!paymentMethod?.id) {
        throw new Error('No se pudo crear el método de pago');
      }
      
      return paymentMethod.id;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  },

  // Procesar pago completo
  async processPayment(amount: number, cardElement: any, billingDetails: any): Promise<any> {
    try {
      // 1. Crear Payment Intent
      const { clientSecret, paymentIntentId } = await this.createPaymentIntent(amount);
      
      // 2. Crear Payment Method
      const paymentMethodId = await this.createPaymentMethod(cardElement, billingDetails);
      
      // 3. Confirmar pago
      const paymentIntent = await this.confirmCardPayment(clientSecret, paymentMethodId);
      
      return {
        success: true,
        paymentIntent,
        paymentIntentId,
        message: 'Pago procesado exitosamente'
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Verificar estado de Stripe
  async checkStripeStatus(): Promise<boolean> {
    try {
      const stripe = await initializeStripe();
      return stripe !== null;
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      return false;
    }
  }
};