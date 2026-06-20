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
  IonText,
  IonSpinner,
  IonAlert,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
  IonBadge
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { person, ban, checkmarkCircle, search, filter } from 'ionicons/icons';
import { adminService } from '../../services/adminService';
import { authService } from '../../services/authService';
import { getImageUrl } from '../../utils/imageUtils';
import './AdminUsers.css';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Local state for input
  const [filters, setFilters] = useState({
    search: '',
    role: 'all'
  });
  const [showDeactivateAlert, setShowDeactivateAlert] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showFiltersAlert, setShowFiltersAlert] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [hideFilters, setHideFilters] = useState(false);

  const history = useHistory();

  // Debounce search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (!authService.isAdmin()) {
      history.push('/store');
      return;
    }
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await adminService.getUsers(filters);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      setAlertMessage('Error al cargar usuarios');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadUsers();
    event.detail.complete();
  };

  const executeStatusChange = async (userId: number, isActive: boolean, reason?: string) => {
    try {
      await adminService.toggleUserStatus(userId, isActive, reason);
      setAlertMessage(`Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`);
      setShowAlert(true);
      loadUsers();
    } catch (error) {
      console.error('Error changing user status:', error);
      loadUsers(); // Revert UI
      setAlertMessage('Error al cambiar estado del usuario.');
      setShowAlert(true);
    }
  };

  const handleToggleClick = (user: any) => {
    const newStatus = !user.is_active;
    if (newStatus) {
      // Activating - Do it immediately
      executeStatusChange(user.id, true);
    } else {
      // Deactivating - Ask for reason
      setSelectedUser(user);
      setShowDeactivateAlert(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" text="" />
          </IonButtons>
          <IonTitle>Gestionar Usuarios</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowFiltersAlert(true)}>
              <IonIcon icon={filter} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Search Bar in Header for smooth hide-on-scroll */}
        {!hideFilters && (
          <IonToolbar className="filters-toolbar">
            <IonSearchbar
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value!)}
              placeholder="Buscar por nombre..."
              animated
              debounce={0}
            />
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent
        className="admin-users"
        scrollEvents={true}
        onIonScroll={(e) => {
          const scrollTop = e.detail.scrollTop;
          const delta = scrollTop - lastScrollTop;

          if (scrollTop < 50) {
            setHideFilters(false);
          } else if (Math.abs(delta) > 10) {
            if (delta > 0 && scrollTop > 150) {
              setHideFilters(true);
            } else if (delta < 0) {
              setHideFilters(false);
            }
            setLastScrollTop(scrollTop);
          }
        }}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Lista de usuarios - CSS GRID */}
        <div className="users-container">
          {loading ? (
            <div className="loading-container" style={{ height: '300px' }}>
              <IonSpinner name="crescent" />
              <p>Cargando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={person} style={{ fontSize: '64px', opacity: 0.5, marginBottom: '16px' }} />
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <div key={user.id} className="user-card-wrapper">
                  <IonCard className="user-card">
                    <div className="user-card-content">
                      <div className="user-avatar-container">
                        {user.profile_picture ? (
                          <img
                            src={getImageUrl(user.profile_picture)}
                            alt={user.username}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                          />
                        ) : (
                          <IonIcon icon={person} />
                        )}
                      </div>

                      <div className="user-info">
                        <h3 className="user-name">
                          {user.first_name} {user.last_name}
                          {user.is_admin && (
                            <IonBadge color="tertiary" className="admin-badge">Admin</IonBadge>
                          )}
                        </h3>
                        <p className="user-username">@{user.username}</p>
                        <p className="user-email">{user.email}</p>
                      </div>

                      <div className="user-stats">
                        <IonBadge color="light">
                          🛍️ {user.product_count || 0} Prod
                        </IonBadge>
                        <IonBadge color="light">
                          📦 {user.order_count || 0} Pedidos
                        </IonBadge>
                        {user.pending_reports > 0 && (
                          <IonBadge color="danger">
                            ⚠️ {user.pending_reports} Reportes
                          </IonBadge>
                        )}
                      </div>

                      <div className="user-footer">
                        <div className="user-meta">
                          <span>Estado: <strong>{user.is_active ? 'Activo' : 'Inactivo'}</strong></span>
                          <span>Reg: {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="user-actions">
                          <IonButton
                            expand="block"
                            fill={user.is_active ? "outline" : "solid"}
                            color={user.is_active ? 'danger' : 'success'}
                            onClick={() => handleToggleClick(user)}
                          >
                            <IonIcon icon={user.is_active ? ban : checkmarkCircle} slot="start" />
                            {user.is_active ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                          </IonButton>
                        </div>
                      </div>
                    </div>
                  </IonCard>
                </div>
              ))}
            </div>
          )}
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Aviso'}
          message={alertMessage}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={showDeactivateAlert}
          onDidDismiss={() => setShowDeactivateAlert(false)}
          header={'Desactivar Cuenta'}
          message={`¿Por qué deseas desactivar a @${selectedUser?.username}?`}
          inputs={[
            {
              name: 'reason',
              type: 'text',
              placeholder: 'Motivo (ej. Comportamiento inapropiado)'
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => setSelectedUser(null)
            },
            {
              text: 'Desactivar',
              handler: (data) => {
                if (selectedUser) {
                  executeStatusChange(selectedUser.id, false, data.reason);
                }
                setSelectedUser(null);
              }
            }
          ]}
        />

        <IonAlert
          isOpen={showFiltersAlert}
          onDidDismiss={() => setShowFiltersAlert(false)}
          header="Filtrar por rol"
          subHeader="Selecciona una opción"
          inputs={[
            {
              name: 'all',
              type: 'radio',
              label: 'Todos los Roles',
              value: 'all',
              checked: filters.role === 'all'
            },
            {
              name: 'admin',
              type: 'radio',
              label: 'Administradores',
              value: 'admin',
              checked: filters.role === 'admin'
            },
            {
              name: 'user',
              type: 'radio',
              label: 'Usuarios',
              value: 'user',
              checked: filters.role === 'user'
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Aplicar',
              handler: (value) => {
                setFilters({ ...filters, role: value });
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminUsers;