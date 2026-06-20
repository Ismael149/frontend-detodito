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
  IonLabel,
  IonBadge,
  IonModal,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonAvatar,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import {
  refresh,
  checkmarkCircle,
  closeCircle,
  alertCircle,
  shieldCheckmark,
  time,
  person,
  warning,
  trash,
  chatbubbles,
  search as searchIcon,
  filter
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { adminCommentService } from '../../services/adminCommentService';
import { authService } from '../../services/authService';
import './AdminComments.css';

interface Comment {
  id: number;
  content: string;
  rating: number;
  moderation_status: 'approved' | 'pending' | 'flagged' | 'rejected' | 'review';
  is_active: boolean;
  score?: number;
  keywords_found?: string[];
  flagged_at?: string;
  reason?: string;
  created_at: string;
  username: string;
  email: string;
  user_id: number;
  product_name: string;
}

const AdminComments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [flaggedComments, setFlaggedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'flagged' | 'all' | 'reports'>('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'pending'
  });

  const [allReports, setAllReports] = useState<any[]>([]);

  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [violationType, setViolationType] = useState('inappropriate_content');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ show: boolean, title: string, message: string }>({
    show: false, title: '', message: ''
  });
  const [showFiltersAlert, setShowFiltersAlert] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [hideFilters, setHideFilters] = useState(false);

  const history = useHistory();

  // Debounce search effect (Standard pattern from AdminUsers)
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
    loadData();
  }, [filters, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'flagged') {
        const data = await adminCommentService.getFlaggedComments();
        if (data.success) setFlaggedComments(data.comments);
      } else if (activeTab === 'reports') {
        const data = await adminCommentService.getReports();
        if (data.success) setAllReports(data.reports);
      } else {
        const statusMap: any = { 'pending': 'pending', 'all': 'all' };
        const data = await adminCommentService.getComments({
          search: filters.search,
          status: activeTab === 'all' ? 'all' : 'pending',
          limit: 100
        });
        if (data.success) setComments(data.comments);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadData();
    event.detail.complete();
  };

  const handleApprove = async (comment: Comment) => {
    try {
      setIsSubmitting(true);
      const res = await adminCommentService.approveFlaggedComment(comment.id, 'Aprobado manualmente');
      if (res.success) {
        setAlertInfo({ show: true, title: 'Éxito', message: 'Comentario aprobado.' });
        loadData();
      }
    } catch (error: any) {
      setAlertInfo({ show: true, title: 'Error', message: error.message || 'Error al aprobar' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRejectModal = (comment: Comment) => {
    setSelectedComment(comment);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedComment || !rejectReason) return;
    try {
      setIsSubmitting(true);
      const res = await adminCommentService.rejectFlaggedComment(selectedComment.id, rejectReason, violationType);
      if (res.success) {
        setShowRejectModal(false);
        setAlertInfo({ show: true, title: 'Acción Completada', message: `Comentario rechazado.` });
        loadData();
      }
    } catch (error: any) {
      setAlertInfo({ show: true, title: 'Error', message: error.message || 'Error al rechazar' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: number) => {
    setCommentToDelete(id);
    setShowDeleteAlert(true);
  };

  const handleDelete = async () => {
    if (!commentToDelete) return;
    try {
      const res = await adminCommentService.deleteComment(commentToDelete);
      if (res.success) loadData();
    } catch (error: any) {
      setAlertInfo({ show: true, title: 'Error', message: 'Error al eliminar' });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" text="" />
          </IonButtons>
          <IonTitle>Gestionar Moderación</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowFiltersAlert(true)}>
              <IonIcon icon={filter} slot="icon-only" />
            </IonButton>
            <IonButton onClick={loadData}>
              <IonIcon icon={refresh} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Search Bar in Header for smooth hide-on-scroll */}
        {!hideFilters && (
          <IonToolbar className="filters-toolbar">
            <IonSearchbar
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value!)}
              placeholder="Buscar comentarios..."
              animated
            />
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent
        className="admin-comments"
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

        {/* LOADING & LIST CONTAINER (Standard Match) */}
        <div className="comments-container">
          {loading ? (
            <div className="loading-container" style={{ height: '300px' }}>
              <IonSpinner name="crescent" />
              <p>Cargando comentarios...</p>
            </div>
          ) : activeTab === 'reports' ? (
            <div className="comments-grid">
              {allReports.map((r) => (
                <div key={`${r.type}-${r.report_id}`} className="comment-card-wrapper">
                  <IonCard className="comment-card">
                    <div className="comment-card-content">
                      <div className="comment-header">
                        <IonBadge color={r.type === 'AI_FLAG' ? 'warning' : 'danger'}>
                          {r.type === 'AI_FLAG' ? 'Alerta Smart AI' : 'Reporte de Usuario'}
                        </IonBadge>
                        <span className="timestamp">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="report-reason" style={{ margin: '10px 0', fontWeight: 'bold' }}>
                        {r.reporter_name} reportó: "{r.reason}"
                      </div>

                      <div className="comment-main-text" style={{ opacity: 0.7, fontStyle: 'italic' }}>
                        Contenido: "{r.content}"
                      </div>

                      <div className="comment-meta">
                        Autor: @{r.author_name}
                      </div>
                    </div>

                    <div className="comment-card-footer">
                      <div className="comment-actions">
                        <IonButton fill="outline" color="success" onClick={() => handleApprove({ id: r.comment_id } as Comment)}>
                          <IonIcon icon={checkmarkCircle} slot="start" /> Ignorar
                        </IonButton>
                        <IonButton fill="outline" color="danger" onClick={() => openRejectModal({ id: r.comment_id } as Comment)}>
                          <IonIcon icon={closeCircle} slot="start" /> Sancionar
                        </IonButton>
                      </div>
                    </div>
                  </IonCard>
                </div>
              ))}
            </div>
          ) : (activeTab === 'flagged' ? flaggedComments : comments).length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={chatbubbles} />
              <p>No se encontraron comentarios</p>
            </div>
          ) : (
            <div className="comments-grid">
              {(activeTab === 'flagged' ? flaggedComments : comments).map((c) => (
                <div key={c.id} className="comment-card-wrapper">
                  <IonCard className="comment-card">
                    <div className="comment-card-content">
                      <div className="comment-header">
                        <div className="comment-user-info">
                          <div className="user-avatar-placeholder">
                            <IonIcon icon={person} />
                          </div>
                          <div className="comment-user-details">
                            <span className="user-display-name">@{c.username}</span>
                            <span className="user-username-small">{c.email}</span>
                          </div>
                        </div>
                        <IonBadge color={
                          c.moderation_status === 'approved' ? 'success' :
                            c.moderation_status === 'rejected' ? 'danger' : 'warning'
                        } className="status-badge">
                          {c.moderation_status}
                        </IonBadge>
                      </div>

                      <div className="comment-main-text">
                        "{c.content}"
                      </div>

                      <div className="comment-product-ref">
                        <IonIcon icon={chatbubbles} /> En: <strong>{c.product_name}</strong>
                      </div>

                      {c.score && c.score > 0 && (
                        <div className="ai-risk-blob">
                          <span className="risk-label-text">Riesgo IA</span>
                          <span className="risk-score-value">{c.score}%</span>
                        </div>
                      )}

                      <div className="comment-meta">
                        <span>Enviado: {new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="comment-card-footer">
                      <div className="comment-actions">
                        {c.moderation_status !== 'approved' && (
                          <IonButton fill="outline" color="success" onClick={() => handleApprove(c)}>
                            <IonIcon icon={checkmarkCircle} slot="start" /> Aprobar
                          </IonButton>
                        )}
                        {c.moderation_status !== 'rejected' && (
                          <IonButton fill="outline" color="danger" onClick={() => openRejectModal(c)}>
                            <IonIcon icon={closeCircle} slot="start" /> Rechazar
                          </IonButton>
                        )}
                        <IonButton fill="clear" color="medium" onClick={() => confirmDelete(c.id)}>
                          <IonIcon icon={trash} />
                        </IonButton>
                      </div>
                    </div>
                  </IonCard>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Rechazo Standard */}
        <IonModal isOpen={showRejectModal} onDidDismiss={() => setShowRejectModal(false)} className="premium-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Sancionar Comentario</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowRejectModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedComment && (
              <div className="modal-form">
                <IonLabel position="stacked">Motivo del Rechazo</IonLabel>
                <IonTextarea
                  value={rejectReason}
                  onIonChange={e => setRejectReason(e.detail.value!)}
                  placeholder="Detalle la infracción..."
                  rows={4}
                />
                <IonLabel position="stacked" className="ion-margin-top">Tipo de Violación</IonLabel>
                <IonSelect value={violationType} onIonChange={e => setViolationType(e.detail.value!)} interface="popover">
                  <IonSelectOption value="inappropriate_content">Contenido Inapropiado</IonSelectOption>
                  <IonSelectOption value="spam">Spam / Publicidad</IonSelectOption>
                  <IonSelectOption value="harassment">Acoso / Bullying</IonSelectOption>
                  <IonSelectOption value="hate_speech">Discurso de Odio</IonSelectOption>
                </IonSelect>
                <IonButton expand="block" color="danger" onClick={handleReject} className="ion-margin-top" disabled={!rejectReason || isSubmitting}>
                  {isSubmitting ? <IonSpinner name="dots" /> : "Confirmar Bloqueo"}
                </IonButton>
              </div>
            )}
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Eliminar"
          message="¿Seguro?"
          buttons={[
            { text: 'No', role: 'cancel' },
            { text: 'Sí, Eliminar', handler: () => handleDelete() }
          ]}
        />

        <IonAlert
          isOpen={alertInfo.show}
          onDidDismiss={() => setAlertInfo({ ...alertInfo, show: false })}
          header={alertInfo.title}
          message={alertInfo.message}
          buttons={['Aceptar']}
        />

        {/* Alerta de Filtros de Moderación */}
        <IonAlert
          isOpen={showFiltersAlert}
          onDidDismiss={() => setShowFiltersAlert(false)}
          header="Filtrar Moderación"
          subHeader="Selecciona una vista"
          inputs={[
            {
              name: 'pending',
              type: 'radio',
              label: 'Pendientes de Revisión',
              value: 'pending',
              checked: activeTab === 'pending'
            },
            {
              name: 'flagged',
              type: 'radio',
              label: 'Alertas Smart AI',
              value: 'flagged',
              checked: activeTab === 'flagged'
            },
            {
              name: 'reports',
              type: 'radio',
              label: 'Todos los Reportes (Unificado)',
              value: 'reports',
              checked: activeTab === 'reports'
            },
            {
              name: 'all',
              type: 'radio',
              label: 'Todo el Historial',
              value: 'all',
              checked: activeTab === 'all'
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
                setActiveTab(value);
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminComments;