import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonText,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  search as searchIcon,
  filter,
  mic,
  close,
  trendingUp,
  apps,
  star,
  flash
} from 'ionicons/icons';
import { searchService } from '../services/searchService';
import { categoryService } from '../services/categoryService';
import { authService } from '../services/authService';
import debounce from 'lodash/debounce';
import ProductImage from '../components/ProductImage';
import './Search.css';

interface SearchFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
  condition: string;
  sortBy: string;
}

const Search: React.FC = () => {
  const history = useHistory();

  // State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'trending'>('trending');
  const [isListening, setIsListening] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // Filters
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    sortBy: 'relevance'
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Check if user is logged in
      const authUser = authService.getCurrentUser();
      // Note: authService.getCurrentUser() might be synchronous or we check token
      const token = authService.getToken();
      const hasAuth = !!token;
      setIsPersonalized(hasAuth);

      const type = hasAuth ? 'personalized' : 'trending';

      const [productsData, categoriesData] = await Promise.all([
        searchService.getRecommendations(12, type),
        categoryService.getCategories()
      ]);
      setTrendingProducts(productsData.recommendations || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  // Debounced Search for Suggestions
  const fetchSuggestions = useCallback(
    debounce(async (text: string) => {
      if (text.length >= 2) {
        try {
          const data = await searchService.getSearchSuggestions(text);
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  // Main Search Logic
  const performSearch = async (reset = true) => {
    if (!query && !hasActiveFilters()) return;

    setShowSuggestions(false); // Hide suggestions on search
    if (reset) {
      setLoading(true);
      setPage(1);
      setResults([]);
      setActiveTab('results');
    }

    try {
      const currentPage = reset ? 1 : page;
      const data = await searchService.searchProducts(query, {
        ...filters,
        page: currentPage
      });

      setResults(prev => reset ? data.results : [...prev, ...data.results]);
      setHasMore(data.results.length === 50); // Assuming 50 items limit
      if (reset) setPage(2);
      else setPage(prev => prev + 1);

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      if (reset) setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    // Si hay una búsqueda activa, la refesacamos. Si no, recargamos sugerencias
    if (query || hasActiveFilters()) {
       await performSearch(true);
    } else {
       await loadInitialData();
    }
    event.detail.complete();
  };

  const handleVoiceSearch = () => {
    // Check if we are in a secure context (HTTPS) which is required for Speech API on many devices
    if (!window.isSecureContext) {
      alert('La búsqueda por voz requiere una conexión segura (HTTPS). Por favor, asegúrate de que el sitio use HTTPS o úsalo desde la app instalada.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta búsqueda por voz');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('🎤 Voice recognition started');
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Voice recognition ended');
    };

    recognition.onerror = (event: any) => {
      console.error('🎤 Voice recognition error:', event.error);
      setIsListening(false);
      alert('Error en búsqueda por voz: ' + event.error);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      console.log('🎤 Voice result:', text);
      setQuery(text);
      // Trigger search immediately after voice
      setTimeout(() => performSearch(true), 300);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('🎤 Recognition start failed:', e);
      setIsListening(false);
    }
  };

  const hasActiveFilters = () => {
    return filters.category || filters.minPrice || filters.maxPrice || filters.condition;
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', condition: '', sortBy: 'relevance' });
    if (query) performSearch(true);
  };

  const navigateToProduct = (id: number) => {
    // Record view for better recommendations if personalized
    if (isPersonalized) {
      // Optimistically record view, no await needed to block navigation
      searchService.recordProductView(id).catch(console.error);
    }
    history.push(`/product/${id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatRating = (rating: any, reviewsCount?: any): string | null => {
    const count = parseInt(reviewsCount) || 0;
    if (count === 0 || rating === null || rating === undefined) return null;
    return parseFloat(rating).toFixed(1);
  };

  // Funciones auxiliares de renderizado
  const renderProductCard = (product: any, isTrending = false) => (
    <IonCard
      key={product.id}
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
          <p className="product-description1">{product.category_name || product.description}</p>
          <div className="product-rating-row-simple">
            <IonIcon icon={star} className="star-yellow" style={{color: formatRating(product.rating, product.reviews_count) ? '#ffc409' : '#ccc'}} />
            <span className="rating-number">{formatRating(product.rating, product.reviews_count) ?? 'Nuevo'}</span>
          </div>
          <p className="product-price">{formatPrice(product.price)}</p>
        </IonText>
      </IonCardContent>
    </IonCard>
  );

  return (
    <IonPage className="search-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/store' text='' />
          </IonButtons>
          <IonTitle>Buscar</IonTitle>
        </IonToolbar>

        {/* CUSTOM SEARCH BAR HEADER */}
        <div className="search-header-container">
          <div className={`search-input-wrapper ${showSuggestions ? 'active' : ''}`}>
            <input
              type="text"
              className="search-input"
              placeholder="¿Qué estás buscando?"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && performSearch(true)}
            />

            {query && (
              <button className="icon-btn" onClick={() => { setQuery(''); setResults([]); setActiveTab('trending'); }}>
                <IonIcon icon={close} />
              </button>
            )}

            <button className={`icon-btn ${isListening ? 'listening' : ''}`} onClick={handleVoiceSearch}>
              <IonIcon icon={mic} />
            </button>

            <button className="icon-btn" onClick={() => performSearch(true)}>
              <IonIcon icon={searchIcon} color="primary" />
            </button>
          </div>

          {/* SUGGESTIONS DROPDOWN - MOVED INSIDE CONTAINER */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-container">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="suggestion-item"
                  onClick={() => {
                    setQuery(item.suggestion);
                    setShowSuggestions(false);
                    performSearch(true);
                  }}
                >
                  <IonIcon icon={item.type === 'category' ? apps : searchIcon} className="suggestion-icon" />
                  <div className="suggestion-text">
                    <h4>{item.suggestion}</h4>
                    <p>{item.type === 'category' ? 'Categoría' : 'Sugerencia'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <IonButton
              fill="clear"
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              color="medium"
            >
              <IonIcon icon={filter} slot="start" />
              Filtros
              {hasActiveFilters() && <span className="filter-dot">•</span>}
            </IonButton>

            {hasActiveFilters() && (
              <IonButton fill="clear" size="small" color="danger" onClick={clearFilters}>
                Limpiar
              </IonButton>
            )}
          </div>
        </div>

        {/* FILTERS PANEL DRAWER */}
        {showFilters && (
          <div className="filters-drawer">
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">Categoría</label>
                <select
                  className="premium-select"
                  value={filters.category}
                  onChange={e => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="">Todas</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Condición</label>
                <select
                  className="premium-select"
                  value={filters.condition}
                  onChange={e => setFilters({ ...filters, condition: e.target.value })}
                >
                  <option value="">Cualquiera</option>
                  <option value="new">Nuevo</option>
                  <option value="used">Usado</option>
                  <option value="refurbished">Reacondicionado</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Precio Min</label>
                <input
                  type="number"
                  className="premium-input-filter"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">Precio Max</label>
                <input
                  type="number"
                  className="premium-input-filter"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
            </div>
            <IonButton
              expand="block"
              className="apply-filters-btn"
              onClick={() => performSearch(true)}
            >
              Aplicar Filtros
            </IonButton>
          </div>
        )}
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {activeTab === 'results' ? (
          <div className="grid-container">
            {loading && page === 1 ? (
              <div className="empty-state">
                <IonSpinner name="crescent" />
                <p>Buscando...</p>
              </div>
            ) : results.length > 0 ? (
              <IonGrid>
                <IonRow>
                  {results.map(product => (
                    <IonCol size="6" sizeMd="4" sizeLg="3" key={product.id}>
                      {renderProductCard(product)}
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            ) : (
              <div className="empty-state">
                <IonIcon icon={searchIcon} />
                <h3>Sin resultados</h3>
                <p>Intenta con otros términos o filtros</p>
              </div>
            )}

            <IonInfiniteScroll
              onIonInfinite={async (ev) => {
                if (hasMore) await performSearch(false);
                ev.target.complete();
              }}
              disabled={!hasMore || loading}
            >
              <IonInfiniteScrollContent loadingSpinner="bubbles" />
            </IonInfiniteScroll>
          </div>
        ) : (
          // TRENDING / RECOMMENDED TAB
          <div className="grid-container">
            <div style={{ padding: '0 4px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={trendingUp} color="primary" />
              <IonText color="dark">
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  {isPersonalized ? 'Recomendado para ti' : 'Tendencias'}
                </h3>
              </IonText>
            </div>

            <IonGrid>
              <IonRow>
                {trendingProducts.map(product => (
                  <IonCol size="6" sizeMd="4" sizeLg="3" key={product.id}>
                    {renderProductCard(product, true)}
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Search;