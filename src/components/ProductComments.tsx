// frontend/src/components/ProductComments.tsx - VERSIÓN CORREGIDA Y REFINADA
import React, { useState, useEffect } from 'react';
import {
  IonAvatar,
  IonLabel,
  IonText,
  IonButton,
  IonIcon,
  IonTextarea,
  IonAlert,
  IonLoading,
  IonBadge
} from '@ionic/react';
import {
  chatbubbleEllipses, send, trash, create, flag,
  caretDown, caretUp, star, starOutline
} from 'ionicons/icons';
import {
  commentService,
  Comment,
  CommentStats // Added missing interface
} from '../services/commentService';
import { authService } from '../services/authService';
import './ProductComments.css';

interface ProductCommentsProps {
  productId: number;
}

import { useIonToast } from '@ionic/react'; // Ensure this is imported at the top

const ProductComments: React.FC<ProductCommentsProps> = ({ productId }) => { // eventId removed as it caused lint error if not in props
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [stats, setStats] = useState<CommentStats>({
    total_comments: 0,
    average_rating: 0,
    five_stars: 0,
    four_stars: 0,
    three_stars: 0,
    two_stars: 0,
    one_stars: 0
  });

  const [repliesData, setRepliesData] = useState<{ [key: number]: Comment[] }>({});
  const [expandedReplies, setExpandedReplies] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [displayedCount, setDisplayedCount] = useState(5); // Restored

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportCommentId, setReportCommentId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [editingType, setEditingType] = useState<'comment' | 'reply'>('comment');
  const [deletingType, setDeletingType] = useState<'comment' | 'reply'>('comment');
  const [activeParentId, setActiveParentId] = useState<number | null>(null);

  /* Hook para Toasts */
  const [present] = useIonToast();

  useEffect(() => {
    // Sincronizar perfil para evitar desajustes de auth
    if (authService.isAuthenticated()) {
      authService.getProfile().catch(err => console.error('Auto-sync profile failed', err));
    }
    loadComments();
  }, [productId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getProductComments(productId);
      setComments(response.comments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!authService.isAuthenticated()) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    if (!newComment.trim()) {
      alert('Por favor escribe un comentario');
      return;
    }

    try {
      setSubmitting(true);
      await commentService.createComment(productId, newComment.trim(), rating);
      setNewComment('');
      setRating(5);
      loadComments();
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      alert(error.message || 'Error al enviar comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!authService.isAuthenticated()) {
      alert('Debes iniciar sesión para responder');
      return;
    }

    if (!replyContent.trim()) {
      alert('Por favor escribe una respuesta');
      return;
    }

    console.log(`✍️ Enviando respuesta a comentario ${commentId}: "${replyContent}"`);
    try {
      setSubmitting(true);
      await commentService.createReply(commentId, replyContent.trim());
      setReplyingTo(null);
      setReplyContent('');
      loadReplies(commentId);
    } catch (error: any) {
      console.error('Error submitting reply:', error);
      alert(error.message || 'Error al enviar respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    try {
      setSubmitting(true);
      if (editingType === 'reply') {
        await commentService.updateReply(commentId, editContent.trim());
        if (activeParentId) loadReplies(activeParentId);
      } else {
        await commentService.updateComment(commentId, editContent.trim(), editRating);
      }
      setEditingComment(null);
      setEditContent('');
      loadComments();
    } catch (error: any) {
      console.error('Error updating comment:', error);

      if (error.response?.status === 403 || error.message?.includes('403')) {
        alert('Sesión inválida o permisos insuficientes. Se cerrará la sesión para corregirlo.');
        authService.logout();
        return;
      }

      alert(error.message || 'Error al actualizar comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      if (deletingType === 'reply') {
        await commentService.deleteReply(commentId);
        if (activeParentId) loadReplies(activeParentId);
      } else {
        await commentService.deleteComment(commentId);
      }
      setShowDeleteAlert(false);
      setDeleteCommentId(null);
      loadComments();
    } catch (error: any) {
      console.error('Error deleting comment:', error);

      if (error.response?.status === 403 || error.message?.includes('403')) {
        alert('Sesión inválida o permisos insuficientes. Se cerrará la sesión para corregirlo.');
        authService.logout();
        return;
      }

      alert('Error al eliminar comentario');
    }
  };

  const handleReportComment = async (commentId: number, reason: string) => {
    if (!commentId || !reason) return;
    try {
      await commentService.reportComment(commentId, reason);
      setShowReportDialog(false);
      setReportCommentId(null);
      setReportReason('');

      present({
        message: 'Reporte enviado correctamente. Gracias por ayudarnos.',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      loadComments();
    } catch (error: any) {
      console.error('Error reporting comment:', error);
      present({
        message: error.message || 'Error al reportar comentario',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
    }
  };

  const loadReplies = async (commentId: number) => {
    try {
      const response = await commentService.getCommentReplies(commentId);
      setRepliesData({ ...repliesData, [commentId]: response.replies });
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const toggleReplies = async (commentId: number) => {
    if (expandedReplies.includes(commentId)) {
      setExpandedReplies(expandedReplies.filter(id => id !== commentId));
    } else {
      setExpandedReplies([...expandedReplies, commentId]);
      if (!repliesData[commentId]) await loadReplies(commentId);
    }
  };

  const isCommentOwner = (comment: Comment) => {
    const currentUser = authService.getCurrentUser();
    return currentUser?.id === comment.user_id;
  };

  const renderStars = (ratingValue: number | null | undefined) => {
    if (!ratingValue) return null;
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <IonIcon
            key={starValue}
            icon={starValue <= ratingValue ? star : starOutline}
            color="warning"
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = isCommentOwner(comment);
    const isExpanded = expandedReplies.includes(comment.id);
    const replies = repliesData[comment.id] || [];
    const replyCount = comment.reply_count || 0;
    const hasReplies = replies.length > 0 || replyCount > 0;

    return (
      <div key={comment.id} className={`comment-item ${isReply ? 'reply' : ''}`}>
        <div className="comment-date-corner">
          {formatDate(comment.created_at)}
        </div>
        <div className="comment-header-row">
          <IonAvatar className="comment-avatar">
            <img
              src={comment.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.username)}&background=random`}
              alt={comment.username}
            />
          </IonAvatar>
          <div className="comment-user-info">
            <h4>{comment.username}</h4>
            <div className="comment-meta">
              {comment.edited && <span>Editado</span>}
              {comment.rating && <span>{comment.edited ? ' · ' : ''}{renderStars(comment.rating)}</span>}
            </div>
            {isOwner && (
              <div className="comment-owner-status">
                {!comment.is_approved && comment.moderation_status === 'review' && (
                  <IonBadge color="warning" mode="ios">En revisión</IonBadge>
                )}
                {!comment.is_active && comment.moderation_status === 'flagged' && (
                  <IonBadge color="danger" mode="ios">Oculto (Contiene lenguaje ofensivo)</IonBadge>
                )}
              </div>
            )}
          </div>

          <div className="comment-header-actions">
            {!isReply && (
              <IonButton size="small" fill="clear" onClick={() => {
                if (replyingTo !== comment.id) setReplyContent('');
                setReplyingTo(replyingTo === comment.id ? null : comment.id);
              }}>
                <IonIcon icon={chatbubbleEllipses} />
              </IonButton>
            )}
            {isOwner && !comment.is_reported && (
              <IonButton size="small" fill="clear" onClick={() => {
                setEditingType(isReply ? 'reply' : 'comment');
                setEditingComment(comment.id);
                if (isReply) setActiveParentId(comment.comment_id || null);
                setEditContent(comment.content);
                setEditRating(comment.rating || 5);
              }}>
                <IonIcon icon={create} />
              </IonButton>
            )}
            {!isOwner && (
              <IonButton size="small" fill="clear" color="danger" onClick={() => {
                setReportCommentId(comment.id);
                setShowReportDialog(true);
              }}>
                <IonIcon icon={flag} />
              </IonButton>
            )}
            {isOwner && !comment.is_reported && (
              <IonButton size="small" fill="clear" color="danger" onClick={() => {
                setDeletingType(isReply ? 'reply' : 'comment');
                setDeleteCommentId(comment.id);
                if (isReply) setActiveParentId(comment.comment_id || null);
                setShowDeleteAlert(true);
              }}>
                <IonIcon icon={trash} />
              </IonButton>
            )}
          </div>
        </div>

        <div className="comment-body-content">
          {comment.is_reported ? (
            <IonText color="medium"><p><em>Este comentario está en revisión</em></p></IonText>
          ) : editingComment === comment.id ? (
            <div className="edit-comment-area">
              <IonTextarea value={editContent} onIonInput={e => setEditContent(e.detail.value!)} rows={3} />
              <div className="edit-rating-stars">
                {[1, 2, 3, 4, 5].map(v => (
                  <IonIcon key={v} icon={v <= editRating ? star : starOutline} color="warning" onClick={() => setEditRating(v)} />
                ))}
              </div>
              <div className="edit-btn-group">
                <IonButton size="small" onClick={() => handleUpdateComment(comment.id)}>Guardar</IonButton>
                <IonButton size="small" fill="outline" onClick={() => setEditingComment(null)}>Cancelar</IonButton>
              </div>
            </div>
          ) : (
            <p>{comment.content}</p>
          )}
        </div>

        {hasReplies && !isReply && (
          <div className="replies-toggle">
            <IonButton size="small" fill="clear" onClick={() => toggleReplies(comment.id)}>
              <IonIcon icon={isExpanded ? caretUp : caretDown} slot="start" />
              {replyCount || replies.length} {replyCount === 1 ? 'respuesta' : 'respuestas'}
            </IonButton>
          </div>
        )}

        {replyingTo === comment.id && !isReply && (
          <div className="reply-form-area">
            <IonTextarea
              value={replyContent}
              onIonInput={e => setReplyContent(e.detail.value!)}
              rows={2}
              placeholder="Escribe una respuesta..."
            />
            <div className="reply-btn-group">
              <IonButton size="small" onClick={() => handleSubmitReply(comment.id)}><IonIcon icon={send} slot="start" />Responder</IonButton>
              <IonButton size="small" fill="outline" onClick={() => setReplyingTo(null)}>Cancelar</IonButton>
            </div>
          </div>
        )}

        {isExpanded && replies.length > 0 && (
          <div className="replies-list-container">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <IonLoading isOpen={true} message="Cargando..." />;

  return (
    <div className="product-opinions-wrapper">
      <div className="opinions-section-header">
        <h2><IonIcon icon={chatbubbleEllipses} /> Opiniones ({comments.length})</h2>
      </div>

      <div className="new-opinion-card">
        <IonTextarea value={newComment} onIonChange={e => setNewComment(e.detail.value!)} rows={3} placeholder="¿Qué te pareció el producto?" disabled={submitting} />
        <div className="new-opinion-actions">
          <div className="rating-input-group">
            <span>Calificar:</span>
            {[1, 2, 3, 4, 5].map(v => (
              <IonIcon key={v} icon={v <= rating ? star : starOutline} color="warning" className="rating-input-star" onClick={() => setRating(v)} />
            ))}
          </div>
          <IonButton onClick={handleSubmitComment} disabled={submitting || !newComment.trim()}>Enviar</IonButton>
        </div>
      </div>

      <div className="opinions-list">
        {comments.length === 0 ? (
          <div className="empty-opinions"><p>Aún no hay opiniones.</p></div>
        ) : (
          <>
            {comments.slice(0, displayedCount).map(c => renderComment(c))}
            {comments.length > displayedCount && (
              <div className="load-more-comments">
                <IonButton
                  fill="clear"
                  expand="block"
                  onClick={() => setDisplayedCount(prev => prev + 5)}
                  className="show-more-btn"
                >
                  <IonIcon icon={caretDown} slot="start" />
                  Ver más opiniones ({comments.length - displayedCount} restantes)
                </IonButton>
              </div>
            )}
          </>
        )}
      </div>

      <IonAlert isOpen={showReportDialog} onDidDismiss={() => setShowReportDialog(false)} header="Reportar"
        inputs={[
          { name: 'reason', type: 'radio', label: 'Spam', value: 'spam' },
          { name: 'reason', type: 'radio', label: 'Inapropiado', value: 'inappropriate' },
          { name: 'reason', type: 'radio', label: 'Otro', value: 'other' }
        ]}
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Reportar',
            handler: data => {
              if (data && reportCommentId) handleReportComment(reportCommentId, data);
            }
          }
        ]}
      />

      <IonAlert isOpen={showDeleteAlert} onDidDismiss={() => setShowDeleteAlert(false)} header="Eliminar" message="¿Eliminar opinión?"
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Eliminar', handler: () => {
              if (deleteCommentId) handleDeleteComment(deleteCommentId);
            }
          }
        ]}
      />

      <IonLoading isOpen={submitting} message="Procesando..." />
    </div>
  );
};

export default ProductComments;