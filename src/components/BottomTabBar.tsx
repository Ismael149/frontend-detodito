// frontend/src/components/BottomTabBar.tsx
import React from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { home, cart, chatbubbles, list, person } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './BottomTabBar.css';

const BottomTabBar: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const tabs = [
    { path: '/store', icon: home, label: 'Hogar' },
    { path: '/cart', icon: cart, label: 'Carro' },
    { path: '/messages', icon: chatbubbles, label: 'Mensajes' },
    { path: '/orders', icon: list, label: 'Pedidos' },
    { path: '/profile', icon: person, label: 'Perfil' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigateTo = (path: string) => {
    history.push(path);
  };

  return (
    <div className="bottom-tab-bar">
      {tabs.map((tab, index) => (
        <IonButton
          key={index}
          fill="clear"
          className={`tab-button ${isActive(tab.path) ? 'active' : ''}`}
          onClick={() => navigateTo(tab.path)}
        >
          <div className="tab-content">
            <IonIcon icon={tab.icon} />
            <IonText>
              <span>{tab.label}</span>
            </IonText>
          </div>
        </IonButton>
      ))}
    </div>
  );
};

export default BottomTabBar;