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
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonToggle,
    IonAlert,
    IonSpinner,
    IonBadge,
    IonModal,
    IonList,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonSelect,
    IonSelectOption
} from '@ionic/react';
import {
    add, create, trash, statsChart, cube, checkmarkCircle, closeCircle
} from 'ionicons/icons';
import { adminService } from '../../services/adminService';
import { categoryIcons } from '../../services/categoryService';
import './AdminCategory.css'; // We CAN reuse the CSS since we overwrote it and it's just CSS variables

// Convertir el objeto de iconos a array para el select
const availableIcons = Object.entries(categoryIcons).map(([name, icon]) => ({
    name,
    icon
}));

const AdminCategoryV2: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState('list');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        icon: 'cube',
        description: '',
        is_active: true
    });

    useEffect(() => {
        console.log('🚀 AdminCategory V4 - INLINE STYLES APPLIED');
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const categoriesData = await adminService.getCategories();
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            icon: 'cube',
            description: '',
            is_active: true
        });
        setShowModal(true);
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            icon: category.icon || 'cube',
            description: category.description || '',
            is_active: category.is_active
        });
        setShowModal(true);
    };

    const handleDelete = (category: any) => {
        setCategoryToDelete(category);
        setShowDeleteAlert(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await adminService.deleteCategory(categoryToDelete.id);
            setCategories(categories.filter(c => c.id !== categoryToDelete.id));
            setShowDeleteAlert(false);
            setCategoryToDelete(null);
        } catch (error: any) {
            console.error('Error deleting category:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingCategory) {
                // Actualizar categoría existente
                const result = await adminService.updateCategory(editingCategory.id, formData);
                setCategories(categories.map(c => c.id === editingCategory.id ? result.category : c));
            } else {
                // Crear nueva categoría
                const result = await adminService.createCategory(formData);
                setCategories([result.category, ...categories]);
            }

            setShowModal(false);
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    // Función para actualizar el icono basado en el nombre
    const handleNameChange = (name: string) => {
        const newIcon = categoryIcons[name] || 'cube';
        setFormData({
            ...formData,
            name,
            icon: newIcon
        });
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCategories = filteredCategories.filter(c => c.is_active);
    const inactiveCategories = filteredCategories.filter(c => !c.is_active);

    if (loading) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/admin/dashboard" text="" />
                        </IonButtons>
                        <IonTitle>Gestión de Categorías</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div className="loading-center">
                        <IonSpinner name="crescent" />
                        <p>Cargando categorías...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    // Helper para asegurar números
    const parseCount = (count: any) => parseInt(count || 0, 10);

    return (
        <IonPage>
            {/* Sticky Header (Standard) */}
            <IonHeader translucent={true}>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/admin" text="" />
                    </IonButtons>
                    <IonTitle>Gestión de Categorías</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleCreate}>
                            <IonIcon icon={add} slot="icon-only" />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="categories-management">

                {/* THIS IS THE NEW STRUCTURE THAT MATCHES ADMIN USERS */}
                <div className="filters-section">
                    {/* Debug Title to prove update */}
                    <IonText color="dark">
                        <h1 className="large-title" style={{ marginLeft: '8px' }}>Categorías V3 (FINAL)</h1>
                    </IonText>

                    <IonSearchbar
                        value={searchTerm}
                        onIonInput={(e) => setSearchTerm(e.detail.value!)}
                        placeholder="Buscar categorías..."
                        animated
                    />

                    <IonSegment
                        mode="ios"
                        value={activeView}
                        onIonChange={(e) => setActiveView(e.detail.value as string)}
                    >
                        <IonSegmentButton value="list">
                            <IonLabel>Lista</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="stats">
                            <IonLabel>Estadísticas</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </div>

                {activeView === 'list' ? (
                    /* Vista de Lista */
                    <div className="categories-list">
                        {/* Categorías Activas */}
                        {activeCategories.length > 0 && (
                            <div className="category-section">
                                <h3 className="section-title">
                                    <IonIcon icon={checkmarkCircle} color="success" />
                                    Categorías Activas ({activeCategories.length})
                                </h3>
                                <IonGrid>
                                    <IonRow>
                                        {activeCategories.map((category) => (
                                            <IonCol size="12" size-md="6" key={category.id}>
                                                <CategoryCard
                                                    category={category}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            </IonCol>
                                        ))}
                                    </IonRow>
                                </IonGrid>
                            </div>
                        )}

                        {/* Categorías Inactivas */}
                        {inactiveCategories.length > 0 && (
                            <div className="category-section">
                                <h3 className="section-title">
                                    <IonIcon icon={closeCircle} color="medium" />
                                    Categorías Inactivas ({inactiveCategories.length})
                                </h3>
                                <IonGrid>
                                    <IonRow>
                                        {inactiveCategories.map((category) => (
                                            <IonCol size="12" size-md="6" key={category.id}>
                                                <CategoryCard
                                                    category={category}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            </IonCol>
                                        ))}
                                    </IonRow>
                                </IonGrid>
                            </div>
                        )}

                        {filteredCategories.length === 0 && (
                            <div className="empty-state">
                                <IonIcon icon={cube} size="large" />
                                <p>No se encontraron categorías</p>
                                <IonButton onClick={handleCreate}>
                                    Crear primera categoría
                                </IonButton>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Vista de Estadísticas */
                    <div className="categories-stats animate-fade-in">
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12" sizeMd="4">
                                    <div className="stat-card">
                                        <div className="stat-icon primary">
                                            <IonIcon icon={cube} />
                                        </div>
                                        <div className="stat-content">
                                            <h3>{categories.length}</h3>
                                            <p>Total Categorías</p>
                                        </div>
                                    </div>
                                </IonCol>
                                <IonCol size="12" sizeMd="4">
                                    <div className="stat-card">
                                        <div className="stat-icon success">
                                            <IonIcon icon={checkmarkCircle} />
                                        </div>
                                        <div className="stat-content">
                                            <h3>{activeCategories.length}</h3>
                                            <p>Activas</p>
                                        </div>
                                    </div>
                                </IonCol>
                                <IonCol size="12" sizeMd="4">
                                    <div className="stat-card">
                                        <div className="stat-icon warning">
                                            <IonIcon icon={closeCircle} />
                                        </div>
                                        <div className="stat-content">
                                            <h3>{inactiveCategories.length}</h3>
                                            <p>Inactivas</p>
                                        </div>
                                    </div>
                                </IonCol>
                            </IonRow>

                            <IonRow>
                                <IonCol size="12" sizeMd="6">
                                    <IonCard className="chart-card">
                                        <IonCardContent>
                                            <h3>Categorías con más productos</h3>
                                            <div className="top-list">
                                                {[...categories]
                                                    .sort((a, b) => parseCount(b.product_count) - parseCount(a.product_count))
                                                    .slice(0, 5)
                                                    .map((cat, index) => (
                                                        <div key={cat.id} className="top-item">
                                                            <span className="rank">#{index + 1}</span>
                                                            <span className="name">{cat.name}</span>
                                                            <span className="count">
                                                                <IonBadge color="primary">{parseCount(cat.product_count)}</IonBadge>
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>

                                <IonCol size="12" sizeMd="6">
                                    <IonCard className="chart-card">
                                        <IonCardContent>
                                            <h3>Distribución</h3>
                                            <div className="distribution-stats">
                                                <div className="dist-item">
                                                    <div className="dist-label">Promedio de productos por categoría</div>
                                                    <div className="dist-value">
                                                        {categories.length > 0
                                                            ? Math.round(categories.reduce((acc, c) => acc + parseCount(c.product_count), 0) / categories.length)
                                                            : 0}
                                                    </div>
                                                </div>
                                                <div className="dist-item">
                                                    <div className="dist-label">Categorías vacías</div>
                                                    <div className="dist-value">
                                                        {categories.filter(c => parseCount(c.product_count) === 0).length}
                                                    </div>
                                                </div>
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                )}

                {/* Modal para crear/editar categoría - REMOVED FOR BREVITY IN V2 IF NOT NEEDED BUT KEEPING TO BE SAFE */}
                <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
                    <IonHeader>
                        <IonToolbar>
                            <IonButtons slot="start">
                                <IonButton onClick={() => setShowModal(false)}>Cancelar</IonButton>
                            </IonButtons>
                            <IonTitle>
                                {editingCategory ? 'Editar Categoría' : 'Crear Categoría'}
                            </IonTitle>
                            <IonButtons slot="end">
                                <IonButton type="submit" form="categoryForm" strong={true}>
                                    Guardar
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        <form id="categoryForm" onSubmit={handleSubmit}>
                            <IonList>
                                <IonItem>
                                    <IonLabel position="stacked">Nombre de la categoría *</IonLabel>
                                    <IonInput
                                        value={formData.name}
                                        onIonInput={(e) => handleNameChange(e.detail.value!)}
                                        required
                                        placeholder="Ej: Tecnología, Moda, Hogar..."
                                    />
                                </IonItem>
                                <IonItem>
                                    <IonLabel position="stacked">Icono</IonLabel>
                                    <div className="icon-selection">
                                        <IonIcon icon={formData.icon} className="selected-icon" />
                                        <IonSelect
                                            value={formData.icon}
                                            onIonChange={(e) => setFormData({ ...formData, icon: e.detail.value })}
                                            placeholder="Seleccionar icono"
                                        >
                                            <IonSelectOption value="cube">Predeterminado (cube)</IonSelectOption>
                                            {availableIcons.map((iconObj) => (
                                                <IonSelectOption key={iconObj.name} value={iconObj.icon}>
                                                    {iconObj.name}
                                                </IonSelectOption>
                                            ))}
                                        </IonSelect>
                                    </div>
                                </IonItem>
                                <IonItem>
                                    <IonLabel position="stacked">Descripción</IonLabel>
                                    <IonTextarea
                                        value={formData.description}
                                        onIonInput={(e) => setFormData({ ...formData, description: e.detail.value! })}
                                        rows={3}
                                        placeholder="Descripción opcional de la categoría..."
                                    />
                                </IonItem>
                                <IonItem>
                                    <IonLabel>Categoría activa</IonLabel>
                                    <IonToggle
                                        checked={formData.is_active}
                                        onIonChange={(e) => setFormData({ ...formData, is_active: e.detail.checked })}
                                        slot="end"
                                    />
                                </IonItem>
                            </IonList>
                        </form>
                    </IonContent>
                </IonModal>

                {/* Alerta de confirmación para eliminar */}
                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header={'Eliminar Categoría'}
                    message={`¿Estás seguro de que quieres eliminar la categoría "${categoryToDelete?.name}"?`}
                    buttons={[
                        { text: 'Cancelar', role: 'cancel' },
                        { text: 'Eliminar', role: 'destructive', handler: confirmDelete }
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

// Componente de tarjeta de categoría (Copied)
const CategoryCard: React.FC<{
    category: any;
    onEdit: (category: any) => void;
    onDelete: (category: any) => void;
}> = ({ category, onEdit, onDelete }) => {
    return (
        <IonCard className={`category-card ${category.is_active ? 'active' : 'inactive'}`}>
            <IonCardContent>
                <div className="category-header">
                    <div className="category-info">
                        <IonIcon icon={category.icon || 'cube'} className="category-icon" />
                        <div>
                            <h4 className="category-name">{category.name}</h4>
                            {category.description && (
                                <p className="category-description">{category.description}</p>
                            )}
                        </div>
                    </div>

                    <IonBadge color={category.is_active ? 'success' : 'medium'}>
                        {category.product_count || 0} productos
                    </IonBadge>
                </div>

                <div className="category-actions">
                    <IonButton
                        size="small"
                        fill="clear"
                        onClick={() => onEdit(category)}
                    >
                        <IonIcon icon={create} />
                        Editar
                    </IonButton>

                    <IonButton
                        size="small"
                        fill="clear"
                        color="danger"
                        onClick={() => onDelete(category)}
                    >
                        <IonIcon icon={trash} />
                        Eliminar
                    </IonButton>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default AdminCategoryV2;
