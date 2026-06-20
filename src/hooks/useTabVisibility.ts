import { useLocation } from 'react-router-dom';

export const useTabVisibility = () => {
  const location = useLocation();

  // Lista de rutas donde NO se debe mostrar la barra inferior
  const hiddenRoutes = [
    '/login',
    '/register',
    '/checkout',
    '/password-reset',
    '/reset-password',
    '/verify-email',
    '/admin'
  ];

  // Verificar si la ruta actual debe ocultar los tabs
  const shouldShowTabs = !hiddenRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  return shouldShowTabs;
};