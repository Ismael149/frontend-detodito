// frontend/src/services/categoryService.ts
import axios from 'axios';
import { environment } from '../environments/environment';

import { 
  phonePortrait, tv, home, bicycle, shirt, gameController, 
  cut, construct, car, cart, time, laptop, watch, book,
  musicalNotes, restaurant, medical, flower, colorPalette, fitness
} from 'ionicons/icons';

// Mapeo de iconos para categorías
export const categoryIcons: { [key: string]: string } = {
  'Tecnología': phonePortrait,
  'Electrodomésticos': tv,
  'Hogar': home,
  'Deportes': bicycle,
  'Moda': shirt,
  'Juguetes': gameController,
  'Belleza': cut,
  'Herramientas': construct,
  'Vehículos': car,
  'Supermercado': cart,
  'Historial': time,
  'Celulares': phonePortrait,
  'Computación': laptop,
  'Relojes': watch,
  'Libros': book,
  'Música': musicalNotes,
  'Comida': restaurant,
  'Salud': medical,
  'Jardín': flower,
  'Arte': colorPalette,
  'Fitness': fitness
};

const API_URL = `${environment.apiUrl}/categories`;

export const categoryService = {
  async getCategories() {
    try {
      const response = await axios.get(API_URL);
      // Agregar iconos a las categorías
      return response.data.map((category: any) => ({
        ...category,
        icon: categoryIcons[category.name] || 'cube'
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Método helper para obtener icono por nombre
  getIconForCategory(categoryName: string): string {
    return categoryIcons[categoryName] || 'cube';
  }
};