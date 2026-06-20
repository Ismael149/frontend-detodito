import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonText,
  IonButton,
  IonIcon
} from '@ionic/react';
import { cart, arrowForward } from 'ionicons/icons';
import ProductImage from '../../../components/ProductImage'; // Ajusta la ruta según tu estructura

interface CheckoutSummaryProps {
  orderData: any;
  onNextStep: (data?: any) => void;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ orderData, onNextStep }) => {
  if (!orderData?.cartItems) return null;


  return (
    <div className="checkout-step">
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={cart} /> Resumen del Pedido
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="cart-items-list">
            {orderData.cartItems.map((item: any) => (
              <IonItem key={item.product_id || item.id} className="cart-item">
                <IonThumbnail slot="start" className="checkout-thumbnail">
                  <ProductImage
                    imageUrl={item.image_url || item.product_image_url}
                    alt={item.name || item.product_name}
                    className="checkout-product-image"
                  />
                </IonThumbnail>
                <IonLabel>
                  <h3>{item.name || item.product_name}</h3>
                  <p>Cantidad: {item.quantity}</p>
                  <IonText color="primary">
                    <strong>${((item.price || 0) * item.quantity).toFixed(2)}</strong>
                  </IonText>
                </IonLabel>
              </IonItem>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${orderData.subtotal?.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Envío:</span>
              <span>Por calcular</span>
            </div>
            <div className="summary-row total">
              <strong>Total estimado:</strong>
              <strong>${orderData.subtotal?.toFixed(2)} + envío</strong>
            </div>
          </div>

          <IonButton
            expand="block"
            onClick={() => onNextStep()}
            className="next-button"
          >
            Continuar con Envío
            <IonIcon icon={arrowForward} slot="end" />
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default CheckoutSummary;