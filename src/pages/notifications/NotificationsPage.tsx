import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonThumbnail,
  IonText,
  IonBadge,
  IonChip,
  IonToggle,
  IonList,
  IonAlert,
  IonLoading,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonMenuButton
} from '@ionic/react';
import {
  settings, checkmarkDone, archive, cart, megaphone, shield, chatbubble,
  car, checkmarkCircle, time, star, gift, wallet, notificationsOutline, alertCircle, trash
} from 'ionicons/icons';
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import './NotificationsPage.css';

type NotificationType = 'all' | 'unread' | 'orders' | 'promotions' | 'security' | 'messages';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  image_url?: string;
  action_url?: string;
  related_id?: number;
  related_type?: string;
  is_read: boolean;
  created_at: string;
  setting_enabled: boolean;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<NotificationType>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [showMarkAllAlert, setShowMarkAllAlert] = useState(false);
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  useEffect(() => {
    // Cargar página inicial al cambiar de pestaña o al montar
    loadNotifications(1, true);
  }, [activeTab]);

  const loadNotifications = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(pageNum, 20, {
        unreadOnly: activeTab === 'unread',
        type: activeTab === 'all' ? undefined : activeTab
      });

      if (refresh) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => {
          // Evitar duplicados por ID (por si se llama dos veces o concurrencia)
          const existingIds = new Set(prev.map(n => n.id));
          const newEntries = response.notifications.filter((n: any) => !existingIds.has(n.id));
          return [...prev, ...newEntries];
        });
      }

      setStats(response.stats);
      setHasMore(response.notifications.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredNotifications(notifications);
  }, [notifications]);

  const filterNotifications = () => {
    // Ya no es necesario filtrar localmente ya que traemos datos filtrados del servidor
    setFilteredNotifications(notifications);
  };

  const handleRefresh = async (event: any) => {
    await loadNotifications(1, true);
    event.detail.complete();
  };

  const loadMore = async (event: any) => {
    await loadNotifications(page + 1);
    event.target.complete();
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setShowMarkAllAlert(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const archiveNotification = async (notificationId: number) => {
    try {
      await notificationService.archiveNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída si no lo está
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navegar si hay action_url
    if (notification.action_url) {
      history.push(notification.action_url);
    } else if (notification.related_type === 'order' || notification.type === 'new_sale') {
      // Fallback para órdenes si no hay action_url explícita
      if (notification.type === 'new_sale') {
        history.push(`/seller/orders`);
      } else {
        history.push(`/orders`);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: any = {
      'order_created': cart,
      'order_shipped': car,
      'order_delivered': checkmarkCircle,
      'order_cancelled': time,
      'promotion': megaphone,
      'discount': gift,
      'special_offer': star,
      'security_alert': shield,
      'password_changed': shield,
      'login_new_device': shield,
      'message_received': chatbubble,
      'seller_response': chatbubble,
      'new_sale': gift,
      'shipping_update': car,
      'product_warning': alertCircle,
      'product_deleted': trash,
      'banner_approved': checkmarkCircle,
      'banner_rejected': alertCircle,
      'banner_waitlist': time,
      'banner_update': megaphone
    };
    return icons[type] || notificationsOutline;
  };

  const getNotificationColor = (type: string) => {
    const colors: any = {
      'order_created': 'primary',
      'order_shipped': 'secondary',
      'order_delivered': 'success',
      'order_cancelled': 'danger',
      'promotion': 'warning',
      'discount': 'warning',
      'special_offer': 'warning',
      'security_alert': 'danger',
      'password_changed': 'success',
      'login_new_device': 'medium',
      'message_received': 'tertiary',
      'new_sale': 'success',
      'shipping_update': 'primary',
      'product_warning': 'warning',
      'product_deleted': 'danger',
      'banner_approved': 'success',
      'banner_rejected': 'danger',
      'banner_waitlist': 'warning',
      'banner_update': 'tertiary'
    };
    return colors[type] || 'medium';
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} d`;

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getUnreadCount = (tab: NotificationType) => {
    switch (tab) {
      case 'all': return stats.unread || 0;
      case 'orders': return stats.byType?.order_created + stats.byType?.order_shipped + stats.byType?.order_delivered || 0;
      case 'promotions': return stats.byType?.promotion + stats.byType?.discount || 0;
      case 'security': return stats.byType?.security_alert + stats.byType?.password_changed || 0;
      case 'messages': return stats.byType?.message_received || 0;
      default: return 0;
    }
  };

  return (
    <IonPage>
      <IonHeader className="notifications-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/store" text="" />
          </IonButtons>
          <IonTitle>Notificaciones</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/notifications/settings">
              <IonIcon icon={settings} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Tabs estilo Mercado Libre */}
        <IonToolbar>
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as NotificationType)}
            scrollable={true}
            mode="ios"
          >
            <IonSegmentButton value="all">
              <IonLabel>
                Todas
                {getUnreadCount('all') > 0 && (
                  <IonBadge color="danger" className="tab-badge">
                    {getUnreadCount('all')}
                  </IonBadge>
                )}
              </IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="unread">
              <IonLabel>No leídas</IonLabel>
            </IonSegmentButton>


          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="notifications-page">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Header con acciones */}
        {filteredNotifications.length > 0 && (
          <div className="notifications-actions">
            <IonButton
              fill="clear"
              size="small"
              onClick={() => setShowMarkAllAlert(true)}
              disabled={stats.unread === 0}
            >
              <IonIcon icon={checkmarkDone} slot="start" />
              Marcar todas como leídas
            </IonButton>
          </div>
        )}

        {/* Lista de notificaciones */}
        <IonList className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={notificationsOutline} size="large" />
              <h3>No hay notificaciones</h3>
              <p>
                {activeTab === 'unread'
                  ? 'No tienes notificaciones sin leer'
                  : 'No hay notificaciones en esta categoría'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <IonItem
                key={notification.id}
                className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                button
                detail={false}
                onClick={() => handleNotificationClick(notification)}
              >
                <IonThumbnail slot="start" className="notification-icon">
                  <IonIcon
                    icon={getNotificationIcon(notification.type)}
                    color={getNotificationColor(notification.type)}
                  />
                </IonThumbnail>

                <IonLabel className="notification-content">
                  <div className="notification-header">
                    <IonText className="notification-title">
                      <h3>{notification.title}</h3>
                    </IonText>
                    <IonText color="medium" className="notification-time">
                      {formatTime(notification.created_at)}
                    </IonText>
                  </div>

                  <IonText className="notification-message">
                    <p style={{ whiteSpace: 'pre-line' }}>{notification.message}</p>
                  </IonText>

                  {notification.image_url && (
                    <div className="notification-image-container">
                      <img src={notification.image_url} alt="Notification attachment" className="notification-attachment-image" />
                    </div>
                  )}

                  {notification.action_url && (
                    <IonButton
                      size="small"
                      fill="outline"
                      className="notification-action"
                      routerLink={notification.action_url}
                    >
                      Ver más
                    </IonButton>
                  )}
                </IonLabel>

                <div slot="end" className="notification-actions">
                  {!notification.is_read && (
                    <IonBadge color="danger" className="unread-dot"></IonBadge>
                  )}
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveNotification(notification.id);
                    }}
                    className="archive-btn"
                  >
                    <IonIcon icon={archive} />
                  </IonButton>
                </div>
              </IonItem>
            ))
          )}
        </IonList>

        <IonInfiniteScroll onIonInfinite={loadMore} disabled={!hasMore}>
          <IonInfiniteScrollContent
            loadingText="Cargando más notificaciones..."
          ></IonInfiniteScrollContent>
        </IonInfiniteScroll>

        <IonAlert
          isOpen={showMarkAllAlert}
          onDidDismiss={() => setShowMarkAllAlert(false)}
          header="Marcar todas como leídas"
          message="¿Estás seguro de que quieres marcar todas las notificaciones como leídas?"
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Marcar', handler: markAllAsRead }
          ]}
        />

        <IonLoading isOpen={loading} message="Cargando notificaciones..." />
      </IonContent>
    </IonPage>
  );
};

export default NotificationsPage;