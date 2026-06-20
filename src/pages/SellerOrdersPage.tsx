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
  IonLoading,
  IonModal,
  IonItem,
  IonInput,
  IonTextarea,
  IonToast,
  IonAlert,
  IonDatetime,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import {
  download,
  refresh,
  cart,
  timeOutline,
  cubeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  navigateOutline,
  camera,
  cameraOutline
} from 'ionicons/icons';
import { orderService, SellerOrder, TrackingData } from '../services/orderService';
import { pdfService } from '../services/pdfService';
import './SellerOrdersPage.css';

// Type definitions
type OrderTab = 'pending' | 'shipped' | 'cancelled';

const SellerOrdersPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<OrderTab>('pending');
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showCancellationAlert, setShowCancellationAlert] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Tracking Form
  const [trackingData, setTrackingData] = useState<TrackingData>({
    status: 'shipped',
    tracking_number: '',
    shipping_agency: 'Envíos Express VE',
    shipping_cost: 6.50,
    estimated_delivery: '',
    seller_notes: '',
    shipping_evidence: {
      image_url: '',
      description: ''
    }
  });

  useEffect(() => {
    loadSellerOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeTab]);

  const loadSellerOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getSellerOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading seller orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(order =>
          order.tracking_status === 'processing' ||
          order.tracking_status === 'pending' ||
          !order.tracking_status
        );
        break;
      case 'shipped':
        filtered = filtered.filter(order =>
          order.tracking_status === 'shipped'
        );
        break;
      case 'cancelled':
        filtered = filtered.filter(order =>
          order.tracking_status === 'cancelled'
        );
        break;
    }

    setFilteredOrders(filtered);
  };

  const handleRefresh = async (event: any) => {
    await loadSellerOrders();
    event.detail.complete();
  };

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['pending', 'processing'].includes(o.tracking_status)).length,
    active: orders.filter(o => o.tracking_status === 'shipped').length,
    completed: orders.filter(o => o.tracking_status === 'delivered').length
  };

  // Helpers
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Pendiente', color: '#ffc409', icon: timeOutline };
      case 'processing': return { label: 'Procesando', color: '#3880ff', icon: cubeOutline };
      case 'shipped': return { label: 'Enviado', color: '#3dc2ff', icon: navigateOutline };
      case 'delivered': return { label: 'Entregado', color: '#2dd36f', icon: checkmarkCircleOutline };
      case 'cancelled': return { label: 'Cancelado', color: '#eb445a', icon: closeCircleOutline };
      default: return { label: status, color: '#999999', icon: cart };
    }
  };

  const openTrackingModal = (order: SellerOrder) => {
    setSelectedOrder(order);
    setShowTrackingModal(true);
  };

  const submitTracking = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      await orderService.updateTracking(selectedOrder.order_item_id, trackingData);
      await loadSellerOrders();
      setShowTrackingModal(false);
      resetTrackingForm();
    } catch (error) {
      console.error('Error updating tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetTrackingForm = () => {
    setSelectedOrder(null);
    setTrackingData({
      status: 'shipped',
      tracking_number: '',
      shipping_agency: 'Envíos Express VE',
      shipping_cost: 0,
      estimated_delivery: '',
      seller_notes: '',
      shipping_evidence: { description: '', image_url: '' }
    });
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancellationReason) return;

    try {
      setLoading(true);
      await orderService.updateItemStatus(selectedOrder.order_item_id, {
        status: 'cancelled',
        cancellation_reason: cancellationReason
      });
      await loadSellerOrders();
      setShowCancellationAlert(false);
      setSelectedOrder(null);
      setCancellationReason('');
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const columns = ['ID Pedido', 'Fecha', 'Producto', 'Cliente', 'Total', 'Estado'];
    const rows = orders.map(order => {
      const dateVal = order.order_date || order.order_created_at || order.item_created_at;
      const formattedDate = dateVal ? new Date(dateVal).toLocaleDateString() : 'N/A';

      return [
        `#${order.order_item_id}`,
        formattedDate,
        order.product_name,
        order.buyer_username || 'Cliente',
        `US$ ${order.price * order.quantity}`,
        order.tracking_status
      ];
    });

    pdfService.generateTableReport(
      'Reporte de Mis Ventas',
      columns,
      rows,
      'mis_ventas_reporte'
    );
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" text="" />
          </IonButtons>
          <IonTitle>Mis Ventas</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleDownloadReport}>
              <IonIcon icon={download} />
            </IonButton>
            <IonButton onClick={loadSellerOrders}>
              <IonIcon icon={refresh} />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        <div className="custom-segment">
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as OrderTab)}
            mode="ios"
          >
            <IonSegmentButton value="pending"><IonLabel>Pendientes</IonLabel></IonSegmentButton>
            <IonSegmentButton value="shipped"><IonLabel>Enviados</IonLabel></IonSegmentButton>
            <IonSegmentButton value="cancelled"><IonLabel>Cancelados</IonLabel></IonSegmentButton>
          </IonSegment>
        </div>
      </IonHeader>

      <IonContent className="seller-orders-page">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonLoading isOpen={loading} message="Cargando ventas..." />

        <div className="sales-container">
          {/* Resumen de Estadísticas - Mostrar solo en la pestaña 'pendientes' o crear una vista */}
          {activeTab === 'pending' && !loading && (
            <div className="stats-card">
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.pending}</span>
                  <span className="stat-label">Pendientes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.completed}</span>
                  <span className="stat-label">Completadas</span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredOrders.length === 0 && (
            <div className="empty-wrapper">
              <div className="empty-icon-circle">
                <IonIcon icon={cubeOutline} style={{ fontSize: '48px', color: 'var(--ion-color-medium)' }} />
              </div>
              <h3 className="empty-title">No hay ventas aquí</h3>
              <p className="empty-desc">
                {activeTab === 'pending' ? 'Estás al día con tus envíos.' :
                  activeTab === 'shipped' ? 'No tienes envíos en tránsito.' :
                    'No tienes pedidos cancelados.'}
              </p>
            </div>
          )}

          {/* Sales List */}
          {filteredOrders.map(order => {
            const statusInfo = getStatusInfo(order.tracking_status);
            const orderDate = new Date(order.order_date || order.item_created_at || Date.now()).toLocaleDateString();

            return (
              <div key={order.order_item_id} className="sale-card-item">
                <div className="card-main-content">
                  {/* Header */}
                  <div className="card-header-flex">
                    <img
                      src={order.image_url || order.product_image || '/assets/placeholder.png'}
                      className="product-thumb"
                      onError={(e: any) => e.target.src = '/assets/placeholder.png'}
                    />
                    <div className="header-info">
                      <h3 className="product-title">{order.product_name}</h3>
                      <span className="order-date">Fecha: {orderDate}</span>
                    </div>
                    <div className="status-pill" style={{ backgroundColor: statusInfo.color }}>
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="details-grid">
                    <div className="detail-box">
                      <span className="detail-label">Comprador</span>
                      <span className="detail-value">{order.buyer_first_name} {order.buyer_last_name}</span>
                      <span className="detail-label" style={{ marginTop: '4px', fontSize: '0.65rem' }}>{order.buyer_username}</span>
                    </div>
                    <div className="detail-box">
                      <span className="detail-label">Total Venta</span>
                      <span className="detail-value price-highlight">
                        ${(order.price * order.quantity).toFixed(2)}
                      </span>
                      <span className="detail-label" style={{ marginTop: '4px' }}>Cant: {order.quantity}</span>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="shipping-section">
                    <span className="shipping-header">Datos de Envío</span>
                    <div className="shipping-address">
                      {order.shipping_agency && <strong>Agencia: {order.shipping_agency}<br /></strong>}
                      {order.shipping_address}<br />
                      {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                    </div>

                    {order.tracking_number && (
                      <div className="tracking-box">
                        <IonIcon icon={navigateOutline} />
                        Tracking: {order.tracking_number}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="card-actions">
                  {(order.tracking_status === 'processing' || order.tracking_status === 'pending') && (
                    <>
                      <IonButton
                        size="small"
                        fill="outline"
                        color="danger"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowCancellationAlert(true);
                        }}
                      >
                        Cancelar
                      </IonButton>
                      <IonButton
                        size="small"
                        fill="solid"
                        onClick={() => openTrackingModal(order)}
                      >
                        Procesar Envío
                      </IonButton>
                    </>
                  )}

                  {order.tracking_status === 'shipped' && (
                    <IonButton size="small" fill="outline" disabled>
                      Pedido enviado
                    </IonButton>
                  )}

                  {order.tracking_status === 'cancelled' && (
                    <IonLabel color="danger" style={{ fontSize: '0.8rem' }}>
                      Cancelado: {order.cancellation_reason || 'Sin razón'}
                    </IonLabel>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tracking Modal */}
        <IonModal isOpen={showTrackingModal} onDidDismiss={() => setShowTrackingModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Confirmar Envío</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowTrackingModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="modal-content ion-padding">
            {selectedOrder && (
              <div style={{ paddingTop: '10px' }}>
                <IonItem lines="none" className="detail-box" style={{ marginBottom: '20px' }}>
                  <IonLabel>
                    <h3>{selectedOrder.product_name}</h3>
                    <p>Para: {selectedOrder.buyer_first_name} {selectedOrder.buyer_last_name}</p>
                  </IonLabel>
                </IonItem>

                <IonLabel position="stacked">Número de Tracking *</IonLabel>
                <IonItem lines="none" className="modal-input-item">
                  <IonInput
                    value={trackingData.tracking_number}
                    onIonInput={e => setTrackingData({ ...trackingData, tracking_number: e.detail.value! })}
                    placeholder="Ej: 9988776655"
                  />
                </IonItem>

                <IonLabel position="stacked">Agencia de Envío *</IonLabel>
                <IonItem lines="none" className="modal-input-item">
                  <IonInput
                    value={trackingData.shipping_agency}
                    onIonInput={e => setTrackingData({ ...trackingData, shipping_agency: e.detail.value! })}
                    placeholder="Ej: DHL, FedEx"
                  />
                </IonItem>

                <IonLabel position="stacked">Costo de Envío</IonLabel>
                <IonItem lines="none" className="modal-input-item">
                  <IonInput
                    type="number"
                    value={trackingData.shipping_cost}
                    onIonInput={e => setTrackingData({ ...trackingData, shipping_cost: parseFloat(e.detail.value!) })}
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  style={{ marginTop: '24px' }}
                  onClick={submitTracking}
                  disabled={!trackingData.tracking_number || !trackingData.shipping_agency}
                >
                  Confirmar Envío
                </IonButton>
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Cancellation Alert */}
        <IonAlert
          isOpen={showCancellationAlert}
          onDidDismiss={() => setShowCancellationAlert(false)}
          header="Anular Pedido"
          message="¿Por qué deseas anular este pedido? El comprador será notificado."
          inputs={[
            {
              name: 'reason',
              type: 'textarea',
              placeholder: 'Motivo de la anulación (obligatorio)',
              value: cancellationReason
            }
          ]}
          buttons={[
            { text: 'Volver', role: 'cancel' },
            {
              text: 'Confirmar Anulación',
              handler: (data) => {
                if (!data.reason) return false;
                setCancellationReason(data.reason);
                handleCancelOrder();
              }
            }
          ]}
        />

      </IonContent>
    </IonPage>
  );
};

export default SellerOrdersPage;