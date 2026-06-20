export interface Banner {
  id: number;
  title: string;
  image: string;
  link?: string;
  category?: string;
  backgroundColor?: string;
  isActive: boolean;
}

export const banners: Banner[] = [
  {
    id: 1,
    title: 'Ofertas de la Semana',
    image: '/assets/banners/ofertas-semana.jpg',
    link: '/category/ofertas',
    category: 'ofertas',
    backgroundColor: '#ff6b6b',
    isActive: true
  },
  {
    id: 2,
    title: 'Tecnología al Mejor Precio',
    image: '/assets/banners/tecnologia.jpg',
    link: '/category/tecnologia',
    category: 'tecnología',
    backgroundColor: '#4ecdc4',
    isActive: true
  },
  {
    id: 3,
    title: 'Hogar y Muebles',
    image: '/assets/banners/hogar.jpg',
    link: '/category/hogar',
    category: 'hogar',
    backgroundColor: '#45b7d1',
    isActive: true
  },
  {
    id: 4,
    title: 'Moda y Accesorios',
    image: '/assets/banners/moda.jpg',
    link: '/category/moda',
    category: 'moda',
    backgroundColor: '#96ceb4',
    isActive: true
  },
  {
    id: 5,
    title: 'Supermercado',
    image: '/assets/banners/supermercado.jpg',
    link: '/category/supermercado',
    category: 'supermercado',
    backgroundColor: '#feca57',
    isActive: true
  }
];

// URLs de imágenes de placeholder para testing
export const placeholderBanners: Banner[] = [
  {
    id: 1,
    title: 'Ofertas Especiales',
    image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800&h=400&fit=crop',
    link: '/category/ofertas',
    category: 'ofertas',
    backgroundColor: '#ff6b6b',
    isActive: true
  },
  {
    id: 2,
    title: 'Tecnología',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=400&fit=crop',
    link: '/category/tecnologia',
    category: 'tecnología',
    backgroundColor: '#4ecdc4',
    isActive: true
  },
  {
    id: 3,
    title: 'Hogar y Decoración',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop',
    link: '/category/hogar',
    category: 'hogar',
    backgroundColor: '#45b7d1',
    isActive: true
  },
  {
    id: 4,
    title: 'Moda 2024',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop',
    link: '/category/moda',
    category: 'moda',
    backgroundColor: '#96ceb4',
    isActive: true
  }
];