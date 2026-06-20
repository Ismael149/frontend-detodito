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
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonModal,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonAlert
} from '@ionic/react';
import {
  add,
  cube,
  create,
  checkmarkCircle,
  closeCircle,
  statsChart,
  text,
  documentText,
  power,
  image
} from 'ionicons/icons';
import { adminService } from '../../services/adminService';
import { categoryIcons } from '../../services/categoryService';
import './AdminCategory.css';

const AdminCategory: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [hideFilters, setHideFilters] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Edit/Delete State
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'cube',
    description: '',
    is_active: true
  });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Load Data
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = categories.filter(c => c.is_active).length;
  const inactiveCount = categories.filter(c => !c.is_active).length;

  // Handlers
  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon || 'cube',
        description: category.description || '',
        is_active: category.is_active
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', icon: 'cube', description: '', is_active: true });
    }
    setFieldErrors({}); // Clear errors when opening modal
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setFieldErrors({ name: 'El nombre de la categoría es obligatorio' });
      return;
    }
    setFieldErrors({});

    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
      } else {
        await adminService.createCategory(formData);
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };



  const handleToggleStatus = async (cat: any) => {
    try {
      const newStatus = !cat.is_active;
      await adminService.updateCategory(cat.id, {
        name: cat.name,
        icon: cat.icon || 'cube',
        description: cat.description || '',
        is_active: newStatus
      });
      loadCategories();
    } catch (err) {
      console.error('Error toggling category status:', err);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin" text="" />
          </IonButtons>
          <IonTitle>Categorías</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => handleOpenModal()}>
              <IonIcon icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Filters Section in Header for smooth hide-on-scroll */}
        {!hideFilters && (
          <IonToolbar className="filters-toolbar">
            <div className="filters-container-inner">
              <IonSearchbar
                value={searchTerm}
                onIonInput={e => setSearchTerm(e.detail.value!)}
                placeholder="Buscar..."
                animated
              />
              <IonSegment mode="ios" value={view} onIonChange={e => setView(e.detail.value as string)}>
                <IonSegmentButton value="list">
                  <IonLabel>Lista</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="stats">
                  <IonLabel>Estadísticas</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </div>
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent
        className="admin-categories"
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

        {/* Content Area */}
        <div className="categories-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <IonSpinner />
            </div>
          ) : view === 'list' ? (
            <IonGrid>
              <IonRow>
                {filtered.map(cat => (
                  <IonCol size="12" sizeMd="6" key={cat.id}>
                    <div className="category-card">
                      <div className="category-card-content">
                        <div className="category-header-row">
                          <div className="category-icon-wrapper">
                            <IonIcon icon={categoryIcons[cat.name] || cube} />
                          </div>
                          <div className="category-details">
                            <h3 className="category-name">{cat.name}</h3>
                            <p className="category-desc">{cat.description || 'Sin descripción'}</p>
                          </div>
                          <IonBadge color={cat.is_active ? 'success' : 'medium'}>
                            {cat.is_active ? 'Activa' : 'Inactiva'}
                          </IonBadge>
                        </div>

                        <div className="category-stats-row">
                          <IonBadge color="light">📦 {cat.product_count} productos</IonBadge>
                        </div>

                        <div className="category-actions-row">
                          <IonButton size="small" fill="clear" color={cat.is_active ? "medium" : "success"} onClick={() => handleToggleStatus(cat)}>
                            <IonIcon icon={power} slot="start" />
                            {cat.is_active ? 'Inhabilitar' : 'Habilitar'}
                          </IonButton>
                          <IonButton size="small" fill="clear" onClick={() => handleOpenModal(cat)}>
                            <IonIcon icon={create} slot="start" />
                            Editar
                          </IonButton>
                        </div>
                      </div>
                    </div>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          ) : (
            <div className="stats-view">
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-box-icon" style={{ background: '#e3f2fd', color: '#2196f3' }}>
                    <IonIcon icon={cube} />
                  </div>
                  <div className="stat-box-content">
                    <h3>{categories.length}</h3>
                    <p>Total</p>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-icon" style={{ background: '#e8f5e9', color: '#4caf50' }}>
                    <IonIcon icon={checkmarkCircle} />
                  </div>
                  <div className="stat-box-content">
                    <h3>{activeCount}</h3>
                    <p>Activas</p>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-icon" style={{ background: '#ffebee', color: '#f44336' }}>
                    <IonIcon icon={closeCircle} />
                  </div>
                  <div className="stat-box-content">
                    <h3>{inactiveCount}</h3>
                    <p>Inactivas</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Premium para Crear/Editar */}
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          className="admin-modal"
          initialBreakpoint={0.75}
          breakpoints={[0, 0.75, 1]}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)} color="medium">Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding modal-content-premium">
            <form onSubmit={handleSave} className="premium-form">
              <div className="form-sections">
                <IonList lines="none" className="premium-list">
                  <div className="input-group">
                    <IonItem className={`premium-item ${fieldErrors.name ? 'has-error' : ''}`}>
                      <IonIcon icon={text} slot="start" color="primary" />
                      <IonInput
                        label="Nombre de la Categoría"
                        labelPlacement="stacked"
                        placeholder="Ej. Electrónica"
                        value={formData.name}
                        onIonChange={e => {
                          setFormData({ ...formData, name: e.detail.value! });
                          if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                        }}
                        required
                      />
                    </IonItem>
                    {fieldErrors.name && (
                      <span className="error-message-premium">{fieldErrors.name}</span>
                    )}
                  </div>

                  <div className="input-group">
                    <IonItem className="premium-item">
                      <IonIcon icon={documentText} slot="start" color="primary" />
                      <IonTextarea
                        label="Descripción"
                        labelPlacement="stacked"
                        placeholder="Breve descripción de la categoría..."
                        value={formData.description}
                        onIonChange={e => setFormData({ ...formData, description: e.detail.value! })}
                        rows={3}
                      />
                    </IonItem>
                  </div>

                  <div className="input-group">
                    <IonItem className="premium-item toggle-item">
                      <IonIcon icon={power} slot="start" color={formData.is_active ? "success" : "medium"} />
                      <IonLabel>
                        <h3>Estado de la Categoría</h3>
                        <p>{formData.is_active ? 'Visible en la tienda' : 'Oculta temporalmente'}</p>
                      </IonLabel>
                      <IonToggle
                        checked={formData.is_active}
                        onIonChange={e => setFormData({ ...formData, is_active: e.detail.checked })}
                      />
                    </IonItem>
                  </div>

                  {/* Icon Preview / Chooser could go here in future */}
                </IonList>
              </div>

              <div className="form-actions">
                <IonButton expand="block" type="submit" className="save-button">
                  {editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'}
                </IonButton>
              </div>
            </form>
          </IonContent>
        </IonModal>



        <IonAlert
          isOpen={errorAlert}
          header="Acción no permitida"
          message={alertMessage}
          buttons={['Aceptar']}
          onDidDismiss={() => setErrorAlert(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminCategory;