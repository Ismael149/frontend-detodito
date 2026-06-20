import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonButton,
  IonAvatar,
  IonText,
  IonAlert,
  IonSkeletonText,
  IonNote
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  personCircle, notifications, bagHandle, storefront, heart,
  wallet, card, pricetag, cart, time, apps, location, download,
  barChart,
  helpCircle, settings, chatbubbleEllipses, logOut, star, chevronForward,
  search, person, informationCircle, megaphone
} from 'ionicons/icons';
import { moreOptions, MoreOption } from '../data/moreOptions';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { getImageUrl } from '../utils/imageUtils';
import './More.css';

const More: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const history = useHistory();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('🔄 [MORE] Loading user data...');

      if (!authService.isAuthenticated()) {
        console.log('❌ [MORE] User not authenticated');
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = await userService.getProfile().then(res => res.user);
      console.log('✅ [MORE] User data loaded:', userData);

      setUser(userData);
    } catch (error) {
      console.error('💥 [MORE] Error loading user data:', error);
      // Fallback a localStorage si falla el fetch
      const localUser = userService.getCurrentUser();
      if (localUser) {
        setUser(localUser);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    return userService.getFullName();
  };

  const handleOptionClick = (option: MoreOption) => {
    switch (option.id) {
      case 'my-products':
        if (!authService.isAuthenticated()) {
          setAlertMessage('Debes iniciar sesión para ver tus productos');
          setShowAlert(true);
          setTimeout(() => history.push('/login'), 1500);
          return;
        }
        history.push('/my-products');
        break;
      case 'favorites':
        history.push('/favorites');
        break;
      case 'categories':
        history.push('/categories');
        break;
      case 'search':
        history.push('/search');
        break;
      case 'notifications':
        history.push('/notifications');
        break;
      case 'advanced-reports':
        history.push('/reports/advanced');
        break;
      case 'orders':
        history.push('/orders');
        break;
      case 'banner-request':
        history.push('/banner-request');
        break;
      case 'seller-orders':
        history.push('/seller/orders');
        break;
      case 'about':
        history.push('/about');
        break;
      case 'settings':
        history.push('/settings');
        break;
      case 'help':
        // Cambiar Centro de ayuda por ChatBot
        history.push('/chatbot');
        break;
      case 'user-header':
        history.push(authService.isAuthenticated() ? '/profile' : '/login');
        break;
      case 'logout':
        authService.logout();
        setAlertMessage('Sesión cerrada correctamente');
        setShowAlert(true);
        break;
      default:
        setAlertMessage(`"${option.title}" - Disponible próximamente`);
        setShowAlert(true);
        break;
    }
  };

  const renderOption = (option: MoreOption) => {
    switch (option.type) {
      case 'header':
        const isAuthenticated = authService.isAuthenticated();

        return (
          <IonItem className="user-header" button onClick={() => handleOptionClick(option)}>
            {isAuthenticated ? (
              <>
                <IonAvatar slot="start">
                  {user?.profile_picture ? (
                    <img src={getImageUrl(user.profile_picture)} alt={user.username} />
                  ) : (
                    <IonIcon icon={personCircle} size="large" color="primary" />
                  )}
                </IonAvatar>
                <IonLabel>
                  <h2>¡Hola, {getDisplayName()}!</h2>
                  <IonNote color="medium">Ver tu perfil</IonNote>
                </IonLabel>

              </>
            ) : (
              <>
                <IonIcon icon={person} slot="start" size="large" color="primary" />
                <IonLabel>
                  <h2>Iniciar sesión</h2>
                  <IonNote color="primary">Toque para iniciar sesión</IonNote>
                </IonLabel>
              </>
            )}
          </IonItem>
        );

      case 'option':
        if (option.requiresAuth && !authService.isAuthenticated()) return null;

        return (
          <IonItem button onClick={() => handleOptionClick(option)} detail>
            <IonIcon icon={getIcon(option.icon)} slot="start" color="medium" />
            <IonLabel>
              <h3>{option.title}</h3>
              {option.subtitle && <IonNote color="medium">{option.subtitle}</IonNote>}
            </IonLabel>
            {option.badge && <IonBadge color="danger" slot="end">{option.badge}</IonBadge>}
          </IonItem>
        );

      case 'section-title':
        return (
          <div className="section-title">
            <IonText color="medium">
              <small>{option.title}</small>
            </IonText>
          </div>
        );

      case 'logout':
        if (!authService.isAuthenticated()) return null;

        return (
          <IonItem button onClick={() => handleOptionClick(option)}>
            <IonIcon icon={getIcon(option.icon)} slot="start" color="danger" />
            <IonLabel color="danger"><h3>{option.title}</h3></IonLabel>
          </IonItem>
        );

      case 'divider':
        return <div className="divider" />;

      default:
        return null;
    }
  };

  const getIcon = (iconName: string | undefined) => {
    if (!iconName) return helpCircle;

    const icons: { [key: string]: any } = {
      'person-circle': personCircle,
      'notifications': notifications,
      'bag-handle': bagHandle,
      'storefront': storefront,
      'heart': heart,
      'wallet': wallet,
      'card': card,
      'pricetag': pricetag,
      'cart': cart,
      'time': time,
      'apps': apps,
      'location': location,
      'bar-chart': barChart,
      'download': download,
      'help-circle': helpCircle,
      'settings': settings,
      'chatbubble-ellipses': chatbubbleEllipses,
      'log-out': logOut,
      'search': search,
      'person': person,
      'information-circle': informationCircle,
      'megaphone': megaphone
    };

    // Verificación segura para evitar undefined como índice
    return icons[iconName] || helpCircle;
  };
  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Más</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            {[1, 2, 3, 4, 5].map((i) => (
              <IonItem key={i}>
                <IonSkeletonText animated style={{ width: '30px', height: '30px' }} slot="start" />
                <IonLabel>
                  <IonSkeletonText animated style={{ width: '60%' }} />
                  <IonSkeletonText animated style={{ width: '40%' }} />
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Más</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="more-content">
        <IonList lines="none" className="more-list">
          {moreOptions.map((option) => (
            <React.Fragment key={option.id}>{renderOption(option)}</React.Fragment>
          ))}
        </IonList>

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

export default More;
/* Handle banner request navigation in handleOptionClick */
// Note: This logic is dynamic based on id, so adding 'banner-request' case is needed if default case doesn't handle it well.
// Checking More.tsx content again... switch case uses id.
