import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonAvatar,
    IonText,
    IonIcon,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
    IonThumbnail,
    IonSegment,
    IonSegmentButton,
    IonButton,
    IonModal,
    IonTextarea,
    IonAlert,
    IonRefresher,
    IonRefresherContent
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { star, storefront, checkmarkCircle, shieldCheckmark, chatbubbles, addCircle, time } from 'ionicons/icons';
import { sellerService } from '../services/sellerService';
import { authService } from '../services/authService';
import ProductImage from '../components/ProductImage';
import './SellerProfile.css';

const SellerProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [sellerData, setSellerData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('products');
    const [showRateModal, setShowRateModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        loadProfile();
    }, [id]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await sellerService.getPublicProfile(Number(id));
            setSellerData(data);
        } catch (error) {
            console.error('Error loading seller profile:', error);
            setAlertMsg('No se pudo cargar el perfil del vendedor');
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (event: any) => {
        await loadProfile();
        event.detail.complete();
    };

    const handleRateSeller = async () => {
        if (!authService.isAuthenticated()) {
            history.push('/login');
            return;
        }

        if (!comment.trim()) {
            setAlertMsg('Por favor escribe un comentario');
            setShowAlert(true);
            return;
        }

        try {
            setSubmitting(true);
            await sellerService.rateSeller(Number(id), rating, comment);
            setAlertMsg('¡Gracias por tu valoración!');
            setShowAlert(true);
            setShowRateModal(false);
            setComment('');
            loadProfile();
        } catch (error: any) {
            setAlertMsg(error.response?.data?.message || 'Error al enviar valoración');
            setShowAlert(true);
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-VE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <IonPage>
                <IonContent className="ion-padding ion-text-center">
                    <IonSpinner name="crescent" />
                    <p>Cargando perfil...</p>
                </IonContent>
            </IonPage>
        );
    }

    if (!sellerData) return null;

    const { seller, stats, reviews, products } = sellerData;

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/store" text="" />
                    </IonButtons>
                    <IonTitle>Perfil del Vendedor</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="seller-profile-content">
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>
                
                <div className="profile-header-gradient">
                    <div className="profile-info-main">
                        <IonAvatar className="seller-large-avatar">
                            <img src={seller.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.username)}&background=random&size=128`} alt={seller.username} />
                        </IonAvatar>
                        <h2 className="seller-username">@{seller.username}</h2>
                        <h3 className="seller-fullname">{seller.full_name}</h3>
                        <div className="seller-joined">
                            <IonIcon icon={time} />
                            <span>En DeTodito desde {seller.created_at ? new Date(seller.created_at).getFullYear() : 'reciente'}</span>
                        </div>
                    </div>
                </div>

                <div className="stats-container">
                    <div className="stat-item">
                        <span className="stat-value">{stats.total_sales}</span>
                        <span className="stat-label">Ventas</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <span className="stat-value">
                            {stats.average_rating ? stats.average_rating.toFixed(1) : 'N/A'}
                            <IonIcon icon={star} color="warning" />
                        </span>
                        <span className="stat-label">{stats.total_ratings} opiniones</span>
                    </div>
                </div>

                <div className="contact-info-container">
                    {seller.email && (
                        <div className="contact-item">
                            <IonIcon icon={shieldCheckmark} color="primary" />
                            <IonText>{seller.email}</IonText>
                        </div>
                    )}
                    {seller.phone && (
                        <div className="contact-item">
                            <IonIcon icon={checkmarkCircle} color="success" />
                            <IonText>{seller.phone}</IonText>
                        </div>
                    )}
                </div>

                <IonSegment value={activeTab} onIonChange={e => setActiveTab(e.detail.value as string)}>
                    <IonSegmentButton value="products">
                        <IonLabel>Productos ({products.length})</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="reviews">
                        <IonLabel>Opiniones ({reviews.length})</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                <div className="tab-content">
                    {activeTab === 'products' && (
                        <IonList className="seller-products-list">
                            {products.length === 0 ? (
                                <div className="empty-state">
                                    <IonIcon icon={storefront} size="large" />
                                    <p>Este vendedor no tiene productos activos</p>
                                </div>
                            ) : (
                                products.map((product: any) => (
                                    <IonItem key={product.id} button onClick={() => history.push(`/product/${product.id}`)}>
                                        <IonThumbnail slot="start">
                                            <ProductImage
                                                imageUrl={product.image_url}
                                                images={product.images}
                                                alt={product.name}
                                            />
                                        </IonThumbnail>
                                        <IonLabel>
                                            <h3>{product.name}</h3>
                                            <p>{formatPrice(product.price)}</p>
                                            <IonText color="medium">
                                                <small>{product.condition === 'new' ? 'Nuevo' : 'Usado'}</small>
                                            </IonText>
                                        </IonLabel>
                                    </IonItem>
                                ))
                            )}
                        </IonList>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="reviews-tab">
                            <IonButton expand="block" fill="outline" className="rate-btn" onClick={() => setShowRateModal(true)}>
                                <IonIcon icon={addCircle} slot="start" />
                                Valorar vendedor
                            </IonButton>

                            <IonList className="reviews-list">
                                {reviews.length === 0 ? (
                                    <div className="empty-state">
                                        <IonIcon icon={chatbubbles} size="large" />
                                        <p>No hay opiniones todavía</p>
                                    </div>
                                ) : (
                                    reviews.map((review: any) => (
                                        <IonCard key={review.id} className="review-card">
                                            <IonCardContent>
                                                <div className="review-header">
                                                    <IonText><strong>{review.buyer_username}</strong></IonText>
                                                    <div className="review-stars">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <IonIcon key={s} icon={star} color={s <= review.rating ? 'warning' : 'medium'} size="small" />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="review-comment">{review.comment}</p>
                                                <IonText color="medium" className="review-date">
                                                    <small>{formatDate(review.created_at)}</small>
                                                </IonText>
                                            </IonCardContent>
                                        </IonCard>
                                    ))
                                )}
                            </IonList>
                        </div>
                    )}
                </div>

                <IonModal isOpen={showRateModal} onDidDismiss={() => setShowRateModal(false)}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Valorar Vendedor</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowRateModal(false)}>Cerrar</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <div className="rating-selector-center">
                            {[1, 2, 3, 4, 5].map(s => (
                                <IonIcon
                                    key={s}
                                    icon={star}
                                    color={s <= rating ? 'warning' : 'medium'}
                                    size="large"
                                    onClick={() => setRating(s)}
                                    style={{ cursor: 'pointer', fontSize: '32px' }}
                                />
                            ))}
                        </div>
                        <IonTextarea
                            placeholder="Escribe tu experiencia con este vendedor..."
                            value={comment}
                            onIonInput={e => setComment(e.detail.value!)}
                            rows={6}
                            className="rating-textarea"
                        />
                        <IonButton expand="block" onClick={handleRateSeller} disabled={submitting}>
                            {submitting ? <IonSpinner /> : 'Enviar valoración'}
                        </IonButton>
                    </IonContent>
                </IonModal>

                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header="Aviso"
                    message={alertMsg}
                    buttons={['OK']}
                />
            </IonContent>
        </IonPage>
    );
};

export default SellerProfilePage;
