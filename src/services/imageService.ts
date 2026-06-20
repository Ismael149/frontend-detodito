import axios from 'axios';
import { environment } from '../environments/environment';

const API_URL = `${environment.apiUrl}/upload`;

export const imageService = {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  async uploadMultipleImages(files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await axios.post(`${API_URL}/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }
};