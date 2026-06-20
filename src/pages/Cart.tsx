import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonText,
  IonButton,
  IonIcon,
  IonLoading,
  IonAlert,
  IonFooter,
  IonToolbar as IonFooterToolbar,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import {
  trash, add, remove, cart as cartIcon, arrowForward
} from 'ionicons/icons';
import ProductImage from '../components/ProductImage';
import { cartService, Cart, CartItem } from '../services/cartService';
import { useHistory } from 'react-router-dom';
import './Cart.css';

import { useIonViewWillEnter } from '@ionic/react';
// ...

const CartPage: React.FC = () => {
  const history = useHistory();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  // ...
  useIonViewWillEnter(() => {
    loadCart();
  });

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error: any) {
      console.error('Error loading cart:', error);
      setError('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadCart();
    event.detail.complete();
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1 || !cart) return;

    // Guardar estado anterior para rollback en caso de error
    const previousItems = [...cart.items];

    // Actualización optimista: actualizar UI inmediatamente
    const updatedItems = cart.items.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart({ ...cart, items: updatedItems });
    setUpdatingItem(itemId);

    try {
      await cartService.updateCartItem(itemId, newQuantity);
      // No recargamos todo el carrito para evitar bloqueos
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      setError('Error al actualizar la cantidad');
      // Revertir cambios si falla
      setCart({ ...cart, items: previousItems });
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!cart) return;

    // Guardar estado anterior
    const previousItems = [...cart.items];

    // Actualización optimista
    const updatedItems = cart.items.filter(item => item.id !== itemId);
    setCart({ ...cart, items: updatedItems });

    try {
      await cartService.removeFromCart(itemId);
    } catch (error: any) {
      console.error('Error removing item:', error);
      setError('Error al eliminar el producto');
      // Revertir cambios
      setCart({ ...cart, items: previousItems });
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      setError('Error al vaciar el carrito');
    }
  };

  const proceedToCheckout = () => {
    if (!cart || cart.items.length === 0) {
      setError('El carrito está vacío');
      return;
    }
    history.push('/checkout');
  };

  // Función para asegurar que el precio sea un número
  const ensureNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    return 0;
  };

  // Calcular total del carrito
  const calculateCartTotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => {
      const price = ensureNumber(item.price);
      const quantity = ensureNumber(item.quantity);
      return total + (price * quantity);
    }, 0);
  };

  // Calcular total de items
  const calculateItemCount = (items: CartItem[]): number => {
    return items.reduce((count, item) => {
      const quantity = ensureNumber(item.quantity);
      return count + quantity;
    }, 0);
  };

  // Calcular valores actualizados
  const cartTotal = cart ? calculateCartTotal(cart.items) : 0;
  const itemCount = cart ? calculateItemCount(cart.items) : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/store" text="" />
          </IonButtons>
          <IonTitle>Carrito</IonTitle>
          <IonButtons slot="end">
            {cart && cart.items.length > 0 && (
              <IonButton onClick={clearCart}>
                <IonIcon icon={trash} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="cart-page">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonLoading isOpen={loading} message="Cargando carrito..." />

        {!loading && (!cart || cart.items.length === 0) ? (
          <div className="empty-cart">
            <IonIcon icon={cartIcon} size="large" />
            <h3>Tu carrito está vacío</h3>
            <p>Agrega algunos productos para comenzar</p>
            <IonButton routerLink="/home">
              Continuar Comprando
            </IonButton>
          </div>
        ) : !loading && cart ? (
          <>
            <div className="cart-items">
              {cart.items.map((item) => {
                const price = ensureNumber(item.price);
                const quantity = ensureNumber(item.quantity);
                const itemTotal = price * quantity;

                return (
                  <IonCard key={item.id} className="cart-item">
                    <IonCardContent>
                      <div className="item-content">
                        <IonThumbnail
                          slot="start"
                          className="item-image clickable"
                          onClick={(e) => {
                            e.stopPropagation();
                            history.push(`/product/${item.product_id}`);
                          }}
                        >
                          <ProductImage
                            imageUrl={item.image_url}
                            alt={item.name}
                            className="cart-item-img"
                          />
                        </IonThumbnail>

                        <div className="item-details">
                          <h3>{item.name}</h3>
                          <IonText color="primary">
                            <strong>${price.toFixed(2)}</strong>
                          </IonText>

                          <div className="controls-row">
                            <div className="quantity-controls">
                              <IonButton
                                size="small"
                                fill="outline"
                                onClick={() => updateQuantity(item.id, quantity - 1)}
                                disabled={quantity <= 1 || updatingItem === item.id}
                              >
                                <IonIcon icon={remove} />
                              </IonButton>

                              <span className="quantity">{quantity}</span>

                              <IonButton
                                size="small"
                                fill="outline"
                                onClick={() => updateQuantity(item.id, quantity + 1)}
                                disabled={quantity >= item.stock || updatingItem === item.id}
                              >
                                <IonIcon icon={add} />
                              </IonButton>
                            </div>

                            <IonButton
                              size="small"
                              color="danger"
                              fill="clear"
                              className="remove-item-btn"
                              onClick={() => removeItem(item.id)}
                            >
                              <IonIcon icon={trash} />
                            </IonButton>
                          </div>

                          <div className="item-total">
                            <strong>Total: ${itemTotal.toFixed(2)}</strong>
                          </div>
                        </div>

                        <div className="item-navigation-arrow" onClick={() => history.push(`/product/${item.product_id}`)}>
                          <IonIcon icon={arrowForward} />
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                );
              })}
            </div>

            {/* Resumen del carrito */}
            <div className="cart-summary-card">
              <div className="cart-summary-content">
                <div className="summary-row">
                  <span>Subtotal ({itemCount} items):</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Envío:</span>
                  <span>Por calcular</span>
                </div>
                <div className="summary-row total">
                  <strong>Total estimado:</strong>
                  <strong>${cartTotal.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </>
        ) : null}

        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError('')}
          header="Error"
          message={error}
          buttons={['OK']}
        />
      </IonContent>

      {/* Footer con botón de checkout */}
      {cart && cart.items.length > 0 && (
        <IonFooter>
          <IonFooterToolbar>
            <IonButton
              expand="block"
              size="large"
              onClick={proceedToCheckout}
            >
              <IonIcon icon={arrowForward} slot="start" />
              Proceder al Pago
              <IonText slot="end">${cartTotal.toFixed(2)}</IonText>
            </IonButton>
          </IonFooterToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default CartPage;