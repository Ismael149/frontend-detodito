// frontend/src/pages/CustomerSupport.tsx
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
  IonAccordion,
  IonAccordionGroup,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import {
  headset, call, mail, chatbubble, helpCircle,
  informationCircle, documentText, time, star,
  send, checkmarkCircle, location, globe,
  chevronForward, logoWhatsapp, chatbubbles
} from 'ionicons/icons';
import './CustomerSupport.css';

const CustomerSupport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const faqCategories = [
    {
      id: 'account',
      title: 'Cuenta y Perfil',
      icon: helpCircle,
      questions: [
        { q: '¿Cómo cambio mi contraseña?', a: 'Ve a "Mi perfil" → "Seguridad" → "Cambiar contraseña".' },
        { q: '¿Cómo actualizo mi información personal?', a: 'Ve a "Mi perfil" → "Editar perfil" para modificar tus datos.' },
        { q: '¿Cómo elimino mi cuenta?', a: 'Ve a "Privacidad" → "Eliminar cuenta".' }
      ]
    },
    {
      id: 'orders',
      title: 'Pedidos y Pagos',
      icon: documentText,
      questions: [
        { q: '¿Cómo rastreo mi pedido?', a: 'Ve a "Mis pedidos" y selecciona el pedido para ver el seguimiento.' },
        { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard).' }
      ]
    }
  ];

  const contactMethods = [
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Respuesta inmediata',
      icon: logoWhatsapp,
      color: 'success',
      action: () => window.open('https://wa.me/584121234567', '_blank')
    },
    {
      id: 'email',
      title: 'Correo Electrónico',
      subtitle: 'Respuesta en 24h',
      icon: mail,
      color: 'primary',
      action: () => window.location.href = 'mailto:soporte@tuempresa.com'
    },
    {
      id: 'phone',
      title: 'Llamada Directa',
      subtitle: 'Lun-Vie 9:00 - 18:00',
      icon: call,
      color: 'secondary',
      action: () => window.location.href = 'tel:08001234567'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setAlertMessage('Por favor completa todos los campos obligatorios');
      setShowAlert(true);
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setShowSuccess(true);
    setContactForm({ name: '', email: '', subject: '', category: '', message: '' });
    setLoading(false);
  };

  return (
    <IonPage className="support-page-v6">
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" text="" />
          </IonButtons>
          <IonTitle>Atención al Cliente</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="support-content-v6">
        <IonList lines="none" className="more-list">

          {/* Header style User-Header */}
          <IonItem className="user-header support-hero">
            <div className="support-header-icon" slot="start">
              <IonIcon icon={headset} />
            </div>
            <IonLabel>
              <h2>Centro de Ayuda</h2>
              <IonNote color="medium">¿En qué podemos ayudarte hoy?</IonNote>
            </IonLabel>
          </IonItem>

          <div className="section-title">
            <IonNote color="medium"><small>CONTACTO RÁPIDO</small></IonNote>
          </div>

          {contactMethods.map(method => (
            <IonItem key={method.id} button onClick={method.action} detail>
              <IonIcon icon={method.icon} slot="start" color={method.color} className="support-list-icon" />
              <IonLabel>
                <h3>{method.title}</h3>
                <IonNote color="medium">{method.subtitle}</IonNote>
              </IonLabel>
            </IonItem>
          ))}

          <div className="section-title">
            <IonNote color="medium"><small>PREGUNTAS FRECUENTES</small></IonNote>
          </div>

          <IonAccordionGroup className="support-faq-accordion">
            {faqCategories.map(cat => (
              <IonAccordion key={cat.id} value={cat.id} className="support-item-accordion">
                <IonItem slot="header" className="support-accordion-header">
                  <IonIcon icon={cat.icon} slot="start" color="medium" />
                  <IonLabel>
                    <h3>{cat.title}</h3>
                  </IonLabel>
                </IonItem>
                <div className="faq-content-v6" slot="content">
                  {cat.questions.map((faq, idx) => (
                    <div key={idx} className="faq-v6-entry">
                      <p className="q-v6"><strong>¿</strong>{faq.q}<strong>?</strong></p>
                      <p className="a-v6">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </IonAccordion>
            ))}
          </IonAccordionGroup>

          <div className="section-title">
            <IonNote color="medium"><small>ENVÍANOS UN MENSAJE</small></IonNote>
          </div>

          <div className="support-form-container-v6">
            <div className="form-card-v6">
              <div className="v6-input-item">
                <label>Nombre</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>
              <div className="v6-input-item">
                <label>Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div className="v6-input-item">
                <label>Categoría</label>
                <div className="v6-select-box">
                  <IonSelect
                    interface="popover"
                    value={contactForm.category}
                    onIonChange={(e) => handleInputChange('category', e.detail.value)}
                    placeholder="Selecciona una opción"
                  >
                    <IonSelectOption value="account">Cuenta</IonSelectOption>
                    <IonSelectOption value="orders">Pedidos</IonSelectOption>
                    <IonSelectOption value="technical">Técnico</IonSelectOption>
                    <IonSelectOption value="other">Otro</IonSelectOption>
                  </IonSelect>
                </div>
              </div>
              <div className="v6-input-item">
                <label>Mensaje</label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Describe tu consulta..."
                />
              </div>
              <button className="v6-submit-button" onClick={handleSubmit} disabled={loading}>
                <IonIcon icon={send} />
                <span>{loading ? 'Enviando...' : 'Enviar Mensaje'}</span>
              </button>
            </div>
          </div>

          <div className="section-title">
            <IonNote color="medium"><small>INFORMACIÓN ADICIONAL</small></IonNote>
          </div>

          <IonItem>
            <IonIcon icon={time} slot="start" color="medium" />
            <IonLabel>
              <h3>Horarios</h3>
              <IonNote color="medium">Lun-Vie 9:00-18:00 | Sáb 9:00-13:00</IonNote>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon icon={globe} slot="start" color="medium" />
            <IonLabel>
              <h3>Cobertura</h3>
              <IonNote color="medium">Nacional (Venezuela)</IonNote>
            </IonLabel>
          </IonItem>

        </IonList>

        <IonLoading isOpen={loading} message="Procesando..." />
        <IonAlert
          isOpen={showAlert}
          header="Soporte"
          message={alertMessage}
          buttons={['Cerrar']}
        />
        <IonAlert
          isOpen={showSuccess}
          header="¡Enviado!"
          message="Te contactaremos en breve."
          buttons={['OK']}
          onDidDismiss={() => setShowSuccess(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default CustomerSupport;