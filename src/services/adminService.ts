import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';
import { categoryIcons } from './categoryService';

const API_URL = `${environment.apiUrl}/admin`;

console.log('🔧 API_URL:', API_URL);

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const assignIconsToCategories = (categories: any[]) => {
  return categories.map((category) => ({
    ...category,
    icon: categoryIcons[category.name] || 'cube'
  }));
};

// Interceptor para agregar el token automáticamente
axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token && config.url?.includes('/api/admin/')) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token agregado a la solicitud:', token.substring(0, 20) + '...');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Error 401 - No autorizado, cerrando sesión');
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  async getDashboardStats() {
    try {
      console.log('Solicitando estadísticas del dashboard...');
      const response = await axios.get(`${API_URL}/stats/dashboard`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  },

  // Productos
  async getProducts(params: any = {}) {
    try {
      console.log('Solicitando productos con parámetros:', params);

      const response = await axios.get(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        },
        params
      });

      console.log('Productos recibidos:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('Error getting products:', error.response?.data || error.message);
      throw error;
    }
  },

  async deleteProduct(productId: number) {
    try {
      const response = await axios.delete(`${API_URL}/products/${productId}`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async warnProduct(productId: number, reason: string, days: number = 3) {
    try {
      const url = `${API_URL}/products/${productId}/warn`;
      console.log('🚀 Sending PATCH request to:', url, { reason, days });
      const response = await axios.patch(
        url,
        { reason, days },
        getAuthHeaders()
      );
      console.log('📥 Response from warnProduct:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error in adminService.warnProduct:', error.response?.data || error.message);
      throw error;
    }
  },

  async activateProduct(productId: number) {
    try {
      const response = await axios.patch(
        `${API_URL}/products/${productId}/activate`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error activating product:', error);
      throw error;
    }
  },

  // Usuarios
  async getUsers(params: any = {}) {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        ...getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  async toggleUserStatus(userId: number, isActive: boolean, reason?: string) {
    try {
      const response = await axios.patch(
        `${API_URL}/users/${userId}/status`,
        { isActive, reason },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  // Categorías
  async getCategories(params: any = {}) {
    try {
      const response = await axios.get(`${API_URL}/categories`, {
        ...getAuthHeaders(),
        params
      });
      return assignIconsToCategories(response.data);
    } catch (error: any) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  async getCategoryStats() {
    try {
      const response = await axios.get(`${API_URL}/categories/stats`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting category stats:', error);
      throw error;
    }
  },

  async createCategory(categoryData: any) {
    try {
      const response = await axios.post(`${API_URL}/categories`, categoryData, getAuthHeaders());
      // Asignar icono después de crear
      const categoryWithIcon = {
        ...response.data.category,
        icon: categoryIcons[categoryData.name] || 'cube'
      };
      return { ...response.data, category: categoryWithIcon };
    } catch (error: any) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(categoryId: number, categoryData: any) {
    try {
      const response = await axios.put(
        `${API_URL}/categories/${categoryId}`,
        categoryData,
        getAuthHeaders()
      );
      // Asignar icono después de actualizar
      const categoryWithIcon = {
        ...response.data.category,
        icon: categoryIcons[categoryData.name] || 'cube'
      };
      return { ...response.data, category: categoryWithIcon };
    } catch (error: any) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(categoryId: number) {
    try {
      const response = await axios.delete(`${API_URL}/categories/${categoryId}`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Pedidos
  async getOrders(params: any = {}) {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        ...getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting orders:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: number, status: string) {
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Comentarios
  // Obtener comentarios con filtros
  async getComments(filters: any = {}) {
    try {
      console.log('🔄 Fetching comments with filters:', filters);

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${API_URL}/comments?${params.toString()}`,
        getAuthHeaders()
      );

      console.log('✅ Comments fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting comments:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener comentarios');
    }
  },

  // Eliminar comentario
  async deleteComment(commentId: number) {
    try {
      console.log('🗑️ Deleting comment:', commentId);

      const response = await axios.delete(
        `${API_URL}/comments/${commentId}`,
        getAuthHeaders()
      );

      console.log('✅ Comment deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting comment:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar comentario');
    }
  },

  // Aprobar/Rechazar comentario - URL CORREGIDA ✅
  async toggleCommentApproval(commentId: number, isApproved: boolean) {
    try {
      console.log('🔄 Toggling comment approval:', { commentId, isApproved });

      // URL CORREGIDA: eliminar el "admin" duplicado
      const response = await axios.patch(
        `${API_URL}/comments/${commentId}/approval`, // ✅ CORREGIDO
        { is_approved: isApproved },
        getAuthHeaders()
      );

      console.log('✅ Comment approval toggled successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error toggling comment approval:', error);

      let errorMessage = 'Error al cambiar estado del comentario';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Ruta no encontrada. Verifica la configuración del servidor.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor';
      }

      throw new Error(errorMessage);
    }
  },

  // Obtener estadísticas de comentarios
  async getCommentStats() {
    try {
      console.log('📊 Fetching comment stats...');

      const response = await axios.get(
        `${API_URL}/stats/comments`,
        getAuthHeaders()
      );

      console.log('✅ Comment stats fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting comment stats:', error);
      // Devolver estadísticas por defecto en caso de error
      return {
        success: true,
        stats: {
          total_comments: 0,
          approved_comments: 0,
          pending_comments: 0,
          reported_comments: 0,
          unique_users: 0,
          products_with_comments: 0,
          average_rating: 0
        }
      };
    }
  },

  // Obtener reportes de comentarios
  async getCommentReports(commentId: number) {
    try {
      console.log('📋 Fetching comment reports for:', commentId);

      const response = await axios.get(
        `${API_URL}/comments/reports?commentId=${commentId}`,
        getAuthHeaders()
      );

      console.log('✅ Comment reports fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting comment reports:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener reportes del comentario');
    }
  },

  // Limpiar reportes de comentario
  async clearCommentReports(commentId: number) {
    try {
      console.log('🧹 Clearing reports for comment:', commentId);

      const response = await axios.delete(
        `${API_URL}/comments/${commentId}/reports`,
        getAuthHeaders()
      );

      console.log('✅ Comment reports cleared successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error clearing comment reports:', error);
      throw new Error(error.response?.data?.message || 'Error al limpiar reportes');
    }
  },

  // Bitácora
  async getActivityLogs(params: any = {}) {
    try {
      const response = await axios.get(`${API_URL}/activity-logs`, {
        ...getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting activity logs:', error);
      throw error;
    }
  }
};