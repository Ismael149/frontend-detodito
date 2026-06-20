// frontend/src/pages/MyProducts.tsx
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
  IonButton,
  IonAlert,
  IonSpinner,
  IonText,
  IonCard,
  IonCardContent,
  IonChip,
  IonActionSheet,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonModal,
  IonTextarea,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import {
  chevronBack,
  createOutline,
  trash,
  eyeOff,
  eye,
  ellipsisVertical,
  add,
  close,
  cart,
  time,
  storefront,
  arrowBack,
  addCircleOutline,
  download,
  alertCircle
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { productService } from '../services/productService';
import { authService } from '../services/authService';
import { pdfService } from '../services/pdfService';
import ProductImage from '../components/ProductImage';
import './MyProducts.css';

const MyProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hideStats, setHideStats] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const history = useHistory();

  useEffect(() => {
    loadUserProducts();
  }, []);

  const loadUserProducts = async () => {
    try {
      setLoading(true);
      const user = authService.getCurrentUser();
      if (!user) {
        history.push('/login');
        return;
      }

      const userProducts = await productService.getUserProducts(user.id);
      setProducts(userProducts);
    } catch (error) {
      console.error('Error loading user products:', error);
      setAlertMessage('Error al cargar tus productos');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadUserProducts();
    event.detail.complete();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    // Si la fecha es reciente (menos de 7 días), mostrar "Hace x días"
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return diffDays === 1 ? 'Hace 1 día' : `Hace ${diffDays} días`;
    }

    return date.toLocaleDateString('es-VE', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusBadge = (product: any) => {
    if (product.is_suspended) {
      return <IonBadge color="warning" className="status-badge">⚠️ Suspendido</IonBadge>;
    }
    if (!product.is_active) {
      return <IonBadge color="medium" className="status-badge">Inactivo</IonBadge>;
    }
    if (product.stock === 0) {
      return <IonBadge color="danger" className="status-badge">Sin stock</IonBadge>;
    }
    return <IonBadge color="success" className="status-badge">Activo</IonBadge>;
  };

  const handleEdit = (product: any) => {
    history.push(`/edit-product/${product.id}`);
  };

  const handleDelete = async (product: any) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setProcessing(true);
      await productService.deleteProduct(productToDelete.id);
      setAlertMessage('El producto ha sido inhabilitado de la aplicación de forma permanente.');
      setShowAlert(true);
      loadUserProducts(); // Recargar lista
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar producto';
      setAlertMessage(`❌ ${errorMessage}`);
      setShowAlert(true);
    } finally {
      setProcessing(false);
      setShowActionSheet(false);
      setProductToDelete(null);
    }
  };

  const handleDeactivate = async () => {
    if (!productToDelete && !selectedProduct) return;
    const target = productToDelete || selectedProduct;
    if (!deactivateReason.trim()) return;

    try {
      setProcessing(true);

      await productService.updateProductStatus(selectedProduct.id, {
        is_active: false,
        deactivation_reason: deactivateReason
      });

      setProducts(prev => prev.map(p =>
        p.id === target.id ? { ...p, is_active: false } : p
      ));

      setAlertMessage('✅ Producto desactivado correctamente');
      setShowAlert(true);
      setShowDeactivateModal(false);
      setDeactivateReason('');
    } catch (error: any) {
      console.error('Error deactivating product:', error);
      setAlertMessage(error.response?.data?.message || '❌ Error al desactivar producto');
      setShowAlert(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleActivate = async (product: any) => {
    try {
      setProcessing(true);

      await productService.updateProductStatus(product.id, {
        is_active: true,
        deactivation_reason: null
      });

      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, is_active: true } : p
      ));

      setAlertMessage('✅ Producto activado correctamente');
      setShowAlert(true);
    } catch (error: any) {
      console.error('Error activating product:', error);
      setAlertMessage(error.response?.data?.message || '❌ Error al activar producto');
      setShowAlert(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadInventory = () => {
    const columns = ['Producto', 'Categoría', 'Precio', 'Stock', 'Estado'];
    const rows = products.map(product => [
      product.name,
      product.category_name,
      `US$ ${product.price}`,
      product.stock,
      product.is_active ? (product.stock > 0 ? 'Activo' : 'Sin Stock') : 'Inactivo'
    ]);

    pdfService.generateTableReport(
      'Inventario de Mis Productos',
      columns,
      rows,
      'mis_productos_inventario'
    );
  };

  const showProductActions = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setShowActionSheet(true);
  };

  const actionSheetButtons = [
    {
      text: 'Editar producto',
      icon: createOutline,
      handler: () => selectedProduct && handleEdit(selectedProduct)
    },
    {
      text: selectedProduct?.is_active ? 'Desactivar' : 'Activar',
      icon: selectedProduct?.is_active ? eyeOff : eye,
      handler: () => {
        if (selectedProduct?.is_active) {
          setShowDeactivateModal(true);
        } else {
          handleActivate(selectedProduct);
        }
      }
    },
    {
      text: 'Eliminar producto',
      role: 'destructive',
      icon: trash,
      handler: () => selectedProduct && handleDelete(selectedProduct)
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      icon: close
    }
  ];

  if (loading) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/more" text="" />
            </IonButtons>
            <IonTitle>Mis productos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="my-products-page ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
            <p>Cargando tus productos...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="my-products-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/more" text="" />
          </IonButtons>
          <IonTitle>Mis productos</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleDownloadInventory} title="Descargar Inventario PDF">
              <IonIcon icon={download} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {!loading && products.length > 0 && (
        <div className={`products-stats-section ${hideStats ? 'hidden-stats' : ''}`}>
          <div className="stats-card small-stats">
            <IonGrid className="ion-no-padding">
              <IonRow>
                <IonCol className="stats-col">
                  <div className="stat-item">
                    <span className="stat-number">{products.length}</span>
                    <span className="stat-label">Total</span>
                  </div>
                </IonCol>
                <IonCol className="stats-col">
                  <div className="stat-item">
                    <span className="stat-number">{products.filter(p => p.is_active && p.stock > 0).length}</span>
                    <span className="stat-label">Activos</span>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </div>
      )}

      <IonContent
        className="products-scroll-content"
        scrollEvents={true}
        onIonScroll={(e) => {
          const currentY = e.detail.scrollTop;
          if (currentY > 50 && currentY > lastScrollY) {
            setHideStats(true);
          } else if (currentY < lastScrollY || currentY < 10) {
            setHideStats(false);
          }
          setLastScrollY(currentY);
        }}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
            <p>Cargando tus productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-products">
            <div className="empty-icon-wrapper">
              <IonIcon icon={storefront} size="large" color="medium" />
            </div>
            <IonText>
              <h3>No tienes productos</h3>
              <p>Comienza a vender hoy mismo publicando tu primer producto.</p>
            </IonText>
            <IonButton
              className="create-first-btn"
              onClick={() => history.push('/create-product')}
              shape="round"
            >
              <IonIcon icon={add} slot="start" />
              Publicar Producto
            </IonButton>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-item-wrapper">
                  <div
                    className="product-card-grid"
                    onClick={() => history.push(`/product/${product.id}`)}
                  >
                    <div className="grid-image-wrapper">
                      <ProductImage
                        imageUrl={product.image_url}
                        images={product.images}
                        alt={product.name}
                        className="product-thumbnail"
                      />
                      {!product.is_active && (
                        <div className="inactive-overlay">
                          <IonBadge color="dark">Inactivo</IonBadge>
                        </div>
                      )}
                      <div className="views-badge-grid">
                        <IonIcon icon={eye} size="small" />
                        {product.view_count || 0}
                      </div>
                      {product.is_suspended && (
                        <div className="suspended-overlay-grid">
                          <IonIcon icon={alertCircle} />
                        </div>
                      )}
                    </div>

                    <div className="grid-info">
                      <div className="grid-header">
                        <h3 className="product-name-grid">{product.name}</h3>
                        <IonButton
                          fill="clear"
                          className="options-btn-grid"
                          onClick={(e) => showProductActions(product, e)}
                        >
                          <IonIcon icon={ellipsisVertical} style={{ fontSize: '16px' }} />
                        </IonButton>
                      </div>

                      <span className="product-price-grid">{formatPrice(product.price)}</span>

                      <div className="grid-meta">
                        <span className="meta-item-grid">
                          Stock: {product.stock}
                        </span>
                        {product.is_suspended && product.warning_expires_at && (
                          <div className="suspension-deadline">
                            <small>Plazo: {new Date(product.warning_expires_at).toLocaleDateString()}</small>
                          </div>
                        )}
                      </div>

                      {product.is_suspended && product.deactivation_reason && (
                        <div className="suspension-reason-mini">
                          <IonText color="danger">
                            <small>⚠️ {product.deactivation_reason}</small>
                          </IonText>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <IonFab vertical="bottom" horizontal="end" slot="fixed" className="create-product-fab">
              <IonFabButton routerLink="/create-product">
                <IonIcon icon={addCircleOutline} />
              </IonFabButton>
            </IonFab>

            <div className="bottom-spacer"></div>
          </>
        )}

        <IonModal isOpen={showDeactivateModal} onDidDismiss={() => setShowDeactivateModal(false)} className="deactivation-modal">
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowDeactivateModal(false)}>Cancelar</IonButton>
              </IonButtons>
              <IonTitle>Desactivar</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={handleDeactivate}
                  disabled={processing || !deactivateReason.trim()}
                  strong={true}
                >
                  {processing ? <IonSpinner /> : 'Confirmar'}
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonText color="dark">
              <h4>Motivo de la desactivación</h4>
              <p className="ion-no-margin ion-margin-bottom"><small>Indica por qué pausas esta publicación</small></p>
            </IonText>
            <IonTextarea
              placeholder="Escribe aquí el motivo..."
              value={deactivateReason}
              onIonInput={(e) => setDeactivateReason(e.detail.value!)}
              rows={6}
              className="reason-input"
            />
          </IonContent>
        </IonModal>

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={actionSheetButtons}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Aviso'}
          message={alertMessage}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={showDeleteConfirm}
          onDidDismiss={() => setShowDeleteConfirm(false)}
          header={'Confirmar eliminación'}
          message={'¿Estás seguro de que deseas eliminar este producto? Esta acción inhabilitará el producto de forma permanente.'}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: confirmDelete
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default MyProducts;