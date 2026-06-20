// frontend/src/components/ChatBot.tsx - COMPLETE REDESIGN "MORE" STYLE
import React, { useState, useRef, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonText,
  IonAvatar,
  IonBadge,
  IonLabel,
  IonNote
} from '@ionic/react';
import {
  send, close, chatbubbleEllipses, helpCircle,
  person, logoWhatsapp, call, mail,
  chevronForward, sparkles, time as timeIcon
} from 'ionicons/icons';
import { getBotResponse } from './ChatBotResponses';
import axios from 'axios';
import { environment } from '../environments/environment';
import './ChatBot.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}


const ChatBot: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '¡Hola! Soy Juli, tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]); // Para el historial de Gemini
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLIonInputElement>(null);

  const quickActions = [
    { id: 'orders', text: 'Mis pedidos', icon: helpCircle },
    { id: 'payments', text: 'Pagos', icon: helpCircle },
    { id: 'shipping', text: 'Envíos', icon: helpCircle },
    { id: 'returns', text: 'Devoluciones', icon: helpCircle }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateBotResponse = async (userMessage: string) => {
    setIsTyping(true);

    try {
      // Intentar llamar a la IA en el backend
      const response = await axios.post(`${environment.apiUrl}/chatbot/ask`, {
        message: userMessage,
        chatHistory: chatHistory
      });

      const botReply = response.data.response;

      // Actualizar historial local para la siguiente consulta
      setChatHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: botReply }] }
      ]);

      addBotMessage(botReply);
    } catch (error) {
      console.error('Error calling AI API:', error);
      // Fallback al sistema local si la API falla
      const fallbackResponse = getBotResponse(userMessage);
      addBotMessage(fallbackResponse);
    } finally {
      setIsTyping(false);
    }
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    simulateBotResponse(text);
  };

  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now() + 1,
      text,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    addUserMessage(inputText);
    setInputText('');
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    addUserMessage(`Necesito ayuda con: ${action.text}`);
  };

  const handleContactOption = (method: string) => {
    switch (method) {
      case 'whatsapp':
        window.open('https://wa.me/584121234567', '_blank');
        break;
      case 'call':
        window.location.href = 'tel:+584121234567';
        break;
      case 'email':
        window.location.href = 'mailto:soporte@detodito.com';
        break;
    }
  };

  return (
    <>
      {isOpen && (
        <div className="chatbot-overlay-v6" onClick={onClose}>
          <div className="chatbot-container-v6" onClick={(e) => e.stopPropagation()}>
            <IonHeader className="ion-no-border">
              <IonToolbar className="chat-toolbar-v6">
                <IonTitle>
                  <div className="chat-header-v6">
                    <IonAvatar className="chat-bot-avatar-v6">
                      <img src="/assets/juli-avatar.jpg" alt="Juli Avatar" />
                    </IonAvatar>
                    <div className="chat-bot-info-v6">
                      <h2>Juli</h2>
                      <p>
                        <span className="status-dot-v6"></span>
                        En línea
                      </p>
                    </div>
                  </div>
                </IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={onClose}>
                    <IonIcon icon={close} />
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>

            <IonContent className="chat-content-v6">
              <IonList lines="none" className="more-list chat-list-v6">

                {/* Welcome Header */}
                <IonItem className="user-header chat-welcome-v6">
                  <div className="chat-welcome-icon" slot="start">
                    <IonIcon icon={sparkles} />
                  </div>
                  <IonLabel>
                    <h2>¡Hola! 👋</h2>
                    <IonNote color="medium">¿En qué puedo ayudarte?</IonNote>
                  </IonLabel>
                </IonItem>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                  <>
                    <div className="section-title">
                      <IonNote color="medium"><small>ACCIONES RÁPIDAS</small></IonNote>
                    </div>
                    {quickActions.map(action => (
                      <IonItem
                        key={action.id}
                        button
                        onClick={() => handleQuickAction(action)}
                        detail
                        className="chat-action-item-v6"
                      >
                        <IonIcon icon={action.icon} slot="start" color="primary" />
                        <IonLabel>{action.text}</IonLabel>
                      </IonItem>
                    ))}
                  </>
                )}

                {/* Messages */}
                <div className="chat-messages-v6">
                  {messages.map(message => (
                    <div key={message.id} className={`chat-msg-v6 ${message.sender}`}>
                      {message.sender === 'bot' && (
                        <IonAvatar className="msg-avatar-v6">
                          <img src="/assets/juli-avatar.jpg" alt="Juli" />
                        </IonAvatar>
                      )}
                      <div className="msg-bubble-v6">
                        <p>{message.text}</p>
                        <span className="msg-time-v6">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {message.sender === 'user' && (
                        <IonAvatar className="msg-avatar-v6 user">
                          <IonIcon icon={person} />
                        </IonAvatar>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="chat-msg-v6 bot">
                      <IonAvatar className="msg-avatar-v6">
                        <img src="/assets/juli-avatar.jpg" alt="Juli" />
                      </IonAvatar>
                      <div className="msg-bubble-v6 typing-v6">
                        <div className="typing-dots-v6">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Contact Options */}
                {messages.length > 3 && (
                  <>
                    <div className="section-title">
                      <IonNote color="medium"><small>CONTACTO DIRECTO</small></IonNote>
                    </div>
                    <IonItem button onClick={() => handleContactOption('whatsapp')} detail className="chat-action-item-v6">
                      <IonIcon icon={logoWhatsapp} slot="start" color="success" />
                      <IonLabel>WhatsApp</IonLabel>
                    </IonItem>
                    <IonItem button onClick={() => handleContactOption('call')} detail className="chat-action-item-v6">
                      <IonIcon icon={call} slot="start" color="primary" />
                      <IonLabel>Llamar</IonLabel>
                    </IonItem>
                  </>
                )}

              </IonList>
            </IonContent>

            {/* Input Area */}
            <div className="chat-input-v6">
              <div className="chat-input-wrapper-v6">
                <input
                  ref={inputRef as any}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escribe tu mensaje..."
                  className="chat-input-field-v6"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="chat-send-btn-v6"
                >
                  <IonIcon icon={send} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;