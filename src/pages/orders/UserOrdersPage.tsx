import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonThumbnail,
  IonText,
  IonBadge,
  IonIcon,
  IonButton,
  IonLoading,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSearchbar,
  IonAccordion,
  IonAccordionGroup,
  IonChip,
  IonLabel,
  IonToast
} from '@ionic/react';
import {
  receipt, time, checkmarkCircle, closeCircle, cart, car,
  download, refresh, cube, pin, storefront, documentText
} from 'ionicons/icons';
import ProductImage from '../../components/ProductImage';
import { orderService } from '../../services/orderService';
import { pdfService } from '../../services/pdfService';
import './UserOrdersPage.css';

type OrderStatus = 'processing' | 'shipped' | 'cancelled';

const UserOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingInvoice, setGeneratingInvoice] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('processing');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchTerm]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getUserOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by Tab Status
    if (statusFilter === 'processing') {
      filtered = filtered.filter(order => {
        const status = getOrderDisplayStatus(order);
        // Mostrar tanto 'pending' como 'processing' bajo la pestaña "Procesando"
        return status === 'pending' || status === 'processing' || !status;
      });
    } else if (statusFilter === 'shipped') {
      filtered = filtered.filter(order => getOrderDisplayStatus(order) === 'shipped');
    } else if (statusFilter === 'cancelled') {
      filtered = filtered.filter(order => getOrderDisplayStatus(order) === 'cancelled');
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.items.some((item: any) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  };

  const handleRefresh = async (event: any) => {
    await loadOrders();
    event.detail.complete();
  };

  const handleGenerateInvoice = async (orderId: number) => {
    try {
      setGeneratingInvoice(orderId);
      setDownloading(true);
      // Simplificamos: downloadInvoice ya se encarga de generarla en el servidor si no existe
      await orderService.downloadInvoice(orderId);
      setToastMessage('Documento listo');
      setShowToast(true);
    } catch (error: any) {
      console.error('Error with invoice:', error);
      // Alerta de diagnóstico para depuración directa en el dispositivo
      const errorMessage = error.message || 'Error desconocido';
      setToastMessage(`Fallo: ${errorMessage}`);
      setShowToast(true);
      alert(`Error Factura (ID ${orderId}): ${errorMessage}`);
    } finally {
      setGeneratingInvoice(null);
      setDownloading(false);
    }
  };

  const handleDownloadReport = () => {
    const columns = ['ID Pedido', 'Fecha', 'Productos', 'Total', 'Estado'];
    const rows = filteredOrders.map(order => [
      `#${order.id}`,
      new Date(order.created_at).toLocaleDateString(),
      order.items.map((item: any) => `${item.name} (x${item.quantity})`).join(', '),
      `US$ ${order.total}`,
      formatStatus(getOrderDisplayStatus(order))
    ]);

    pdfService.generateTableReport(
      'Reporte de Mis Compras',
      columns,
      rows,
      'mis_compras_reporte'
    );
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'pending': 'warning', // Aunque visualmente ahora todo será 'Procesando' con color primario abajo?
      // El usuario pidió "eliminar el status pendiente", así que usaremos el color de processing
      'processing': 'primary',
      'shipped': 'secondary',
      'delivered': 'success',
      'cancelled': 'danger'
    };

    // Override: si es pending, mostrar como processing (primary) o warning?
    // "cambia el estado de todos esos pedidos que dicen 'pendiente' por 'procesando'"
    if (status === 'pending') return 'primary';

    return colors[status] || 'medium';
  };

  const formatStatus = (status: string) => {
    const statusMap: any = {
      'pending': 'Procesando', // Override solicitado
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getOrderDisplayStatus = (order: any) => {
    const statuses = order.items.map((item: any) => item.item_status);
    if (statuses.length > 0 && statuses.every((s: string) => s === 'cancelled')) return 'cancelled';
    if (statuses.includes('delivered')) return 'delivered';
    if (statuses.includes('shipped')) return 'shipped';
    if (statuses.includes('processing')) return 'processing';
    return order.status || 'pending';
  };

  const renderItemStatusIndicator = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'shipped':
        return (
          <div className="item-status-icon success-status" title="Enviado/Entregado">
            <IonIcon icon={checkmarkCircle} />
          </div>
        );
      case 'cancelled':
        return (
          <div className="item-status-icon danger-status" title="Cancelado">
            <IonIcon icon={closeCircle} />
          </div>
        );
      case 'pending':
      case 'processing':
      default:
        return (
          <div className="item-status-icon warning-status" title="En proceso">
            <IonIcon icon={time} />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border premium-header">
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/profile" text="" />
            </IonButtons>
            <IonTitle>Mis Pedidos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="orders-loading-state">
            <IonLoading isOpen={true} message="Cargando tus compras..." />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border premium-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" text="" />
          </IonButtons>
          <IonTitle>Mis Pedidos</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleDownloadReport}>
              <IonIcon icon={documentText} slot="icon-only" />
            </IonButton>
            <IonButton onClick={loadOrders}>
              <IonIcon icon={refresh} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <div className="orders-header-filters">
          <IonSearchbar
            value={searchTerm}
            onIonInput={(e) => setSearchTerm(e.detail.value!)}
            placeholder="Buscar pedido..."
            className="premium-search"
          />
          <IonSegment
            value={statusFilter}
            onIonChange={(e) => setStatusFilter(e.detail.value as OrderStatus)}
            className="premium-segment"
            mode="ios"
          >
            <IonSegmentButton value="processing"><IonLabel>Procesando</IonLabel></IonSegmentButton>
            <IonSegmentButton value="shipped"><IonLabel>Enviados</IonLabel></IonSegmentButton>
            <IonSegmentButton value="cancelled"><IonLabel>Cancelados</IonLabel></IonSegmentButton>
          </IonSegment>
        </div>
      </IonHeader>

      <IonContent className="orders-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <IonIcon icon={receipt} />
            <h3>No hay pedidos</h3>
            <p>Aún no has realizado compras que coincidan.</p>
            <IonButton routerLink="/home" fill="clear">Ir a la tienda</IonButton>
          </div>
        ) : (
          <IonAccordionGroup className="orders-accordion-group">
            {filteredOrders.map((order) => (
              <IonAccordion key={order.id} value={order.id.toString()} className="order-receipt-card">
                <div slot="header" className="order-card-header">
                  <div className="order-thumb">
                    <ProductImage
                      imageUrl={order.items[0]?.image_url || order.items[0]?.product_image}
                      alt="Order"
                    />
                  </div>
                  <div className="order-meta">
                    <div className="order-top-line">
                      <span className="order-number">ORD #{order.id}</span>
                      <IonBadge color={getStatusColor(getOrderDisplayStatus(order))} className="order-status-pill">
                        {formatStatus(getOrderDisplayStatus(order))}
                      </IonBadge>
                    </div>
                    <div className="order-bottom-line">
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      <span className="dot">•</span>
                      <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>
                  <div className="order-total-price">
                    <span>${order.total}</span>
                  </div>
                </div>

                <div slot="content" className="order-card-content">
                  <div className="order-items-list">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="order-item-row">
                        <div className="item-img">
                          <ProductImage imageUrl={item.image_url || item.product_image} alt={item.name} />
                          {renderItemStatusIndicator(item.item_status || 'processing')}
                        </div>
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-seller">
                            <IonIcon icon={storefront} /> {item.seller_username}
                          </span>
                          <div className="item-qty-price">
                            <span>x{item.quantity}</span>
                            <span>${item.price}</span>
                          </div>
                          {item.seller_notes && (
                            <div className="item-note">
                              <strong>Nota:</strong> "{item.seller_notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-breakdown">
                    <h3>Detalles del Pedido</h3>
                    <div className="breakdown-row">
                      <span>Dirección</span>
                      <span>{order.shipping_address}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Agencia</span>
                      <span>{order.shipping_agency || 'N/A'}</span>
                    </div>
                    <div className="divider"></div>
                    <div className="breakdown-row">
                      <span>Subtotal</span>
                      <span>${(order.total - order.shipping_cost).toFixed(2)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Envío</span>
                      <span>${order.shipping_cost}</span>
                    </div>
                    <div className="breakdown-row total">
                      <span>Total</span>
                      <span>${order.total}</span>
                    </div>
                  </div>

                  <div className="order-actions-bar">
                    <IonButton
                      fill="outline"
                      size="small"
                      onClick={() => handleGenerateInvoice(order.id)}
                      disabled={generatingInvoice === order.id}
                      className="receipt-btn"
                    >
                      <IonIcon icon={download} slot="start" />
                      Factura
                    </IonButton>

                    {order.status === 'shipped' && (
                      <IonBadge className="tracking-badge">
                        <IonIcon icon={pin} /> {order.tracking_number}
                      </IonBadge>
                    )}
                  </div>
                </div>
              </IonAccordion>
            ))}
          </IonAccordionGroup>
        )}
      </IonContent>
      <IonLoading isOpen={generatingInvoice !== null} message="Preparando documento..." />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
        color={toastMessage.includes('Error') ? 'danger' : 'success'}
      />
    </IonPage>
  );
};

export default UserOrdersPage;
