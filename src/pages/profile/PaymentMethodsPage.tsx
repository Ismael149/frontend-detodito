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
  IonList,
  IonItem,
  IonLabel,
  IonAlert,
  IonLoading,
  IonBadge
} from '@ionic/react';
import {
  add, card, star, trash, create,
  cardOutline, americanFootball
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import './PaymentMethodsPage.css';

const PaymentMethodsPage: React.FC = () => {
  const history = useHistory();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<any | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await paymentService.getUserPaymentMethods();
      // Ensure we always have an array
      setPaymentMethods(Array.isArray(methods) ? methods : []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCardIcon = (cardType: string) => {
    const icons: any = {
      'visa': cardOutline,
      'mastercard': cardOutline,
      'amex': americanFootball
    };
    return icons[cardType.toLowerCase()] || cardOutline;
  };

  const getCardColor = (cardType: string) => {
    const colors: any = {
      'visa': '#1a1f71',
      'mastercard': '#eb001b',
      'amex': '#002663'
    };
    return colors[cardType.toLowerCase()] || '#666';
  };

  const getCardDisplayName = (cardType: string) => {
    const type = cardType.toLowerCase();
    if (type === 'visa') return 'Visa';
    if (type === 'mastercard') return 'Mastercard';
    if (type === 'amex') return 'Amex';
    return 'Tarjeta';
  };

  const formatCardNumber = (lastFour: string) => {
    return `**** **** **** ${lastFour}`;
  };

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  const handleCreate = () => {
    history.push('/profile/payment');
  };

  const handleEdit = (method: any) => {
    history.push(`/profile/payment/${method.id}`);
  };

  const handleDelete = (method: any) => {
    setMethodToDelete(method);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!methodToDelete) return;

    try {
      await paymentService.deletePaymentMethod(methodToDelete.id);
      setPaymentMethods(paymentMethods.filter(m => m.id !== methodToDelete.id));
      setShowDeleteAlert(false);
      setMethodToDelete(null);
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const setDefaultMethod = async (methodId: number) => {
    try {
      await paymentService.setDefaultPaymentMethod(methodId);
      // Update local state to reflect change
      setPaymentMethods(paymentMethods.map(m => ({
        ...m,
        is_default: m.id === methodId
      })));
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" text="" />
          </IonButtons>
          <IonTitle>Métodos de Pago</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleCreate}>
              <IonIcon icon={add} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="payment-methods-page">
        <IonLoading isOpen={loading} message="Cargando métodos de pago..." />

        {!loading && paymentMethods.length === 0 ? (
          <div className="empty-state">
            <IonIcon icon={card} size="large" />
            <h3>No hay métodos de pago</h3>
            <p>Agrega una tarjeta para agilizar tus compras</p>
            <IonButton onClick={handleCreate}>
              Agregar Tarjeta
            </IonButton>
          </div>
        ) : (
          <IonList>
            {paymentMethods.map((method) => (
              <IonItem key={method.id} className="payment-method-item">
                <IonIcon
                  icon={getCardIcon(method.card_type)}
                  slot="start"
                  style={{ color: getCardColor(method.card_type) }}
                />

                <IonLabel>
                  <h3>{getCardDisplayName(method.card_type)} {formatCardNumber(method.last_four)}</h3>
                  <p>Expira: {formatExpiryDate(method.expiry_month, method.expiry_year)}</p>
                  {method.is_default && (
                    <IonBadge color="success">
                      <IonIcon icon={star} />
                      Principal
                    </IonBadge>
                  )}
                </IonLabel>

                <div className="payment-method-actions">
                  {!method.is_default && (
                    <IonButton
                      fill="clear"
                      size="small"
                      onClick={() => setDefaultMethod(method.id)}
                    >
                      <IonIcon icon={star} />
                    </IonButton>
                  )}
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleEdit(method)}
                  >
                    <IonIcon icon={create} />
                  </IonButton>
                  <IonButton
                    fill="clear"
                    size="small"
                    color="danger"
                    onClick={() => handleDelete(method)}
                  >
                    <IonIcon icon={trash} />
                  </IonButton>
                </div>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Eliminar Tarjeta'}
          message={'¿Estás seguro de que quieres eliminar esta tarjeta?'}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Eliminar', role: 'destructive', handler: confirmDelete }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default PaymentMethodsPage;
