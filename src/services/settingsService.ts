import { environment } from '../environments/environment';
import axios from 'axios';

const API_URL = environment.apiUrl;

export const settingsService = {
    // Obtener configuraciones del usuario
    async getSettings() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching settings:', error);
            throw error.response?.data || error;
        }
    },

    // Obtener métodos de pago
    async getPaymentMethods() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/payment-methods`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Adaptar respuesta para ser consistente { success: true, methods: [] }
            // Si el backend devuelve array directo, lo envolvemos
            if (Array.isArray(response.data)) {
                return { success: true, methods: response.data };
            }
            return response.data;
        } catch (error: any) {
            console.error('Error fetching payment methods:', error);
            // Retornar estructura fallback
            return { success: false, methods: [] };
        }
    },

    // Actualizar configuraciones
    async updateSettings(settings: any) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/settings`,
                { settings },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Error updating settings:', error);
            throw error.response?.data || error;
        }
    },

    // Resetear configuraciones
    async resetSettings() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/settings/reset`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error resetting settings:', error);
            throw error.response?.data || error;
        }
    },

    // Aplicar configuraciones visuales (idioma, etc.)
    applyVisualSettings(settings: any) {
        // Guardar en localStorage como respaldo
        localStorage.setItem('app_settings', JSON.stringify(settings));

        // Determinar el tema a aplicar (Prioridad: app_theme -> admin_theme -> settings.darkMode)
        const appTheme = localStorage.getItem('app_theme');
        const adminTheme = localStorage.getItem('admin_theme');

        const themeToApply = appTheme || adminTheme || (settings && settings.darkMode ? 'dark' : 'light');

        if (themeToApply === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    },

    // Cargar configuraciones visuales al iniciar
    loadVisualSettings() {
        const savedSettings = localStorage.getItem('app_settings');
        let settings = {};
        if (savedSettings) {
            try {
                settings = JSON.parse(savedSettings);
            } catch (error) {
                console.error('Error parsing visual settings:', error);
            }
        }
        // Siempre aplicar para que tome admin_theme de localStorage if exists
        this.applyVisualSettings(settings);
    }
};

// Aplicar configuraciones visuales al cargar la página
settingsService.loadVisualSettings();
