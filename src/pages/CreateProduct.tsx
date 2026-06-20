import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonAlert,
  IonLabel,
  IonSpinner,
  IonToast,
  IonIcon,
  IonChip,
  IonText,
  useIonViewWillEnter
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  addCircle,
  trashOutline,
  camera,
  pricetags,
  cube,
  list,
  informationCircle,
  cloudUpload,
  closeCircle,
  checkmarkCircle
} from 'ionicons/icons';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { authService } from '../services/authService';
import { paymentService } from '../services/paymentService';
import './CreateProduct.css';

const CreateProduct: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    condition: 'new',
    attributes: {
      'Marca': '',
      'Modelo': '',
      'Color': ''
    } as { [key: string]: string }
  });
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field: string) => {
    const errors = { ...fieldErrors };
    const value = formData[field as keyof typeof formData];

    switch (field) {
      case 'name':
        if (!formData.name.trim()) {
          errors.name = 'El nombre es obligatorio';
        } else {
          delete errors.name;
        }
        break;
      case 'category_id':
        if (!formData.category_id) {
          errors.category_id = 'La categoría es obligatoria';
        } else {
          delete errors.category_id;
        }
        break;
      case 'price':
        if (!formData.price || parseFloat(formData.price) <= 0) {
          errors.price = 'El precio debe ser mayor a 0';
        } else {
          delete errors.price;
        }
        break;
      case 'stock':
        if (formData.stock === '' || parseInt(formData.stock) < 0) {
          errors.stock = 'El stock no puede ser negativo';
        } else {
          delete errors.stock;
        }
        break;
    }
    setFieldErrors(errors);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
      isValid = false;
    }

    if (!formData.category_id) {
      errors.category_id = 'La categoría es obligatoria';
      isValid = false;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
      isValid = false;
    }

    if (formData.stock === '' || parseInt(formData.stock) < 0) {
      errors.stock = 'El stock no puede ser negativo';
      isValid = false;
    }

    if (images.length === 0) {
      errors.images = 'Debes agregar al menos una imagen';
      isValid = false;
    }

    setFieldErrors(errors);
    return { isValid, errors };
  };

  const showFieldAlert = (fieldName: string) => {
    const fieldLabels: { [key: string]: string } = {
      name: 'Nombre del producto',
      category_id: 'Categoría',
      price: 'Precio',
      stock: 'Stock disponible',
      images: 'Galería de Imágenes'
    };

    const label = fieldLabels[fieldName] || fieldName;
    setAlertMessage(`El campo "${label}" es obligatorio`);
    setShowAlert(true);
  };

  const addAttribute = () => {
    if (newAttrKey.trim() && newAttrValue.trim()) {
      setFormData({
        ...formData,
        attributes: {
          ...formData.attributes,
          [newAttrKey.trim()]: newAttrValue.trim()
        }
      });
      setNewAttrKey('');
      setNewAttrValue('');
    }
  };

  const removeAttribute = (key: string) => {
    const newAttrs = { ...formData.attributes };
    delete newAttrs[key];
    setFormData({ ...formData, attributes: newAttrs });
  };

  const handleFixedAttributeChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        [key]: value
      }
    });
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      history.push('/login');
      return;
    }
    loadCategories();
    checkPaymentMethod();
  }, [history]);

  useIonViewWillEnter(() => {
    // Limpiar el formulario cada vez que el usuario entra a la vista
    clearForm();
    // También verificar método de pago nuevamente por si lo agregó y volvió
    checkPaymentMethod();
  });

  const checkPaymentMethod = async () => {
    try {
      const methods = await paymentService.getUserPaymentMethods();
      if (!methods || methods.length === 0) {
        setShowPaymentAlert(true);
      }
    } catch (error) {
      console.error('Error checking payment methods:', error);
      // Opcionalmente podrías dejarlo pasar o mostrar error
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getCategories();
      // Solo mostrar categorías activas para crear productos
      setCategories(categoriesData.filter((c: any) => c.is_active));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: File[] = [];
    const newPreviews: string[] = [];
    let imagesAdded = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        setAlertMessage('❌ Solo se permiten archivos de imagen');
        setShowAlert(true);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setAlertMessage('❌ Las imágenes no deben superar los 5MB');
        setShowAlert(true);
        continue;
      }

      if (images.length + newImages.length >= 10) {
        setAlertMessage('❌ Máximo 10 imágenes permitidas');
        setShowAlert(true);
        break;
      }

      newImages.push(file);
      imagesAdded++;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === imagesAdded) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
            if (imagesAdded > 0) {
              setSuccessMessage(`✅ ${imagesAdded} imagen(es) agregada(s) correctamente`);
              setShowSuccessToast(true);
            }
          }
        }
      };
      reader.readAsDataURL(file);
    }

    setImages(prev => [...prev, ...newImages]);
    if (fieldErrors.images) {
      setFieldErrors(prev => ({ ...prev, images: '' }));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSuccessMessage('🗑️ Imagen eliminada');
    setShowSuccessToast(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authService.isAuthenticated()) {
      setAlertMessage('🔐 Debes iniciar sesión para crear un producto');
      setShowAlert(true);
      history.push('/login');
      return;
    }

    if (images.length === 0) {
      setAlertMessage('📸 Debes agregar al menos una imagen del producto');
      setShowAlert(true);
      return;
    }

    const { isValid, errors } = validateForm();
    if (!isValid) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        showFieldAlert(firstErrorField);
      }
      return;
    }

    setLoading(true);

    try {
      // Doble verificación de seguridad: el usuario DEBE tener un método de pago
      const methods = await paymentService.getUserPaymentMethods();
      if (!methods || methods.length === 0) {
        setLoading(false);
        setShowPaymentAlert(true);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('attributes', JSON.stringify(formData.attributes));

      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      await productService.createProduct(formDataToSend);

      setSuccessMessage('🎉 ¡Producto creado exitosamente!');
      setShowSuccessToast(true);

      setTimeout(() => {
        history.push('/store');
      }, 1500);

    } catch (error: any) {
      console.error('Error creating product:', error);
      if (error.response?.status === 401) {
        setAlertMessage('🔐 Sesión expirada. Por favor, inicia sesión nuevamente.');
        authService.logout();
      } else if (error.response?.status === 400) {
        setAlertMessage('❌ Datos inválidos: ' + (error.response.data.message || 'Verifica la información'));
      } else {
        setAlertMessage('❌ Error al crear producto: ' + (error.response?.data?.message || 'Intenta nuevamente'));
      }
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      condition: 'new',
      attributes: {
        'Marca': '',
        'Modelo': '',
        'Color': ''
      }
    });
    setImages([]);
    setImagePreviews([]);
    setSuccessMessage('🧹 Formulario limpiado');
    setShowSuccessToast(true);
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="create-product-content">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '20px' }}>
            <IonSpinner name="crescent" />
            <p style={{ color: '#666' }}>Creando producto...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/store" text="" />
          </IonButtons>
          <IonTitle>Crear Producto</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="create-product-content">
        <div className="page-header">
          <h1>Publicar un Producto</h1>
          <p>Completa la información detallada para atraer a más compradores.</p>
        </div>

        <form onSubmit={handleSubmit} className="form-container">

          {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
          <div className="form-section">
            <div className="section-header">
              <IonIcon icon={informationCircle} color="primary" size="large" />
              <h3 className="section-title">Información Básica</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Producto *</label>
              <div className={`input-container ${fieldErrors.name ? 'has-error' : ''}`}>
                <input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => validateField('name')}
                  placeholder="Eje: Smartphone Samsung Galaxy S24 Ultra"
                  className="native-input"
                  required
                />
              </div>
              {fieldErrors.name && (
                <IonText color="danger" style={{
                  fontSize: '0.8rem',
                  paddingLeft: '4px',
                  marginTop: '4px',
                  display: 'block'
                }}>
                  <small>{fieldErrors.name}</small>
                </IonText>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <div className={`input-container ${fieldErrors.category_id ? 'has-error' : ''}`}>
                <IonSelect
                  value={formData.category_id}
                  placeholder="Selecciona una categoría"
                  onIonChange={(e) => handleInputChange('category_id', e.detail.value)}
                  onIonBlur={() => validateField('category_id')}
                  className="custom-select"
                  interface="action-sheet"
                  required
                >
                  {categories.map((category) => (
                    <IonSelectOption key={category.id} value={category.id}>
                      {category.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
              {fieldErrors.category_id && (
                <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                  <small>{fieldErrors.category_id}</small>
                </IonText>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Condición del Producto</label>
              <div className="input-container">
                <IonSelect
                  value={formData.condition}
                  onIonChange={(e) => setFormData({ ...formData, condition: e.detail.value })}
                  className="custom-select"
                  interface="action-sheet"
                  placeholder="Seleccionar condición"
                  cancelText="Cancelar"
                >
                  <IonSelectOption value="new">Nuevo</IonSelectOption>
                  <IonSelectOption value="used">Usado</IonSelectOption>
                  <IonSelectOption value="refurbished">Reacondicionado</IonSelectOption>
                </IonSelect>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DESCRIPCIÓN */}
          <div className="form-section">
            <div className="section-header">
              <IonIcon icon={list} color="primary" size="large" />
              <h3 className="section-title">Descripción Detallada</h3>
            </div>

            <div className="form-group">
              <div className="input-container textarea-container">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe las características principales..."
                  className="native-textarea"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: PRECIO E INVENTARIO */}
          <div className="form-section">
            <div className="section-header">
              <IonIcon icon={pricetags} color="primary" size="large" />
              <h3 className="section-title">Precio e Inventario</h3>
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">Precio (USD) *</label>
                <div className={`input-container ${fieldErrors.price ? 'has-error' : ''}`}>
                  <span style={{ marginRight: '5px', fontWeight: 'bold' }}>$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    onBlur={() => validateField('price')}
                    placeholder="0.00"
                    className="native-input"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                {fieldErrors.price && (
                  <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                    <small>{fieldErrors.price}</small>
                  </IonText>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Stock Disponible *</label>
                <div className={`input-container ${fieldErrors.stock ? 'has-error' : ''}`}>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    onBlur={() => validateField('stock')}
                    placeholder="Eje: 10"
                    className="native-input"
                    required
                    min="0"
                  />
                </div>
                {fieldErrors.stock && (
                  <IonText color="danger" style={{ fontSize: '0.8rem', paddingLeft: '4px', marginTop: '4px', display: 'block' }}>
                    <small>{fieldErrors.stock}</small>
                  </IonText>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: CARACTERÍSTICAS DINÁMICAS */}
          <div className="form-section">
            <div className="section-header">
              <IonIcon icon={cube} color="primary" size="large" />
              <h3 className="section-title">Especificaciones</h3>
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">Marca</label>
                <div className="input-container">
                  <input
                    placeholder="Eje: Apple"
                    value={formData.attributes['Marca']}
                    onChange={e => handleFixedAttributeChange('Marca', e.target.value)}
                    className="native-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Modelo</label>
                <div className="input-container">
                  <input
                    placeholder="Eje: iPhone 15"
                    value={formData.attributes['Modelo']}
                    onChange={e => handleFixedAttributeChange('Modelo', e.target.value)}
                    className="native-input"
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="input-container">
                <input
                  placeholder="Eje: Negro"
                  value={formData.attributes['Color']}
                  onChange={e => handleFixedAttributeChange('Color', e.target.value)}
                  className="native-input"
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eee', margin: '20px 0' }}></div>

            <div className="form-row-double">
              <div className="form-group">
                <div className="input-container">
                  <input
                    placeholder="Nombre (Eje: Memoria)"
                    value={newAttrKey}
                    onChange={e => setNewAttrKey(e.target.value)}
                    className="native-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-container">
                  <input
                    placeholder="Valor (Eje: 256GB)"
                    value={newAttrValue}
                    onChange={e => setNewAttrValue(e.target.value)}
                    className="native-input"
                  />
                </div>
              </div>
            </div>

            <IonButton fill="outline" expand="block" onClick={addAttribute} disabled={!newAttrKey || !newAttrValue}>
              <IonIcon slot="start" icon={addCircle} />
              Agregar Característica
            </IonButton>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
              {Object.entries(formData.attributes)
                .filter(([key]) => !['Marca', 'Modelo', 'Color'].includes(key))
                .map(([key, value]) => (
                  <IonChip key={key} outline color="primary">
                    <IonLabel>{key}: {value}</IonLabel>
                    <IonIcon icon={closeCircle} onClick={() => removeAttribute(key)} />
                  </IonChip>
                ))}
            </div>
          </div>

          {/* SECCIÓN 5: IMÁGENES */}
          <div className="form-section">
            <div className="section-header">
              <IonIcon icon={camera} color="primary" size="large" />
              <h3 className="section-title">Galería de Imágenes *</h3>
            </div>

            {fieldErrors.images && (
              <IonText color="danger" className="error-message" style={{ margin: '0 0 10px 0' }}>
                <small>{fieldErrors.images}</small>
              </IonText>
            )}

            <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
              <IonIcon icon={cloudUpload} style={{ fontSize: '48px', color: '#3880ff' }} />
              <div className="upload-feedback">
                <h3>Subir Imágenes</h3>
                <p>{images.length} / 10 seleccionadas</p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg, image/png, image/webp"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            {imagePreviews.length > 0 && (
              <div className="images-grid">
                {imagePreviews.map((preview, index) => (
                  <div className="image-preview" key={index}>
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button type="button" className="delete-btn" onClick={(e) => { e.stopPropagation(); removeImage(index); }}>
                      <IonIcon icon={trashOutline} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="actions-footer">
            <IonButton
              fill="outline"
              color="medium"
              className="btn-large"
              onClick={clearForm}
              disabled={loading}
            >
              Limpiar
            </IonButton>
            <IonButton
              expand="block"
              type="submit"
              className="btn-large"
              style={{ flex: 2 }}
              disabled={loading || images.length === 0}
            >
              {loading ? (
                <IonSpinner name="crescent" />
              ) : (
                <>
                  <IonIcon icon={checkmarkCircle} slot="start" />
                  Publicar
                </>
              )}
            </IonButton>
          </div>

        </form>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Campo Requerido'}
          message={alertMessage}
          buttons={['Entendido']}
        />

        <IonToast
          isOpen={showSuccessToast}
          onDidDismiss={() => setShowSuccessToast(false)}
          message={successMessage}
          duration={2000}
          position="top"
          color="success"
        />

        <IonAlert
          isOpen={showPaymentAlert}
          backdropDismiss={false}
          header={'Método de Pago Requerido'}
          message={'Para poder publicar productos, primero debes registrar una tarjeta de crédito o débito donde recibir los fondos de tus ventas.'}
          buttons={[
            {
              text: 'Más tarde',
              role: 'cancel',
              handler: () => {
                setShowPaymentAlert(false);
                history.push('/store');
              }
            },
            {
              text: 'Registrar Tarjeta',
              handler: () => {
                setShowPaymentAlert(false);
                history.push('/profile/payment');
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default CreateProduct;