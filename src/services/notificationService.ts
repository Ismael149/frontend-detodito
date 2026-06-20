import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/notifications`;

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  image_url?: string;
  action_url?: string;
  related_id?: number;
  related_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationSetting {
  id: number;
  category: string;
  via_email: boolean;
  via_push: boolean;
  via_in_app: boolean;
  is_active: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: { [key: string]: number };
}

// Emulador de EventEmitter simple
const listeners: ((count: number) => void)[] = [];
let currentUnreadCount = 0;

export const notificationService = {
  // Suscribirse a cambios en el contador
  subscribe(callback: (count: number) => void) {
    listeners.push(callback);
    callback(currentUnreadCount);
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  // Actualizar el contador global
  setUnreadCount(count: number) {
    currentUnreadCount = count;
    listeners.forEach(listener => listener(count));
  },

  // Obtener el contador actual
  getUnreadCount() {
    return currentUnreadCount;
  },

  // Obtener estadísticas y actualizar contador
  async refreshStats() {
    if (!authService.isAuthenticated()) {
      this.setUnreadCount(0);
      return;
    }
    try {
      // Usamos limit 1 porque solo nos interesan los stats
      const response = await axios.get(`${API_URL}?limit=1`, getAuthHeaders());
      if (response.data && response.data.stats) {
        this.setUnreadCount(response.data.stats.unread || 0);
        return response.data.stats;
      }
    } catch (error) {
      console.error('Error refreshing notification stats:', error);
    }
  },

  // Obtener notificaciones
  async getNotifications(page: number = 1, limit: number = 20, filters: any = {}) {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (filters.unreadOnly) params.append('unreadOnly', 'true');
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);

      const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeaders());

      // Actualizar stats si vienen en la respuesta
      if (response.data && response.data.stats) {
        this.setUnreadCount(response.data.stats.unread || 0);
      }

      return response.data;
    } catch (error: any) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Marcar como leída
  async markAsRead(notificationId: number) {
    try {
      const response = await axios.patch(
        `${API_URL}/${notificationId}/read`,
        {},
        getAuthHeaders()
      );
      // Tras marcar como leída, refrescamos stats
      this.refreshStats();
      return response.data;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Marcar todas como leídas
  async markAllAsRead() {
    try {
      const response = await axios.patch(
        `${API_URL}/read-all`,
        {},
        getAuthHeaders()
      );
      // Al marcar todas como leídas, el contador es 0
      this.setUnreadCount(0);
      return response.data;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Archivar notificación
  async archiveNotification(notificationId: number) {
    try {
      const response = await axios.patch(
        `${API_URL}/${notificationId}/archive`,
        {},
        getAuthHeaders()
      );
      this.refreshStats();
      return response.data;
    } catch (error: any) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  },

  // Obtener configuración
  async getSettings() {
    try {
      const response = await axios.get(`${API_URL}/settings`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  },

  // Actualizar configuración
  async updateSetting(category: string, setting: Partial<NotificationSetting>) {
    try {
      const response = await axios.put(
        `${API_URL}/settings/${category}`,
        setting,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating notification setting:', error);
      throw error;
    }
  },

  // Registrar dispositivo para push
  async registerDevice(deviceData: any) {
    try {
      const response = await axios.post(
        `${API_URL}/devices`,
        deviceData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error registering device:', error);
      throw error;
    }
  },

  // Crear notificación de ejemplo (para testing)
  async createSampleNotification(type: string = 'order_created') {
    try {
      const response = await axios.post(
        `${API_URL}/sample`,
        { type },
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating sample notification:', error);
      throw error;
    }
  }
};