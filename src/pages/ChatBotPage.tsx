// frontend/src/pages/ChatBotPage.tsx
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
  IonButton,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge,
  IonNote
} from '@ionic/react';
import {
  chatbubbleEllipses, rocket, shield, time,
  helpCircle, checkmarkCircle, speedometer,
  star, person, settings, informationCircle,
  chevronForward, sparkles, chatbubbles
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import ChatBot from '../components/ChatBot';
import './ChatBotPage.css';

const ChatBotPage: React.FC = () => {
  const history = useHistory();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const features = [
    {
      icon: speedometer,
      title: 'Respuesta rápida',
      description: 'Consultas en segundos'
    },
    {
      icon: shield,
      title: 'Info confiable',
      description: 'Datos precisos'
    },
    {
      icon: time,
      title: '24/7 Disponible',
      description: 'Ayuda siempre'
    },
    {
      icon: person,
      title: 'Personal',
      description: 'Adaptado a ti'
    }
  ];

  const popularTopics = [
    { title: 'Problemas con pedidos', icon: helpCircle, count: 45 },
    { title: 'Métodos de pago', icon: helpCircle, count: 32 },
    { title: 'Políticas de envío', icon: helpCircle, count: 28 },
    { title: 'Devoluciones', icon: helpCircle, count: 24 }
  ];

  const stats = {
    resolved: 98,
    avgResponseTime: '45s',
    satisfaction: 96
  };

  const handleStartChat = () => setIsChatOpen(true);

  return (
    <IonPage className="chatbot-v6">
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/more" text="" />
          </IonButtons>
          <IonTitle>Juli</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="chatbot-content-v6">
        <IonList lines="none" className="more-list">

          {/* Header style User-Header consistent with More.tsx */}
          <IonItem className="user-header chatbot-hero-v6">
            <IonAvatar className="chatbot-header-avatar-v6" slot="start">
              <img src="/assets/juli-avatar.jpg" alt="Juli" />
            </IonAvatar>
            <IonLabel>
              <h2>Juli</h2>
              <IonNote color="medium">Tu asistente virtual inteligente</IonNote>
            </IonLabel>
          </IonItem>

          {/* Stats Bar (Floating horizontal) */}
          <div className="v6-stats-row">
            <div className="v6-stat-pill">
              <IonIcon icon={sparkles} />
              <span>{stats.resolved}% Éxito</span>
            </div>
            <div className="v6-stat-pill">
              <IonIcon icon={speedometer} />
              <span>{stats.avgResponseTime}</span>
            </div>
            <div className="v6-stat-pill">
              <IonIcon icon={star} />
              <span>{stats.satisfaction}%</span>
            </div>
          </div>

          <div className="v6-action-box">
            <IonButton expand="block" mode="ios" className="v6-main-chat-btn" onClick={handleStartChat}>
              <IonIcon icon={chatbubbles} slot="start" />
              Chatear Ahora
            </IonButton>
          </div>

          <div className="section-title">
            <IonNote color="medium"><small>¿POR QUÉ USARLO?</small></IonNote>
          </div>

          <div className="v6-features-grid">
            {features.map((f, i) => (
              <div key={i} className="v6-feature-card">
                <IonIcon icon={f.icon} />
                <h4>{f.title}</h4>
                <p>{f.description}</p>
              </div>
            ))}
          </div>

          <div className="section-title">
            <IonNote color="medium"><small>TEMAS POPULARES</small></IonNote>
          </div>

          {popularTopics.map((topic, index) => (
            <IonItem key={index} button onClick={handleStartChat} detail className="edit-item-v6">
              <IonIcon icon={topic.icon} slot="start" color="primary" />
              <IonLabel>
                <h3>{topic.title}</h3>
                <p>{topic.count}+ consultas resueltas</p>
              </IonLabel>
              <IonBadge slot="end" color="light">{topic.count}</IonBadge>
            </IonItem>
          ))}

          <div className="section-title">
            <IonNote color="medium"><small>CONSEJOS</small></IonNote>
          </div>

          <IonItem className="edit-item-v6 no-click">
            <IonIcon icon={informationCircle} slot="start" color="success" />
            <IonLabel className="ion-text-wrap">
              <p className="v6-tip-txt">• Sé específico con tus pedidos</p>
              <p className="v6-tip-txt">• Incluye números de tracking</p>
              <p className="v6-tip-txt">• Pide ayuda humana si lo necesitas</p>
            </IonLabel>
          </IonItem>

          <div className="section-title">
            <IonNote color="medium"><small>CONTACTO ALTERNATIVO</small></IonNote>
          </div>

          <IonItem button onClick={() => history.push('/support')} detail className="edit-item-v6">
            <IonIcon icon={person} slot="start" color="medium" />
            <IonLabel>
              <h3>Contacto Humano</h3>
              <p>Habla con un agente</p>
            </IonLabel>
          </IonItem>

          <IonItem button onClick={() => history.push('/feedback')} detail className="edit-item-v6">
            <IonIcon icon={star} slot="start" color="medium" />
            <IonLabel>
              <h3>Enviar Feedback</h3>
              <p>Ayúdanos a mejorar</p>
            </IonLabel>
          </IonItem>

          <div className="v6-footer-note">
            <small>
              Nuestro asistente IA está en constante aprendizaje para servirte mejor.
            </small>
          </div>

        </IonList>

        <ChatBot
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default ChatBotPage;