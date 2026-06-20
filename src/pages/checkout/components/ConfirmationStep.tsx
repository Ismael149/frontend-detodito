import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonText,
  IonLoading,
  IonItem,
  IonLabel,
  IonBadge,
  IonAlert
} from '@ionic/react';
import { checkmarkCircle, download, home, receipt, refresh } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { orderService } from '../../../services/orderService';

interface ConfirmationStepProps {
  orderData: any;
  paymentResult: any;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ orderData, paymentResult }) => {
  const history = useHistory();
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [invoiceError, setInvoiceError] = useState('');

  useEffect(() => {
    if (paymentResult?.orderId) {
      generateInvoice();
    }
  }, [paymentResult]);

  const generateInvoice = async () => {
    if (!paymentResult?.orderId) return;

    try {
      setGeneratingInvoice(true);
      setInvoiceError('');

      console.log('Generating invoice for order:', paymentResult.orderId);

      const invoiceData = await orderService.generateInvoice(paymentResult.orderId);
      console.log('Invoice generated:', invoiceData);

      setInvoice(invoiceData.invoice);
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      setInvoiceError(error.message || 'Error al generar la factura');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!paymentResult?.orderId) return;

    try {
      await orderService.downloadInvoice(paymentResult.orderId);
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      setInvoiceError(error.message || 'Error al descargar la factura');
    }
  };

  const handleRetryInvoice = () => {
    setInvoiceError('');
    generateInvoice();
  };

  const handleGoHome = () => {
    history.push('/store');
  };

  const handleViewOrders = () => {
    history.push('/orders');
  };

  return (
    <div className="confirmation-step">
      <IonCard className="success-card">
        <IonCardContent>
          <div className="success-icon">
            <IonIcon icon={checkmarkCircle} color="success" />
          </div>
          <h2>¡Compra Exitosa!</h2>
          <p>Tu pedido ha sido procesado correctamente</p>

          {paymentResult?.orderId && (
            <IonBadge color="primary">
              Orden #: {paymentResult.orderId}
            </IonBadge>
          )}
        </IonCardContent>
      </IonCard>

      {/* Resumen del Pedido */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Resumen del Pedido</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="order-summary">
            <IonItem>
              <IonLabel>
                <h3>Productos</h3>
                {orderData?.cartItems?.map((item: any, index: number) => (
                  <p key={index}>{item.name} x {item.quantity}</p>
                ))}
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <h3>Total</h3>
                <IonText color="primary">
                  <strong>${orderData?.subtotal?.toFixed(2)}</strong>
                </IonText>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <h3>Método de Pago</h3>
                <p>Tarjeta terminada en {paymentResult?.lastFour}</p>
              </IonLabel>
            </IonItem>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Factura */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Factura</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {invoiceError ? (
            <div className="invoice-error">
              <IonText color="danger">
                <p>{invoiceError}</p>
              </IonText>
              <IonButton
                size="small"
                color="medium"
                onClick={handleRetryInvoice}
              >
                <IonIcon icon={refresh} slot="start" />
                Reintentar
              </IonButton>
            </div>
          ) : invoice ? (
            <div className="invoice-section">
              <IonText>
                <p><strong>Número de Factura:</strong> {invoice.invoice_number}</p>
                <p><strong>Generada:</strong> {new Date(invoice.issued_at).toLocaleString()}</p>
              </IonText>
              <IonButton
                expand="block"
                color="primary"
                onClick={handleDownloadInvoice}
              >
                <IonIcon icon={download} slot="start" />
                Descargar Factura PDF
              </IonButton>
            </div>
          ) : generatingInvoice ? (
            <div className="invoice-generating">
              <IonText color="medium">
                <p>Generando factura...</p>
              </IonText>
              <IonLoading isOpen={true} message="Generando factura..." />
            </div>
          ) : (
            <div className="invoice-pending">
              <IonText color="medium">
                <p>La factura se generará automáticamente</p>
              </IonText>
              <IonButton
                size="small"
                color="medium"
                onClick={generateInvoice}
              >
                <IonIcon icon={refresh} slot="start" />
                Generar Factura
              </IonButton>
            </div>
          )}
        </IonCardContent>
      </IonCard>

      {/* Información importante */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Información Importante</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="important-info">
            <IonText>
              <p>✅ Recibirás un correo de confirmación con los detalles de tu pedido</p>
              <p>✅ Puedes ver el estado de tu pedido en la sección "Mis Pedidos"</p>
              <p>✅ La factura estará disponible para descargar en cualquier momento</p>
              <p>✅ Para consultas, contacta a soporte@tuempresa.com</p>
            </IonText>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Acciones */}
      <div className="confirmation-actions">
        <IonButton
          expand="block"
          color="primary"
          onClick={handleGoHome}
        >
          <IonIcon icon={home} slot="start" />
          Continuar Comprando
        </IonButton>

        <IonButton
          expand="block"
          color="secondary"
          fill="outline"
          onClick={handleViewOrders}
        >
          <IonIcon icon={receipt} slot="start" />
          Ver Mis Pedidos
        </IonButton>
      </div>

      <IonAlert
        isOpen={!!invoiceError}
        onDidDismiss={() => setInvoiceError('')}
        header="Error"
        message={invoiceError}
        buttons={['OK']}
      />
    </div>
  );
};

export default ConfirmationStep;