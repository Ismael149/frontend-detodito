import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/payment-methods`;

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export interface PaymentMethod {
  id?: number;
  user_id?: number;
  card_type: string;
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentMethodCreate {
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  cardholder_name: string;
  is_default?: boolean;
}

export const paymentService = {
  // Obtener todos los métodos de pago del usuario
  async getUserPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting payment methods:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener métodos de pago');
    }
  },

  // Obtener método de pago por ID
  async getPaymentMethodById(methodId: number): Promise<PaymentMethod> {
    try {
      const response = await axios.get(`${API_URL}/${methodId}`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting payment method:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener el método de pago');
    }
  },

  // Crear nuevo método de pago
  async createPaymentMethod(methodData: PaymentMethodCreate): Promise<PaymentMethod> {
    try {
      const response = await axios.post(API_URL, methodData, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment method:', error);
      throw new Error(error.response?.data?.message || 'Error al crear método de pago');
    }
  },

  // Actualizar método de pago
  async updatePaymentMethod(methodId: number, methodData: Partial<PaymentMethod>): Promise<PaymentMethod> {
    try {
      const response = await axios.put(`${API_URL}/${methodId}`, methodData, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error updating payment method:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar método de pago');
    }
  },

  // Eliminar método de pago
  async deletePaymentMethod(methodId: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${methodId}`, getAuthHeaders());
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar método de pago');
    }
  },

  // Establecer método de pago por defecto
  async setDefaultPaymentMethod(methodId: number): Promise<PaymentMethod> {
    try {
      const response = await axios.patch(
        `${API_URL}/${methodId}/set-default`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error setting default payment method:', error);
      throw new Error(error.response?.data?.message || 'Error al establecer método de pago por defecto');
    }
  },

  // Validar método de pago para checkout
  async validatePaymentMethodForCheckout(): Promise<{ valid: boolean; hasMethod: boolean }> {
    try {
      const response = await axios.get(`${API_URL}/checkout/validate`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error validating payment method for checkout:', error);
      return { valid: false, hasMethod: false };
    }
  }
};