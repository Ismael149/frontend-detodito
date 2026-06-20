import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonText,
  IonAlert,
  IonSkeletonText,
  IonNote,
  IonAvatar,
  IonButton,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { arrowBack } from 'ionicons/icons';
import {
  personCircle, person, location, card, bagHandle, storefront, heart,
  wallet, cash, pricetag, shieldCheckmark, lockClosed, notifications,
  helpCircle, headset, chatbubbleEllipses, swapHorizontal, logOut,
  star, pencil, chevronForward, calendar, time
} from 'ionicons/icons';
import { profileOptions, ProfileOption } from '../data/profileOptions';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { getImageUrl } from '../utils/imageUtils';
import './Profile.css';

const Profile: React.FC = () => {
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
      console.log('🔄 [PROFILE] Loading user data...');

      if (!authService.isAuthenticated()) {
        console.log('❌ [PROFILE] User not authenticated');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Intentar cargar desde el backend
        const response = await userService.getProfile();
        console.log('✅ [PROFILE] User data loaded from backend:', response.user);

        setUser(response.user);
      } catch (error) {
        console.log('⚠️ [PROFILE] Falling back to localStorage:', error);
        // Fallback a localStorage
        const userData = userService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('💥 [PROFILE] Error loading user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadUserData();
    event.detail.complete();
  };

  const getDisplayName = () => {
    if (!user) return 'Usuario';

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || user.username || user.email?.split('@')[0] || 'Usuario';
  };

  const getDisplayEmail = () => {
    return user?.email || 'usuario@ejemplo.com';
  };

  const handleOptionClick = (option: ProfileOption) => {
    switch (option.id) {
      case 'edit-profile':
        history.push('/edit-profile');
        break;
      case 'change-password':
        history.push('/change-password');
        break;
      case 'favorites':
        history.push('/favorites');
        break;
      case 'notifications':
        history.push('/notifications');
        break;
      case 'orders':
        history.push('/orders');
        break;
      case 'addresses':
        history.push('/profile/address');
        break;
      case 'payment-methods':
        history.push('/profile/payment');
        break;
      case 'security':
        history.push('/security');
        break;
      case 'privacy':
        history.push('/privacy');
        break;
      case 'support':
        history.push('/support');
        break;
      case 'feedback':
        history.push('/feedback');
        break;
      case 'logout':
        authService.logout();
        userService.clearCurrentUser();
        setAlertMessage('Sesión cerrada correctamente');
        setShowAlert(true);
        setTimeout(() => history.push('/store'), 1000);
        break;
      default:
        setAlertMessage(`"${option.title}" - Disponible próximamente`);
        setShowAlert(true);
        break;
    }
  };

  const renderOption = (option: ProfileOption) => {
    switch (option.type) {
      case 'header':
        return (
          <IonItem className="profile-header" button onClick={() => history.push('/edit-profile')}>
            <IonAvatar slot="start" className="profile-avatar">
              {user?.profile_picture ? (
                <img src={getImageUrl(user.profile_picture)} alt={getDisplayName()} />
              ) : (
                <IonIcon icon={personCircle} size="large" color="primary" />
              )}
            </IonAvatar>
            <IonLabel>
              <h2 className="profile-name">{getDisplayName()}</h2>
              <IonNote color="medium">{getDisplayEmail()}</IonNote>
              <div className="profile-rating">

              </div>
            </IonLabel>
            <IonButton fill="clear" size="small">
              <IonIcon icon={pencil} />
            </IonButton>
          </IonItem>
        );

      case 'info':
        let displayValue = option.value;
        switch (option.id) {
          case 'personal-info':
            displayValue = getDisplayName();
            break;
          case 'phone':
            displayValue = user?.phone || 'No especificado';
            break;
          case 'location':
            displayValue = user?.address || 'No especificada';
            break;
        }

        return (
          <IonItem button onClick={() => handleOptionClick(option)} detail={option.action}>
            <IonIcon icon={getIcon(option.icon)} slot="start" color="primary" />
            <IonLabel>
              <h3>{option.title}</h3>
              <IonNote color="medium">{displayValue}</IonNote>
            </IonLabel>
          </IonItem>
        );

      case 'option':
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

      case 'logout':
        if (!authService.isAuthenticated()) return null;

        return (
          <IonItem button onClick={() => handleOptionClick(option)}>
            <IonIcon icon={getIcon(option.icon)} slot="start" color="danger" />
            <IonLabel color="danger"><h3>{option.title}</h3></IonLabel>
          </IonItem>
        );

      case 'action':
        return (
          <IonItem button onClick={() => handleOptionClick(option)} color={option.color}>
            <IonIcon icon={getIcon(option.icon)} slot="start" color={option.color} />
            <IonLabel color={option.color}><h3>{option.title}</h3></IonLabel>
          </IonItem>
        );

      case 'divider':
        return <div className="divider" />;

      default:
        return null;
    }
  };

  const getIcon = (iconName: string | undefined): any => {
    if (!iconName || typeof iconName !== 'string') {
      return helpCircle;
    }

    const icons: Record<string, any> = {
      'person-circle': personCircle,
      'person': person,
      'location': location,
      'card': card,
      'bag-handle': bagHandle,
      'storefront': storefront,
      'heart': heart,
      'wallet': wallet,
      'cash': cash,
      'pricetag': pricetag,
      'shield-checkmark': shieldCheckmark,
      'lock-closed': lockClosed,
      'notifications': notifications,
      'help-circle': helpCircle,
      'headset': headset,
      'chatbubble-ellipses': chatbubbleEllipses,
      'swap-horizontal': swapHorizontal,
      'log-out': logOut,
      'pencil': pencil,
      'calendar': calendar,
      'time': time,
      'star': star,
    };

    return icons[iconName] || helpCircle;
  };

  if (!authService.isAuthenticated()) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/store" text="" />
            </IonButtons>
            <IonTitle>Mi Perfil</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="not-authenticated">
            <IonIcon icon={personCircle} size="large" />
            <h2>Inicia sesión</h2>
            <p>Para ver tu perfil, necesitas iniciar sesión</p>
            <IonButton onClick={() => history.push('/login')}>Iniciar sesión</IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/store" text="" />
            </IonButtons>
            <IonTitle>Mi Perfil</IonTitle>
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
          <IonButtons slot="start">
            <IonBackButton defaultHref="/store" text="" />
          </IonButtons>
          <IonTitle>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="profile-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonList lines="none" className="profile-list">
          {profileOptions.map((option) => (
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

export default Profile;