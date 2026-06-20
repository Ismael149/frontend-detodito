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
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonText,
  IonLoading,
  IonAlert
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { receipt, download, checkmarkCircle, home, list } from 'ionicons/icons';
import { orderService } from '../services/orderService';
import './OrderConfirmation.css';

// Definir la interfaz para el estado de location
interface LocationState {
  orderData?: {
    order: {
      id: number;
      invoice_number: string;
      total: number;
      status: string;
    };
    payment: {
      success: boolean;
      transactionId: string;
      message: string;
    };
    invoice_number: string;
  };
}

// Definir interfaces para los datos de la orden
interface OrderData {
  order: {
    id: number;
    invoice_number: string;
    total: number;
    status: string;
  };
  payment: {
    success: boolean;
    transactionId: string;
    message: string;
  };
  invoice_number: string;
}

const OrderConfirmation: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>(); // Especificar el tipo del estado
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Usar type assertion para acceder a orderData de forma segura
  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      console.warn('No orderData found in location state, redirecting to cart');
      history.replace('/cart');
    }
  }, [orderData, history]);

  const handleDownloadInvoice = async () => {
    if (!orderData?.order?.id) return;

    try {
      setLoading(true);
      await orderService.downloadInvoice(orderData.order.id);

      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrders = () => {
    history.push('/orders');
  };

  const handleContinueShopping = () => {
    history.push('/store');
  };

  // Si no hay orderData, mostrar mensaje de carga o redirección
  if (!orderData) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/store" text="" />
            </IonButtons>
            <IonTitle>Confirmación de Orden</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="text-center">
            <IonLoading isOpen={true} message="Cargando información de la orden..." />
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
            <IonBackButton defaultHref="/store" text="" />
          </IonButtons>
          <IonTitle>¡Orden Confirmada!</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="confirmation-container">
          {/* Icono de éxito */}
          <div className="success-icon">
            <IonIcon icon={checkmarkCircle} color="success" />
          </div>

          <h2 className="text-center">¡Gracias por tu compra!</h2>
          <p className="text-center">Tu orden ha sido procesada exitosamente</p>

          {/* Resumen de la orden */}
          <IonCard>
            <IonCardContent>
              <IonItem>
                <IonLabel>
                  <h3>Número de Orden</h3>
                  <p>#{orderData.order.id}</p>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h3>Número de Factura</h3>
                  <p>{orderData.invoice_number}</p>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h3>Total</h3>
                  <p>${orderData.order.total}</p>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h3>Estado</h3>
                  <p>{orderData.order.status}</p>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {/* Información de pago */}
          <IonCard>
            <IonCardContent>
              <h3>Información de Pago</h3>
              <IonItem>
                <IonLabel>
                  <p>Transacción ID</p>
                  <IonText color="primary">
                    <strong>{orderData.payment.transactionId}</strong>
                  </IonText>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Estado</p>
                  <IonText color="success">
                    <strong>{orderData.payment.success ? 'Completado' : 'Pendiente'}</strong>
                  </IonText>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {/* Acciones */}
          <div className="action-buttons">
            <IonButton
              expand="block"
              onClick={handleDownloadInvoice}
              disabled={loading}
            >
              <IonIcon icon={download} slot="start" />
              Descargar Factura PDF
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              onClick={handleViewOrders}
            >
              <IonIcon icon={list} slot="start" />
              Ver Mis Órdenes
            </IonButton>

            <IonButton
              expand="block"
              fill="clear"
              onClick={handleContinueShopping}
            >
              <IonIcon icon={home} slot="start" />
              Seguir Comprando
            </IonButton>
          </div>

          {/* Mensaje de éxito después de descargar */}
          {success && (
            <div className="success-message">
              <IonText color="success">
                <p>Factura descargada exitosamente</p>
              </IonText>
            </div>
          )}
        </div>

        <IonLoading isOpen={loading} message="Descargando factura..." />
        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError('')}
          header="Error"
          message={error}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default OrderConfirmation;