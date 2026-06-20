import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/cart`;

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 segundos timeout para evitar bloqueos
  };
};

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number | string; // Puede venir como número o string
  image_url?: string;
  stock: number;
}

export interface Cart {
  id: number;
  user_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items: CartItem[];
  total: number | string; // Puede venir como número o string
  item_count: number;
}

// Función helper para convertir a número
const ensureNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
};

// Normalizar datos del carrito
const normalizeCart = (cart: any): Cart => {
  return {
    ...cart,
    total: ensureNumber(cart.total),
    items: cart.items?.map((item: any) => ({
      ...item,
      price: ensureNumber(item.price),
      quantity: ensureNumber(item.quantity)
    })) || []
  };
};

export const cartService = {
  // Obtener carrito del usuario (alias para getUserCart)
  async getCart(): Promise<Cart> {
    const cart = await this.getUserCart();
    return normalizeCart(cart);
  },

  // Obtener carrito del usuario
  async getUserCart(): Promise<Cart> {
    try {
      const response = await axios.get(`${API_URL}`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting user cart:', error);
      throw error;
    }
  },

  // Agregar producto al carrito
  async addToCart(productId: number, quantity: number = 1): Promise<CartItem> {
    try {
      const response = await axios.post(
        `${API_URL}/items`,
        { product_id: productId, quantity },
        getAuthHeaders()
      );
      const item = response.data;
      return {
        ...item,
        price: ensureNumber(item.price),
        quantity: ensureNumber(item.quantity)
      };
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Actualizar cantidad en carrito
  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    try {
      const response = await axios.put(
        `${API_URL}/items/${itemId}`,
        { quantity },
        getAuthHeaders()
      );
      const item = response.data;
      return {
        ...item,
        price: ensureNumber(item.price),
        quantity: ensureNumber(item.quantity)
      };
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Eliminar producto del carrito
  async removeFromCart(itemId: number): Promise<void> {
    try {
      const response = await axios.delete(
        `${API_URL}/items/${itemId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Vaciar carrito
  async clearCart(): Promise<void> {
    try {
      const response = await axios.delete(`${API_URL}`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Obtener contador de items en carrito
  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getUserCart();
      return cart.items?.reduce((count, item) => count + ensureNumber(item.quantity), 0) || 0;
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }
};