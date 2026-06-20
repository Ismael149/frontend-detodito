import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonBadge,
  IonText,
  IonLoading,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonChip,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonAlert,
  IonDatetime,
  IonModal,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import {
  search, filter, eye, refresh, calendar, person, cash,
  time, checkmarkCircle, closeCircle, arrowRedo, cube, helpCircle
} from 'ionicons/icons';
import { adminOrderService, Order, OrderFilters } from '../../services/adminOrderService';
import { useHistory } from 'react-router-dom';
import './AdminOrders.css';

const AdminOrdersPage: React.FC = () => {
  const history = useHistory();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState<any>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateFilterType, setDateFilterType] = useState<'from' | 'to'>('from');
  const [error, setError] = useState<string>('');
  const [showFiltersAlert, setShowFiltersAlert] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [hideFilters, setHideFilters] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async (append = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError('');
      }

      console.log('🔄 Loading orders with filters:', filters);

      const response = await adminOrderService.getAllOrders(filters);

      console.log('✅ Orders loaded:', response);

      if (append) {
        setOrders(prev => [...prev, ...response.orders]);
      } else {
        setOrders(response.orders);
      }

      setPagination(response.pagination);
      setStats(response.stats);
    } catch (error: any) {
      console.error('❌ Error loading orders:', error);
      setError(error.message || 'Error al cargar las órdenes');

      // Establecer valores por defecto en caso de error
      if (!append) {
        setOrders([]);
        setPagination({
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        });
        setStats({
          total_orders: 0,
          pending_orders: 0,
          processing_orders: 0,
          shipped_orders: 0,
          delivered_orders: 0,
          cancelled_orders: 0,
          total_revenue: 0
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status || undefined,
      page: 1
    }));
  };

  const handleDateFilter = (date: string, type: 'from' | 'to') => {
    setFilters(prev => ({
      ...prev,
      [`date_${type}`]: date,
      page: 1
    }));
  };

  const handleLoadMore = (event: any) => {
    if (pagination.page < pagination.totalPages) {
      setFilters(prev => ({
        ...prev,
        page: prev.page! + 1
      }));
    }
    event.target.complete();
  };

  const handleViewOrderDetails = (orderId: number) => {
    history.push(`/admin/orders/${orderId}`);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'pending': 'warning',
      'processing': 'primary',
      'shipped': 'secondary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'medium';
  };

  const getStatusIcon = (status: string) => {
    const icons: any = {
      'pending': time,
      'processing': cube,
      'shipped': arrowRedo,
      'delivered': checkmarkCircle,
      'cancelled': closeCircle
    };
    return icons[status] || helpCircle;
  };

  const getStatusText = (status: string) => {
    const translations: any = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return translations[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE');
  };

  const hasActiveFilters = () => {
    return !!filters.status || !!filters.search || !!filters.date_from || !!filters.date_to;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" text="" />
          </IonButtons>
          <IonTitle>Gestión de Órdenes</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowFiltersAlert(true)}>
              <IonIcon icon={filter} slot="icon-only" />
            </IonButton>
            <IonButton onClick={handleRefresh} disabled={refreshing}>
              <IonIcon icon={refresh} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Filters Section in Header for smooth hide-on-scroll */}
        {!hideFilters && (
          <IonToolbar className="filters-toolbar">
            <div className="filters-container-inner">
              <IonSearchbar
                placeholder="Buscar por ID, usuario o email..."
                onIonInput={(e) => handleSearch(e.detail.value!)}
                value={filters.search}
                animated
              />

              <div className="filter-chips-row">
                <IonButton
                  size="small"
                  fill={filters.date_from ? "solid" : "outline"}
                  onClick={() => {
                    setDateFilterType('from');
                    setShowDateModal(true);
                  }}
                  className="date-filter-btn"
                >
                  <IonIcon icon={calendar} slot="start" />
                  {filters.date_from ? formatDate(filters.date_from) : 'Desde'}
                </IonButton>

                <IonButton
                  size="small"
                  fill={filters.date_to ? "solid" : "outline"}
                  onClick={() => {
                    setDateFilterType('to');
                    setShowDateModal(true);
                  }}
                  className="date-filter-btn"
                >
                  <IonIcon icon={calendar} slot="start" />
                  {filters.date_to ? formatDate(filters.date_to) : 'Hasta'}
                </IonButton>

                {hasActiveFilters() && (
                  <IonButton
                    size="small"
                    fill="clear"
                    color="danger"
                    onClick={clearFilters}
                  >
                    Limpiar
                  </IonButton>
                )}
              </div>
            </div>
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent
        className="admin-orders-page"
        scrollEvents={true}
        onIonScroll={(e) => {
          const scrollTop = e.detail.scrollTop;
          const delta = scrollTop - lastScrollTop;

          if (scrollTop < 50) {
            setHideFilters(false);
          } else if (Math.abs(delta) > 10) {
            if (delta > 0 && scrollTop > 150) {
              setHideFilters(true);
            } else if (delta < 0) {
              setHideFilters(false);
            }
            setLastScrollTop(scrollTop);
          }
        }}
      >
        <IonRefresher slot="fixed" onIonRefresh={(e) => {
           handleRefresh();
           e.detail.complete();
        }}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Mostrar error si existe */}
        {error && (
          <IonCard color="warning">
            <IonCardContent>
              <IonText>
                <p>{error}</p>
              </IonText>
            </IonCardContent>
          </IonCard>
        )}

        {/* Lista de órdenes */}
        {loading && !refreshing ? (
          <IonLoading isOpen={true} message="Cargando órdenes..." />
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <IonText color="medium">
              <h3>No se encontraron órdenes</h3>
              <p>{hasActiveFilters() ? 'Intenta con otros filtros' : 'Aún no hay órdenes en el sistema'}</p>
            </IonText>
          </div>
        ) : (
          <>
            <IonGrid>
              <IonRow>
                {orders.map((order) => (
                  <IonCol size="12" key={order.id}>
                    <IonCard className="order-card">
                      <IonCardContent>
                        <IonGrid>
                          <IonRow>
                            <IonCol size="12" sizeMd="8">
                              <div className="order-info">
                                <IonText>
                                  <h3>Orden #{order.id}</h3>
                                </IonText>

                                <div className="order-details">
                                  <IonChip color={getStatusColor(order.status)} className="order-status-chip">
                                    <IonIcon icon={getStatusIcon(order.status)} />
                                    <IonLabel>{getStatusText(order.status)}</IonLabel>
                                  </IonChip>

                                  <IonText color="medium">
                                    <small>
                                      <IonIcon icon={person} />
                                      {order.username} • {order.email}
                                    </small>
                                  </IonText>

                                  <IonText color="primary">
                                    <strong>
                                      <IonIcon icon={cash} />
                                      {formatCurrency(order.total)}
                                    </strong>
                                  </IonText>
                                </div>

                                <div className="order-meta">
                                  <IonText color="medium">
                                    <small>
                                      Creada: {formatDate(order.created_at)}
                                      {order.updated_at !== order.created_at &&
                                        ` • Actualizada: ${formatDate(order.updated_at)}`
                                      }
                                    </small>
                                  </IonText>
                                </div>

                                {order.items && order.items.length > 0 && (
                                  <div className="order-items-preview">
                                    <IonText color="medium">
                                      <small>
                                        Productos: {order.items.length} •
                                        Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                                      </small>
                                    </IonText>
                                  </div>
                                )}
                              </div>
                            </IonCol>

                            <IonCol size="12" sizeMd="4">
                              <div className="order-actions">
                                <IonButton
                                  expand="block"
                                  fill="solid"
                                  onClick={() => handleViewOrderDetails(order.id)}
                                >
                                  <IonIcon icon={eye} slot="start" />
                                  Ver Detalles
                                </IonButton>
                              </div>
                            </IonCol>
                          </IonRow>
                        </IonGrid>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>

            {/* Paginación infinita */}
            <IonInfiniteScroll
              onIonInfinite={handleLoadMore}
              disabled={pagination.page >= pagination.totalPages}
            >
              <IonInfiniteScrollContent
                loadingText="Cargando más órdenes..."
              />
            </IonInfiniteScroll>

            {/* Información de paginación */}
            <div className="pagination-info">
              <IonText color="medium">
                <p>
                  Mostrando {orders.length} de {pagination.total} órdenes
                  {pagination.totalPages > 1 && ` • Página ${pagination.page} de ${pagination.totalPages}`}
                </p>
              </IonText>
            </div>
          </>
        )}

        {/* Modal para selección de fecha */}
        <IonModal
          isOpen={showDateModal}
          onDidDismiss={() => setShowDateModal(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>
                Seleccionar Fecha {dateFilterType === 'from' ? 'Inicial' : 'Final'}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowDateModal(false)}>
                  Cerrar
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonDatetime
              presentation="date"
              onIonChange={(e) => {
                if (e.detail.value) {
                  handleDateFilter(e.detail.value as string, dateFilterType);
                  setShowDateModal(false);
                }
              }}
            />
          </IonContent>
        </IonModal>

        <IonLoading isOpen={refreshing} message="Actualizando órdenes..." />

        {/* Alerta de Filtros de Estado */}
        <IonAlert
          isOpen={showFiltersAlert}
          onDidDismiss={() => setShowFiltersAlert(false)}
          header="Filtrar por Estado"
          subHeader="Selecciona una categoría"
          inputs={[
            {
              name: 'all',
              type: 'radio',
              label: 'Todos los estados',
              value: '',
              checked: !filters.status
            },
            {
              name: 'pending',
              type: 'radio',
              label: 'Pendientes',
              value: 'pending',
              checked: filters.status === 'pending'
            },
            {
              name: 'processing',
              type: 'radio',
              label: 'Procesando',
              value: 'processing',
              checked: filters.status === 'processing'
            },
            {
              name: 'shipped',
              type: 'radio',
              label: 'Enviadas',
              value: 'shipped',
              checked: filters.status === 'shipped'
            },
            {
              name: 'delivered',
              type: 'radio',
              label: 'Entregadas',
              value: 'delivered',
              checked: filters.status === 'delivered'
            },
            {
              name: 'cancelled',
              type: 'radio',
              label: 'Canceladas',
              value: 'cancelled',
              checked: filters.status === 'cancelled'
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Aplicar',
              handler: (value) => {
                handleStatusFilter(value);
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminOrdersPage;