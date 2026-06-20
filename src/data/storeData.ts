export interface StoreProduct {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  images?: string[];
  seller: string;
  rating: number;
  reviews: number;
  condition: string;
  free_shipping: boolean;
  discount?: number;
  category: string;
  is_featured?: boolean;
  is_trending?: boolean;
  is_recent?: boolean;
  location?: string;
  stock: number;
}

// Datos de ejemplo completos
export const storeProducts: StoreProduct[] = [
  // Productos destacados
  {
    id: 1,
    name: 'iPhone 14 Pro Max 256GB',
    price: 1299.99,
    original_price: 1399.99,
    image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    seller: 'TechStore Oficial',
    rating: 4.8,
    reviews: 124,
    condition: 'Nuevo',
    free_shipping: true,
    discount: 7,
    category: 'Tecnología',
    is_featured: true,
    stock: 15
  },
  {
    id: 2,
    name: 'Samsung Galaxy S23 Ultra',
    price: 1199.99,
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
    seller: 'MobileWorld',
    rating: 4.6,
    reviews: 89,
    condition: 'Nuevo',
    free_shipping: true,
    category: 'Tecnología',
    is_featured: true,
    stock: 8
  },
  {
    id: 3,
    name: 'MacBook Air M2 13"',
    price: 1499.99,
    original_price: 1599.99,
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop',
    seller: 'Apple Premium',
    rating: 4.9,
    reviews: 203,
    condition: 'Nuevo',
    free_shipping: false,
    discount: 6,
    category: 'Tecnología',
    is_featured: true,
    stock: 12
  },
  {
    id: 4,
    name: 'Sony WH-1000XM4',
    price: 349.99,
    original_price: 399.99,
    image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
    seller: 'AudioPro',
    rating: 4.7,
    reviews: 156,
    condition: 'Nuevo',
    free_shipping: true,
    discount: 12,
    category: 'Audio',
    is_featured: true,
    stock: 25
  },
  
  // Productos en oferta
  {
    id: 5,
    name: 'Nike Air Max 270',
    price: 129.99,
    original_price: 159.99,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    seller: 'SportShoes',
    rating: 4.4,
    reviews: 78,
    condition: 'Nuevo',
    free_shipping: true,
    discount: 18,
    category: 'Deportes',
    is_trending: true,
    stock: 30
  },
  {
    id: 6,
    name: 'PlayStation 5',
    price: 499.99,
    original_price: 549.99,
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop',
    seller: 'GameCenter',
    rating: 4.8,
    reviews: 312,
    condition: 'Nuevo',
    free_shipping: true,
    discount: 9,
    category: 'Gaming',
    is_trending: true,
    stock: 5
  },
  {
    id: 7,
    name: 'Samsung 55" 4K Smart TV',
    price: 699.99,
    original_price: 799.99,
    image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
    seller: 'ElectroHome',
    rating: 4.5,
    reviews: 167,
    condition: 'Nuevo',
    free_shipping: false,
    discount: 12,
    category: 'Electrodomésticos',
    is_trending: true,
    stock: 18
  },
  {
    id: 8,
    name: 'KitchenAid Batidora',
    price: 299.99,
    original_price: 349.99,
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    seller: 'HomeKitchen',
    rating: 4.6,
    reviews: 94,
    condition: 'Nuevo',
    free_shipping: true,
    discount: 14,
    category: 'Hogar',
    is_trending: true,
    stock: 22
  },
  
  // Vistos recientemente
  {
    id: 9,
    name: 'Apple Watch Series 8',
    price: 399.99,
    image_url: 'https://images.unsplash.com/photo-1579586337278-3f436c25d4a1?w=400&h=400&fit=crop',
    seller: 'WatchStore',
    rating: 4.7,
    reviews: 203,
    condition: 'Nuevo',
    free_shipping: true,
    category: 'Tecnología',
    is_recent: true,
    stock: 14
  },
  {
    id: 10,
    name: 'Canon EOS R6',
    price: 2499.99,
    image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop',
    seller: 'CameraPro',
    rating: 4.9,
    reviews: 67,
    condition: 'Nuevo',
    free_shipping: true,
    category: 'Fotografía',
    is_recent: true,
    stock: 6
  },
  {
    id: 11,
    name: 'Nespresso Essenza Mini',
    price: 149.99,
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    seller: 'CoffeeTime',
    rating: 4.3,
    reviews: 89,
    condition: 'Nuevo',
    free_shipping: true,
    category: 'Hogar',
    is_recent: true,
    stock: 35
  },
  {
    id: 12,
    name: 'Adidas Ultraboost 22',
    price: 179.99,
    image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
    seller: 'SportShoes',
    rating: 4.5,
    reviews: 156,
    condition: 'Nuevo',
    free_shipping: true,
    category: 'Deportes',
    is_recent: true,
    stock: 28
  }
];

// Funciones para obtener productos por categoría
export const getFeaturedProducts = () => 
  storeProducts.filter(product => product.is_featured);

export const getTrendingProducts = () => 
  storeProducts.filter(product => product.is_trending);

export const getRecentProducts = () => 
  storeProducts.filter(product => product.is_recent);

export const getProductsWithDiscount = () => 
  storeProducts.filter(product => product.discount && product.discount > 0);