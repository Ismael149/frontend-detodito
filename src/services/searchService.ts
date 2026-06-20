import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/search`;

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Cache para resultados de búsqueda
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Definir tipo para filtros
interface SearchFilters {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  sortBy?: string;
  hasDiscount?: boolean;
  freeShipping?: boolean;
  inStock?: boolean;
  page?: number;
}

export const searchService = {
  async searchProducts(query: string, filters: SearchFilters = {}, useCache = true) {
    try {
      const cacheKey = JSON.stringify({ query, filters, type: 'search' });
      
      if (useCache && searchCache.has(cacheKey)) {
        const cached = searchCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.data;
        }
      }

      const params = new URLSearchParams();
      
      // Agregar query solo si existe y tiene al menos 2 caracteres
      if (query && query.trim().length >= 2) {
        params.append('q', query.trim());
      }
      
      // Definir las claves de filtro como strings específicas
      const filterKeys: Array<keyof SearchFilters> = [
        'category', 'minPrice', 'maxPrice', 'condition', 
        'sortBy', 'hasDiscount', 'freeShipping', 'inStock', 'page'
      ];
      
      filterKeys.forEach((key: keyof SearchFilters) => {
        const value = filters[key];
        
        // Solo agregar si tiene valor y no es el valor por defecto
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'hasDiscount' || key === 'freeShipping' || key === 'inStock') {
            // Solo enviar si es true
            if (value === true) {
              params.append(key, 'true');
            }
          } else if (key === 'condition') {
            // Solo enviar si tiene valor y no es vacío
            if (value !== '') {
              params.append(key, value.toString());
            }
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const url = `${API_URL}?${params.toString()}`;
      console.log('🔍 Search URL:', url);

      const response = await axios.get(url);
      
      if (useCache) {
        searchCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  async searchWithFilters(filters: SearchFilters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Definir las claves de filtro
      const filterKeys: Array<keyof SearchFilters> = [
        'category', 'minPrice', 'maxPrice', 'condition', 
        'sortBy', 'hasDiscount', 'freeShipping', 'inStock'
      ];
      
      filterKeys.forEach((key: keyof SearchFilters) => {
        const value = filters[key];
        
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'hasDiscount' || key === 'freeShipping' || key === 'inStock') {
            if (value === true) {
              params.append(key, 'true');
            }
          } else if (key === 'condition' && value === '') {
            // No enviar condición vacía
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const url = `${API_URL}/filter?${params.toString()}`;
      console.log('🔍 Filter search URL:', url);

      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error searching with filters:', error);
      throw error;
    }
  },

  async getSearchSuggestions(query: string) {
    try {
      if (!query || query.length < 2) {
        return { suggestions: [] };
      }

      const response = await axios.get(`${API_URL}/suggestions?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting suggestions:', error);
      return { suggestions: [] };
    }
  },

  async getSearchHistory() {
    try {
      const response = await axios.get(`${API_URL}/history`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting search history:', error);
      return [];
    }
  },

  async getRecommendations(limit: number = 12, type: 'personalized' | 'trending' | 'similar' = 'personalized', productId?: number, offset: number = 0) {
    try {
      let url = `${API_URL}/recommendations?limit=${limit}&type=${type}&offset=${offset}`;
      if (type === 'similar' && productId) {
        url += `&productId=${productId}`;
      }
      
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting recommendations:', error);
      return { recommendations: [], total: 0 };
    }
  },

  async getRealTimeFeed(limit: number = 30) {
    try {
      const response = await axios.get(`${API_URL}/feed?limit=${limit}`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting real-time feed:', error);
      return { recommendations: [], total: 0 };
    }
  },

  async recordProductView(productId: number) {
    try {
      const response = await axios.post(
        `${API_URL}/record-view`,
        { productId },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error recording product view:', error);
    }
  },

  async recordSearchClick(query: string) {
    try {
      const response = await axios.post(
        `${API_URL}/record-click`,
        { query },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error recording search click:', error);
    }
  },

  // Limpiar cache
  clearCache() {
    searchCache.clear();
  },

  // Obtener estadísticas de búsqueda
  async getSearchStats() {
    try {
      const response = await axios.get(`${API_URL}/stats`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting search stats:', error);
      return {};
    }
  }
};