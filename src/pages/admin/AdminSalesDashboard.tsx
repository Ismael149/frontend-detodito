import React, { useState, useEffect } from 'react';
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
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonLoading,
  IonBackButton,
  useIonViewWillEnter,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import {
  cash, boat, megaphone, refresh, warning, wallet, trendingUp
} from 'ionicons/icons';
import { adminOrderService } from '../../services/adminOrderService';
import axios from 'axios';
import { environment } from '../../environments/environment';
import './AdminDashboard.css';

const AdminSalesDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  const [earnings, setEarnings] = useState({
    shipping: 0,
    banners: 0,
    total: 0
  });

  const [stats, setStats] = useState({
    totalOrders: 0,
    activeBanners: 0
  });

  useEffect(() => {
    loadEarningsData();
  }, []);

  useIonViewWillEnter(() => {
    loadEarningsData();
  });

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Loading app earnings data...');

      const API_URL = `${environment.apiUrl}`;
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Orders (Limit 2000 for calculation)
      const allKeyOrders = await adminOrderService.getAllOrders({ limit: 2000 });

      const validOrders = allKeyOrders.orders.filter((o: any) => o.status !== 'cancelled');
      const shippingRevenue = validOrders.reduce((sum: number, o: any) => sum + (Number(o.shipping_cost) || 0), 0);

      // 2. Fetch Banners
      const bannersResponse = await axios.get(`${API_URL}/banners/admin/list`, { headers });
      const banners = bannersResponse.data.banners || [];

      const paidBanners = banners.filter((b: any) => b.status === 'active' || b.status === 'expired');
      const bannerRevenue = paidBanners.reduce((sum: number, b: any) => sum + (Number(b.cost) || 0), 0);

      setEarnings({
        shipping: shippingRevenue,
        banners: bannerRevenue,
        total: shippingRevenue + bannerRevenue
      });

      setStats({
        totalOrders: validOrders.length,
        activeBanners: banners.filter((b: any) => b.status === 'active').length
      });

    } catch (error: any) {
      console.error('❌ Error loading earnings:', error);
      setError('Error al calcular ganancias. Verifique conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async (event?: any) => {
    setRefreshing(true);
    await loadEarningsData();
    if (event && event.detail) {
      event.detail.complete();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading && !refreshing) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/admin/dashboard" text="" />
            </IonButtons>
            <IonTitle>Finanzas de la App</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={true} message="Calculando ganancias..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" text="" />
          </IonButtons>
          <IonTitle>Finanzas de la App</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleRefresh} disabled={refreshing}>
              <IonIcon icon={refresh} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="admin-dashboard">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {error && (
          <IonCard color="warning">
            <IonCardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IonIcon icon={warning} />
                <IonText><p>{error}</p></IonText>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <div className="stats-header">
                <IonText>
                  <h2>Ganancias de la Aplicación</h2>
                  <p>Ingresos netos por servicios (Envíos y Publicidad)</p>
                </IonText>
              </div>
            </IonCol>
          </IonRow>

          {/* MAIN CARD: TOTAL REVENUE */}
          <IonRow>
            <IonCol size="12">
              <IonCard className="stat-card total-revenue" style={{ background: 'linear-gradient(135deg, #2f80ed 0%, #1cb5e0 100%)', color: 'white' }}>
                <IonCardContent>
                  <div className="stat-content">
                    <IonIcon icon={wallet} className="stat-icon" style={{ color: 'rgba(255,255,255,0.8)' }} />
                    <div className="stat-info">
                      <IonText color="light">
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '8px 0' }}>
                          {formatCurrency(earnings.total)}
                        </h1>
                        <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>Ganancia Total Acumulada</p>
                      </IonText>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* BREAKDOWN CARDS */}
          <IonRow>
            {/* SHIPPING REVENUE */}
            <IonCol size="12" sizeMd="6">
              <IonCard className="stat-card">
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={boat} color="primary" />
                    Ingresos por Envíos
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="stat-info">
                    <IonText color="dark">
                      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
                        {formatCurrency(earnings.shipping)}
                      </h2>
                      <p className="ion-text-wrap">
                        Generado por {stats.totalOrders} órdenes procesadas.
                        <br />
                        <small style={{ color: '#666' }}>Tarifas de envío cobradas a clientes.</small>
                      </p>
                    </IonText>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* BANNER REVENUE */}
            <IonCol size="12" sizeMd="6">
              <IonCard className="stat-card">
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonIcon icon={megaphone} color="tertiary" />
                    Ingresos por Publicidad
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="stat-info">
                    <IonText color="dark">
                      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
                        {formatCurrency(earnings.banners)}
                      </h2>
                      <p>
                        Proveniente de Banners promocionales.
                        <br />
                        <small style={{ color: '#666' }}>{stats.activeBanners} banners actualmente activos.</small>
                      </p>
                    </IonText>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonCard color="light">
                <IonCardContent>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <IonIcon icon={trendingUp} color="success" size="large" />
                    <div>
                      <IonText color="dark">
                        <h3><strong>Nota sobre el cálculo</strong></h3>
                      </IonText>
                      <IonText color="medium">
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                          Estas ganancias representan exclusivamente los ingresos de la plataforma (Fees de envío + Publicidad).
                          El valor de los productos vendidos no se incluye, ya que pertenece a los vendedores.
                        </p>
                      </IonText>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default AdminSalesDashboard;