import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = environment.apiUrl;

export const userService = {
  // Obtener usuario actual desde localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  // Obtener nombre completo
  getFullName() {
    const user = this.getCurrentUser();
    if (!user) return 'Usuario';

    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }

    return user.username || 'Usuario';
  },

  // Guardar usuario en localStorage
  setCurrentUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Limpiar usuario de localStorage
  clearCurrentUser() {
    localStorage.removeItem('user');
  },

  // Obtener perfil desde el backend
  async getProfile() {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearCurrentUser();
          authService.logout();
          throw new Error('Sesión expirada');
        }
        const errorData = await response.json().catch(() => ({ message: 'Error' }));
        throw new Error(errorData.message || 'Error al obtener el perfil');
      }

      const data = await response.json();
      if (data.user) this.setCurrentUser(data.user);
      return data;
    } catch (error: any) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },

  // Actualizar perfil
  async updateProfile(profileData: any) {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || 'Error al actualizar el perfil');
      if (responseData.user) this.setCurrentUser(responseData.user);
      return responseData;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Actualizar avatar (soporta URL o FormData)
  async updateAvatar(data: string | FormData) {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No autenticado');

      const isFormData = data instanceof FormData;
      const headers: any = {
        'Authorization': `Bearer ${token}`
      };

      // Importante: Multer necesita que el navegador establezca el Content-Type con el boundary
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_URL}/auth/update-avatar`, {
        method: 'POST',
        headers: headers,
        body: isFormData ? data : JSON.stringify({ profile_picture: data })
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || 'Error al actualizar el avatar');
      if (responseData.user) this.setCurrentUser(responseData.user);
      return responseData;
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },

  // Cambiar contraseña
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || 'Error al cambiar la contraseña');

      return responseData;
    } catch (error: any) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Resto de métodos...
  isAuthenticated() {
    return authService.isAuthenticated();
  },

  getToken() {
    return authService.getToken();
  },

  // Actualizar configuración de privacidad
  async updatePrivacySettings(settings: any) {
    // Por ahora lo guardamos en el perfil del usuario en localStorage
    const user = this.getCurrentUser();
    if (user) {
      user.privacy_settings = settings;
      this.setCurrentUser(user);
    }
    // Opcionalmente podrías persistirlo en el backend vía updateProfile
    // return this.updateProfile({ privacy_settings: settings });
    return { success: true };
  },

  // Eliminar cuenta permanentemente
  async deleteAccount(reason: string) {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`${API_URL}/auth/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Error al eliminar la cuenta');
      }

      return responseData;
    } catch (error: any) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
};