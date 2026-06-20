import React from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { cart, person, list, settings } from 'ionicons/icons';
import { authService } from '../services/authService'
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>DeTodito</IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={settings} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="auth-buttons" style={{ textAlign: 'center', marginTop: '2rem' }}>
          {authService.isAuthenticated() ? (
            <IonButton routerLink="/login" color="danger" onClick={() => authService.logout()}>
              Cerrar Sesión
            </IonButton>
          ) : (
            <>
              <IonButton routerLink="/login" color="primary">
                Iniciar Sesión
              </IonButton>
              <IonButton routerLink="/register" color="secondary" fill="outline">
                Registrarse
              </IonButton>
            </>
          )}
        </div>
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonCard color="primary" button>
                <IonCardHeader>
                  <IonIcon icon={cart} size="large" />
                  <IonCardTitle>Productos</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Gestiona tu inventario de productos
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard color="secondary" button>
                <IonCardHeader>
                  <IonIcon icon={list} size="large" />
                  <IonCardTitle>Pedidos</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Revisa y gestiona pedidos
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <IonCard color="tertiary" button>
                <IonCardHeader>
                  <IonIcon icon={person} size="large" />
                  <IonCardTitle>Clientes</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Administra tu lista de clientes
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard color="success" button>
                <IonCardHeader>
                  <IonIcon icon={settings} size="large" />
                  <IonCardTitle>Configuración</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Configura tu aplicación
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <div className="welcome-message">
          <h2>Bienvenido a DeTodito</h2>
          <p>Gestiona tu negocio de manera eficiente con todas las herramientas en un solo lugar.</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;