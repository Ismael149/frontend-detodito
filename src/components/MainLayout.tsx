// frontend/src/components/MainLayout.tsx
import React from 'react';
import { IonContent } from '@ionic/react';
import BottomTabBar from './BottomTabBar';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  fullscreen?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, fullscreen = false }) => {
  return (
    <>
      <IonContent className={fullscreen ? '' : 'tab-bar-padding'}>
        {children}
      </IonContent>
      <BottomTabBar />
    </>
  );
};

export default MainLayout;