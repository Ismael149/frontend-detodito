import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { environment } from '../../environments/environment';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonText,
  IonSpinner,
  IonBadge,
  IonBackButton,
  useIonViewWillEnter,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  logOut, settings, people, bag, chatbubbles, document,
  cube, cart, chatbubble, statsChart, list, cash,
  arrowUp, arrowDown, time, alertCircle, receipt, cloudDownload,
  shieldCheckmark, megaphone, arrowBack
} from 'ionicons/icons';
import { adminService } from '../../services/adminService';
import { authService } from '../../services/authService';
import { adminOrderService } from '../../services/adminOrderService';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    categoriesWithProducts: 0
  });
  const history = useHistory();
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    console.log('AdminDashboard - Verificando permisos');
    const isAdmin = authService.isAdmin();
    console.log('AdminDashboard - Es admin:', isAdmin);

    if (!isAdmin) {
      console.log('AdminDashboard - Redirigiendo a /store');
      history.push('/store');
      return;
    }

    loadDashboardData();
  }, []);

  useIonViewWillEnter(() => {
    console.log('AdminDashboard - useIonViewWillEnter - Recargando datos');
    loadDashboardData();
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar estadísticas generales y de órdenes
      const results = await Promise.all([
        adminService.getDashboardStats(),
        adminOrderService.getDashboardStats(),
        adminService.getActivityLogs({ limit: 5 }),
        adminService.getCategories(),
        axios.get(`${environment.apiUrl}/banners/admin/list`, {
          headers: { Authorization: `Bearer ${authService.getToken()}` }
        }),
        adminOrderService.getAllOrders({ limit: 2000 })
      ]);

      const generalStats = results[0];
      const orderStatsData = results[1];
      const activities = results[2];
      const categories = results[3];
      const bannersResponse = results[4];
      const allOrders = results[5];

      // Calculate App Earnings
      const validOrders = allOrders.orders.filter((o: any) => o.status !== 'cancelled');
      const shippingRevenue = validOrders.reduce((sum: number, o: any) => sum + (Number(o.shipping_cost) || 0), 0);

      const banners = bannersResponse.data.banners || [];
      const paidBanners = banners.filter((b: any) => b.status === 'active' || b.status === 'expired');
      const bannerRevenue = paidBanners.reduce((sum: number, b: any) => sum + (Number(b.cost) || 0), 0);

      const totalAppEarnings = shippingRevenue + bannerRevenue;

      const activeBannersCount = banners.filter((b: any) => b.status === 'active').length;

      setStats({
        ...(generalStats || {}),
        active_banners: activeBannersCount
      });
      setOrderStats({
        ...(orderStatsData || {}),
        total_revenue: totalAppEarnings
      });
      setRecentActivities(activities);

      // Debug: Log stats to verify data
      console.log('📊 Dashboard Stats:', generalStats);
      console.log('📦 Order Stats (Modified):', { ...orderStatsData, total_revenue: totalAppEarnings });

      // Calcular estadísticas de categorías
      setCategoryStats({
        totalCategories: categories.length,
        activeCategories: categories.filter((c: any) => c.is_active).length,
        categoriesWithProducts: categories.filter((c: any) => c.product_count > 0).length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadDashboardData();
    event.detail.complete();
  };

  const handleLogout = () => {
    authService.logout();
    history.push('/login');
  };

  const navigateTo = (path: string) => {
    history.push(`/admin/${path}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando panel de administración...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.push('/store')}>
              <IonIcon icon={arrowBack} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>Panel de Administración</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon icon={logOut} slot="start" />
              Salir
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="admin-dashboard">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Bienvenida y resumen */}
        <div className="welcome-section">
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonCard color="light">
                  <IonCardContent>
                    <IonText>
                      <h1>Bienvenido al Panel de Administración</h1>
                      <p>Gestiona todos los aspectos de tu plataforma desde un solo lugar</p>
                    </IonText>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Estadísticas rápidas */}
        <div className="dashboard-stats">


          <IonGrid>
            <IonRow>
              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-primary">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={people} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{stats?.total_users || 0}</h2>
                        <p>Usuarios</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-secondary">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={bag} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{stats?.total_products || 0}</h2>
                        <p>Productos</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-tertiary">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={receipt} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{orderStats?.total_orders || 0}</h2>
                        <p>Total Pedidos</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-warning">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={time} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{orderStats?.pending_orders || 0}</h2>
                        <p>Pendientes</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-primary">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={cube} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{stats?.processing_orders || 0}</h2>
                        <p>En Proceso</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-secondary">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={bag} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{stats?.shipped_orders || 0}</h2>
                        <p>Enviados</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-success">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={shieldCheckmark} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{stats?.delivered_orders || 0}</h2>
                        <p>Entregados</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-danger">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={alertCircle} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{(stats?.reported_comments || 0) + (stats?.reported_products || 0)}</h2>
                        <p>Reportados</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-success">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={cash} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{formatCurrency(orderStats?.total_revenue || 0)}</h2>
                        <p>Total Ingresos</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-tertiary">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={cart} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{orderStats?.total_items_sold || 0}</h2>
                        <p>Items Vendidos</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-warning">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={megaphone} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{stats?.active_banners || 0}</h2>
                        <p>Banners Activos</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" size-md="3">
                <IonCard className="stat-card stat-card-medium">
                  <IonCardContent style={{ padding: '12px' }}>
                    <div className="stat-content">
                      <IonIcon icon={list} className="stat-icon" />
                      <div className="stat-info">
                        <h2>{categoryStats.totalCategories || 0}</h2>
                        <p>Categorías</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Menú de administración */}
        <div className="admin-menu">
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonText>
                  <h2>Gestión del Sistema</h2>
                  <p>Selecciona una categoría para gestionar</p>
                </IonText>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="12" size-md="6" size-lg="4">
                <IonCard button onClick={() => navigateTo('products')} className="menu-card">
                  <IonCardContent className="menu-item">
                    <div className="menu-icon">
                      <IonIcon icon={bag} />
                    </div>
                    <div className="menu-content">
                      <IonText>
                        <h3>Gestionar Productos</h3>
                        <p>{stats?.total_products || 0} productos en total</p>
                      </IonText>
                      <IonBadge color="primary">
                        {stats?.reported_products || 0} reportados
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" size-md="6" size-lg="4">
                <IonCard button onClick={() => navigateTo('users')} className="menu-card">
                  <IonCardContent className="menu-item">
                    <div className="menu-icon">
                      <IonIcon icon={people} />
                    </div>
                    <div className="menu-content">
                      <IonText>
                        <h3>Gestionar Usuarios</h3>
                        <p>{stats?.total_users || 0} usuarios registrados</p>
                      </IonText>
                      <IonBadge color="secondary">
                        {stats?.new_users_this_month || 0} nuevos este mes
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" size-md="6" size-lg="4">
                <IonCard button onClick={() => navigateTo('categories')} className="menu-card">
                  <IonCardContent className="menu-item">
                    <div className="menu-icon">
                      <IonIcon icon={list} />
                    </div>
                    <div className="menu-content">
                      <IonText>
                        <h3>Gestionar Categorías</h3>
                        <p>{categoryStats.totalCategories || 0} categorías</p>
                      </IonText>
                      <IonBadge color="medium">
                        {categoryStats.activeCategories} activas
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>


              <IonCol size="12" size-md="6" size-lg="4">
                <IonCard button onClick={() => navigateTo('orders')} className="menu-card">
                  <IonCardContent className="menu-item">
                    <div className="menu-icon">
                      <IonIcon icon={receipt} />
                    </div>
                    <div className="menu-content">
                      <IonText>
                        <h3>Gestionar Pedidos</h3>
                        <p>{orderStats?.total_orders || 0} pedidos totales</p>
                      </IonText>
                      <IonBadge color="warning">
                        {orderStats?.pending_orders || 0} pendientes
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" size-md="6" size-lg="4">
                <IonCard button onClick={() => navigateTo('sales-dashboard')} className="menu-card">
                  <IonCardContent className="menu-item">
                    <div className="menu-icon">
                      <IonIcon icon={statsChart} />
                    </div>
                    <div className="menu-content">
                      <IonText>
                        <h3>Dashboard de Ventas</h3>
                        <p>Estadísticas detalladas de ventas</p>
                      </IonText>
                      <IonBadge color="success">
                        {formatCurrency(orderStats?.total_revenue || 0)}
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" size-md="6" size-lg="4">
                <IonCard button onClick={() => navigateTo('banners')} className="menu-card">
                  <IonCardContent className="menu-item">
                    <div className="menu-icon">
                      <IonIcon icon={megaphone} />
                    </div>
                    <div className="menu-content">
                      <IonText>
                        <h3>Gestionar Banners</h3>
                        <p>{stats?.active_banners || 0} activos</p>
                      </IonText>
                      <IonBadge color={stats?.active_banners >= 10 ? 'danger' : 'success'}>
                        {stats?.active_banners >= 10 ? 'Completo' : 'Disponible'}
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" size-md="6" size-lg="4">
                <IonCard button onClick={() => navigateTo('comments')} className="menu-card">
                  <IonCardContent className="menu-item">
                    <div className="menu-icon">
                      <IonIcon icon={chatbubbles} />
                    </div>
                    <div className="menu-content">
                      <IonText>
                        <h3>Moderar Comentarios</h3>
                        <p>Gestionar comentarios reportados</p>
                      </IonText>
                      <IonBadge color="danger">
                        {stats?.reported_comments || 0} reportados
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" size-md="6" size-lg="4">
                <IonCard button onClick={() => navigateTo('reports')} className="menu-card">
                  <IonCardContent className="menu-item">
                    <div className="menu-icon">
                      <IonIcon icon={document} />
                    </div>
                    <div className="menu-content">
                      <IonText>
                        <h3>Reportes y Análisis</h3>
                        <p>Reportes detallados del sistema</p>
                      </IonText>
                      <IonBadge color="tertiary">
                        Ver análisis
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" size-md="6" size-lg="4">
                <IonCard button onClick={() => navigateTo('activity-logs')} className="menu-card">
                  <IonCardContent className="menu-item">
                    <div className="menu-icon">
                      <IonIcon icon={settings} />
                    </div>
                    <div className="menu-content">
                      <IonText>
                        <h3>Bitácora de Actividades</h3>
                        <p>Registro completo del sistema</p>
                      </IonText>
                      <IonBadge color="medium">
                        Ver logs
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" size-md="6" size-lg="4">
                <IonCard button onClick={() => navigateTo('backup')} className="menu-card">
                  <IonCardContent className="menu-item">
                    <div className="menu-icon">
                      <IonIcon icon={cloudDownload} />
                    </div>
                    <div className="menu-content">
                      <IonText>
                        <h3>Backup & Restauración</h3>
                        <p>Copia de seguridad de la base de datos</p>
                      </IonText>
                      <IonBadge color="warning">
                        Administrativo
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" size-md="6" size-lg="4">
                <IonCard button onClick={() => navigateTo('settings')} className="menu-card">
                  <IonCardContent className="menu-item">
                    <div className="menu-icon">
                      <IonIcon icon={settings} />
                    </div>
                    <div className="menu-content">
                      <IonText>
                        <h3>Configuración</h3>
                        <p>Configuración general del sistema</p>
                      </IonText>
                      <IonBadge color="primary">
                        Configurar
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Actividad reciente */}
        {recentActivities.length > 0 && (
          <div className="recent-activity">
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <IonCard>
                    <IonCardContent>
                      <IonText>
                        <h3>Actividad Reciente</h3>
                      </IonText>
                      <div className="activity-list">
                        {recentActivities.slice(0, 5).map((activity, index) => (
                          <div key={index} className="activity-item">
                            <IonText>
                              <p>
                                <strong>{activity.admin_username}</strong> - {activity.action}
                              </p>
                              <small>{new Date(activity.created_at).toLocaleString()}</small>
                            </IonText>
                          </div>
                        ))}
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;