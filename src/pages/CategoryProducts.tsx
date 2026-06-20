// frontend/src/pages/CategoryProducts.tsx - VERSIÓN CORREGIDA
import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonText,
  IonSpinner,
  IonButton,
  IonIcon,
  IonBadge,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSearchbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonToast,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import {
  star,
  cart,
  filter,
  flame,
  trendingUp,
  time,
  search as searchIcon,
  flash,
  cube
} from 'ionicons/icons';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import ProductImage from '../components/ProductImage';
import './CategoryProducts.css';

const CategoryProducts: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();

  const searchBarRef = useRef<HTMLIonSearchbarElement>(null);

  useEffect(() => {
    loadCategory();
  }, [id]);

  useEffect(() => {
    if (category) {
      loadProducts();
    }
  }, [category, sortBy]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, activeTab]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const categories = await categoryService.getCategories();
      const foundCategory = categories.find((cat: any) => cat.id === parseInt(id));

      if (foundCategory) {
        setCategory(foundCategory);
      } else {
        setToastMessage('Categoría no encontrada');
        setShowToast(true);
        setTimeout(() => history.push('/categories'), 2000);
      }
    } catch (error) {
      console.error('Error loading category:', error);
      setToastMessage('Error al cargar la categoría');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const allProducts = await productService.getProducts();

      // Filtrar productos por categoría
      const categoryProducts = allProducts.filter(
        (product: any) => product.category_id === parseInt(id)
      );

      // Debug: Ver productos encontrados
      console.log('📦 Productos de categoría:', {
        categoryId: id,
        totalProducts: allProducts.length,
        categoryProducts: categoryProducts.length,
        products: categoryProducts.map(p => ({
          id: p.id,
          name: p.name,
          category_id: p.category_id,
          image_url: p.image_url,
          images: p.images
        }))
      });

      // Ordenar productos
      const sortedProducts = sortProducts(categoryProducts, sortBy);

      setProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
      setPage(1);
      setHasMore(sortedProducts.length > 20);
    } catch (error) {
      console.error('Error loading products:', error);
      setToastMessage('Error al cargar productos');
      setShowToast(true);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadCategory();
    if (category) {
      await loadProducts();
    }
    event.detail.complete();
  };

  const sortProducts = (products: any[], sortType: string) => {
    const sorted = [...products];

    switch (sortType) {
      case 'price_asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
      case 'popular':
        // Simular popularidad
        return sorted.sort((a, b) => {
          const popularityA = (a.view_count || 0) + (a.favorite_count || 0);
          const popularityB = (b.view_count || 0) + (b.favorite_count || 0);
          return popularityB - popularityA;
        });
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'relevance':
      default:
        return sorted;
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    // Filtrar por pestaña activa
    switch (activeTab) {
      case 'trending':
        // Simular productos trending
        filtered = filtered.filter(p => (p.view_count || 0) > 10);
        break;
      case 'discount':
        filtered = filtered.filter(p => p.discount > 0);
        break;
      case 'free_shipping':
        filtered = filtered.filter(p => p.free_shipping);
        break;
      case 'new':
        filtered = filtered.filter(p => p.condition === 'new');
        break;
      default:
        // 'all' - mostrar todos
        break;
    }

    setFilteredProducts(filtered);
  };

  const loadMoreProducts = async (event: any) => {
    // Simular carga de más productos
    setTimeout(() => {
      const currentCount = filteredProducts.length;
      const newProducts = products.slice(currentCount, currentCount + 10);

      if (newProducts.length > 0) {
        setFilteredProducts(prev => [...prev, ...newProducts]);
        setPage(page + 1);
        setHasMore(currentCount + newProducts.length < products.length);
      } else {
        setHasMore(false);
      }

      event.target.complete();
    }, 1000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Devuelve el rating real formateado, o null si el producto no tiene reseñas
  const formatRating = (rating: any, reviewsCount?: any): string | null => {
    const count = parseInt(reviewsCount) || 0;
    if (count === 0 || rating === null || rating === undefined) return null;
    return parseFloat(rating).toFixed(1);
  };

  const calculateDiscountPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  const navigateToProduct = (productId: number) => {
    history.push(`/product/${productId}`);
  };

  const getCategoryStats = () => {
    const totalProducts = products.length;
    const newProducts = products.filter(p => p.condition === 'new').length;
    const discountProducts = products.filter(p => p.discount > 0).length;
    const freeShippingProducts = products.filter(p => p.free_shipping).length;
    const trendingProducts = products.filter(p => (p.view_count || 0) > 10).length;

    return { totalProducts, newProducts, discountProducts, freeShippingProducts, trendingProducts };
  };

  const stats = getCategoryStats();

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando categoría...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!category) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/categories" text="" />
            </IonButtons>
            <IonTitle>Categoría no encontrada</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="empty-state">
            <IonText color="medium">
              <h3>La categoría no existe</h3>
              <p>Regresa a la lista de categorías</p>
            </IonText>
            <IonButton onClick={() => history.push('/categories')}>
              Ver categorías
            </IonButton>
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
            <IonBackButton defaultHref="/categories" text="" />
          </IonButtons>
          <IonTitle>{category.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowFilters(!showFilters)}>
              <IonIcon icon={filter} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="category-products-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {/* Banner de categoría 
        <div className="category-banner">
          <div className="category-header">
            <div className="category-icon-large">
              <IonIcon icon={category.icon || cube} />
            </div>
            <div className="category-info">
              <IonText>
                <h1 className="category-title">{category.name}</h1>
              </IonText>
              {category.description && (
                <IonText color="light">
                  <p className="category-description">{category.description}</p>
                </IonText>
              )}
              <div className="category-stats">
                <IonBadge color="light">
                  <span>{stats.totalProducts} productos</span>
                </IonBadge>
                {stats.newProducts > 0 && (
                  <IonBadge color="success">
                    <span>{stats.newProducts} nuevos</span>
                  </IonBadge>
                )}
                {stats.discountProducts > 0 && (
                  <IonBadge color="danger">
                    <IonIcon icon={flash} size="small" />
                    <span>{stats.discountProducts} con descuento</span>
                  </IonBadge>
                )}
                {stats.freeShippingProducts > 0 && (
                  <IonBadge color="primary">
                    <IonIcon icon={cart} size="small" />
                    <span>{stats.freeShippingProducts} envío gratis</span>
                  </IonBadge>
                )}
              </div>
            </div>
          </div>
        </div>*/}

        {/* Barra de búsqueda */}
        <div className="category-search">
          <IonSearchbar
            ref={searchBarRef}
            value={searchQuery}
            onIonInput={(e) => setSearchQuery(e.detail.value!)}
            placeholder={`Buscar en ${category.name}...`}
            animated
          />
        </div>

        {/* Se removed IonSegment as requested */}

        {/* Panel de filtros avanzados */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-header">
              <IonText>
                <h3>Ordenar por</h3>
              </IonText>
              <IonButton fill="clear" size="small" onClick={() => setShowFilters(false)}>
                Cerrar
              </IonButton>
            </div>
            <div className="sort-options">
              {[
                { value: 'relevance', label: 'Más relevantes' },
                { value: 'price_asc', label: 'Precio: Menor a mayor' },
                { value: 'price_desc', label: 'Precio: Mayor a menor' },
                { value: 'newest', label: 'Más recientes' },
                { value: 'popular', label: 'Más populares' },
                { value: 'rating', label: 'Mejor calificados' }
              ].map((option) => (
                <IonButton
                  key={option.value}
                  fill={sortBy === option.value ? 'solid' : 'outline'}
                  color={sortBy === option.value ? 'primary' : 'medium'}
                  size="small"
                  onClick={() => {
                    setSortBy(option.value);
                    setShowFilters(false);
                  }}
                  className="sort-option-button"
                >
                  {option.label}
                </IonButton>
              ))}
            </div>
          </div>
        )}

        {/* Contador de resultados */}
        <div className="results-count">
          <IonText color="medium">
            <p>
              Mostrando {filteredProducts.length} de {products.length} productos
              {searchQuery && ` para "${searchQuery}"`}
            </p>
          </IonText>
        </div>

        {/* Lista de productos */}
        {loadingProducts ? (
          <div className="loading-products">
            <IonSpinner name="crescent" />
            <p>Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-products">
            <IonIcon icon={category.icon || cube} size="large" color="medium" />
            <IonText color="medium">
              <h3>No hay productos en esta categoría</h3>
              <p>
                {searchQuery
                  ? `No encontramos productos para "${searchQuery}"`
                  : 'Pronto habrá productos disponibles'}
              </p>
            </IonText>
            {searchQuery && (
              <IonButton fill="outline" onClick={() => setSearchQuery('')}>
                Limpiar búsqueda
              </IonButton>
            )}
          </div>
        ) : (
          <>
            <IonGrid>
              <IonRow>
                {filteredProducts.map((product) => (
                  <IonCol size="6" size-md="4" size-lg="3" key={product.id}>
                    <IonCard
                      className={`product-card ${product.stock === 0 ? 'out-of-stock' : ''}`}
                      onClick={() => navigateToProduct(product.id)}
                    >
                      <div className="product-image-container">
                        {product.stock === 0 && (
                          <div className="out-of-stock-overlay">Sin Stock</div>
                        )}
                        <ProductImage
                          imageUrl={product.primary_image || product.image_url}
                          images={product.images}
                          alt={product.name}
                          className="product-image2"
                        />
                        {product.discount > 0 && (
                          <div className="discount-tag">
                            <IonIcon icon={flash} size="small" />
                            <span>{product.discount}% OFF</span>
                          </div>
                        )}
                      </div>
                      <IonCardContent className="product-card-details">
                        <IonText>
                          <p className="product-name1">{product.name}</p>
                          <p className="product-description1">{product.description}</p>
                          <div className="product-rating-row-simple">
                            <IonIcon icon={star} className="star-yellow" style={{color: formatRating(product.rating, product.reviews_count) ? '#ffc409' : '#ccc'}} />
                            <span className="rating-number">{formatRating(product.rating, product.reviews_count) ?? 'Nuevo'}</span>
                          </div>
                          <p className="product-price">{formatPrice(product.price)}</p>
                        </IonText>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>

            {/* Scroll infinito */}
            {hasMore && (
              <IonInfiniteScroll
                threshold="100px"
                onIonInfinite={loadMoreProducts}
              >
                <IonInfiniteScrollContent
                  loadingSpinner="bubbles"
                  loadingText="Cargando más productos..."
                />
              </IonInfiniteScroll>
            )}
          </>
        )}
      </IonContent>

      {/* Toast para mensajes */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
      />
    </IonPage>
  );
};

export default CategoryProducts;