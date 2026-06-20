// frontend/src/pages/FeedbackPage.tsx
import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonAlert,
  IonLoading,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonRange
} from '@ionic/react';
import {
  send, star, bulb, bug, rocket, heart,
  starOutline, chatbubbleEllipses, checkmarkCircle,
  thumbsUp, flash, sparkles, chevronForward
} from 'ionicons/icons';
import './FeedbackPage.css';

const FeedbackPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [rating, setRating] = useState(5);
  const [feedbackForm, setFeedbackForm] = useState({
    title: '',
    message: '',
    email: '',
    allowContact: true
  });

  const feedbackTypes = [
    { id: 'suggestion', title: 'Sugerencia', icon: bulb, color: 'warning', desc: 'Mejorar algo' },
    { id: 'bug', title: 'Error / Bug', icon: bug, color: 'danger', desc: 'Algo falla' },
    { id: 'feature', title: 'Nueva función', icon: rocket, color: 'primary', desc: 'Qué falta' },
    { id: 'compliment', title: 'Elogio', icon: heart, color: 'success', desc: 'Qué te gusta' }
  ];

  const ratingLabels = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  const handleInputChange = (field: string, value: any) => {
    setFeedbackForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.message.trim()) {
      setAlertMessage('Por favor, escribe tu mensaje');
      setShowAlert(true);
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setShowSuccess(true);
    setFeedbackForm({ title: '', message: '', email: '', allowContact: true });
    setFeedbackType('suggestion');
    setRating(5);
    setLoading(false);
  };

  return (
    <IonPage className="feedback-page-v6">
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" text="" />
          </IonButtons>
          <IonTitle>Enviar Feedback</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="feedback-content-v6">
        <IonList lines="none" className="more-list">

          {/* Header style User-Header */}
          <IonItem className="user-header feedback-hero">
            <div className="feedback-header-icon" slot="start">
              <IonIcon icon={chatbubbleEllipses} />
            </div>
            <IonLabel>
              <h2>Tu Opinión</h2>
              <IonNote color="medium">Ayúdanos a mejorar cada día</IonNote>
            </IonLabel>
          </IonItem>

          <div className="section-title">
            <IonNote color="medium"><small>TIPO DE FEEDBACK</small></IonNote>
          </div>

          <div className="v6-type-grid-container">
            {feedbackTypes.map(type => (
              <IonItem
                key={type.id}
                className={`type-item-v6 ${feedbackType === type.id ? 'active' : ''}`}
                button
                onClick={() => setFeedbackType(type.id)}
              >
                <div className={`v6-type-dot ${type.color}`} slot="start">
                  <IonIcon icon={type.icon} />
                </div>
                <IonLabel>
                  <h3>{type.title}</h3>
                  <IonNote color="medium">{type.desc}</IonNote>
                </IonLabel>
                {feedbackType === type.id && <IonIcon icon={checkmarkCircle} color="primary" slot="end" />}
              </IonItem>
            ))}
          </div>

          <div className="section-title">
            <IonNote color="medium"><small>CALIFICACIÓN</small></IonNote>
          </div>

          <IonItem className="rating-item-v6">
            <div className="rating-v6-wrapper">
              <div className="stars-row-v6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <IonIcon
                    key={s}
                    icon={s <= rating ? star : starOutline}
                    className={s <= rating ? 'star-on' : 'star-off'}
                    onClick={() => setRating(s)}
                  />
                ))}
              </div>
              <div className="rating-label-v6">
                <h3>{ratingLabels[rating - 1]}</h3>
              </div>
              <IonRange
                min={1}
                max={5}
                step={1}
                snaps={true}
                value={rating}
                onIonChange={(e) => setRating(e.detail.value as number)}
                className="v6-range-slider"
              />
            </div>
          </IonItem>

          <div className="section-title">
            <IonNote color="medium"><small>MENSAJE</small></IonNote>
          </div>

          <div className="feedback-form-v6">
            <div className="v6-card-form">
              <div className="v6-field">
                <label>Asunto (opcional)</label>
                <input
                  type="text"
                  value={feedbackForm.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Resumen corto"
                />
              </div>

              <div className="v6-field">
                <label>Tu comentario</label>
                <textarea
                  rows={5}
                  value={feedbackForm.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Explícanos con detalle..."
                />
              </div>

              <div className="v6-field">
                <label>Tu email (opcional)</label>
                <input
                  type="email"
                  value={feedbackForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Para responderte"
                />
              </div>

              <IonItem className="contact-allow-item" lines="none">
                <IonLabel>
                  <h3>Permitir contacto</h3>
                  <p>Solo si es necesario</p>
                </IonLabel>
                <IonSelect
                  interface="popover"
                  value={feedbackForm.allowContact}
                  onIonChange={(e) => handleInputChange('allowContact', e.detail.value)}
                >
                  <IonSelectOption value={true}>Sí</IonSelectOption>
                  <IonSelectOption value={false}>No</IonSelectOption>
                </IonSelect>
              </IonItem>

              <button className="v6-send-btn" onClick={handleSubmit} disabled={loading}>
                <IonIcon icon={send} />
                <span>{loading ? 'Enviando...' : 'Enviar Feedback'}</span>
              </button>
            </div>
          </div>

          <div className="section-title">
            <IonNote color="medium"><small>NUESTRO PROCESO</small></IonNote>
          </div>

          <div className="v6-timeline-container">
            <div className="v6-timeline-item">
              <div className="v6-dot active"><IonIcon icon={sparkles} /></div>
              <div className="v6-text">
                <h4>Recepción</h4>
                <p>Tu feedback llega directo a nuestro equipo.</p>
              </div>
            </div>
            <div className="v6-timeline-item">
              <div className="v6-dot"><IonIcon icon={flash} /></div>
              <div className="v6-text">
                <h4>Análisis</h4>
                <p>Estudiamos cómo implementarlo mejor.</p>
              </div>
            </div>
          </div>

        </IonList>

        <IonLoading isOpen={loading} message="Enviando..." />
        <IonAlert
          isOpen={showAlert}
          header="Feedback"
          message={alertMessage}
          buttons={['Cerrar']}
        />
        <IonAlert
          isOpen={showSuccess}
          header="¡Gracias!"
          message="Tu opinión nos ayuda a crecer."
          buttons={['Aceptar']}
          onDidDismiss={() => setShowSuccess(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default FeedbackPage;