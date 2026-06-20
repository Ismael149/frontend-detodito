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
  IonItem,
  IonLabel,
  IonBadge,
  IonSearchbar,
  IonSelect,
  IonList,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { trash, eye, alertCircle, refresh, filter, checkmark } from 'ionicons/icons';
import { adminService } from '../../services/adminService';
import { authService } from '../../services/authService';
import { getImageUrl } from '../../utils/imageUtils';
import { environment } from '../../environments/environment';
import './AdminProducts.css';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Local state for search bar to prevent re-renders losing focus
  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    reported: 'all'
  });

  // Estados para las alertas de confirmación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // ← ESTADO PARA MANEJAR ERRORES DE IMAGEN ←
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  // ← FIN DEL ESTADO DE IMAGENES ←

  const [showFiltersAlert, setShowFiltersAlert] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [hideFilters, setHideFilters] = useState(false);

  // Estados para advertencia
  const [showWarnConfirm, setShowWarnConfirm] = useState(false);
  const [showWarnInput, setShowWarnInput] = useState(false);
  const [productToWarn, setProductToWarn] = useState<any>(null);
  const [warnReason, setWarnReason] = useState('');
  const [warnDays, setWarnDays] = useState(3);

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
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await adminService.getProducts({ ...filters, limit: 100 });
      setProducts(productsData);
      // Limpiar errores de imagen al recargar productos
      setImageErrors(new Set());
    } catch (error) {
      console.error('Error loading products:', error);
      setAlertMessage('Error al cargar productos');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadProducts();
    event.detail.complete();
  };

  // Función para solicitar confirmación de eliminación
  const confirmDeleteProduct = (productId: number, productName: string) => {
    setProductToDelete(productId);
    setAlertMessage('¿Estás seguro de que deseas eliminar este producto? Esta acción inhabilitará el producto de forma permanente.');
    setShowDeleteConfirm(true);
  };

  // Función para ejecutar la eliminación después de la confirmación
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await adminService.deleteProduct(productToDelete);
      setAlertMessage('El producto ha sido inhabilitado de la aplicación de forma permanente.');
      setShowAlert(true);
      loadProducts(); // Recargar la lista
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar producto';
      setAlertMessage(`❌ ${errorMessage}`);
      setShowAlert(true);
    } finally {
      // Limpiar el estado
      setProductToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  // Función para cancelar la eliminación
  const cancelDelete = () => {
    setProductToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleWarnProduct = async (reason?: string, days?: number) => {
    const finalReason = reason || warnReason;
    const finalDays = days !== undefined ? days : warnDays;

    alert(`DEBUG: Iniciando advertencia para producto ${productToWarn?.id}. Motivo: ${finalReason}`);

    console.log('📡 Attempting to warn product:', {
      productId: productToWarn?.id,
      reason: finalReason,
      days: finalDays
    });

    if (!productToWarn) {
      console.error('❌ Error: No product selected to warn');
      return;
    }

    if (!finalReason.trim()) {
      console.warn('⚠️ Warning attempt blocked: Reason is empty');
      setAlertMessage('❌ Debes ingresar un motivo para la advertencia.');
      setShowAlert(true);
      return;
    }

    try {
      setLoading(true);
      console.log('🌐 Calling adminService.warnProduct...');
      const result = await adminService.warnProduct(productToWarn.id, finalReason, finalDays);
      console.log('✅ internal warnProduct result:', result);
      setAlertMessage(`✅ Advertencia enviada a ${productToWarn.seller_username}`);
      setShowAlert(true);
      setShowWarnInput(false);
      setWarnReason('');
      loadProducts();
    } catch (error: any) {
      console.error('Error warning product:', error);
      const errorMessage = error.response?.data?.message || 'Error al enviar advertencia';
      setAlertMessage(`❌ ${errorMessage}`);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmWarnProduct = (product: any) => {
    setProductToWarn(product);
    setShowWarnInput(true);
  };

  const handleActivateProduct = async (productId: number) => {
    try {
      setLoading(true);
      await adminService.activateProduct(productId);
      setAlertMessage('✅ Producto re-activado correctamente');
      setShowAlert(true);
      loadProducts();
    } catch (error) {
      console.error('Error activating product:', error);
      setAlertMessage('❌ Error al re-activar producto');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const navigateToProduct = (productId: number) => {
    history.push(`/product/${productId}`);
  };

  // ← FUNCIÓN PARA MANEJAR ERRORES DE IMAGEN ←
  const handleImageError = (productId: number) => {
    setImageErrors(prev => new Set(prev).add(productId));
  };
  // ← FIN DE LA FUNCIÓN ←


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" text="" />
          </IonButtons>
          <IonTitle>Gestionar Productos</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowFiltersAlert(true)}>
              <IonIcon icon={filter} slot="icon-only" />
            </IonButton>
            <IonButton onClick={loadProducts}>
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
              placeholder="Buscar productos..."
              animated
            />
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent
        className="admin-products"
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

        {/* Lista de productos */}
        <div className="products-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <IonSpinner name="crescent" />
              <p>Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={alertCircle} />
              <h3>No se encontraron productos</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card-wrapper">
                  <IonCard className="product-card">
                    <div
                      className="product-image-container"
                      onClick={() => navigateToProduct(product.id)}
                    >
                      <div
                        className="product-image-background"
                        style={{
                          backgroundImage: `url(${getImageUrl(product.primary_image)})`
                        }}
                      ></div>

                      {/* Badge de estado superpuesto */}
                      <div className="status-badges">
                        {product.reported && (
                          <IonBadge color="danger" className="status-badge">Reportado</IonBadge>
                        )}
                        {product.is_suspended && (
                          <IonBadge color="warning" className="status-badge">Suspendido</IonBadge>
                        )}
                        {!product.is_active && !product.is_suspended && (
                          <IonBadge color="medium" className="status-badge">Inactivo</IonBadge>
                        )}
                      </div>
                    </div>

                    <IonCardContent className="product-content">
                      <div className="product-header">
                        <h3 className="product-title" onClick={() => navigateToProduct(product.id)}>
                          {product.name}
                        </h3>
                        <span className="product-category-badge">{product.category_name}</span>
                      </div>

                      <div className="product-details">
                        <p className="product-price">${Number(product.price).toLocaleString()}</p>
                        <p className="product-seller">
                          <small>Vendedor: {product.seller_username}</small>
                        </p>
                      </div>

                      <div className="product-stats">
                        <span>👁️ {product.view_count || 0}</span>
                        <span>❤️ {product.favorite_count || 0}</span>
                      </div>

                      <div className="product-actions">
                        <IonButton
                          size="small"
                          fill="outline"
                          onClick={() => navigateToProduct(product.id)}
                        >
                          <IonIcon icon={eye} slot="start" />
                          Ver
                        </IonButton>
                        <IonButton
                          size="small"
                          color="warning"
                          fill="outline"
                          onClick={() => confirmWarnProduct(product)}
                        >
                          <IonIcon icon={alertCircle} slot="start" />
                          Advertir
                        </IonButton>
                        {product.is_suspended && (
                          <IonButton
                            size="small"
                            color="success"
                            fill="outline"
                            onClick={() => handleActivateProduct(product.id)}
                          >
                            <IonIcon icon={checkmark} slot="start" />
                            Re-activar
                          </IonButton>
                        )}
                        <IonButton
                          size="small"
                          color="danger"
                          fill="outline"
                          onClick={() => confirmDeleteProduct(product.id, product.name)}
                        >
                          <IonIcon icon={trash} slot="start" />
                          Eliminar
                        </IonButton>
                      </div>

                      {product.is_suspended && product.warning_expires_at && (
                        <div className="warning-info" style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--ion-color-danger)' }}>
                          ⏱️ Expira: {new Date(product.warning_expires_at).toLocaleDateString()}
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerta de Filtros */}
        <IonAlert
          isOpen={showFiltersAlert}
          onDidDismiss={() => setShowFiltersAlert(false)}
          header="Filtrar por estado"
          subHeader="Selecciona una opción"
          inputs={[
            {
              name: 'all',
              type: 'radio',
              label: 'Todos los productos',
              value: 'all',
              checked: filters.reported === 'all'
            },
            {
              name: 'reported',
              type: 'radio',
              label: 'Reportados',
              value: 'reported',
              checked: filters.reported === 'reported'
            },
            {
              name: 'not_reported',
              type: 'radio',
              label: 'No reportados',
              value: 'not_reported',
              checked: filters.reported === 'not_reported'
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
                setFilters({ ...filters, reported: value });
              }
            }
          ]}
        />

        {/* Alerta de confirmación para eliminar */}
        <IonAlert
          isOpen={showDeleteConfirm}
          onDidDismiss={() => setShowDeleteConfirm(false)}
          header={'Confirmar eliminación'}
          message={alertMessage}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: handleDeleteProduct
            }
          ]}
        />

        {/* Alerta para ingresar advertencia */}
        <IonAlert
          isOpen={showWarnInput}
          onDidDismiss={() => setShowWarnInput(false)}
          header={'Enviar Advertencia'}
          subHeader={productToWarn?.name}
          message={'Describe el motivo del incumplimiento. El producto será suspendido y el vendedor notificado.'}
          inputs={[
            {
              name: 'reason',
              type: 'textarea',
              placeholder: 'Motivo del incumplimiento (ej. Imagen no permitida)...',
            },
            {
              name: 'days',
              type: 'number',
              placeholder: 'Días de plazo (default: 3)',
              value: 3,
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Enviar Suspensión',
              handler: (data) => {
                handleWarnProduct(data.reason, parseInt(data.days) || 3);
              }
            }
          ]}
        />

        {/* Alerta de mensajes generales */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Aviso'}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminProducts;