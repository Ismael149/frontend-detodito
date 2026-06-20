// frontend/src/pages/AllCategories.tsx
import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonText,
  IonButton,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import './Store.css';

const AllCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadCategories();
    event.detail.complete();
  };

  const navigateToCategory = (categoryId: number) => {
    history.push(`/category/${categoryId}`);
  };

  const goBack = () => {
    history.goBack();
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando categorías...</p>
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
            <IonBackButton defaultHref="/categories" text="" />
          </IonButtons>
          <IonTitle>Todas las Categorías</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="all-categories-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonGrid>
          <IonRow>
            {categories.map((category) => (
              <IonCol size="6" size-md="4" size-lg="3" key={category.id}>
                <div
                  className="category-grid-item"
                  onClick={() => navigateToCategory(category.id)}
                >
                  <div className="category-grid-icon">
                    <IonIcon icon={category.icon} />
                  </div>
                  <IonText>
                    <p className="category-grid-name">{category.name}</p>
                  </IonText>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {categories.length === 0 && (
          <div className="empty-state">
            <IonText color="medium">
              <p>No hay categorías disponibles</p>
            </IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AllCategories;