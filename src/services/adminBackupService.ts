// frontend/src/services/adminBackupService.ts
import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/admin/backup`;

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const adminBackupService = {
  // Obtener lista de backups
  async getBackups() {
    try {
      const response = await axios.get(`${API_URL}/list`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting backups:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener backups');
    }
  },

  // Crear nuevo backup
  async createBackup() {
    try {
      const response = await axios.post(`${API_URL}/create`, {}, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error creating backup:', error);
      throw new Error(error.response?.data?.message || 'Error al crear backup');
    }
  },

  // Descargar backup
  async downloadBackup(filename: string) {
    try {
      const response = await axios.get(`${API_URL}/download/${filename}`, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar backup');
    }
  },

  // Eliminar backup
  async deleteBackup(filename: string) {
    try {
      const response = await axios.delete(`${API_URL}/delete/${filename}`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error deleting backup:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar backup');
    }
  },

  // Restaurar backup
  async restoreBackup(filename: string) {
    try {
      const response = await axios.post(`${API_URL}/restore/${filename}`, {}, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      throw new Error(error.response?.data?.message || 'Error al restaurar backup');
    }
  },

  // Subir y restaurar backup
  async uploadBackup(file: File, onProgress?: (progress: number) => void) {
    try {
      const formData = new FormData();
      formData.append('backupFile', file);

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error uploading backup:', error);
      throw new Error(error.response?.data?.message || 'Error al subir backup');
    }
  },

  // Verificar estado de la base de datos
  async getDatabaseStatus() {
    try {
      const response = await axios.get(`${API_URL}/status`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting database status:', error);
      throw new Error(error.response?.data?.message || 'Error al verificar estado de BD');
    }
  }
};