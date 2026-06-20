// frontend/src/services/adminCommentService.ts - Moderación Avanzada
import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/admin/comments`;
const MOD_URL = `${environment.apiUrl}/admin`;

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const adminCommentService = {
  // Obtener todos los comentarios con filtros
  async getComments(params: any = {}) {
    try {
      const response = await axios.get(
        `${MOD_URL}/comments`,
        { ...getAuthHeaders(), params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener comentarios');
    }
  },

  // Obtener comentarios marcados (Flagged)
  async getFlaggedComments() {
    try {
      const response = await axios.get(
        `${MOD_URL}/flagged`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener comentarios marcados');
    }
  },

  // Obtener reporte consolidado (IA + Usuarios)
  async getReports() {
    try {
      const response = await axios.get(
        `${MOD_URL}/reports`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener reportes');
    }
  },

  // Aprobar comentario marcado
  async approveFlaggedComment(commentId: number, notes?: string) {
    try {
      const response = await axios.post(
        `${MOD_URL}/flagged/${commentId}/approve`,
        { notes },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al aprobar comentario');
    }
  },

  // Rechazar comentario marcado con penalización
  async rejectFlaggedComment(commentId: number, reason: string, violationType: string = 'inappropriate_content') {
    try {
      const response = await axios.post(
        `${MOD_URL}/flagged/${commentId}/reject`,
        { reason, violationType },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al rechazar comentario');
    }
  },

  // Obtener estadísticas de moderación
  async getModerationStats() {
    try {
      const response = await axios.get(
        `${MOD_URL}/stats`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error getting stats:', error);
      return { success: false, stats: { moderation: {}, penalties: {} } };
    }
  },

  // Obtener principales infractores
  async getTopViolators() {
    try {
      const response = await axios.get(
        `${MOD_URL}/violators`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener infractores');
    }
  },

  // Levantar suspensión
  async liftSuspension(userId: number) {
    try {
      const response = await axios.post(
        `${MOD_URL}/users/${userId}/lift-suspension`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al levantar suspensión');
    }
  },

  // Eliminar comentario permanentemente
  async deleteComment(commentId: number) {
    try {
      const response = await axios.delete(
        `${MOD_URL}/comments/${commentId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar comentario');
    }
  }
};