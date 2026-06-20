import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/addresses`;

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Asegúrate de que esta interfaz esté exportada
export interface Address {
  id?: number;
  user_id?: number;
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
  created_at?: string;
  updated_at?: string;
}

export const addressService = {
  // Obtener todas las direcciones del usuario
  async getUserAddresses(): Promise<Address[]> {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting user addresses:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener direcciones');
    }
  },

  // Obtener dirección por ID
  async getAddressById(addressId: number): Promise<Address> {
    try {
      const response = await axios.get(`${API_URL}/${addressId}`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting address:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener la dirección');
    }
  },

  // Crear nueva dirección
  async createAddress(addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address> {
    try {
      const response = await axios.post(API_URL, addressData, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error creating address:', error);
      throw new Error(error.response?.data?.message || 'Error al crear la dirección');
    }
  },

  // Actualizar dirección
  async updateAddress(addressId: number, addressData: Partial<Address>): Promise<Address> {
    try {
      const response = await axios.put(`${API_URL}/${addressId}`, addressData, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error updating address:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar la dirección');
    }
  },

  // Eliminar dirección
  async deleteAddress(addressId: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${addressId}`, getAuthHeaders());
    } catch (error: any) {
      console.error('Error deleting address:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar la dirección');
    }
  },

  // Establecer dirección por defecto
  async setDefaultAddress(addressId: number): Promise<Address> {
    try {
      const response = await axios.patch(
        `${API_URL}/${addressId}/set-default`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error setting default address:', error);
      throw new Error(error.response?.data?.message || 'Error al establecer dirección por defecto');
    }
  },

  // Validar dirección para checkout
  async validateAddressForCheckout(): Promise<{ valid: boolean; hasAddress: boolean }> {
    try {
      const response = await axios.get(`${API_URL}/checkout/validate`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error validating address for checkout:', error);
      return { valid: false, hasAddress: false };
    }
  }
};