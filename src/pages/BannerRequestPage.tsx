import React, { useState, useEffect, useRef } from 'react';
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
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText,
    IonNote,
    IonLoading,
    IonAlert,
    useIonToast,
    IonAvatar,
    IonModal,
    IonSearchbar,
    IonThumbnail
} from '@ionic/react';
import { cloudUpload, card, chevronForward, alertCircle, checkmarkCircle, megaphone, pricetag, time, sparkles, search, close } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { settingsService } from '../services/settingsService';
import { authService } from '../services/authService';
import axios from 'axios';
import { environment } from '../environments/environment';
import './BannerRequestPage.css';

const API_URL = environment.apiUrl;

// Definir el servicio aquí temporalmente si no existe
const bannerService = {
    requestBanner: async (formData: FormData) => {
        const response = await axios.post(`${API_URL}/banners/request`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    getMyBanners: async () => {
        const response = await axios.get(`${API_URL}/banners/my-banners`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    }
};

const productService = {
    getUserProducts: async (userId: number) => {
        const response = await axios.get(`${API_URL}/products/user/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    }
};

// Module-level storage to survive Android remounts
let NUCLEAR_FILE_STORE: File | null = null;
let NUCLEAR_PRODUCT_LINK: string = '';
let NUCLEAR_PRODUCT_NAME: string = '';
let NUCLEAR_PREVIEW_URL: string = '';
let NUCLEAR_PRODUCT_OBJECT: any = null;

const BannerRequestPage: React.FC = () => {
    const history = useHistory();
    const [present] = useIonToast();

    // NUCLEAR DIAGNOSTIC: Detect remounts (kept for internal console but removed alerts)
    const renderCount = useRef(0);
    renderCount.current++;
    useEffect(() => {
        console.log('Componente Montado (Nuclear v1.1.0)');
    }, []);

    const [formData, setFormData] = useState({
        image_url: '',
        product_link: NUCLEAR_PRODUCT_LINK,
        duration_type: '1_week'
    });

    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState<any>({ buttons: [] });

    // Nuevos estados para subida de archivo y selector de productos
    const [selectedFileName, setSelectedFileName] = useState(NUCLEAR_FILE_STORE ? NUCLEAR_FILE_STORE.name : '');
    const [previewUrl, setPreviewUrl] = useState<string>(NUCLEAR_PREVIEW_URL);
    const [selectedProductName, setSelectedProductName] = useState(NUCLEAR_PRODUCT_NAME);
    const [showProductModal, setShowProductModal] = useState(false);
    const [userProducts, setUserProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchProduct, setSearchProduct] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    const PRICING: { [key: string]: number } = {
        '1_week': 5.00,
        '2_weeks': 10.00,
        '3_weeks': 15.00,
        '1_month': 20.00
    };

    useEffect(() => {
        checkPaymentMethods();
    }, []);

    const checkPaymentMethods = async () => {
        try {
            const response = await settingsService.getPaymentMethods();
            if (response.success && response.methods.length > 0) {
                setPaymentMethods(response.methods);
            } else {
                setAlertConfig({
                    header: 'Método de pago requerido',
                    message: 'Para publicar un banner necesitas registrar una tarjeta de crédito o débito. ¿Deseas agregar una ahora?',
                    buttons: [
                        {
                            text: 'Cancelar',
                            role: 'cancel',
                            handler: () => history.goBack()
                        },
                        {
                            text: 'Agregar Tarjeta',
                            handler: () => history.push('/payment-methods')
                        }
                    ]
                });
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Error checking payment methods:', error);
        } finally {
            setCheckingPayment(false);
        }
    };

    const loadUserProducts = async () => {
        try {
            setLoadingProducts(true);
            const user = authService.getCurrentUser();
            if (user && user.id) {
                const products = await productService.getUserProducts(user.id);
                setUserProducts(products);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleFileSelect = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            NUCLEAR_FILE_STORE = file;
            setSelectedFileName(file.name);

            const reader = new FileReader();
            reader.onloadstart = () => console.log("⏳ Reading file for preview...");
            reader.onloadend = () => {
                const result = reader.result as string;
                console.log("✅ Preview generated, length:", result.length);
                NUCLEAR_PREVIEW_URL = result;
                setPreviewUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const openProductSelector = () => {
        loadUserProducts();
        setShowProductModal(true);
    };

    const selectProduct = (product: any) => {
        const link = `/product/${product.id}`;
        NUCLEAR_PRODUCT_LINK = link;
        NUCLEAR_PRODUCT_NAME = product.name;
        NUCLEAR_PRODUCT_OBJECT = product; // Store the full product object
        setFormData({ ...formData, product_link: link });
        setSelectedProductName(product.name);
        setShowProductModal(false);
    };

    const calculateCost = () => {
        return PRICING[formData.duration_type] || 0;
    };

    const handleSubmit = async () => {
        const file = NUCLEAR_FILE_STORE;
        const link = NUCLEAR_PRODUCT_LINK || formData.product_link;
        const errors: { [key: string]: string } = {};
        let isValid = true;

        if (!file) {
            errors.image = 'Debes seleccionar una imagen para el banner';
            isValid = false;
        }

        if (!link) {
            errors.product = 'Debes seleccionar un producto para promocionar';
            isValid = false;
        }

        if (!isValid) {
            setFieldErrors(errors);
            present({
                message: 'Por favor completa los campos requeridos',
                duration: 2000,
                color: 'danger',
                position: 'top'
            });
            return;
        }

        setFieldErrors({}); // Clear errors if valid

        const submitData = new FormData();
        if (file) {
            submitData.append('image', file);
        }
        submitData.append('product_link', link);
        submitData.append('duration_type', formData.duration_type);

        setLoading(true);
        try {
            await bannerService.requestBanner(submitData);

            setAlertConfig({
                header: 'Solicitud Enviada',
                message: 'Tu solicitud de banner ha sido creada exitosamente. El administrador la revisará y recibirás una notificación cuando sea aprobada.',
                buttons: [{
                    text: 'Entendido',
                    handler: () => history.push('/store')
                }]
            });
            setShowAlert(true);

        } catch (error: any) {
            console.error('Error submitting banner:', error);
            const msg = error.response?.data?.error || 'Error al enviar solicitud';

            if (error.response?.data?.requiresPaymentMethod) {
                setAlertConfig({
                    header: 'Pago Requerido',
                    message: 'No tienes una tarjeta predeterminada para el cobro. Por favor agrega una.',
                    buttons: [{
                        text: 'Ir a Pagos',
                        handler: () => history.push('/payment-methods')
                    }]
                });
                setShowAlert(true);
            } else {
                present({
                    message: msg,
                    duration: 3000,
                    color: 'danger'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (checkingPayment) {
        return <IonLoading isOpen={true} message="Verificando cuenta..." />;
    }

    const defaultPaymentMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0];

    return (
        <IonPage className="banner-request-v6">
            <IonHeader className="ion-no-border">
                <IonToolbar className="premium-toolbar">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/store" text="" />
                    </IonButtons>
                    <IonTitle>Publicar Banner</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="banner-request-content-v6">
                <IonList lines="none" className="more-list">

                    {/* Header style User-Header consistent with More.tsx */}
                    <IonItem className="user-header banner-hero">
                        <div className="banner-header-icon" slot="start">
                            <IonIcon icon={megaphone} />
                        </div>
                        <IonLabel>
                            <h2>Impulsa tu Marca</h2>
                            <IonNote color="medium">Destaca tus productos en la tienda</IonNote>
                        </IonLabel>
                    </IonItem>

                    <div className="section-title">
                        <IonNote color="medium"><small>DETALLES DEL BANNER</small></IonNote>
                    </div>

                    <IonItem className={`edit-item-v6 ${fieldErrors.image ? 'has-error' : ''}`}>
                        <IonIcon icon={cloudUpload} slot="start" color="medium" />
                        <label className="v6-input-field" htmlFor="banner-upload" style={{ width: '100%', cursor: 'pointer' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)', display: 'block', marginBottom: '4px' }}>
                                Imagen del Banner *
                            </span>
                            <input
                                id="banner-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{
                                    position: 'absolute',
                                    opacity: 0,
                                    width: '1px',
                                    height: '1px',
                                    padding: 0,
                                    margin: '-1px',
                                    overflow: 'hidden',
                                    clip: 'rect(0,0,0,0)',
                                    border: 0
                                }}
                            />
                            <div className="fake-input">
                                {selectedFileName || 'Toca para seleccionar imagen'}
                            </div>
                        </label>
                    </IonItem>
                    {fieldErrors.image && (
                        <span className="error-message-v6">{fieldErrors.image}</span>
                    )}

                    {(previewUrl || NUCLEAR_PREVIEW_URL) && (
                        <IonItem lines="none" className="preview-item-v6">
                            <div className="image-preview-v6" style={{ width: '100%', padding: '10px 0' }}>
                                <div style={{
                                    width: '100%',
                                    height: '160px',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: '2px solid var(--ion-color-primary)',
                                    position: 'relative',
                                    background: '#f0f0f0'
                                }}>
                                    <img src={previewUrl || NUCLEAR_PREVIEW_URL} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: '8px',
                                        background: 'rgba(var(--ion-color-primary-rgb), 0.8)',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        textAlign: 'center'
                                    }}>
                                        VISTA PREVIA DEL BANNER
                                    </div>
                                </div>
                            </div>
                        </IonItem>
                    )}

                    <IonItem className={`edit-item-v6 clickable-v6 ${fieldErrors.product ? 'has-error' : ''}`} onClick={openProductSelector}>
                        <IonIcon icon={chevronForward} slot="start" color="medium" />
                        <div className="v6-input-field">
                            <label>Producto a Promocionar *</label>
                            <div className="fake-input">
                                {selectedProductName || 'Toca para seleccionar un producto'}
                            </div>
                        </div>
                        <IonIcon icon={search} slot="end" color="primary" />
                    </IonItem>
                    {fieldErrors.product && (
                        <span className="error-message-v6">{fieldErrors.product}</span>
                    )}

                    {NUCLEAR_PRODUCT_OBJECT && (
                        <div className="product-preview-v6" style={{ padding: '0 16px', margin: '5px 0' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px',
                                background: 'var(--ion-color-step-50)',
                                borderRadius: '10px',
                                border: '1px dashed var(--ion-color-primary)'
                            }}>
                                <IonThumbnail slot="start" style={{ width: '40px', height: '40px', marginRight: '10px' }}>
                                    <img
                                        src={NUCLEAR_PRODUCT_OBJECT.primary_image || (NUCLEAR_PRODUCT_OBJECT.images && NUCLEAR_PRODUCT_OBJECT.images[0]?.image_url)}
                                        alt="Product"
                                        style={{ borderRadius: '4px' }}
                                    />
                                </IonThumbnail>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{NUCLEAR_PRODUCT_OBJECT.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--ion-color-medium)' }}>Promocionando este producto</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="section-title">
                        <IonNote color="medium"><small>DURACIÓN Y COSTO</small></IonNote>
                    </div>

                    <IonItem className="edit-item-v6 clickable-v6">
                        <IonIcon icon={time} slot="start" color="medium" />
                        <IonLabel>
                            <p className="v6-label-mini">Duración de la Campaña</p>
                            <h3 className="capitalize">
                                {formData.duration_type === '1_week' ? '1 Semana' :
                                    formData.duration_type === '2_weeks' ? '2 Semanas' :
                                        formData.duration_type === '3_weeks' ? '3 Semanas' : '1 Mes'}
                            </h3>
                        </IonLabel>
                        <IonSelect
                            value={formData.duration_type}
                            interface="action-sheet"
                            onIonChange={e => setFormData({ ...formData, duration_type: e.detail.value })}
                            className="v6-absolute-select"
                        >
                            <IonSelectOption value="1_week">1 Semana - $5.00</IonSelectOption>
                            <IonSelectOption value="2_weeks">2 Semanas - $10.00</IonSelectOption>
                            <IonSelectOption value="3_weeks">3 Semanas - $15.00</IonSelectOption>
                            <IonSelectOption value="1_month">1 Mes - $20.00</IonSelectOption>
                        </IonSelect>
                        <IonIcon icon={chevronForward} slot="end" className="v6-chevron" />
                    </IonItem>

                    <IonItem className="cost-summary-item-v6">
                        <IonIcon icon={pricetag} slot="start" color="primary" />
                        <IonLabel>
                            <h2>Total a pagar</h2>
                            <h3 className="v6-price-big">${calculateCost().toFixed(2)}</h3>
                        </IonLabel>
                    </IonItem>

                    <div className="section-title">
                        <IonNote color="medium"><small>PAGO ACTUAL</small></IonNote>
                    </div>

                    {paymentMethods.length > 0 ? (
                        <IonItem className="payment-method-v6">
                            <IonIcon icon={card} slot="start" color="medium" />
                            <IonLabel>
                                <h3>•••• {defaultPaymentMethod.last_four}</h3>
                                <IonNote color="medium">Tarjeta registrada</IonNote>
                            </IonLabel>
                            <IonIcon icon={checkmarkCircle} color="success" slot="end" />
                        </IonItem>
                    ) : (
                        <IonItem className="payment-method-v6 no-payment" button onClick={() => history.push('/payment-methods')}>
                            <IonIcon icon={alertCircle} slot="start" color="warning" />
                            <IonLabel>
                                <h3>Sin método de pago</h3>
                                <IonNote color="medium">Toca para agregar</IonNote>
                            </IonLabel>
                        </IonItem>
                    )}

                    <div className="v6-terms-box">
                        <IonIcon icon={sparkles} color="primary" />
                        <IonNote>El cobro es automático tras la aprobación administrativa.</IonNote>
                    </div>

                    <div className="edit-actions-v6">
                        <IonButton
                            expand="block"
                            className="v6-save-btn"
                            onClick={handleSubmit}
                            disabled={loading || paymentMethods.length === 0}
                        >
                            {loading ? 'Enviando...' : 'Solicitar Publicación'}
                        </IonButton>
                        <IonButton expand="block" fill="clear" color="medium" onClick={() => history.push('/store')}>
                            Cancelar
                        </IonButton>
                    </div>

                </IonList>

                {/* Modal Selector de Productos */}
                <IonModal isOpen={showProductModal} onDidDismiss={() => setShowProductModal(false)} className="product-selector-modal">
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Mis Productos</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowProductModal(false)}>
                                    <IonIcon icon={close} />
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                        <IonToolbar>
                            <IonSearchbar
                                placeholder="Buscar en mis productos..."
                                value={searchProduct}
                                onIonInput={(e) => setSearchProduct(e.detail.value!)}
                            />
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        {loadingProducts ? (
                            <div className="ion-text-center ion-padding">
                                <IonLoading isOpen={true} message="Cargando tus productos..." />
                            </div>
                        ) : userProducts.length === 0 ? (
                            <div className="ion-text-center ion-padding">
                                <IonNote>No tienes productos publicados.</IonNote>
                            </div>
                        ) : (
                            <IonList>
                                {userProducts
                                    .filter(p => !searchProduct || p.name.toLowerCase().includes(searchProduct.toLowerCase()))
                                    .map(product => (
                                        <IonItem key={product.id} button onClick={() => selectProduct(product)}>
                                            <IonThumbnail slot="start">
                                                <img src={product.primary_image || (product.images && product.images[0]?.image_url)} alt={product.name} />
                                            </IonThumbnail>
                                            <IonLabel>
                                                <h2>{product.name}</h2>
                                                <p>${Number(product.price).toFixed(2)}</p>
                                            </IonLabel>
                                            <IonIcon icon={checkmarkCircle} slot="end" color="primary" />
                                        </IonItem>
                                    ))}
                            </IonList>
                        )}
                    </IonContent>
                </IonModal>

                <IonLoading isOpen={loading} message="Procesando solicitud..." />
                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header={alertConfig.header}
                    message={alertConfig.message}
                    buttons={alertConfig.buttons}
                />
            </IonContent >
        </IonPage >
    );
};

export default BannerRequestPage;
