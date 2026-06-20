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
  cameraOutline
} from 'ionicons/icons';
import { orderService } from '../../services/orderService';
import { pdfService } from '../../services/pdfService';
import './SellerSalesPage.css';

// Types
type SalesFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const SellerSalesPage: React.FC = () => {
  // State
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SalesFilter>('all');

  // Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [statusForm, setStatusForm] = useState({
    status: '',
    tracking_number: '',
    cancellation_reason: ''
  });

  // Load Data
  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await orderService.getSellerOrders();
      setSales(data || []);
    } catch (error) {
      console.error('Error loading sales:', error);
      showToastMessage('Error cargando ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadSales();
    event.detail.complete();
  };

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  // Filter Logic
  const filteredSales = sales.filter(item => {
    if (statusFilter === 'all') return true;
    return item.item_status === statusFilter;
  });

  // Calculate Stats
  const stats = {
    total: sales.length,
    pending: sales.filter(s => s.item_status === 'pending').length,
    active: sales.filter(s => ['processing', 'shipped'].includes(s.item_status)).length,
    completed: sales.filter(s => s.item_status === 'delivered').length
  };

  // Status Helpers
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

  // Modal handlers
  const openStatusModal = (item: any, newStatus: string) => {
    setSelectedItem(item);
    setStatusForm({
      status: newStatus,
      tracking_number: item.tracking_number || '',
      cancellation_reason: ''
    });
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedItem) return;
    try {
      await orderService.updateItemStatus(selectedItem.id, statusForm);
      showToastMessage('Estado actualizado correctamente');
      setShowStatusModal(false);
      loadSales();
    } catch (error) {
      console.error('Update error:', error);
      showToastMessage('Error al actualizar estado');
    }
  };

  const handleDownloadSalesReport = () => {
    const columns = ['ID Item', 'Fecha', 'Producto', 'Cliente', 'Total', 'Estado'];
    const rows = filteredSales.map(sale => [
      `#${sale.id}`,
      new Date(sale.created_at).toLocaleDateString(),
      sale.product_name,
      sale.buyer_name || 'Cliente',
      `US$ ${sale.item_price * sale.quantity}`,
      sale.item_status
    ]);

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
          <IonTitle>Gestión de Ventas</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleDownloadSalesReport}>
              <IonIcon icon={download} />
            </IonButton>
            <IonButton onClick={loadSales}>
              <IonIcon icon={refresh} />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        <div className="custom-segment">
          <IonSegment
            value={statusFilter}
            onIonChange={e => setStatusFilter(e.detail.value as SalesFilter)}
            mode="ios"
            scrollable
          >
            <IonSegmentButton value="all"><IonLabel>Todas</IonLabel></IonSegmentButton>
            <IonSegmentButton value="pending"><IonLabel>Nuevas</IonLabel></IonSegmentButton>
            <IonSegmentButton value="processing"><IonLabel>Proceso</IonLabel></IonSegmentButton>
            <IonSegmentButton value="shipped"><IonLabel>Enviadas</IonLabel></IonSegmentButton>
          </IonSegment>
        </div>
      </IonHeader>

      <IonContent className="seller-sales-page">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Loading State */}
        <IonLoading isOpen={loading} message="Cargando tus ventas..." />

        <div className="sales-container">
          {/* Stats Summary */}
          {!loading && statusFilter === 'all' && (
            <div className="stats-card">
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.active}</span>
                  <span className="stat-label">Activas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.completed}</span>
                  <span className="stat-label">Completadas</span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredSales.length === 0 && (
            <div className="empty-wrapper">
              <div className="empty-icon-circle">
                <IonIcon icon={cart} style={{ fontSize: '48px', color: 'var(--ion-color-medium)' }} />
              </div>
              <h3 className="empty-title">Sin ventas encontradas</h3>
              <p className="empty-desc">
                No hay ventas en esta categoría por el momento.
              </p>
            </div>
          )}

          {/* Sales List */}
          {filteredSales.map((sale) => {
            const statusInfo = getStatusInfo(sale.item_status);

            return (
              <div key={sale.id} className="sale-card-item">
                {/* Header Part */}
                <div className="card-main-content">
                  <div className="card-header-flex">
                    <img
                      src={sale.product_image || '/assets/placeholder.png'}
                      className="product-thumb"
                      onError={(e: any) => e.target.src = '/assets/placeholder.png'}
                    />
                    <div className="header-info">
                      <h3 className="product-title">{sale.product_name}</h3>
                      <span className="order-date">
                        Fecha: {new Date(sale.order_created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="status-pill" style={{ backgroundColor: statusInfo.color }}>
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="details-grid">
                    <div className="detail-box">
                      <span className="detail-label">Comprador</span>
                      <span className="detail-value">{sale.buyer_username}</span>
                    </div>
                    <div className="detail-box">
                      <span className="detail-label">Total ID #{sale.id}</span>
                      <span className="detail-value price-highlight">
                        ${(sale.price * sale.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="shipping-section">
                    <span className="shipping-header">Dirección de Envío</span>
                    <div className="shipping-address">
                      <strong>{sale.shipping_name}</strong><br />
                      {sale.shipping_address}<br />
                      {sale.shipping_city}, {sale.shipping_state}
                    </div>
                    {sale.tracking_number && (
                      <div className="tracking-box">
                        <IonIcon icon={navigateOutline} />
                        Tracking: {sale.tracking_number}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                {['pending', 'processing', 'shipped'].includes(sale.item_status) && (
                  <div className="card-actions">
                    {sale.item_status === 'pending' && (
                      <>
                        <IonButton
                          size="small"
                          fill="outline"
                          color="danger"
                          onClick={() => openStatusModal(sale, 'cancelled')}
                        >
                          Rechazar
                        </IonButton>
                        <IonButton
                          size="small"
                          fill="solid"
                          onClick={() => openStatusModal(sale, 'processing')}
                        >
                          Procesar
                        </IonButton>
                      </>
                    )}

                    {sale.item_status === 'processing' && (
                      <IonButton
                        size="small"
                        color="secondary"
                        onClick={() => openStatusModal(sale, 'shipped')}
                      >
                        Marcar Enviado
                      </IonButton>
                    )}

                    {sale.item_status === 'shipped' && (
                      <IonButton
                        size="small"
                        color="success"
                        onClick={() => openStatusModal(sale, 'delivered')}
                      >
                        Confirmar Entrega
                      </IonButton>
                    )}
                  </div>
                )}

                {sale.item_status === 'cancelled' && (
                  <div className="card-actions" style={{ justifyContent: 'center', color: '#eb445a' }}>
                    <small>Cancelado: {sale.cancellation_reason || 'Sin razón'}</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal para Actualizar Estado */}
        <IonModal
          isOpen={showStatusModal}
          onDidDismiss={() => setShowStatusModal(false)}
          initialBreakpoint={0.5}
          breakpoints={[0, 0.5, 0.8]}
        >
          <IonContent className="modal-content spin-y-scroll">
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginTop: 0 }}>Actualizar Estado</h2>
              <p>Vas a cambiar el estado a: <strong>{getStatusInfo(statusForm.status).label}</strong></p>

              {/* Condicional inputs based on status */}
              {(statusForm.status === 'shipped' || statusForm.status === 'delivered') && (
                <div style={{ marginTop: '20px' }}>
                  <IonLabel position="stacked">Número de Guía / Tracking</IonLabel>
                  <IonItem lines="none" style={{ border: '1px solid #ccc', borderRadius: '8px', marginTop: '8px', '--background': 'transparent' }}>
                    <IonInput
                      placeholder="Ej. FEDEX-123445"
                      value={statusForm.tracking_number}
                      onIonChange={e => setStatusForm({ ...statusForm, tracking_number: e.detail.value! })}
                    />
                  </IonItem>
                </div>
              )}

              {statusForm.status === 'cancelled' && (
                <div style={{ marginTop: '20px' }}>
                  <IonLabel position="stacked">Razón de cancelación</IonLabel>
                  <IonItem lines="none" style={{ border: '1px solid #ccc', borderRadius: '8px', marginTop: '8px', '--background': 'transparent' }}>
                    <IonTextarea
                      rows={4}
                      placeholder="Explica el motivo..."
                      value={statusForm.cancellation_reason}
                      onIonChange={e => setStatusForm({ ...statusForm, cancellation_reason: e.detail.value! })}
                    />
                  </IonItem>
                </div>
              )}

              <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                <IonButton expand="block" fill="outline" style={{ flex: 1 }} onClick={() => setShowStatusModal(false)}>
                  Cancelar
                </IonButton>
                <IonButton expand="block" style={{ flex: 1 }} onClick={handleUpdateStatus}>
                  Confirmar
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color="dark"
        />

      </IonContent>
    </IonPage>
  );
};

export default SellerSalesPage;
