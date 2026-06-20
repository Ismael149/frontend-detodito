// frontend/src/pages/AboutPage.tsx
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonImg
} from '@ionic/react';
import {
  informationCircle, globe, heart, people,
  shield, star, documentText, arrowRedo,
  logoGithub, logoTwitter, logoInstagram,
  mail, call, location, calendar
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  const history = useHistory();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const appInfo = {
    name: 'DeTodito',
    version: '1.0.1',
    build: 'v1.1.1-PREVIEW-FIX-0850',
    releaseDate: '4 Feb 2026'
  };

  const features = [
    {
      icon: '🛒',
      title: 'Compra y Venta Segura',
      description: 'Plataforma confiable para transacciones'
    },
    {
      icon: '🚚',
      title: 'Envíos Nacionales',
      description: 'Cobertura en todo el país'
    },
    {
      icon: '💳',
      title: 'Pagos Seguros',
      description: 'Múltiples métodos de pago'
    },
    {
      icon: '🛡️',
      title: 'Protección al Comprador',
      description: 'Garantía en todas las compras'
    }
  ];

  const team = [
    {
      name: 'Equipo Desarrollo',
      role: 'Ingeniería de Software',
      avatar: '👨‍💻'
    },
    {
      name: 'Equipo Diseño',
      role: 'Experiencia de Usuario',
      avatar: '🎨'
    },
    {
      name: 'Soporte Técnico',
      role: 'Atención al Cliente',
      avatar: '🛠️'
    },
    {
      name: 'Comunidad',
      role: 'Usuarios Activos',
      avatar: '👥'
    }
  ];

  const legalLinks = [
    {
      title: 'Términos de Servicio',
      url: '/terms',
      icon: documentText
    },
    {
      title: 'Política de Privacidad',
      url: '/privacy',
      icon: shield
    },
    {
      title: 'Política de Cookies',
      url: '/cookies',
      icon: documentText
    }
  ];

  const socialMedia = [
    {
      name: 'Twitter',
      icon: logoTwitter,
      url: 'https://twitter.com/detodito',
      color: 'primary'
    },
    {
      name: 'Instagram',
      icon: logoInstagram,
      url: 'https://instagram.com/detodito',
      color: 'danger'
    },
    {
      name: 'GitHub',
      icon: logoGithub,
      url: 'https://github.com/detodito',
      color: 'dark'
    }
  ];

  const contactInfo = [
    {
      icon: mail,
      title: 'Email',
      value: 'contacto@detodito.com',
      action: () => window.location.href = 'mailto:contacto@detodito.com'
    },
    {
      icon: call,
      title: 'Teléfono',
      value: '+58 412-123-4567',
      action: () => window.location.href = 'tel:+584121234567'
    },
    {
      icon: location,
      title: 'Ubicación',
      value: 'Caracas, Venezuela',
      action: () => {
        setAlertMessage('Oficina principal en Caracas. Trabajamos remotamente para servirte en todo el país.');
        setShowAlert(true);
      }
    }
  ];

  const handleLegalLink = (url: string) => {
    history.push(url);
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appInfo.name,
          text: `Descarga ${appInfo.name} - La mejor app para comprar y vender productos`,
          url: 'https://detodito.com'
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setAlertMessage('Enlace copiado al portapapeles');
      setShowAlert(true);
      navigator.clipboard.writeText('https://detodito.com');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/more" text="" />
          </IonButtons>
          <IonTitle>Acerca de</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="about-content">
        {/* Header */}
        <div className="about-header-card">
          <div className="app-logo">
            <div className="logo-placeholder">🛒</div>
          </div>
          <h1 className="app-name">{appInfo.name}</h1>
          <p className="app-tagline">Tu mercado digital de confianza</p>

          <div className="app-version">
            <IonBadge color="light">
              Versión {appInfo.version} • Build {appInfo.build}
            </IonBadge>
            <p className="release-date">Lanzamiento: {appInfo.releaseDate}</p>
          </div>

          <div className="header-actions">
            <IonButton
              fill="outline"
              size="small"
              onClick={handleShareApp}
            >
              <IonIcon icon={arrowRedo} slot="start" />
              Compartir App
            </IonButton>
          </div>
        </div>

        <IonList lines="none" className="about-list">
          {/* Misión */}
          <div className="section-title-v6">
            <IonText color="medium"><small>NUESTRA MISIÓN</small></IonText>
          </div>
          <div className="mission-card-v6">
            <p className="mission-text">
              En {appInfo.name} conectamos a compradores y vendedores en una
              plataforma segura, intuitiva y confiable. Nuestro objetivo es
              facilitar el comercio electrónico en Venezuela, ofreciendo una
              experiencia excepcional a todos nuestros usuarios.
            </p>
          </div>

          {/* Características */}
          <div className="section-title-v6">
            <IonText color="medium"><small>LO QUE OFRECEMOS</small></IonText>
          </div>
          <div className="features-grid-v6">
            {features.map((feature, index) => (
              <div key={index} className="feature-card-v6">
                <div className="feature-icon-v6">{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Equipo */}
          <div className="section-title-v6">
            <IonText color="medium"><small>NUESTRO EQUIPO</small></IonText>
          </div>
          <div className="team-grid-v6">
            {team.map((member, index) => (
              <div key={index} className="team-member-v6">
                <div className="member-avatar-v6">{member.avatar}</div>
                <div className="member-info-v6">
                  <h4>{member.name}</h4>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Información Legal */}
          <div className="section-title-v6">
            <IonText color="medium"><small>INFORMACIÓN LEGAL</small></IonText>
          </div>
          {legalLinks.map((link, index) => (
            <IonItem
              key={index}
              button
              onClick={() => handleLegalLink(link.url)}
              detail
            >
              <IonIcon icon={link.icon} slot="start" color="medium" />
              <IonLabel>{link.title}</IonLabel>
            </IonItem>
          ))}

          {/* Contacto */}
          <div className="section-title-v6">
            <IonText color="medium"><small>CONTÁCTANOS</small></IonText>
          </div>
          {contactInfo.map((contact, index) => (
            <IonItem
              key={index}
              button
              onClick={contact.action}
            >
              <IonIcon icon={contact.icon} slot="start" color="primary" />
              <IonLabel>
                <h3>{contact.title}</h3>
                <p>{contact.value}</p>
              </IonLabel>
            </IonItem>
          ))}

          {/* Redes Sociales */}
          <div className="section-title-v6">
            <IonText color="medium"><small>SÍGUENOS</small></IonText>
          </div>
          <div className="social-links-v6">
            {socialMedia.map((social, index) => (
              <IonButton
                key={index}
                fill="outline"
                color={social.color as any}
                href={social.url}
                target="_blank"
              >
                <IonIcon icon={social.icon} slot="start" />
                {social.name}
              </IonButton>
            ))}
          </div>

        </IonList>

        {/* Footer */}
        <div className="about-footer">
          <p>© {new Date().getFullYear()} {appInfo.name}. Todos los derechos reservados.</p>
          <p className="footer-love">
            Hecho con <IonIcon icon={heart} color="danger" /> en Venezuela
          </p>
        </div>

        {/* Alertas */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Información"
          message={alertMessage}
          buttons={['Entendido']}
        />
      </IonContent>
    </IonPage>
  );
};

export default AboutPage;
