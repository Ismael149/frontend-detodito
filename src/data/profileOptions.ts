// frontend/src/data/profileOptions.ts - VERSIÓN ACTUALIZADA
export interface ProfileOption {
  id: string;
  type: 'header' | 'info' | 'option' | 'logout'| 'action' | 'divider';
  title?: string;
  icon?: string;
  color?: string;
  subtitle?: string;
  badge?: string | number;
  value?: string;
  action?: boolean;
}

export const profileOptions: ProfileOption[] = [
  {
    id: 'user-header',
    type: 'header',
    title: 'Mi Perfil',
    icon: 'person-circle'
  },
  {
    id: 'divider-1',
    type: 'divider'
  },
  {
    id: 'edit-profile',
    type: 'option',
    title: 'Editar perfil',
    icon: 'pencil',
    subtitle: 'Actualiza tu información personal'
  },
  {
    id: 'change-password',
    type: 'option',
    title: 'Cambiar contraseña',
    icon: 'lock-closed',
    subtitle: 'Actualiza tu contraseña de acceso'
  },
  {
    id: 'orders',
    type: 'option',
    title: 'Historial de compras',
    icon: 'bag-handle',
    subtitle: 'Ver todas tus órdenes'
  },
  {
    id: 'favorites',
    type: 'option',
    title: 'Favoritos',
    icon: 'heart',
    subtitle: 'Productos guardados'
  },
  {
    id: 'notifications',
    type: 'option',
    title: 'Notificaciones',
    icon: 'notifications',
    subtitle: 'Gestiona tus alertas'
  },
  {
    id: 'divider-2',
    type: 'divider'
  },
  {
    id: 'addresses',
    type: 'option',
    title: 'Direcciones',
    icon: 'location',
    subtitle: 'Gestiona tus direcciones de envío'
  },
  {
    id: 'payment-methods',
    type: 'option',
    title: 'Métodos de pago',
    icon: 'card',
    subtitle: 'Tarjetas y otros métodos'
  },
  {
    id: 'security',
    type: 'option',
    title: 'Seguridad',
    icon: 'shield-checkmark',
    subtitle: 'Protege tu cuenta'
  },
  {
    id: 'privacy',
    type: 'option',
    title: 'Privacidad',
    icon: 'lock-closed',
    subtitle: 'Controla tu información'
  },
  {
    id: 'divider-3',
    type: 'divider'
  },
  {
    id: 'support',
    type: 'option',
    title: 'Atención al cliente',
    icon: 'headset',
    subtitle: 'Ayuda y soporte'
  },
  {
    id: 'feedback',
    type: 'option',
    title: 'Enviar feedback',
    icon: 'chatbubble-ellipses',
    subtitle: 'Comparte tu opinión'
  },
  {
    id: 'divider-4',
    type: 'divider'
  },
  {
    id: 'logout',
    type: 'logout',
    title: 'Cerrar sesión',
    icon: 'log-out',
    color: 'danger',
  }
];