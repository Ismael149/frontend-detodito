import React from 'react';
import { IonButton, IonText } from '@ionic/react';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

export const DebugUser: React.FC = () => {
  const checkUser = () => {
    console.log('=== DEBUG USER ===');
    console.log('Is authenticated:', authService.isAuthenticated());
    console.log('Is admin:', authService.isAdmin());
    console.log('User data:', userService.getCurrentUser());
    console.log('LocalStorage user:', localStorage.getItem('user'));
    console.log('LocalStorage token:', localStorage.getItem('token'));
    console.log('==================');
  };

  return (
    <div style={{ padding: '10px', background: '#f0f0f0' }}>
      <IonButton onClick={checkUser} size="small">
        Debug User
      </IonButton>
      <IonText>
        <p>User: {userService.getFullName()}</p>
        <p>Admin: {authService.isAdmin() ? 'Yes' : 'No'}</p>
      </IonText>
    </div>
  );
};