export interface MoreOption {
  id: string;
  type: 'header' | 'option' | 'divider' | 'logout' | 'section-title';
  title?: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  badge?: string | number;
  requiresAuth?: boolean;
}

export const moreOptions: MoreOption[] = [
  {
    id: 'user-header',
    type: 'header',
    title: 'Iniciar sesión',
    icon: 'person'
  },
  {
    id: 'orders',
    type: 'option',
    title: 'Mis compras',
    icon: 'bag-handle',
    requiresAuth: true
  },
  {
    id: 'my-products',
    type: 'option',
    title: 'Mis productos',
    icon: 'storefront',
    subtitle: 'Administra tus publicaciones',
    requiresAuth: true
  },
  {
    id: 'seller-orders',
    type: 'option',
    title: 'Mis ventas',
    icon: 'wallet',
    subtitle: 'Tus pedidos vendidos',
    requiresAuth: true
  },
  {
    id: 'banner-request',
    type: 'option',
    title: 'Destacar Producto',
    icon: 'megaphone',
    subtitle: 'Publicita tus artículos',
    requiresAuth: true,
    badge: 'Nuevo'
  },
  {
    id: 'favorites',
    type: 'option',
    title: 'Favoritos',
    icon: 'heart',
    requiresAuth: true
  },
  {
    id: 'categories',
    type: 'option',
    title: 'Categorías',
    icon: 'apps',
    requiresAuth: true
  },
  {
    id: 'notifications',
    type: 'option',
    title: 'Notificaciones',
    icon: 'notifications',
    requiresAuth: true
  },
  {
    id: 'advanced-reports',
    type: 'option',
    title: 'Centro de Reportes',
    icon: 'bar-chart',
    subtitle: 'Estadísticas detalladas y PDFs',
    requiresAuth: true
  },
  {
    id: 'divider-2',
    type: 'divider'
  },
  {
    id: 'help-section',
    type: 'section-title',
    title: 'Ayuda'
  },
  {
    id: 'help',
    type: 'option',
    title: 'Juli',
    icon: 'chatbubble-ellipses',
    subtitle: 'Tu asistente virtual 24/7'
  },
  {
    id: 'settings',
    type: 'option',
    title: 'Configuración',
    icon: 'settings',
    subtitle: 'Privacidad y notificaciones'
  },
  {
    id: 'about',
    type: 'option',
    title: 'Acerca de',
    icon: 'information-circle',
    subtitle: 'Versión y términos'
  },
  {
    id: 'divider-3',
    type: 'divider'
  },
  {
    id: 'logout',
    type: 'logout',
    title: 'Cerrar sesión',
    icon: 'log-out',
    color: 'danger',
    requiresAuth: true
  }
];