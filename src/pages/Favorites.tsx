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
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonAlert,
  IonSpinner,
  IonText,
  IonThumbnail,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { heart, heartDislike, trash, star, arrowBack } from 'ionicons/icons';
import { favoriteService } from '../services/favoriteService';
import { authService } from '../services/authService';
import ProductImage from '../components/ProductImage';
import './Favorites.css';
import { environment } from '../environments/environment';

import { useIonViewWillEnter } from '@ionic/react';
// ... (imports)

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  useIonViewWillEnter(() => {
    if (!authService.isAuthenticated()) {
      history.push('/login');
      return;
    }
    loadFavorites();
  });

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoritesData = await favoriteService.getFavorites();
      setFavorites(favoritesData);
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      setAlertMessage('Error al cargar favoritos');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadFavorites();
    event.detail.complete();
  };

  const removeFavorite = async (productId: number, productName: string) => {
    try {
      setRemoving(true);
      await favoriteService.removeFavorite(productId);
      setFavorites(favorites.filter(fav => fav.product_id !== productId));
      setAlertMessage(`"${productName}" removido de favoritos`);
      setShowAlert(true);
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      setAlertMessage('Error al remover de favoritos');
      setShowAlert(true);
    } finally {
      setRemoving(false);
    }
  };

  const clearAllFavorites = async () => {
    try {
      setRemoving(true);
      // Eliminar todos los favoritos uno por uno
      for (const favorite of favorites) {
        await favoriteService.removeFavorite(favorite.product_id);
      }
      setFavorites([]);
      setAlertMessage('Todos los favoritos removidos');
      setShowAlert(true);
    } catch (error: any) {
      console.error('Error clearing favorites:', error);
      setAlertMessage('Error al limpiar favoritos');
      setShowAlert(true);
    } finally {
      setRemoving(false);
    }
  };
  const formatRating = (rating: any, reviewsCount?: any): string | null => {
    const count = parseInt(reviewsCount) || 0;
    if (count === 0 || rating === null || rating === undefined) return null;
    return parseFloat(rating).toFixed(1);
  };

  const navigateToProduct = (productId: number) => {
    history.push(`/product/${productId}`);
  };





  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/store" text="" />
            </IonButtons>
            <IonTitle>Favoritos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando favoritos...</p>
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
          <IonTitle>Favoritos</IonTitle>
          {favorites.length > 0 && (
            <IonButtons slot="end">
              <IonButton onClick={clearAllFavorites} color="danger" disabled={removing}>
                <IonIcon icon={trash} />
                Limpiar
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent className="favorites-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {favorites.length === 0 ? (
          <div className="empty-favorites">
            <IonIcon icon={heart} size="large" />
            <h2>No tienes favoritos</h2>
            <p>Agrega productos a favoritos para verlos aquí</p>
            <IonButton onClick={() => history.push('/store')}>
              Explorar Productos
            </IonButton>
          </div>
        ) : (
          <>
            <div className="favorites-header">
              <IonText>
                <h2>Mis Favoritos ({favorites.length})</h2>
              </IonText>
            </div>

            <IonGrid className="featured-grid">
              <IonRow>
                {favorites.map((favorite) => (
                  <IonCol size="6" key={favorite.id}>
                    <IonCard
                      className="product-card"
                      onClick={() => navigateToProduct(favorite.product_id)}
                    >
                      <div className="product-image-container">
                        <ProductImage
                          imageUrl={favorite.primary_image || favorite.image_url}
                          images={favorite.images}
                          alt={favorite.name}
                          className="product-image2"
                        />
                        <button
                          className="remove-favorite-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(favorite.product_id, favorite.name);
                          }}
                        >
                          <IonIcon icon={trash} />
                        </button>
                      </div>

                      <IonCardContent className="product-card-details">
                        <IonText>
                          <p className="product-name1">{favorite.name}</p>
                          <p className="product-description1">{favorite.category_name}</p>
                          <div className="product-rating-row-simple">
                            <IonIcon icon={star} className="star-yellow" style={{color: formatRating(favorite.rating, favorite.reviews_count) ? '#ffc409' : '#ccc'}} />
                            <span className="rating-number">{formatRating(favorite.rating, favorite.reviews_count) ?? 'Nuevo'}</span>
                          </div>
                          <p className="product-price">US$ {favorite.price}</p>
                        </IonText>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </>
        )}

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Aviso'}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Favorites;