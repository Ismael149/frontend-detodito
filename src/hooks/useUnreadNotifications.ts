import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

export const useUnreadNotifications = () => {
    const [unreadCount, setUnreadCount] = useState(notificationService.getUnreadCount());

    useEffect(() => {
        // Suscribirse a cambios globales
        const unsubscribe = notificationService.subscribe((count) => {
            setUnreadCount(count);
        });

        // Carga inicial
        notificationService.refreshStats();

        // Polling opcional como respaldo cada 1 minuto
        const interval = setInterval(() => {
            notificationService.refreshStats();
        }, 60000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    return { unreadCount, refresh: () => notificationService.refreshStats() };
};
