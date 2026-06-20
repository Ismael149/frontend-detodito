import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/sellers`;

const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

export const sellerService = {
    // Obtener perfil público (datos, stats, valoraciones, productos)
    async getPublicProfile(sellerId: number) {
        try {
            const response = await axios.get(`${API_URL}/${sellerId}/profile`);
            return response.data;
        } catch (error) {
            console.error('Error getting seller profile:', error);
            throw error;
        }
    },

    // Valorar a un vendedor
    async rateSeller(sellerId: number, rating: number, comment: string) {
        try {
            const response = await axios.post(
                `${API_URL}/${sellerId}/rate`,
                { rating, comment },
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Error rating seller:', error);
            throw error;
        }
    }
};
