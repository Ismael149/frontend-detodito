// frontend/src/pages/Store.tsx
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonFab,
  IonFabButton,
  IonIcon,
  IonButton,
  IonChip,
  IonSpinner,
  IonText,
  IonRefresher,
  IonRefresherContent,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/react';
import { add, cart, rocket, addCircleOutline, apps, time, search, heart, person, home, flash, notifications, star, chevronForward, chatbubbles } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import ProductImage from '../components/ProductImage';
import BannerCarousel from '../components/BannerCarousel';
import { placeholderBanners } from '../data/banners';
import SearchBar from '../components/SearchBar';
import {
  storeProducts,
  getFeaturedProducts,
  getTrendingProducts,
  getRecentProducts,
  getProductsWithDiscount,
  StoreProduct
} from '../data/storeData';
import { searchService } from '../services/searchService';
import { authService } from '../services/authService';
import { environment } from '../environments/environment';
import './Store.css';

const API_URL = environment.apiUrl;

import { useIonViewWillEnter } from '@ionic/react';

// ... (API_URL)

const Store: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState<string>('');
  const [banners, setBanners] = useState<any[]>([]);
  const history = useHistory();
  const [refreshing, setRefreshing] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [discountProducts, setDiscountProducts] = useState<any[]>([]);
  
  // Infinite Scroll State
  const [infiniteProducts, setInfiniteProducts] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 12;

  const handleSearchClick = () => {
    // Navegar a la página de búsqueda que ya tienes
    history.push('/search');
  };

  const handleRefresh = async (event: any) => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadStoreData(),
        loadBanners()
      ]);
    } catch (err) {
      console.error('Error refreshing store:', err);
    } finally {
      setRefreshing(false);
      event.detail.complete();
    }
  };

  useIonViewWillEnter(() => {
    console.log('🔄 Store component mounted/entered');
    loadStoreData();
    loadBanners();
  });

  const loadBanners = async () => {
    try {
      const response = await axios.get(`${API_URL}/banners/active`);
      if (response.data && response.data.length > 0) {
        // Map API data to component props
        const mappedBanners = response.data.map((b: any) => ({
          id: b.id,
          image: b.image_url,
          title: 'Publicidad', // Default title as DB might not have it or it's optional
          link: b.product_link,
          backgroundColor: '#ffffff'
        }));
        setBanners(mappedBanners);
      } else {
        setBanners(placeholderBanners);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      setBanners(placeholderBanners);
    }
  };

  const loadStoreData = async () => {
    try {
      console.log('🔄 Loading store data...');

      const isAuthenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      console.log('👤 User authenticated:', isAuthenticated, currentUser?.id);

      // Parallel requests: Categories + Standard Products + (Optional) Personal Recommendations
      const promises: Promise<any>[] = [
        categoryService.getCategories(),
        productService.getProducts()
      ];

      if (isAuthenticated) {
        // Obtener recomendaciones de IA para usuarios con sesión iniciada
        promises.push(searchService.getRecommendations(8, 'personalized'));
      }

      const results = await Promise.all(promises);
      const categoriesData = results[0];
      const productsData = results[1];
      const personalRecs = isAuthenticated ? results[2] : null;

      console.log('📋 Categories loaded:', categoriesData?.length);
      console.log('📦 Products loaded:', productsData?.length);

      if (personalRecs && personalRecs.recommendations && personalRecs.recommendations.length > 0) {
        console.log('🧠 AI Recommendations loaded:', personalRecs.recommendations.length);
        // Use AI recommendations for 'Featured/Recommended' section
        setFeaturedProducts(personalRecs.recommendations);
      } else {
        // Fallback to default logic
        setFeaturedProducts(productsData.slice(0, 8));
      }

      setCategories(categoriesData);
      setRecentProducts(productsData.slice(2, 8)); // Productos "vistos recientemente"
      setTrendingProducts(productsData.slice(4, 10));
      setDiscountProducts(productsData.filter((p: any) => p.discount > 0).slice(0, 6));

      // Reset infinite scroll on master reload/refresh
      setOffset(0);
      setHasMore(true);
      fetchInitialInfiniteProducts();

    } catch (error) {
      console.error('❌ Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialInfiniteProducts = async () => {
    try {
      const resp = await searchService.getRecommendations(LIMIT, 'personalized', undefined, 0);
      const newRecs = resp.recommendations || [];
      setInfiniteProducts(newRecs);
      setOffset(newRecs.length);
      if (newRecs.length < LIMIT) setHasMore(false);
    } catch (err) {
      console.error('Error fetching initial infinite products:', err);
    }
  };

  const loadMoreProducts = async (event: CustomEvent<void>) => {
    if (!hasMore) {
      (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }

    try {
      const resp = await searchService.getRecommendations(LIMIT, 'personalized', undefined, offset);
      const newRecs = resp.recommendations || [];
      
      if (newRecs.length === 0) {
        setHasMore(false);
      } else {
        setInfiniteProducts(prev => [...prev, ...newRecs]);
        setOffset(prev => prev + newRecs.length);
        if (newRecs.length < LIMIT) setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more products:', err);
      setHasMore(false);
    } finally {
      (event.target as HTMLIonInfiniteScrollElement).complete();
    }
  };

  const navigateToCategory = (categoryId: number) => {
    history.push(`/category/${categoryId}`);
  };

  const navigateToAllCategories = () => {
    history.push('/categories');
  };

  const navigateToProduct = (productId: number) => {
    history.push(`/product/${productId}`);
  };

  const navigateToSearch = () => {
    if (searchText.trim()) {
      history.push(`/search?q=${encodeURIComponent(searchText)}`);
    }
  };

  const navigateToSection = (section: string) => {
    history.push(`/products?section=${section}`);
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

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando tienda...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="store-toolbar">
          <SearchBar
            onSearchClick={handleSearchClick}
            placeholder="Buscar productos, marcas y más..."
          />
        </IonToolbar>
      </IonHeader>

      <IonContent className="store-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Carrusel de Banners */}
        <div className="banners-section">
          <BannerCarousel
            banners={banners}
            autoPlay={true}
            autoPlayInterval={5000}
            height="150px"
          />
        </div>

        {/* Categorías con scroll horizontal */}
        <div className="categories-section">
          <div className="categories-scroll">
            {categories.slice(0, 8).map((category) => (
              <div
                key={category.id}
                className="category-scroll-item"
                onClick={() => navigateToCategory(category.id)}
              >
                <div className="category-icon">
                  <IonIcon icon={category.icon} />
                </div>
                <IonText>
                  <p className="category-name" >{category.name}</p>
                </IonText>
              </div>
            ))}

            {/* Botón "Ver Más" */}
            <div
              className="category-scroll-item see-more-category"
              onClick={navigateToAllCategories}
            >
              <div className="category-icon see-more-icon">
                <IonIcon icon={apps} />
              </div>
              <IonText>
                <p className="category-name">Ver más</p>
              </IonText>
            </div>
          </div>
        </div>



        {/* Sección de Productos Destacados - Estilo Mercado Libre */}
        <div className="section">
          <div className="section-header">
            <IonText>
              <h3>{authService.isAuthenticated() ? 'Seleccionado para ti' : 'Productos destacados'}</h3>
            </IonText>
          </div>

          <IonGrid>
            <IonRow>
              {featuredProducts.slice(0, 8).map((product) => (
                <IonCol size="6" key={product.id}>
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
        </div>

        {/* Sección de Tendencias */}
        {trendingProducts.length > 0 && (
          <div className="section">
            <div className="section-header with-icon">
              <IonIcon icon={rocket} color="danger" />
              <IonText>
                <h3>Tendencias</h3>
              </IonText>
            </div>

            <div className="products-scroll">
              {trendingProducts.map((product) => (
                <IonCard
                  key={product.id}
                  className={`product-card scroll-card ${product.stock === 0 ? 'out-of-stock' : ''}`}
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
              ))}
            </div>
          </div>
        )}


        {/* Sección de visto recientemente */}
        {recentProducts.length > 0 && (
          <div className="section">
            <div className="section-header">
              <IonText>
                <h3>Visto recientemente</h3>
              </IonText>
            </div>
            <div className="products-scroll">
              {recentProducts.map((product) => (
                <IonCard
                  key={product.id}
                  className={`product-card scroll-card ${product.stock === 0 ? 'out-of-stock' : ''}`}
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
              ))}
            </div>
          </div>
        )}

        {/* Sección de productos destacados */}
        <div className="section">
          <div className="section-header">
            <IonText>
              <h3>Porque te interesa</h3>
            </IonText>
          </div>
          <IonGrid>
            <IonRow>
              {featuredProducts.slice(0, 4).map((product) => (
                <IonCol size="6" key={product.id}>
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
        </div>



        {/* Sección de productos infinitos (Scroll Infinito) */}
        {infiniteProducts.length > 0 && (
          <div className="section no-title-section">
            <IonGrid>
              <IonRow>
                {infiniteProducts.map((product) => (
                  <IonCol size="6" key={`infinite-${product.id}`}>
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
          </div>
        )}

        <IonInfiniteScroll
          threshold="100px"
          disabled={!hasMore}
          onIonInfinite={loadMoreProducts}
        >
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Cargando más productos..."
          ></IonInfiniteScrollContent>
        </IonInfiniteScroll>
        <IonFab className="Button_chatbot" slot="fixed">
          <IonFabButton routerLink="/chatbot" >
            <IonIcon icon={chatbubbles} />
          </IonFabButton>
        </IonFab>

        {/* Botón flotante para agregar producto */}
        <IonFab className="Button_chatbot2" slot="fixed">
          <IonFabButton routerLink="/create-product">
            <IonIcon icon={addCircleOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Store;