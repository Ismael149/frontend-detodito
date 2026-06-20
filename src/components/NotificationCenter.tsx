import React, { useState, useEffect } from 'react';
import {
  IonBadge,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonContent
} from '@ionic/react';
import { notifications, checkmarkDone } from 'ionicons/icons';
import './NotificationCenter.css';

// Renombrar la interfaz para evitar conflicto con la nativa del navegador
interface AppNotification {
  id: number;
  type: 'order' | 'system' | 'promotion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const NotificationCenter: React.FC = () => {
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopover, setShowPopover] = useState({
    open: false,
    event: undefined as any
  });

  useEffect(() => {
    loadNotifications();
    setupRealTimeNotifications();
    
    // Solicitar permiso para notificaciones del sistema
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const loadNotifications = async () => {
    try {
      // Datos de ejemplo - reemplazar con llamada real a la API
      const exampleNotifications: AppNotification[] = [
        {
          id: 1,
          type: 'order',
          title: '¡Pedido Confirmado!',
          message: 'Tu orden #12345 ha sido procesada exitosamente',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
          read: false
        },
        {
          id: 2,
          type: 'system',
          title: 'Mantenimiento Programado',
          message: 'El sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
          read: true
        },
        {
          id: 3,
          type: 'promotion',
          title: '¡Oferta Especial!',
          message: '20% de descuento en productos seleccionados esta semana',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
          read: false
        }
      ];
      
      setAppNotifications(exampleNotifications);
      setUnreadCount(exampleNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const setupRealTimeNotifications = () => {
    // Simular notificaciones en tiempo real (en producción usarías WebSockets)
    const interval = setInterval(() => {
      // Simular nueva notificación cada 30 segundos (solo para demo)
      if (Math.random() > 0.8) { // 20% de probabilidad
        const newNotification: AppNotification = {
          id: Date.now(),
          type: 'order',
          title: '¡Actualización de Pedido!',
          message: 'Tu pedido ha sido enviado y está en camino',
          timestamp: new Date(),
          read: false
        };
        
        setAppNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        showSystemNotification(newNotification);
      }
    }, 30000);

    return () => clearInterval(interval);
  };

  const showSystemNotification = (notification: AppNotification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icon/favicon.png'
      });
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      // En producción, harías una llamada a la API aquí
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
      
      setAppNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // await fetch('/api/notifications/read-all', { method: 'PATCH' });
      
      setAppNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} d`;
    
    return timestamp.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'system':
        return '⚙️';
      case 'promotion':
        return '🎁';
      default:
        return '🔔';
    }
  };

  const openPopover = (event: any) => {
    setShowPopover({
      open: true,
      event: event.nativeEvent
    });
  };

  return (
    <div className="notification-center">
      <IonButton 
        fill="clear" 
        onClick={openPopover}
        className="notification-button"
        id="notification-trigger"
      >
        <IonIcon icon={notifications} />
        {unreadCount > 0 && (
          <IonBadge color="danger" className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </IonBadge>
        )}
      </IonButton>

      <IonPopover
        isOpen={showPopover.open}
        onDidDismiss={() => setShowPopover({ open: false, event: undefined })}
        event={showPopover.event}
        className="notification-popover"
      >
        <IonContent>
          <div className="notification-header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <IonButton 
                fill="clear" 
                size="small"
                onClick={markAllAsRead}
                className="mark-all-read"
              >
                <IonIcon icon={checkmarkDone} slot="start" />
                Marcar todas como leídas
              </IonButton>
            )}
          </div>

          <IonList className="notification-list">
            {appNotifications.length === 0 ? (
              <IonItem>
                <IonLabel>
                  <p className="empty-notifications">No hay notificaciones</p>
                </IonLabel>
              </IonItem>
            ) : (
              appNotifications.slice(0, 10).map(notification => (
                <IonItem 
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  button
                  detail={false}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <IonLabel className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <IonNote className="notification-time">
                      {formatTime(notification.timestamp)}
                    </IonNote>
                  </IonLabel>
                  
                  {!notification.read && (
                    <div className="unread-indicator" slot="end"></div>
                  )}
                </IonItem>
              ))
            )}
          </IonList>

          {appNotifications.length > 10 && (
            <div className="notification-footer">
              <IonButton 
                expand="block" 
                fill="clear"
                routerLink="/notifications"
                className="view-all-button"
              >
                Ver todas las notificaciones ({appNotifications.length})
              </IonButton>
            </div>
          )}
        </IonContent>
      </IonPopover>
    </div>
  );
};

export default NotificationCenter;