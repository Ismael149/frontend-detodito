// frontend/src/pages/ProductDetail.tsx - VERSIÓN COMPLETA CORREGIDA
import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonImg,
  IonButton,
  IonIcon,
  IonChip,
  IonText,
  IonSpinner,
  IonAlert,
  IonItem,
  IonLabel,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardContent,
  IonList,
  IonThumbnail,
  IonFooter,
  IonTextarea,
  IonModal,
  IonAvatar,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import {
  cart,
  heart,
  heartOutline,
  share,
  shareOutline,
  location,
  shieldCheckmark,
  shieldCheckmarkOutline,
  star,
  chevronForward,
  storefront,
  storefrontOutline,
  checkmarkCircle,
  checkmarkCircleOutline,
  car,
  returnUpBack,
  card,
  lockClosed,
  chatbubbles,
  addCircle,
  thumbsUp,
  flag,
  personCircle,
  time,
  create,
  trash,
  chatbubble,
  chatbubbleOutline,
  send,
  rocket,
  flash
} from 'ionicons/icons';
import { Share } from '@capacitor/share';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { authService } from '../services/authService';
import { favoriteService } from '../services/favoriteService';
import { commentService } from '../services/commentService';
import ProductImage from '../components/ProductImage';
import ProductComments from '../components/ProductComments';
import { environment } from '../environments/environment';
import './ProductDetail.css';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [alsoViewedProducts, setAlsoViewedProducts] = useState<any[]>([]);

  const [loadingRelated, setLoadingRelated] = useState(false);

  // Ref para evitar doble conteo en modo estricto de React
  const viewRecorded = React.useRef(false);

  // Resetear el ref cuando cambia el ID
  useEffect(() => {
    viewRecorded.current = false;
  }, [id]);

  // Estados para comentarios
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState({
    content: '',
    rating: 5
  });
  const [submittingComment, setSubmittingComment] = useState(false);

  // Estados para editar/responder comentarios
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentData, setEditCommentData] = useState({
    content: '',
    rating: 5
  });
  const [showReplyInput, setShowReplyInput] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState<{ [key: number]: any[] }>({});
  const [loadingReplies, setLoadingReplies] = useState<{ [key: number]: boolean }>({});

  // Definir el tipo correcto para commentStats
  interface CommentStatsState {
    average_rating: number;
    total_comments: number;
    rating_distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  }

  const [commentStats, setCommentStats] = useState<CommentStatsState>({
    average_rating: 0,
    total_comments: 0,
    rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    loadProductDetail();
  }, [id]);

  const checkFavoriteStatus = useCallback(async () => {
    if (!product || !authService.isAuthenticated()) {
      setFavoriteLoading(false);
      return;
    }

    try {
      setFavoriteLoading(true);
      const response = await favoriteService.checkFavorite(product.id);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      setIsFavorite(false);
    } finally {
      setFavoriteLoading(false);
    }
  }, [product]);

  // Función para calcular precio con descuento
  const calculateDiscountPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  // Se ha eliminado getImageUrl local para usar el componente ProductImage estandarizado

  // Función para cargar productos relacionados
  const loadRelatedProducts = async () => {
    if (!product) return;

    try {
      setLoadingRelated(true);

      const allProducts = await productService.getProducts();

      // Productos relacionados (misma categoría)
      const related = allProducts
        .filter(p =>
          p.id !== product.id &&
          p.category_id === product.category_id
        )
        .slice(0, 8);

      // Productos "también vistos" (aleatorios)
      const alsoViewed = allProducts
        .filter(p => p.id !== product.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

      setRelatedProducts(related);
      setAlsoViewedProducts(alsoViewed);
    } catch (error) {
      console.error('Error loading related products:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  // Función para cargar comentarios del producto
  const loadComments = async () => {
    if (!product) return;

    try {
      setLoadingComments(true);
      const commentsData = await commentService.getProductComments(product.id);

      // Filtra solo los comentarios aprobados para mostrar
      const approvedComments = commentsData.comments?.filter(
        (comment: any) => comment.is_approved === true
      ) || [];

      setComments(approvedComments);

      // Calcular estadísticas solo de comentarios aprobados
      if (approvedComments.length > 0) {
        const avg = approvedComments.reduce((sum: number, comment: any) =>
          sum + (comment.rating || 0), 0) / approvedComments.length;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        approvedComments.forEach((comment: any) => {
          if (comment.rating && comment.rating >= 1 && comment.rating <= 5) {
            distribution[comment.rating as keyof typeof distribution]++;
          }
        });

        setCommentStats({
          average_rating: avg || 0,
          total_comments: approvedComments.length,
          rating_distribution: distribution
        });
      } else {
        // Si no hay comentarios aprobados
        setCommentStats({
          average_rating: 0,
          total_comments: 0,
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Función para enviar un comentario
  const submitComment = async () => {
    if (!authService.isAuthenticated()) {
      setAlertMessage('🔐 Debes iniciar sesión para comentar');
      setShowAlert(true);
      setTimeout(() => history.push('/login'), 1500);
      return;
    }

    if (!newComment.content.trim()) {
      setAlertMessage('📝 Escribe tu comentario antes de enviar');
      setShowAlert(true);
      return;
    }

    try {
      setSubmittingComment(true);

      // Llamar directamente con los 3 parámetros
      await commentService.createComment(
        product.id,
        newComment.content.trim(),
        newComment.rating
      );

      setAlertMessage('✅ Comentario enviado correctamente');
      setShowAlert(true);

      // Limpiar formulario y recargar comentarios
      setNewComment({ content: '', rating: 5 });
      setShowCommentModal(false);
      loadComments();

    } catch (error: any) {
      console.error('Error submitting comment:', error);
      setAlertMessage(error.message || '❌ Error al enviar comentario');
      setShowAlert(true);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Función para reportar un comentario
  const reportComment = async (commentId: number) => {
    if (!authService.isAuthenticated()) {
      setAlertMessage('🔐 Debes iniciar sesión para reportar comentarios');
      setShowAlert(true);
      return;
    }

    try {
      // Solo pasar el reason como string
      await commentService.reportComment(commentId, 'Contenido inapropiado');
      setAlertMessage('🚩 Comentario reportado correctamente');
      setShowAlert(true);
    } catch (error: any) {
      console.error('Error reporting comment:', error);
      setAlertMessage(error.message || '❌ Error al reportar comentario');
      setShowAlert(true);
    }
  };

  // Función para editar comentario
  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditCommentData({
      content: comment.content,
      rating: comment.rating
    });
  };

  // Función para actualizar comentario
  const handleUpdateComment = async (commentId: number) => {
    try {
      await commentService.updateComment(commentId, editCommentData.content, editCommentData.rating);
      setAlertMessage('✅ Comentario actualizado');
      setShowAlert(true);
      setEditingCommentId(null);
      loadComments();
    } catch (error: any) {
      console.error('Error updating comment:', error);
      setAlertMessage(error.message || '❌ Error al actualizar comentario');
      setShowAlert(true);
    }
  };

  // Función para eliminar comentario
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este comentario?')) return;

    try {
      await commentService.deleteComment(commentId);
      setAlertMessage('✅ Comentario eliminado');
      setShowAlert(true);
      loadComments();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      setAlertMessage(error.message || '❌ Error al eliminar comentario');
      setShowAlert(true);
    }
  };

  // Función para cargar respuestas
  const handleLoadReplies = async (commentId: number) => {
    try {
      setLoadingReplies({ ...loadingReplies, [commentId]: true });
      const repliesData = await commentService.getCommentReplies(commentId);
      setReplies({ ...replies, [commentId]: repliesData.replies || [] });
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies({ ...loadingReplies, [commentId]: false });
    }
  };

  // Función para crear respuesta
  const handleCreateReply = async (commentId: number) => {
    if (!replyContent.trim()) {
      setAlertMessage('📝 Escribe una respuesta');
      setShowAlert(true);
      return;
    }

    try {
      await commentService.createReply(commentId, replyContent.trim());
      setAlertMessage('✅ Respuesta enviada');
      setShowAlert(true);
      setShowReplyInput(null);
      setReplyContent('');
      handleLoadReplies(commentId);
    } catch (error: any) {
      console.error('Error creating reply:', error);
      setAlertMessage(error.message || '❌ Error al enviar respuesta');
      setShowAlert(true);
    }
  };

  // Función para calcular el porcentaje de cada rating
  const calculateRatingPercentage = (rating: number) => {
    const total = Object.values(commentStats.rating_distribution).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return (commentStats.rating_distribution[rating as keyof typeof commentStats.rating_distribution] / total) * 100;
  };

  // Función para renderizar estrellas
  const renderRatingStars = (rating: number, size: string = 'small') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IonIcon
          key={i}
          icon={star}
          color={i <= rating ? 'warning' : 'medium'}
          className={size}
        />
      );
    }
    return <div className={`rating-stars ${size}`}>{stars}</div>;
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (product) {
      checkFavoriteStatus();
      loadRelatedProducts();
      loadComments();
    }
  }, [product, checkFavoriteStatus]);

  const loadProductDetail = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProduct(Number(id));

      // Lógica de Vistas Únicas por Usuario
      const viewedKey = `viewed_product_${id}`;
      const hasViewed = localStorage.getItem(viewedKey);

      if (!hasViewed) {
        // Si no lo ha visto, incrementar y marcar como visto
        await productService.incrementView(Number(id));
        localStorage.setItem(viewedKey, 'true');
      }

      console.log('🔍 [DEBUG] full productData:', productData);
      console.log('🔍 [DEBUG] Seller Info:', {
        username: productData.seller_username,
        avatar: productData.seller_profile_picture,
        id: productData.user_id
      });

      // Procesar atributos si existen (vienen como JSONB)
      let parsedAttributes: { name: string; value: string }[] = [];
      if (productData.attributes) {
        const attrs = typeof productData.attributes === 'string'
          ? JSON.parse(productData.attributes)
          : productData.attributes;

        parsedAttributes = Object.entries(attrs).map(([name, value]) => ({
          name,
          value: String(value)
        }));
      }

      // Si no hay atributos en BD, usar los básicos
      if (parsedAttributes.length === 0) {
        parsedAttributes = [
          { name: 'Marca', value: productData.brand || 'Genérica' },
          { name: 'Modelo', value: productData.model || '2024' },
          { name: 'Color', value: productData.color || 'Negro' },
          { name: 'Estado', value: productData.condition === 'new' ? 'Nuevo' : 'Usado' }
        ];
      }

      const enhancedProduct = {
        ...productData,
        attributes: parsedAttributes,
        warranty: 'Garantía del vendedor',
        returns: true,
        free_shipping: true,
        installments: 12,
        interest_free: true,
        questions: [
          { question: '¿Tiene garantía?', answer: 'Sí, 6 meses', date: '2024-01-15' },
          { question: '¿Hacen envíos a todo el país?', answer: 'Sí, por Envíos Express VE', date: '2024-01-10' }
        ]
      };

      setProduct(enhancedProduct);
    } catch (error: any) {
      console.error('Error loading product:', error);
      setError('Error al cargar el producto');
      setShowAlert(true);
      setAlertMessage('No se pudo cargar la información del producto');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadProductDetail();
    if (product) {
       await checkFavoriteStatus();
       await loadRelatedProducts();
       await loadComments();
    }
    event.detail.complete();
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const addToCart = async () => {
    try {
      await cartService.addToCart(product.id, quantity);
      setAlertMessage('✅ Producto agregado al carrito');
      setShowAlert(true);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setAlertMessage('❌ Error al agregar al carrito');
      setShowAlert(true);
    }
  };

  const buyNow = async () => {
    try {
      await cartService.addToCart(product.id, quantity);
      history.push('/cart');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setAlertMessage('❌ Error al agregar al carrito');
      setShowAlert(true);
    }
  };

  const toggleFavorite = async () => {
    if (!authService.isAuthenticated()) {
      setAlertMessage('🔐 Debes iniciar sesión para usar favoritos');
      setShowAlert(true);
      setTimeout(() => history.push('/login'), 1500);
      return;
    }

    if (!product) return;

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await favoriteService.removeFavorite(product.id);
        setIsFavorite(false);
        setAlertMessage('❤️ Removido de favoritos');
      } else {
        await favoriteService.addFavorite(product.id);
        setIsFavorite(true);
        setAlertMessage('💚 Agregado a favoritos');
      }

      setShowAlert(true);

    } catch (error: any) {
      console.error('Error in toggleFavorite:', error);
      setIsFavorite(prev => !prev);

      if (error.response?.status === 401) {
        setAlertMessage('🔐 Sesión expirada. Por favor, inicia sesión nuevamente.');
        authService.logout();
      } else {
        setAlertMessage('❌ Error al actualizar favoritos');
      }

      setShowAlert(true);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatRating = (rating: any, reviewsCount?: any): string | null => {
    const count = parseInt(reviewsCount) || 0;
    if (count === 0 || rating === null || rating === undefined) return null;
    return parseFloat(rating).toFixed(1);
  };

  const calculateInstallment = (price: number, installments: number) => {
    return formatPrice(price / installments);
  };

  const debugImageUrls = () => {
    console.log('🔍 Debug de imágenes:');
    console.log('📦 Producto principal:', product?.image_url);
    console.log('🖼️ Imágenes del producto:', product?.images);
    console.log('🔗 Productos relacionados:', relatedProducts.map(p => ({
      id: p.id,
      name: p.name,
      image_url: p.image_url
    })));
    console.log('👀 También vistos:', alsoViewedProducts.map(p => ({
      id: p.id,
      name: p.name,
      image_url: p.image_url
    })));
  };

  useEffect(() => {
    if (relatedProducts.length > 0 || alsoViewedProducts.length > 0) {
      debugImageUrls();
    }
  }, [relatedProducts, alsoViewedProducts]);

  // Función para navegar a producto relacionado
  const navigateToRelatedProduct = (productId: number) => {
    history.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando producto...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !product) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/store" text="" />
            </IonButtons>
            <IonTitle>Producto no encontrado</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="error-container">
            <p>{error || 'El producto no existe'}</p>
            <IonButton onClick={() => history.push('/store')}>
              Volver a la tienda
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const currentImage = product.images?.[currentImageIndex] || product;

  return (
    <IonPage>
      <IonHeader className="product-header ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/store" text="" />
          </IonButtons>
          <IonTitle className="product-title-header">{product.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleFavorite} disabled={favoriteLoading} className="favorite-button">
              <IonIcon
                icon={isFavorite ? heart : heartOutline}
                color={isFavorite ? "danger" : "dark"}
              />
            </IonButton>
            <IonButton className="share-button" onClick={async () => {
              const currentUrl = window.location.href;
              try {
                // Check if running on native platform
                const isNative = (window as any).Capacitor?.isNativePlatform();

                if (isNative) {
                  await Share.share({
                    title: product.name,
                    text: `Mira este producto en DeTodito: ${product.name}`,
                    url: currentUrl,
                    dialogTitle: 'Compartir producto',
                  });
                } else if (navigator.share && navigator.canShare({ url: currentUrl })) {
                  // Fallback to Web Share API
                  await navigator.share({
                    title: product.name,
                    text: `Mira este producto en DeTodito: ${product.name}`,
                    url: currentUrl,
                  });
                } else {
                  // Fallback to Clipboard
                  await navigator.clipboard.writeText(currentUrl);
                  setAlertMessage('📋 ¡Enlace copiado al portapapeles!');
                  setShowAlert(true);
                }
              } catch (error) {
                console.error('Error sharing:', error);
                // Fallback copy if share fails
                try {
                  await navigator.clipboard.writeText(currentUrl);
                  setAlertMessage('📋 ¡Enlace copiado al portapapeles!');
                  setShowAlert(true);
                } catch (e) {
                  console.error('Clipboard failed', e);
                }
              }
            }}>
              <IonIcon icon={shareOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="product-detail-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {/* Galería de Imágenes */}
        <div className="image-gallery">
          <div className="main-image-container">
            <ProductImage
              imageUrl={currentImage.image_url}
              alt={product.name}
              className="main-image"
            />

            {product.images && product.images.length > 1 && (
              <>
                <div className="image-counter">
                  {currentImageIndex + 1} / {product.images.length}
                </div>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {product.images && product.images.length > 1 && (
            <div className="thumbnails">
              {product.images.map((image: any, index: number) => (
                <div
                  key={image.id || index}
                  className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <ProductImage
                    imageUrl={image.image_url}
                    alt={`${product.name} ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información Principal */}
        <div className="product-main-info">
          {/* Estado y Condición */}
          <div className="product-status">
            <IonChip color="success" className="condition-chip">
              {product.condition === 'new' ? 'Nuevo' : 'Usado'}
            </IonChip>
            {/* Etiqueta de Nuevo (Reciente) si tiene menos de 7 días */}
            {new Date().getTime() - new Date(product.created_at).getTime() < 7 * 24 * 60 * 60 * 1000 && (
              <IonChip color="primary" className="new-tag-chip">
                ¡NUEVO!
              </IonChip>
            )}
            <span className="stock-text">{product.stock} disponibles</span>
          </div>

          {/* Título */}
          <h1 className="product-title">{product.name}</h1>

          {/* Precio */}
          <div className="price-section">
            <div className="current-price">{formatPrice(product.price)}</div>
          </div>

          {/* Cantidad */}
          <div className="quantity-section">
            <IonLabel>Cantidad:</IonLabel>
            <div className="quantity-selector">
              <IonButton
                fill="clear"
                size="small"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                -
              </IonButton>
                <span className="quantity-value">{product.stock > 0 ? quantity : 0}</span>
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  disabled={product.stock === 0 || quantity >= product.stock}
                >
                  +
                </IonButton>
                <span className="stock-info">
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                </span>
            </div>
          </div>
        </div>

        {/* Información del Vendedor */}
        {/* Información del Vendedor V4 */}
        <div className="seller-card">
          <div className="custom-card-content">
            <div className="seller-header">
              <IonAvatar className="seller-avatar">
                <img
                  src={
                    product.seller_profile_picture
                      ? (product.seller_profile_picture.startsWith('http')
                        ? product.seller_profile_picture
                        : `${environment.apiUrl.replace('/api', '')}${product.seller_profile_picture.startsWith('/') ? '' : '/'}${product.seller_profile_picture.startsWith('uploads') ? '' : 'uploads/'}${product.seller_profile_picture}`)
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(product.seller_username)}&background=random`
                  }
                  alt={product.seller_username}
                />
              </IonAvatar>
              <div className="seller-info">
                <div className="seller-name">{product.seller_username}</div>
                <div className="seller-details">
                  <div className="rating-mini">
                    <IonIcon icon={star} color="warning" />
                    <span>{product.seller_rating}</span>
                  </div>
                  <span className="sales-count">• {product.seller_sales} ventas</span>
                </div>
              </div>
              <IonButton fill="clear" size="small" className="v4-action-btn" onClick={() => history.push(`/seller-profile/${product.user_id}`)}>
                <IonIcon icon={chevronForward} />
              </IonButton>
            </div>

            <div className="seller-features">
              <div className="feature">
                <IonIcon icon={checkmarkCircleOutline} color="success" />
                <span>Vendedor verificado</span>
              </div>
              <div className="feature">
                <IonIcon icon={shieldCheckmarkOutline} color="primary" />
                <span>Compra Protegida</span>
              </div>
            </div>
          </div>
        </div>

        {/* Características */}
        {/* Características */}
        <div className="features-card">
          <div className="custom-card-content">
            <h3>Características</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-name">Categoría</span>
                <span className="feature-value">{product.category_name || 'General'}</span>
              </div>
              {product.attributes?.map((attr: any, index: number) => (
                <div key={index} className="feature-item">
                  <span className="feature-name">{attr.name}</span>
                  <span className="feature-value">{attr.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secciones de Información */}
        {/* Secciones de Información V4 Segmented Control */}
        <IonSegment value={activeSection} onIonChange={e => setActiveSection(e.detail.value as string)} mode="ios" className="v4-segment">
          <IonSegmentButton value="description">
            <IonLabel>Descripción</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="comments">
            <IonLabel>Opiniones ({commentStats.total_comments})</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="questions">
            <IonLabel>Preguntas</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Contenido de las secciones */}
        <div className="section-content">
          {activeSection === 'description' && (
            <div className="description-content v4-card">
              <h4>Descripción del producto</h4>
              <p>{product.description || 'Este producto no tiene descripción.'}</p>
            </div>
          )}



          {/* SECCIÓN DE PREGUNTAS V4 */}
          {activeSection === 'questions' && (
            <div className="questions-content v4-card">
              <h4>Preguntas y respuestas</h4>
              {product.questions?.length > 0 ? (
                product.questions.map((q: any, index: number) => (
                  <div key={index} className="question-item">
                    <div className="question">{q.question}</div>
                    <div className="answer">{q.answer}</div>
                    <div className="question-date">{q.date}</div>
                  </div>
                ))
              ) : (
                <div className="empty-questions-v4">
                  <IonIcon icon={chatbubbleOutline} />
                  <p>Aún no hay preguntas. ¡Sé el primero en preguntar!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* COMPONENTE DE COMENTARIOS COMPLETO - Delegación a componente V4 */}
        <div style={{ display: activeSection === 'comments' ? 'block' : 'none' }}>
          <ProductComments productId={parseInt(id)} />
        </div>

        {/* Productos Relacionados V4 */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section v4-card">
            <div className="custom-card-content">
              <div className="section-header">
                <h3>Productos relacionados</h3>
                <IonButton fill="clear" size="small" className="v4-view-all" routerLink={`/category/${product.category_id}`}>
                  Ver todos
                </IonButton>
              </div>

              <div className="related-products-scroll">
                {relatedProducts.map((relatedProduct: any) => (
                  <div
                    key={relatedProduct.id}
                    className="related-product-item"
                    onClick={() => navigateToRelatedProduct(relatedProduct.id)}
                  >
                    <div className="related-product-image">
                      {relatedProduct.discount > 0 && (
                        <div className="related-discount-badge">-{relatedProduct.discount}%</div>
                      )}
                      <ProductImage
                        imageUrl={relatedProduct.image_url}
                        images={relatedProduct.images}
                        alt={relatedProduct.name}
                        className="related-product-img"
                      />
                    </div>
                    <div className="related-product-info">
                      <p className="related-product-name">{relatedProduct.name}</p>
                      <div className="related-product-rating">
                        <IonIcon icon={star} color={formatRating(relatedProduct.rating, relatedProduct.reviews_count) ? "warning" : "medium"} />
                        <span>{formatRating(relatedProduct.rating, relatedProduct.reviews_count) ?? 'Nuevo'}</span>
                      </div>
                      <div className="related-product-price">
                        {relatedProduct.discount > 0 ? (
                          <>
                            <div className="related-current-price">
                              {formatPrice(calculateDiscountPrice(relatedProduct.price, relatedProduct.discount))}
                            </div>
                            <div className="related-original-price">
                              {formatPrice(relatedProduct.price)}
                            </div>
                          </>
                        ) : (
                          <div className="related-current-price">
                            {formatPrice(relatedProduct.price)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Otros usuarios también vieron V4 */}
        {alsoViewedProducts.length > 0 && (
          <div className="also-viewed-section v4-card">
            <div className="custom-card-content">
              <div className="section-header">
                <h3>Otros usuarios también vieron</h3>
              </div>

              <IonList className="also-viewed-list ion-no-padding">
                {alsoViewedProducts.map((prod: any) => (
                  <IonItem
                    key={prod.id}
                    button
                    detail={false}
                    onClick={() => navigateToRelatedProduct(prod.id)}
                    className="also-viewed-item-v4"
                  >
                    <IonThumbnail slot="start" className="also-viewed-thumbnail">
                      <ProductImage
                        imageUrl={prod.image_url}
                        images={prod.images}
                        alt={prod.name}
                        className="also-viewed-img"
                      />
                    </IonThumbnail>

                    <IonLabel className="also-viewed-info">
                      <h4 className="also-viewed-name">{prod.name}</h4>
                      <div className="also-viewed-rating">
                        <IonIcon icon={star} color={formatRating(prod.rating, prod.reviews_count) ? "warning" : "medium"} />
                        <span>{formatRating(prod.rating, prod.reviews_count) ?? 'Nuevo'}</span>
                      </div>
                      <div className="also-viewed-price">
                        {formatPrice(prod.price)}
                      </div>
                    </IonLabel>
                    <IonIcon icon={chevronForward} slot="end" color="medium" className="v4-arrow" />
                  </IonItem>
                ))}
              </IonList>
            </div>
          </div>
        )}

        {/* Modal para escribir comentario */}
        <IonModal isOpen={showCommentModal} onDidDismiss={() => setShowCommentModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Escribir opinión</IonTitle>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowCommentModal(false)}>Cancelar</IonButton>
              </IonButtons>
              <IonButtons slot="end">
                <IonButton
                  onClick={submitComment}
                  disabled={submittingComment || !newComment.content.trim()}
                >
                  {submittingComment ? <IonSpinner /> : 'Enviar'}
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div className="comment-form">
              <IonText>
                <h4>Califica este producto</h4>
              </IonText>

              <div className="rating-selector">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <IonButton
                    key={starValue}
                    fill="clear"
                    size="large"
                    onClick={() => setNewComment({ ...newComment, rating: starValue })}
                  >
                    <IonIcon
                      icon={star}
                      color={starValue <= newComment.rating ? 'warning' : 'medium'}
                    />
                  </IonButton>
                ))}
              </div>

              <IonTextarea
                placeholder="Comparte tu experiencia con este producto..."
                value={newComment.content}
                onIonInput={(e) => setNewComment({ ...newComment, content: e.detail.value! })}
                rows={6}
                autoGrow={true}
                className="comment-textarea"
              />

              <IonText color="medium">
                <small>
                  Tu opinión será revisada antes de publicarse para mantener la calidad de la comunidad.
                </small>
              </IonText>
            </div>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Aviso'}
          message={alertMessage}
          buttons={['OK']}
        />

      </IonContent>

      {/* Footer Fijo - Botones de Compra */}
      <IonFooter className="product-footer">
        <IonToolbar>
          <div className="footer-buttons">
            {authService.getCurrentUser()?.id === product?.user_id ? (
              <div className="own-product-badge">
                <IonIcon icon={storefront} slot="start" />
                <IonText color="primary">
                  Este es tu producto
                </IonText>
              </div>
            ) : (
              <>
                <IonButton
                  fill="outline"
                  color={product?.stock === 0 ? "medium" : "primary"}
                  className="cart-button"
                  onClick={addToCart}
                  disabled={product?.stock === 0}
                >
                  <IonIcon icon={cart} slot="start" />
                  {product?.stock === 0 ? 'Sin Stock' : 'Agregar'}
                </IonButton>

                <IonButton
                  expand="block"
                  color={product?.stock === 0 ? "medium" : "primary"}
                  className="buy-button"
                  onClick={buyNow}
                  disabled={product?.stock === 0}
                >
                  {product?.stock === 0 ? 'Agotado' : 'Comprar ahora'}
                </IonButton>
              </>
            )}
          </div>

        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default ProductDetail;