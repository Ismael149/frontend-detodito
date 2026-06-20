import axios from 'axios';
import { environment } from '../environments/environment';

const API_URL = `${environment.apiUrl}/auth`;

// Configurar interceptor para incluir el token en todas las solicitudes
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Verificar si estamos en la página de login
    const isLoginPage = window.location.pathname.includes('/login');

    // Verificar si la petición era al endpoint de login
    const isLoginEndpoint = error.config?.url?.includes('/login');

    // Solo manejar redirección 401 si NO estamos en login y NO es una petición de login
    // DEBUG: Comentamos la redirección automática para evitar recargas indeseadas en login
    console.log(`🔒 [AUTH] 401 Detectado. Path: ${window.location.pathname}, URL: ${error.config?.url}`);

    if (error.response?.status === 401 && !isLoginPage && !isLoginEndpoint) {
      console.log('🔒 [AUTH] Sesión expirada, pero NO redirigiremos automáticmente por ahora (DEBUG)');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/login'; // <--- COMENTADO PARA DEBUG
    }

    return Promise.reject(error);
  }
);

export const authService = {
  async register(userData: any) {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async login(credentials: any) {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);

        // Guardar todos los datos del usuario, incluyendo is_admin
        const userData = response.data.user || response.data;
        localStorage.setItem('user', JSON.stringify(userData));

        console.log('🔐 [AUTH] Login successful:', {
          id: userData.id,
          first_name: userData.first_name,
          email: userData.email,
          is_admin: userData.is_admin
        });

        return response.data;
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  // Método mejorado para verificar admin
  isAdmin() {
    try {
      const user = this.getCurrentUser();
      console.log('👑 [AUTH] Admin check - User:', user);

      if (!user) {
        console.log('❌ [AUTH] No user found for admin check');
        return false;
      }

      // Diferentes formas en que podría venir el campo admin
      const isAdmin = user.is_admin === true ||
        user.is_admin === 1 ||
        user.is_admin === 'true' ||
        user.is_admin === '1' ||
        user.role === 'admin' ||
        user.user_type === 'admin';

      console.log('✅ [AUTH] Is admin result:', isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('❌ [AUTH] Error in admin check:', error);
      return false;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  },

  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  // Obtener perfil completo del usuario desde la API
  async getProfile() {
    try {
      const response = await axios.get(`${API_URL}/profile`);

      // Actualizar los datos del usuario en localStorage
      if (response.data) {
        const currentUser = this.getCurrentUser();
        const updatedUser = {
          ...currentUser,
          ...response.data
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }

      return response.data;
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Actualizar datos del usuario
  async updateProfile(userData: any) {
    try {
      const response = await axios.put(`${API_URL}/profile`, userData);

      // Actualizar localStorage
      if (response.data) {
        const currentUser = this.getCurrentUser();
        const updatedUser = {
          ...currentUser,
          ...response.data
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }

      return response.data;
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Solicitar verificación de email
  async requestEmailVerification(email: string) {
    try {
      const response = await axios.post(`${API_URL}/verify-email/request`, { email });
      return response.data;
    } catch (error: any) {
      console.error('Error requesting email verification:', error);
      throw error;
    }
  },

  // Verificar email con token
  async verifyEmail(token: string) {
    try {
      console.log('🔍 [SERVICE] Verificando email con token:', token);
      const response = await axios.get(`${API_URL}/verify-email/${token}`);
      console.log('✅ [SERVICE] Respuesta del servidor:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [SERVICE] Error en verifyEmail:', error);

      if (error.response) {
        console.log('📊 [SERVICE] Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }

      throw error;
    }
  },

  // Reenviar email de verificación
  async resendVerificationEmail(email: string) {
    try {
      const response = await axios.post(`${API_URL}/verify-email/resend`, { email });
      return response.data;
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  },

  // Solicitar recuperación de contraseña
  async requestPasswordReset(email: string) {
    try {
      const response = await axios.post(`${API_URL}/password/reset-request`, { email });
      return response.data;
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  // Validar token de recuperación
  async validateResetToken(token: string) {
    try {
      const response = await axios.get(`${API_URL}/password/validate-token/${token}`);
      return response.data;
    } catch (error: any) {
      console.error('Error validating reset token:', error);
      throw error;
    }
  },

  // Restablecer contraseña
  async resetPassword(token: string, newPassword: string) {
    try {
      const response = await axios.post(`${API_URL}/password/reset`, {
        token,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Cambiar contraseña (estando logueado)
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await axios.post(`${API_URL}/change-password`, {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};