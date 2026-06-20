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
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonLoading,
  IonBadge,
  IonItem,
  IonLabel,
  IonChip,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonThumbnail,
  IonAccordion,
  IonAccordionGroup,
  IonList,
  IonToast
} from '@ionic/react';
import {
  arrowBack, download, refresh, checkmarkCircle, closeCircle,
  time, cube, arrowRedo, person, location, card, document,
  calendar, cash, informationCircle, images, megaphone,
  chatbubbles, list, shieldCheckmark
} from 'ionicons/icons';
import { adminOrderService, OrderDetails } from '../../services/adminOrderService';
import { useHistory, useParams } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUtils';
import './AdminOrderDetails.css';

export const AdminOrderDetails: React.FC = () => {
  const history = useHistory();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderDetails = await adminOrderService.getOrderDetails(parseInt(orderId));
      setOrder(orderDetails);
      setNewStatus(orderDetails.status);
      setAdminNotes(orderDetails.admin_notes || '');
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;

    try {
      setUpdating(true);
      await adminOrderService.updateOrderStatus(
        parseInt(orderId),
        newStatus,
        adminNotes
      );
      await loadOrderDetails(); // Recargar detalles
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      setDownloading(true);
      console.log('📄 Initiating invoice download for order:', order.id);
      await adminOrderService.downloadInvoice(order.id);
      setToastMessage('Factura lista para guardar');
      setShowToast(true);
    } catch (error: any) {
      console.error('❌ Error downloading invoice:', error);
      setToastMessage(`Error: ${error.message || 'No se pudo descargar la factura'}`);
      setShowToast(true);
    } finally {
      setDownloading(false);
    }
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
    return icons[status] || 'help';
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

  const getItemStatusColor = (status: string) => {
    const colors: any = {
      'pending': 'warning',
      'processing': 'primary',
      'shipped': 'secondary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'medium';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodText = (method: string) => {
    if (!method) return '';
    const m = method.toLowerCase();
    const translations: any = {
      'credit_card': 'Tarjeta de Crédito',
      'debit_card': 'Tarjeta de Débito',
      'paypal': 'PayPal',
      'bank_transfer': 'Transferencia Bancaria',
      'cash': 'Efectivo',
      'mobile_payment': 'Pago Móvil',
      'stripe': 'Stripe (Tarjeta)'
    };
    return translations[m] || method;
  };

  const getPaymentStatusText = (status: string) => {
    if (!status) return '';
    const s = status.toLowerCase();
    const translations: any = {
      'paid': 'Pagado',
      'completed': 'Pagado',
      'pending': 'Pendiente',
      'unpaid': 'No Pagado',
      'failed': 'Fallido',
      'refunded': 'Reembolsado',
      'cancelled': 'Cancelado',
      'processing': 'Procesando'
    };
    return translations[s] || status;
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/admin/orders" text="" />
            </IonButtons>
            <IonTitle>Cargando Orden...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={true} message="Cargando detalles de la orden..." />
        </IonContent>
      </IonPage>
    );
  }

  if (!order) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/admin/orders" text="" />
            </IonButtons>
            <IonTitle>Orden No Encontrada</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="order-not-found">
            <IonText color="danger">
              <h3>Orden no encontrada</h3>
              <p>La orden solicitada no existe o no tienes permisos para verla.</p>
            </IonText>
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
            <IonBackButton defaultHref="/admin/orders" text="" />
          </IonButtons>
          <IonTitle>Orden #{order.id}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={loadOrderDetails}>
              <IonIcon icon={refresh} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="admin-order-details">
        <IonGrid className="ion-padding">
          {/* SECCIÓN 1: CABECERA Y ESTADO CRÍTICO */}
          <IonRow>
            <IonCol size="12">
              <IonCard className="order-header-card">
                <IonCardContent>
                  <IonGrid className="ion-no-padding">
                    <IonRow className="ion-align-items-center">
                      <IonCol size="12" sizeMd="7">
                        <div className="order-title-group">
                          <IonText>
                            <h2 className="ion-no-margin">Detalles de Orden #{order.id}</h2>
                            <p className="order-creation-date">
                              <IonIcon icon={calendar} />
                              {formatDate(order.created_at)}
                            </p>
                          </IonText>

                          <div className="status-badge-container">
                            <IonChip color={getStatusColor(order.status)} className="main-status-chip">
                              <IonIcon icon={getStatusIcon(order.status)} />
                              <IonLabel>{getStatusText(order.status)}</IonLabel>
                            </IonChip>
                            <IonButton
                              size="small"
                              fill="solid"
                              color="light"
                              className="update-status-btn"
                              onClick={() => setShowStatusModal(true)}
                            >
                              Gestionar Estado
                            </IonButton>
                          </div>
                        </div>
                      </IonCol>
                      <IonCol size="12" sizeMd="5" className="ion-text-right mobile-text-left">
                        <div className="order-total-display">
                          <IonText color="primary">
                            <p className="total-label">Total a Cobrar</p>
                            <h1 className="total-amount">{formatCurrency(order.total)}</h1>
                          </IonText>
                          <IonButton
                            fill="outline"
                            className="download-invoice-btn"
                            onClick={handleDownloadInvoice}
                          >
                            <IonIcon icon={download} slot="start" />
                            Factura PDF
                          </IonButton>
                        </div>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* SECCIÓN 2: NOTAS ADMINISTRATIVAS - Solo si existen */}
          {order.admin_notes && (
            <IonRow>
              <IonCol size="12">
                <IonCard className="admin-notes-display-card">
                  <IonCardContent className="admin-notes-content">
                    <div className="admin-notes-header">
                      <IonIcon icon={informationCircle} />
                      <span>Nota Interna del Administrador</span>
                    </div>
                    <div className="admin-notes-text">
                      <p>{order.admin_notes}</p>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}

          <IonRow>
            {/* SECCIÓN 3: INFORMACIÓN DEL CLIENTE Y ENVÍO */}
            <IonCol size="12" sizeLg="8">
              <IonRow className="ion-no-padding">
                <IonCol size="12" sizeMd="6">
                  <IonCard className="info-sub-card">
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={person} /> Cliente
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <div className="details-list">
                        <div className="detail-item">
                          <span className="detail-label"><IonIcon icon={document} /> Nombre Completo</span>
                          <span className="detail-value">{order.username}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label"><IonIcon icon={megaphone} /> Correo Electrónico</span>
                          <span className="detail-value">{order.email}</span>
                        </div>
                        {order.phone && (
                          <div className="detail-item">
                            <span className="detail-label"><IonIcon icon={chatbubbles} /> Teléfono</span>
                            <span className="detail-value">{order.phone}</span>
                          </div>
                        )}
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="12" sizeMd="6">
                  <IonCard className="info-sub-card">
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={location} /> Entrega
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <div className="details-list">
                        <div className="detail-item">
                          <span className="detail-label"><IonIcon icon={person} /> Destinatario</span>
                          <span className="detail-value">{order.shipping_name}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label"><IonIcon icon={location} /> Dirección Detallada</span>
                          <span className="detail-value multiline">{order.shipping_address}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label"><IonIcon icon={time} /> Ciudad y Estado</span>
                          <span className="detail-value">{order.shipping_city}, {order.shipping_state}</span>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>

              <IonRow className="ion-no-padding">
                <IonCol size="12" sizeMd="6">
                  <IonCard className="info-sub-card">
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={card} /> Pago
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <div className="details-list">
                        <div className="detail-item">
                          <span className="detail-label"><IonIcon icon={cash} /> Método de Pago</span>
                          <span className="detail-value">{getPaymentMethodText(order.payment_method)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label"><IonIcon icon={checkmarkCircle} /> Estatus del Pago</span>
                          <div className="ion-margin-top">
                            <IonBadge color={(order.payment_status === 'paid' || order.payment_status === 'completed') ? 'success' : 'warning'} className="premium-badge">
                              {getPaymentStatusText(order.payment_status)}
                            </IonBadge>
                          </div>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="12" sizeMd="6">
                  <IonCard className="info-sub-card">
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={cube} /> Logística
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <div className="details-list">
                        <div className="detail-item">
                          <span className="detail-label"><IonIcon icon={megaphone} /> Agencia de Envío</span>
                          <span className="detail-value">{order.shipping_agency}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label"><IonIcon icon={list} /> Número de Guía</span>
                          <span className="detail-value">{order.tracking_number || 'Pendiente de asignar'}</span>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>

              {/* LISTA DE PRODUCTOS */}
              <IonRow className="ion-no-padding">
                <IonCol size="12">
                  <IonCard className="products-list-card">
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={document} /> Resumen de Compra
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="ion-no-padding">
                      <IonAccordionGroup>
                        {order.items.map((item) => (
                          <IonAccordion key={item.id} value={`item-${item.id}`} className="product-accordion">
                            <div slot="header" className="order-item-header-custom">
                              <IonGrid className="ion-no-padding">
                                <IonRow className="ion-align-items-center">
                                  <IonCol size="auto">
                                    <IonThumbnail className="product-thumbnail">
                                      <img
                                        src={getImageUrl(item.primary_image)}
                                        alt={item.product_name}
                                      />
                                    </IonThumbnail>
                                  </IonCol>
                                  <IonCol className="ion-padding-start">
                                    <h3 className="product-name">{item.product_name}</h3>
                                    <div className="product-meta-row">
                                      <IonChip color={getItemStatusColor(item.item_status)} className="tiny-chip">
                                        <IonIcon icon={getStatusIcon(item.item_status)} />
                                        <IonLabel>{getStatusText(item.item_status)}</IonLabel>
                                      </IonChip>
                                      <span className="qty-price-label">
                                        {item.quantity} unidades × {formatCurrency(item.price)}
                                      </span>
                                    </div>
                                  </IonCol>
                                  <IonCol size="auto" className="ion-text-right">
                                    <div className="item-subtotal">
                                      {formatCurrency(item.price * item.quantity)}
                                    </div>
                                  </IonCol>
                                </IonRow>
                              </IonGrid>
                            </div>

                            <div slot="content" className="accordion-details ion-padding">
                              <div className="details-list">
                                <div className="detail-item">
                                  <span className="detail-label">Vendedor</span>
                                  <span className="detail-value">{item.seller_username}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">SKU / ID</span>
                                  <span className="detail-value">#{item.product_id}</span>
                                </div>
                                {item.tracking_number && (
                                  <div className="detail-item">
                                    <span className="detail-label">Tracking Item</span>
                                    <span className="detail-value">{item.tracking_number}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </IonAccordion>
                        ))}
                      </IonAccordionGroup>

                      <div className="financial-summary ion-padding">
                        <div className="summary-row">
                          <span>Subtotal Productos</span>
                          <span>{formatCurrency(order.total - order.shipping_cost)}</span>
                        </div>
                        <div className="summary-row">
                          <span>Costo de Envío</span>
                          <span>{formatCurrency(order.shipping_cost)}</span>
                        </div>
                        <div className="summary-row total">
                          <span>Total General</span>
                          <span className="final-price">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonCol>

            {/* SECCIÓN Lateral: GESTIÓN */}
            <IonCol size="12" sizeLg="4">
              <IonCard className="admin-actions-sidebar">
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={shieldCheckmark} /> Panel de Control
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className="admin-guide">Utilice este panel para actualizar el progreso de la orden y dejar notas de auditoría.</p>

                  <div className="admin-form-group">
                    <IonLabel className="input-label">Observaciones Internas</IonLabel>
                    <IonTextarea
                      placeholder="Escriba aquí cualquier detalle relevante para el seguimiento..."
                      value={adminNotes}
                      onIonInput={(e) => setAdminNotes(e.detail.value!)}
                      rows={8}
                      className="admin-textarea"
                    />
                  </div>

                  <IonButton
                    expand="block"
                    color="primary"
                    className="save-all-btn"
                    onClick={() => setShowStatusModal(true)}
                  >
                    <IonIcon icon={refresh} slot="start" />
                    Guardar Cambios
                  </IonButton>

                  <div className="history-info">
                    <IonIcon icon={time} color="medium" />
                    <p>Sincronizado por última vez el:<br /><strong>{formatDate(order.updated_at)}</strong></p>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Modal-Alert Simplificado para el Estado */}
        <IonAlert
          isOpen={showStatusModal}
          onDidDismiss={() => setShowStatusModal(false)}
          header="Cambiar Estado de la Orden"
          message="Seleccione el nuevo progreso:"
          inputs={[
            { name: 'status', type: 'radio', label: 'Pendiente', value: 'pending', checked: newStatus === 'pending' },
            { name: 'status', type: 'radio', label: 'Procesando', value: 'processing', checked: newStatus === 'processing' },
            { name: 'status', type: 'radio', label: 'Enviado', value: 'shipped', checked: newStatus === 'shipped' },
            { name: 'status', type: 'radio', label: 'Entregado', value: 'delivered', checked: newStatus === 'delivered' },
            { name: 'status', type: 'radio', label: 'Cancelado', value: 'cancelled', checked: newStatus === 'cancelled' }
          ]}
          buttons={[
            { text: 'Cerrar', role: 'cancel' },
            {
              text: 'Confirmar Cambio',
              handler: (data) => {
                setNewStatus(data);
                handleUpdateStatus();
              }
            }
          ]}
        />

        <IonLoading isOpen={updating} message="Sincronizando cambios..." />
        <IonLoading isOpen={downloading} message="Generando y preparando factura..." />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
          color={toastMessage.includes('Error') ? 'danger' : 'success'}
        />
      </IonContent>
    </IonPage>
  );
};

// Exported as named export at top

