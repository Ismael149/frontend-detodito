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
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonLoading,
    IonAlert,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonRefresher,
    IonRefresherContent
} from '@ionic/react';
import {
    arrowBack,
    checkmarkCircle,
    closeCircle,
    timeOutline,
    alertCircleOutline,
    chatboxEllipsesOutline
} from 'ionicons/icons';
import { environment } from '../../environments/environment';
import axios from 'axios';
import { getImageUrl } from '../../utils/imageUtils';
import './AdminBannersPage.css';

const API_URL = environment.apiUrl;

const AdminBannersPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('pending'); // pending | active | history
    const [banners, setBanners] = useState<any[]>([]);
    const [stats, setStats] = useState({ activeCount: 0, limit: 10 });
    const [loading, setLoading] = useState(true);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const [hideFilters, setHideFilters] = useState(false);

    // Alert & Action Sheet states
    const [showReplyAlert, setShowReplyAlert] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<any>(null);
    const [replyMessage, setReplyMessage] = useState('Lo sentimos, actualmente no hay cupo. Tu solicitud ha sido puesta en lista de espera.');

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/banners/admin/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBanners(response.data.banners);
            setStats({ activeCount: response.data.activeCount, limit: response.data.limit });
        } catch (error) {
            console.error('Error loading banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (event: any) => {
        await loadBanners();
        event.detail.complete();
    };

    const handleApprove = async (banner: any) => {
        if (stats.activeCount >= stats.limit) {
            alert('Límite de banners alcanzado (10/10). Debes rechazar o esperar a que uno expire.');
            return;
        }

        // Determine weeks based on duration_type
        const durationMap: { [key: string]: number } = {
            '1_week': 1, '2_weeks': 2, '3_weeks': 3, '1_month': 4
        };
        const weeks = durationMap[banner.duration_type] || 1;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/banners/admin/${banner.id}/approve`,
                { weeks },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadBanners(); // Reload
        } catch (error) {
            console.error('Error approving banner:', error);
            alert('Error al aprobar.');
        }
    };

    const openReplyDialog = (banner: any) => {
        setSelectedBanner(banner);
        setShowReplyAlert(true);
    };

    const handleReply = async (status: string, message: string = replyMessage) => {
        if (!selectedBanner) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/banners/admin/${selectedBanner.id}/reply`,
                { status, message: replyMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadBanners();
        } catch (error) {
            console.error('Error replying:', error);
        } finally {
            setShowReplyAlert(false);
            setSelectedBanner(null);
        }
    };

    const filteredBanners = banners.filter(b => {
        if (activeTab === 'pending') return b.status === 'pending' || b.status === 'waiting_list';
        if (activeTab === 'active') return b.status === 'active';
        return b.status === 'expired' || b.status === 'rejected';
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'waiting_list': return 'tertiary';
            case 'rejected': return 'danger';
            case 'expired': return 'medium';
            default: return 'medium';
        }
    };

    const translateStatus = (status: string) => {
        switch (status) {
            case 'active': return 'ACTIVO';
            case 'pending': return 'PENDIENTE';
            case 'waiting_list': return 'EN LISTA DE ESPERA';
            case 'rejected': return 'RECHAZADO';
            case 'expired': return 'EXPIRADO';
            default: return status.toUpperCase();
        }
    };

    const translateDuration = (duration: string) => {
        const map: { [key: string]: string } = {
            '1_week': '1 Semana',
            '2_weeks': '2 Semanas',
            '3_weeks': '3 Semanas',
            '1_month': '1 Mes'
        };
        return map[duration] || duration.replace('_', ' ');
    };

    return (
        <IonPage className="admin-banners-page">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/admin/dashboard" text="" />
                    </IonButtons>
                    <IonTitle>Gestionar Banners</IonTitle>
                </IonToolbar>

                <IonToolbar className={`filters-toolbar ${hideFilters ? 'toolbar-hidden' : ''}`}>
                    <IonSegment mode="ios" value={activeTab} onIonChange={e => setActiveTab(e.detail.value as string)}>
                        <IonSegmentButton value="pending">
                            <IonLabel>Pendientes</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="active">
                            <IonLabel>Activos ({stats.activeCount}/10)</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="history">
                            <IonLabel>Historial</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonHeader>

            <IonContent
                className="ion-padding"
                scrollEvents={true}
                onIonScroll={(e) => {
                    const scrollTop = e.detail.scrollTop;
                    const delta = scrollTop - lastScrollTop;

                    if (scrollTop < 80) {
                        if (hideFilters) setHideFilters(false);
                    } else if (Math.abs(delta) > 40) {
                        const isScrollingDown = delta > 0;
                        if (isScrollingDown !== hideFilters) {
                            setHideFilters(isScrollingDown);
                        }
                        setLastScrollTop(scrollTop);
                    }
                }}
            >
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>

                {/* Stats Card */}
                {activeTab === 'active' && (
                    <IonCard className="stats-card">
                        <IonCardContent>
                            <IonRow className="ion-align-items-center">
                                <IonCol size="6">
                                    <IonText color="medium">Espacios Ocupados</IonText>
                                    <div className="stats-number">
                                        {stats.activeCount} <span style={{ fontSize: '16px', color: '#999' }}>/ {stats.limit}</span>
                                    </div>
                                </IonCol>
                                <IonCol size="6" className="ion-text-right">
                                    <IonBadge color={stats.activeCount >= 10 ? 'danger' : 'success'}>
                                        {stats.activeCount >= 10 ? 'Completo' : 'Disponible'}
                                    </IonBadge>
                                </IonCol>
                            </IonRow>
                        </IonCardContent>
                    </IonCard>
                )}

                {filteredBanners.map(banner => (
                    <IonCard key={banner.id} className="banner-card glass-card">
                        <IonCardContent className="compact-content">
                            <img src={getImageUrl(banner.image_url)} alt="Banner" className="banner-image" />

                            <div className="meta-info">
                                <span>Usuario: {banner.user_name || `User #${banner.user_id}`}</span>
                                <IonBadge color={getStatusColor(banner.status)} className="status-badge">
                                    {translateStatus(banner.status)}
                                </IonBadge>
                            </div>

                            <h3>Link: <a href={banner.product_link}>{banner.product_link}</a></h3>
                            <p>Duración solicitada: <strong>{translateDuration(banner.duration_type)}</strong></p>
                            <p>Costo: <strong>${parseFloat(banner.cost).toFixed(2)}</strong></p>

                            {banner.status === 'active' && banner.end_date && (
                                <p style={{ color: 'green' }}>Expira: {new Date(banner.end_date).toLocaleDateString()}</p>
                            )}

                            {/* Actions for Pending */}
                            {activeTab === 'pending' && (
                                <IonGrid className="ion-no-padding" style={{ marginTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px' }}>
                                    <IonRow>
                                        <IonCol size="12" size-md="6">
                                            <IonButton
                                                fill="outline"
                                                color="medium"
                                                expand="block"
                                                className="action-btn"
                                                onClick={() => openReplyDialog(banner)}
                                            >
                                                <IonIcon icon={chatboxEllipsesOutline} slot="start" />
                                                Responder
                                            </IonButton>
                                        </IonCol>
                                        <IonCol size="12" size-md="6">
                                            <IonButton
                                                color="success"
                                                expand="block"
                                                className="action-btn"
                                                onClick={() => handleApprove(banner)}
                                            >
                                                <IonIcon icon={checkmarkCircle} slot="start" />
                                                Aprobar y Cobrar
                                            </IonButton>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>
                            )}
                        </IonCardContent>
                    </IonCard>
                ))}

                {filteredBanners.length === 0 && !loading && (
                    <div className="ion-text-center ion-padding">
                        <IonIcon icon={alertCircleOutline} style={{ fontSize: '48px', color: '#ccc' }} />
                        <p>No hay banners en esta categoría</p>
                    </div>
                )}

                <IonLoading isOpen={loading} message="Cargando banners..." />

                <IonAlert
                    isOpen={showReplyAlert}
                    onDidDismiss={() => setShowReplyAlert(false)}
                    header="Responder Solicitud"
                    inputs={[
                        {
                            name: 'replyMessage',
                            type: 'textarea',
                            placeholder: 'Mensaje para el usuario...',
                            value: replyMessage,
                            attributes: {
                                rows: 4
                            }
                        }
                    ]}
                    buttons={[
                        {
                            text: 'Cancelar',
                            role: 'cancel'
                        },
                        {
                            text: 'Lista de Espera',
                            handler: (data) => {
                                setReplyMessage(data.replyMessage);
                                handleReply('waiting_list', data.replyMessage);
                            }
                        },
                        {
                            text: 'Rechazar Definitivamente',
                            role: 'destructive',
                            handler: (data) => {
                                setReplyMessage(data.replyMessage);
                                handleReply('rejected', data.replyMessage);
                            }
                        }
                    ]}
                />

            </IonContent>
        </IonPage>
    );
};

export default AdminBannersPage;
