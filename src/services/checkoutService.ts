import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/checkout`;

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export interface CheckoutData {
  cart_id: number;
  shipping_address_id: number;
  payment_method_id?: number;
  shipping_agency?: string;
  shipping_cost?: number;
}

export interface PaymentData {
  paymentMethod: string;
  lastFour: string;
}

export interface ShippingCalculation {
  address_id: number;
  cart_id: number;
}

export const checkoutService = {
  // Crear orden
  async createOrder(checkoutData: CheckoutData) {
    try {
      console.log('Creating order with data:', checkoutData);

      const response = await axios.post(
        `${API_URL}/order`,
        checkoutData,
        getAuthHeaders()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Error al crear la orden');
    }
  },

  // Procesar pago
  async processPayment(orderId: number, paymentData: PaymentData) {
    try {
      const response = await axios.post(
        `${API_URL}/${orderId}/payment`,
        paymentData,
        getAuthHeaders()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error processing payment:', error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Error al procesar el pago');
    }
  },

  // Obtener resumen del checkout
  async getCheckoutSummary(cartId: number) {
    try {
      if (!cartId) {
        throw new Error('Cart ID es requerido');
      }

      const response = await axios.get(
        `${API_URL}/summary?cart_id=${cartId}`,
        getAuthHeaders()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting checkout summary:', error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Error al obtener resumen del checkout');
    }
  },

  // Completar checkout (flujo completo)
  async completeCheckout(checkoutData: CheckoutData, paymentData: PaymentData) {
    try {
      // 1. Crear orden
      const orderResult = await this.createOrder(checkoutData);

      // 2. Procesar pago
      const paymentResult = await this.processPayment(
        orderResult.order.orderId,
        paymentData
      );

      return {
        order: orderResult,
        payment: paymentResult
      };
    } catch (error: any) {
      console.error('Error completing checkout:', error);
      throw error;
    }
  },

  async completeCheckoutAtomic(checkoutData: CheckoutData, paymentData: PaymentData) {
    try {
      const response = await axios.post(
        `${API_URL}/complete-atomic`,
        { ...checkoutData, paymentData },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error in completeCheckoutAtomic:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al procesar la compra');
    }
  },

  async calculateShipping(addressId: number, cartId: number) {

    try {
      const response = await axios.post(
        `${API_URL}/shipping/calculate`,
        {
          address_id: addressId,
          cart_id: cartId
        },
        getAuthHeaders()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error calculating shipping:', error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Error al calcular el envío');
    }
  }
};