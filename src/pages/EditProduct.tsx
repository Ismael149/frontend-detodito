// frontend/src/pages/EditProduct.tsx
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
  IonAlert,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonChip,
  IonCard,
  IonCardContent,
  IonFab,
  IonFabButton,
  IonModal,
  IonList,
  IonThumbnail,
  IonBadge,
  IonText,
  IonToast
} from '@ionic/react';
import {
  chevronBack,
  save,
  trash,
  camera,
  add,
  close,
  image
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import './EditProduct.css';

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async (forceReload = false) => {
    try {
      setLoading(true);

      console.log(`🔄 Cargando datos para producto ID: ${id}`,
        forceReload ? '(FORZANDO RECARGA)' : '');

      // Forzar recarga de categorías
      const categoriesData = await categoryService.getCategories();
      // Solo mostrar categorías activas (o la categoría actual si el producto ya la tiene asignada, incluso si ahora es inactiva)
      setCategories(categoriesData.filter((c: any) => c.is_active));
      console.log(`✅ Categorías cargadas: ${categoriesData.length}`);

      // Cargar producto con timestamp para evitar cache
      const timestamp = forceReload ? Date.now() : 0;
      const productData = await productService.getProduct(parseInt(id));

      if (!productData) {
        throw new Error('Producto no encontrado');
      }

      console.log('✅ Producto cargado desde API:', {
        id: productData.id,
        name: productData.name,
        price: productData.price,
        stock: productData.stock,
        updated_at: productData.updated_at
      });

      // Asegurarse de que si la categoría actual está inactiva y no vino en "categories", igual la agreguemos para que el select no quede en blanco
      const currentCategory = categoriesData.find((c: any) => c.id === productData.category_id);
      if (currentCategory && !currentCategory.is_active) {
        setCategories(prev => [...prev, currentCategory]);
      }

      // Actualizar estado
      setProduct(productData);

      // Procesar imágenes con timestamp nuevo
      const imagesWithTimestamp = (productData.images || []).map((img: any) => ({
        ...img,
        image_url: `${img.image_url}?t=${Date.now()}` // Forzar recarga de imagen
      }));

      setExistingImages(imagesWithTimestamp);

      console.log(`✅ ${imagesWithTimestamp.length} imágenes cargadas`);

    } catch (error) {
      console.error('❌ Error loading data:', error);
      setAlertMessage('Error al cargar datos del producto');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: any) => {
    const files = Array.from(event.target.files);
    setImages(prev => [...prev, ...files as File[]]);
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imageId: number) => {
    setImagesToDelete(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    // Validación
    const errors: { [key: string]: string } = {};
    if (!product.name.trim()) errors.name = 'El nombre es obligatorio';
    if (!product.price || product.price <= 0) errors.price = 'Precio inválido';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setToastMessage('Por favor corrige los errores');
      setShowToast(true);
      return;
    }

    try {
      setSaving(true);

      console.log('🔄 Iniciando actualización...', product);

      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price.toString());
      formData.append('stock', product.stock.toString());
      formData.append('category_id', product.category_id.toString());
      formData.append('condition', product.condition);

      if (imagesToDelete.length > 0) {
        formData.append('images_to_delete', JSON.stringify(imagesToDelete));
      }

      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await productService.updateProduct(parseInt(id), formData);
      console.log('✅ Respuesta del servidor:', response);

      if (response.success) {
        // Actualizar estado local con los datos del servidor
        setProduct(response.product);

        // Limpiar estados temporales
        setImages([]);
        setImagesToDelete([]);

        // Forzar recarga completa
        await loadData(true);

        setAlertMessage('✅ Producto actualizado correctamente. Recargando...');
        setShowAlert(true);

        // Esperar y redirigir
        setTimeout(() => {
          history.push('/my-products');
        }, 2000);
      } else {
        throw new Error(response.message || 'Error al actualizar');
      }

    } catch (error: any) {
      console.error('❌ Error updating product:', error);
      setAlertMessage(error.response?.data?.message || error.message || 'Error al actualizar');
      setShowAlert(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/my-products" text="" />
            </IonButtons>
            <IonTitle>Editar Producto</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando producto...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!product) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/my-products" text="" />
            </IonButtons>
            <IonTitle>Producto no encontrado</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="error-container">
            <p>El producto no existe o no tienes permiso para editarlo.</p>
            <IonButton onClick={() => history.push('/my-products')}>
              Volver a Mis Productos
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage className="edit-product-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/my-products" text="" />
          </IonButtons>
          <IonTitle>Editar Producto</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="edit-container">
          <form onSubmit={handleSubmit}>

            {/* SECCIÓN 1: IMÁGENES */}
            <div className="premium-card">
              <div className="card-title">
                <IonIcon icon={image} />
                <span>Galería del Producto</span>
              </div>

              <div className="images-grid">
                {/* Improperly named existingImages map - logic kept same */}
                {existingImages.map((img) => (
                  <div key={img.id} className="image-item">
                    <img src={img.image_url} alt="Producto" />
                    {img.is_primary && <div className="primary-badge">Principal</div>}
                    <div className="delete-btn" onClick={() => markImageForDeletion(img.id)}>
                      <IonIcon icon={close} size="small" />
                    </div>
                  </div>
                ))}

                {/* New local previews */}
                {images.map((file, idx) => (
                  <div key={`new-${idx}`} className="image-item">
                    <img src={URL.createObjectURL(file)} alt="Preview" />
                    <div className="delete-btn" onClick={() => removeNewImage(idx)}>
                      <IonIcon icon={close} size="small" />
                    </div>
                  </div>
                ))}

                {/* Upload Button */}
                <label className="upload-placeholder">
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <IonIcon icon={camera} color="primary" size="large" />
                  <span className="upload-text">Agregar</span>
                </label>
              </div>
            </div>

            {/* SECCIÓN 2: INFORMACIÓN BÁSICA */}
            <div className="premium-card">
              <div className="card-title">
                <IonIcon icon={save} />
                <span>Detalles Básicos</span>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre del Producto</label>
                <div className="premium-input-wrapper">
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => {
                      setProduct({ ...product, name: e.target.value });
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                    }}
                    placeholder="Ej: iPhone 15 Pro Max"
                    className={`premium-native-input ${fieldErrors.name ? 'input-error' : ''}`}
                  />
                  {fieldErrors.name && (
                    <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                      <small>{fieldErrors.name}</small>
                    </IonText>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <div className="premium-input-wrapper">
                  <IonTextarea
                    value={product.description}
                    onIonInput={(e) => setProduct({ ...product, description: e.detail.value! })}
                    rows={4}
                    placeholder="Describe los detalles, estado y características..."
                    className="premium-input"
                  />
                </div>
                <div className="char-count">{product.description?.length || 0} caracteres</div>
              </div>

              <IonGrid style={{ padding: 0 }}>
                <IonRow>
                  <IonCol size="6" style={{ paddingLeft: 0 }}>
                    <div className="form-group">
                      <label className="form-label">Precio ($)</label>
                      <div className="premium-input-wrapper">
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => {
                            setProduct({ ...product, price: parseFloat(e.target.value) });
                            if (fieldErrors.price) setFieldErrors({ ...fieldErrors, price: '' });
                          }}
                          step="0.01"
                          min="0.01"
                          className={`premium-native-input ${fieldErrors.price ? 'input-error' : ''}`}
                        />
                        {fieldErrors.price && (
                          <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                            <small>{fieldErrors.price}</small>
                          </IonText>
                        )}
                      </div>
                    </div>
                  </IonCol>

                  <IonCol size="6" style={{ paddingRight: 0 }}>
                    <div className="form-group">
                      <label className="form-label">Stock</label>
                      <div className="premium-input-wrapper">
                        <input
                          type="number"
                          value={product.stock}
                          onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })}
                          min="1"
                          className="premium-native-input"
                        />
                      </div>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>

            {/* SECCIÓN 3: CLASIFICACIÓN */}
            <div className="premium-card">
              <div className="card-title">
                <IonIcon icon={chevronBack} style={{ transform: 'rotate(-90deg)' }} />
                <span>Clasificación</span>
              </div>

              <div className="form-group">
                <label className="form-label">Categoría</label>
                <div className="premium-input-wrapper">
                  <IonSelect
                    value={product.category_id}
                    onIonChange={(e) => setProduct({ ...product, category_id: e.detail.value })}
                    interface="action-sheet"
                    className="premium-input"
                    cancelText="Cancelar"
                  >
                    {categories.map(cat => (
                      <IonSelectOption key={cat.id} value={cat.id}>{cat.name}</IonSelectOption>
                    ))}
                  </IonSelect>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Condición</label>
                <div className="premium-input-wrapper">
                  <IonSelect
                    value={product.condition}
                    onIonChange={(e) => setProduct({ ...product, condition: e.detail.value })}
                    interface="action-sheet"
                    className="premium-input"
                  >
                    <IonSelectOption value="new">Nuevo</IonSelectOption>
                    <IonSelectOption value="used">Usado</IonSelectOption>
                    <IonSelectOption value="refurbished">Reacondicionado</IonSelectOption>
                  </IonSelect>
                </div>
              </div>

              <div className="form-group">
                <div className="status-toggle">
                  <div>
                    <IonLabel style={{ fontWeight: '600' }}>Estado de publicación</IonLabel>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary-light)', margin: 0 }}>
                      {product.is_active ? 'Visible en tienda' : 'Oculto al público'}
                    </p>
                  </div>
                  <IonBadge color={product.is_active ? 'success' : 'medium'}>
                    {product.is_active ? 'Activo' : 'Inactivo'}
                  </IonBadge>
                </div>
              </div>
            </div>

            {/* BOTONES */}
            <div className="action-bar">
              <IonButton
                expand="block"
                fill="outline"
                className="cancel-btn"
                onClick={() => history.goBack()}
              >
                Cancelar
              </IonButton>

              <IonButton
                expand="block"
                className="save-btn"
                type="submit"
                disabled={saving || !product.name || !product.price}
              >
                {saving ? <IonSpinner name="crescent" /> : 'Guardar Cambios'}
              </IonButton>
            </div>

          </form>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Estado'}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        color="danger"
        position="top"
      />
    </IonPage>
  );
};

export default EditProduct;