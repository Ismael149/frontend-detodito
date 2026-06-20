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
  IonBadge,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonDatetime,
  IonModal,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { document, time, refresh, calendar, filter } from 'ionicons/icons';
import { adminService } from '../../services/adminService';
import { authService } from '../../services/authService';
import './AdminActivityLogs.css';

const AdminActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    target_type: '',
    date_from: null as string | null,
    date_to: null as string | null
  });
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showTypeAlert, setShowTypeAlert] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [hideFilters, setHideFilters] = useState(false);

  const history = useHistory();

  useEffect(() => {
    if (!authService.isAdmin()) {
      history.push('/store');
      return;
    }
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const apiFilters = {
        ...filters,
        date_from: filters.date_from || '',
        date_to: filters.date_to || ''
      };
      const logsData = await adminService.getActivityLogs(apiFilters);
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      setAlertMessage('Error al cargar bitácora');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadLogs();
    event.detail.complete();
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('DELETE')) return 'danger';
    if (action.includes('UPDATE')) return 'warning';
    if (action.includes('CREATE')) return 'success';
    return 'primary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/admin/dashboard" text="" />
            </IonButtons>
            <IonTitle>Bitácora de Actividades</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando bitácora...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <style>{`
        body.dark .admin-activity-logs,
        body.dark .admin-activity-logs ion-content {
          --background: #121212 !important;
          background: #121212 !important;
        }

        body.dark .log-item,
        body.dark .filters-section,
        body.dark .empty-state {
          --background: #1e1e1e !important;
          background: #1e1e1e !important;
          color: white !important;
          border-color: #333 !important;
        }

        body.dark .log-header h3,
        body.dark .log-header p,
        body.dark .log-details p,
        body.dark .log-meta ion-text {
           color: white !important;
        }

        body.dark .filters-section ion-searchbar {
            --background: #2c2c2c !important;
            --color: white !important;
        }

        body.dark .filters-section ion-select {
            --background: #2c2c2c !important;
            color: white !important;
        }
        
        body.dark ion-item {
            --background: #1e1e1e !important;
            --color: white !important;
        }
        
        ion-modal.date-modal {
          --width: 90%;
          --max-width: 400px;
          --height: auto;
          --border-radius: 16px;
        }

        .date-modal-inner {
          background: white;
          padding: 16px;
          border-radius: 16px;
        }

        body.dark .date-modal-inner {
           background: #1e1e1e !important;
           color: white !important;
        }
      `}</style>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" text="" />
          </IonButtons>
          <IonTitle>Bitácora de Actividades</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowTypeAlert(true)}>
              <IonIcon icon={filter} slot="icon-only" />
            </IonButton>
            <IonButton onClick={loadLogs}>
              <IonIcon icon={refresh} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Filters Section in Header for smooth hide-on-scroll */}
        {!hideFilters && (
          <IonToolbar className="filters-toolbar">
            <div className="filters-container-inner">
              <IonSearchbar
                value={filters.action}
                onIonInput={(e) => setFilters({ ...filters, action: e.detail.value! })}
                placeholder="Buscar por acción..."
                animated
              />

              <div className="filter-chips-row">
                <IonButton fill="outline" size="small" onClick={() => setShowStartModal(true)}>
                  <IonIcon icon={calendar} slot="start" />
                  {filters.date_from ? new Date(filters.date_from).toLocaleDateString() : 'Desde'}
                </IonButton>
                <IonButton fill="outline" size="small" onClick={() => setShowEndModal(true)}>
                  <IonIcon icon={calendar} slot="start" />
                  {filters.date_to ? new Date(filters.date_to).toLocaleDateString() : 'Hasta'}
                </IonButton>
                <IonButton fill="clear" color="primary" size="small" onClick={() => setShowTypeAlert(true)}>
                  Tipo: {filters.target_type || 'Todos'}
                </IonButton>
              </div>
            </div>
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent
        className="admin-activity-logs"
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
        <div className="filters-spacer" style={{ height: '0px' }}></div>

        <IonModal isOpen={showStartModal} onDidDismiss={() => setShowStartModal(false)} className="date-modal">
          <div className="date-modal-inner">
            <IonDatetime
              presentation="date"
              value={filters.date_from}
              onIonChange={(e) => {
                setFilters({ ...filters, date_from: e.detail.value as string });
                setShowStartModal(false);
              }}
            />
            <IonButton expand="full" onClick={() => setShowStartModal(false)}>Cerrar</IonButton>
          </div>
        </IonModal>

        <IonModal isOpen={showEndModal} onDidDismiss={() => setShowEndModal(false)} className="date-modal">
          <div className="date-modal-inner">
            <IonDatetime
              presentation="date"
              value={filters.date_to}
              onIonChange={(e) => {
                setFilters({ ...filters, date_to: e.detail.value as string });
                setShowEndModal(false);
              }}
            />
            <IonButton expand="full" onClick={() => setShowEndModal(false)}>Cerrar</IonButton>
          </div>
        </IonModal>

        <div className="logs-list">
          {logs.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron registros</p>
            </div>
          ) : (
            <IonGrid>
              {logs.map((log) => (
                <IonCard key={log.id} className="log-item">
                  <IonCardContent>
                    <IonGrid>
                      <IonRow>
                        <IonCol size="12">
                          <div className="log-header">
                            <IonText>
                              <h3>
                                <IonBadge color={getActionBadgeColor(log.action)}>
                                  {log.action}
                                </IonBadge>
                                {' '}por {log.admin_username || 'Sistema'}
                              </h3>
                              <p>Tipo: {log.target_type} | ID: {log.target_id}</p>
                            </IonText>
                            <IonText color="medium">
                              <small>{formatDate(log.created_at)}</small>
                            </IonText>
                          </div>
                          {log.details && (
                            <div className="log-details">
                              <p>{log.details}</p>
                            </div>
                          )}
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonGrid>
          )}
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Aviso'}
          message={alertMessage}
          buttons={['OK']}
        />

        {/* Emergent Type Selector */}
        <IonAlert
          isOpen={showTypeAlert}
          onDidDismiss={() => setShowTypeAlert(false)}
          header="Filtrar por Tipo"
          inputs={[
            { type: 'radio', label: 'Todos', value: '', checked: filters.target_type === '' },
            { type: 'radio', label: 'Usuario', value: 'user', checked: filters.target_type === 'user' },
            { type: 'radio', label: 'Producto', value: 'product', checked: filters.target_type === 'product' },
            { type: 'radio', label: 'Pedido', value: 'order', checked: filters.target_type === 'order' },
            { type: 'radio', label: 'Comentario', value: 'comment', checked: filters.target_type === 'comment' },
            { type: 'radio', label: 'Administrador', value: 'admin', checked: filters.target_type === 'admin' }
          ]}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Aplicar', handler: (val) => setFilters({ ...filters, target_type: val }) }
          ]}
        />
      </IonContent>
    </IonPage >
  );
};

export default AdminActivityLogs;