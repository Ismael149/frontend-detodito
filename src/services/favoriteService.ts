import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/favorites`;

interface FavoriteResponse {
  isFavorite: boolean;
  favorite?: any;
  message?: string;
}

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const favoriteService = {
  async getFavorites() {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());

      return response.data;
    } catch (error: any) {
      console.error('Error getting favorites:', error);

      if (error.response?.status === 401) {
        authService.logout();
        throw new Error('Sesión expirada');
      }

      throw error;
    }
  },

  async addFavorite(productId: number): Promise<FavoriteResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/add`,
        { product_id: productId },
        getAuthHeaders()
      );
      return { ...response.data, isFavorite: true };
    } catch (error: any) {
      console.error('Error adding favorite:', error);

      // Si el error es que ya existe, devolver éxito
      if (error.response?.status === 400 &&
        error.response?.data?.message?.includes('ya existe')) {
        return { isFavorite: true, message: 'Ya está en favoritos' };
      }

      throw error;
    }
  },

  async removeFavorite(productId: number): Promise<FavoriteResponse> {
    try {
      const response = await axios.delete(
        `${API_URL}/remove/${productId}`,
        getAuthHeaders()
      );
      return { ...response.data, isFavorite: false };
    } catch (error: any) {
      console.error('Error removing favorite:', error);

      // Si el error es que no existe, devolver éxito
      if (error.response?.status === 404) {
        return { isFavorite: false, message: 'No estaba en favoritos' };
      }

      throw error;
    }
  },

  async checkFavorite(productId: number): Promise<{ isFavorite: boolean }> {
    try {
      const response = await axios.get(
        `${API_URL}/check/${productId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error checking favorite:', error);

      // Si es error 404, el producto no es favorito
      if (error.response?.status === 404) {
        return { isFavorite: false };
      }

      // Para otros errores, lanzar excepción
      throw error;
    }
  },
};

const getFullImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return '/assets/images/placeholder.png';

  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  if (imagePath.startsWith('/uploads')) {
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }

  return imagePath;
};