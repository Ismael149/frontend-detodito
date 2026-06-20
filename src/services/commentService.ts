// frontend/src/services/commentService.ts - AGREGAR INTERFACES
import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = environment.apiUrl;

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Interfaces
export interface CreateCommentData {
  content: string;
  rating: number;
  parent_comment_id?: number;
}

export interface Comment {
  id: number;
  product_id: number;
  user_id: number;
  content: string;
  rating: number;
  is_approved: boolean;
  is_reported: boolean;
  report_count: number;
  created_at: string;
  username: string;
  email: string;
  report_reasons?: string;
  // Propiedades opcionales para respuestas
  reply_count?: number;
  replies?: Comment[];
  profile_picture?: string;
  edited?: boolean;
  is_active?: boolean;
  moderation_status?: string;
  comment_id?: number; // Para respuestas (DB field)
  parent_comment_id?: number; // Alias común
}

export interface CommentStats {
  total_comments: number;
  average_rating: number;
  five_stars: number;
  four_stars: number;
  three_stars: number;
  two_stars: number;
  one_stars: number;
}

export interface ProductCommentsResponse {
  success: boolean;
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: CommentStats;
}

export const commentService = {
  // Obtener comentarios de un producto
  async getProductComments(productId: number, page = 1, limit = 20): Promise<ProductCommentsResponse> {
    try {
      console.log(`📝 Obteniendo comentarios del producto ${productId}`);

      const response = await axios.get(
        `${API_URL}/products/${productId}/comments`,
        {
          params: { page, limit }
        }
      );

      console.log('✅ Comentarios obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo comentarios:', error);

      // Devolver estructura vacía en caso de error
      return {
        success: false,
        comments: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        },
        stats: {
          total_comments: 0,
          average_rating: 0,
          five_stars: 0,
          four_stars: 0,
          three_stars: 0,
          two_stars: 0,
          one_stars: 0
        }
      };
    }
  },

  // Crear comentario - CORREGIDO: Acepta 3 parámetros separados
  async createComment(productId: number, content: string, rating: number) {
    try {
      console.log(`✍️ Creando comentario para producto ${productId}`);

      const response = await axios.post(
        `${API_URL}/products/${productId}/comments`,
        { content, rating },
        getAuthHeaders()
      );

      console.log('✅ Comentario creado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creando comentario:', error);
      throw new Error(error.response?.data?.message || 'Error al crear comentario');
    }
  },

  // Eliminar comentario
  async deleteComment(commentId: number) {
    try {
      console.log(`🗑️ Eliminando comentario ${commentId}`);

      const response = await axios.delete(
        `${API_URL}/comments/${commentId}`,
        getAuthHeaders()
      );

      console.log('✅ Comentario eliminado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error eliminando comentario:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar comentario');
    }
  },

  // Reportar comentario - CORREGIDO: Solo necesita reason (string)
  async reportComment(commentId: number, reason: string) {
    try {
      console.log(`🚨 Reportando comentario ${commentId}: ${reason}`);

      const response = await axios.post(
        `${API_URL}/comments/${commentId}/report`,
        { reason },
        getAuthHeaders()
      );

      console.log('✅ Comentario reportado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error reportando comentario:', error);
      throw new Error(error.response?.data?.message || 'Error al reportar comentario');
    }
  },

  // Verificar si el usuario puede comentar (ha comprado el producto)
  async canComment(productId: number) {
    try {
      const token = authService.getToken();
      if (!token) {
        return { canComment: false, reason: 'Debe iniciar sesión' };
      }

      const response = await axios.get(
        `${API_URL}/orders/can-comment/${productId}`,
        getAuthHeaders()
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error verificando permiso para comentar:', error);
      return { canComment: false, reason: 'Error al verificar' };
    }
  },

  // Actualizar respuesta
  async updateReply(replyId: number, content: string) {
    try {
      const response = await axios.put(
        `${API_URL}/replies/${replyId}`,
        { content },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating reply:', error);
      throw error;
    }
  },

  // Eliminar respuesta
  async deleteReply(replyId: number) {
    try {
      const response = await axios.delete(`${API_URL}/replies/${replyId}`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  },

  // Actualizar comentario
  async updateComment(commentId: number, content: string, rating: number) {
    try {
      console.log(`📝 Actualizando comentario ${commentId}`);

      const response = await axios.put(
        `${API_URL}/comments/${commentId}`,
        { content, rating },
        getAuthHeaders()
      );

      console.log('✅ Comentario actualizado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error actualizando comentario:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar comentario');
    }
  },

  // Obtener respuestas de un comentario
  async getCommentReplies(commentId: number, page = 1, limit = 20) {
    try {
      console.log(`💬 Obteniendo respuestas para comentario ${commentId}`);

      const response = await axios.get(
        `${API_URL}/comments/${commentId}/replies`,
        {
          params: { page, limit }
        }
      );

      console.log('✅ Respuestas obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo respuestas:', error);
      return {
        success: false,
        replies: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  },

  // Crear respuesta
  async createReply(commentId: number, content: string) {
    try {
      console.log(`💬 Creando respuesta para comentario ${commentId}`);

      const response = await axios.post(
        `${API_URL}/comments/${commentId}/replies`,
        { content },
        getAuthHeaders()
      );

      console.log('✅ Respuesta creada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creando respuesta:', error);
      throw new Error(error.response?.data?.message || 'Error al crear respuesta');
    }
  },

};