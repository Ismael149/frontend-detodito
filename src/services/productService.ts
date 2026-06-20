import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/products`;

// Función para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'multipart/form-data',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const productService = {
  async getProducts() {
    try {
      console.log('🔄 Fetching products from:', API_URL);
      const response = await axios.get(API_URL);
      console.log('✅ Products response:', response.data);

      if (!response.data || !Array.isArray(response.data)) {
        console.error('❌ Invalid products data:', response.data);
        return [];
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      console.error('❌ Error details:', error.response?.data);
      return [];
    }
  },

  async refreshProduct(id: number) {
    try {
      const response = await axios.get(`${API_URL}/${id}/refresh?t=${Date.now()}`);
      return response.data;
    } catch (error) {
      console.error('Error refreshing product:', error);
      throw error;
    }
  },

  async getProduct(id: number, forceReload = false) {
    try {
      console.log(`🔍 Buscando producto ID: ${id}`, forceReload ? '(no cache)' : '');

      // Agregar timestamp para evitar cache
      const url = forceReload
        ? `${API_URL}/${id}?t=${Date.now()}`
        : `${API_URL}/${id}`;

      const response = await axios.get(url);

      const product = response.data;


      console.log('✅ Producto procesado:', product.name);
      return product;
    } catch (error: any) {
      console.error('❌ Error fetching product:', error);
      throw error;
    }
  },

  async createProduct(productData: FormData) {
    const response = await axios.post(API_URL, productData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async updateProduct(id: number, productData: FormData) {
    const response = await axios.put(`${API_URL}/${id}`, productData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  async deleteProduct(id: number) {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });
    return response.data;
  },

  async updateProductStatus(id: number, statusData: {
    is_active: boolean;
    deactivation_reason?: string | null  // Permitir null
  }) {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, statusData, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating product status:', error);
      throw error;
    }
  },

  async getUserProducts(userId: number) {
    const response = await axios.get(`${API_URL}/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });
    return response.data;
  },

  async getRelatedProducts(productId: number, categoryId: number, limit: number = 8) {
    try {
      const allProducts = await this.getProducts();

      // Filtrar productos de la misma categoría, excluyendo el actual
      return allProducts
        .filter(product =>
          product.id !== productId &&
          product.category_id === categoryId
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting related products:', error);
      return [];
    }
  },

  async getAlsoViewedProducts(productId: number, limit: number = 4) {
    try {
      const allProducts = await this.getProducts();

      // Simular productos que otros usuarios vieron
      // En una app real, esto vendría de analytics
      return allProducts
        .filter(product => product.id !== productId)
        .sort(() => Math.random() - 0.5) // Mezclar aleatoriamente
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting also viewed products:', error);
      return [];
    }
  },

  async incrementView(id: number) {
    try {
      await axios.post(`${API_URL}/${id}/view`);
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  }
};

