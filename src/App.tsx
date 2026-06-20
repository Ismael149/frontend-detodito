import React, { useEffect, useState } from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import { IonApp, IonTabs, IonRouterOutlet, IonTabBar, IonBadge, IonTabButton, IonIcon, IonLabel, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, cart, person, search, heart, menu, notifications, settings, basket, trashOutline, chevronUp, chevronDown } from 'ionicons/icons';

/* Importaciones de páginas */
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ResendVerificationPage from './pages/auth/ResendVerificationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import CreateProduct from './pages/CreateProduct';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import AllCategories from './pages/AllCategories';
import More from './pages/More';
import Search from './pages/Search';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminComments from './pages/admin/AdminComments';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';
import AdminGuard from './guards/AdminGuard';
import NotificationCenter from './components/NotificationCenter';
import { DebugUser } from './components/DebugUser';
import NotificationsPage from './pages/notifications/NotificationsPage';
import NotificationSettingsPage from './pages/notifications/NotificationSettingsPage';
import { useTabVisibility } from './hooks/useTabVisibility';
import AddressConfigPage from './pages/profile/AddressConfigPage';
import PaymentConfigPage from './pages/profile/PaymentConfigPage';
import PaymentMethodsPage from './pages/profile/PaymentMethodsPage';
import UserOrdersPage from './pages/orders/UserOrdersPage';
import SellerOrdersPage from './pages/SellerOrdersPage';
import SellerSalesPage from './pages/sales/SellerSalesPage';
import { AdminOrderDetails } from './pages/admin/AdminOrderDetails';
import AdminSalesDashboard from './pages/admin/AdminSalesDashboard';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdvancedReportsPage from './pages/reports/AdvancedReportsPage';
import MyProducts from './pages/MyProducts';
import EditProduct from './pages/EditProduct';
import CategoryProducts from './pages/CategoryProducts';
import SellerProfilePage from './pages/SellerProfilePage';
import BackupRestore from './pages/admin/BackupRestore';
import AdminSettings from './pages/admin/AdminSettings';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import BannerRequestPage from './pages/BannerRequestPage';

import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';

import SecuritySettings from './pages/SecuritySettings';
import PrivacySettings from './pages/PrivacySettings';
import CustomerSupport from './pages/CustomerSupport';
import FeedbackPage from './pages/FeedbackPage';

import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import ChatBotPage from './pages/ChatBotPage';
import { settingsService } from './services/settingsService';

// Páginas legales
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import CookiesPolicyPage from './pages/legal/CookiesPolicyPage';

/* CSS Core requerido para que los componentes de Ionic funcionen correctamente */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Utilidades CSS opcionales que pueden ser comentadas */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
/* import '@ionic/react/css/palettes/dark.system.css'; */


/* Variables del tema */
import './theme/variables.css';
import './theme/Navigation.css';
import AdminCategory from './pages/admin/AdminCategory';
import CheckoutPage from './pages/checkout/CheckoutPage';

import { useUnreadNotifications } from './hooks/useUnreadNotifications';

setupIonicReact();

const AppTabs: React.FC = () => {
  const shouldShowTabs = useTabVisibility();
  const { unreadCount } = useUnreadNotifications();
  return (
    <IonTabs>
      <IonRouterOutlet id="main">
        <Route exact path="/reports/advanced" component={AdvancedReportsPage} />
        <Route exact path="/store" component={Store} />
        <Route exact path="/category/:id" component={CategoryProducts} />
        <Route exact path="/categories" component={AllCategories} />
        <Route exact path="/product/:id" component={ProductDetail} />
        <Route exact path="/create-product" component={CreateProduct} />
        <Route exact path="/cart" component={Cart} />
        <Route exact path="/favorites" component={Favorites} />
        <Route exact path="/more" component={More} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/search" component={Search} />
        <Route exact path="/debuguser" component={DebugUser} />
        <Route exact path="/admin/orders/:orderId" component={AdminOrderDetails} />
        <Route exact path="/profile/address" component={AddressConfigPage} />
        <Route exact path="/profile/payment" component={PaymentConfigPage} />
        <Route exact path="/profile/payment/:id" component={PaymentConfigPage} />
        <Route exact path="/notifications" component={NotificationsPage} />
        <Route exact path="/notifications/settings" component={NotificationSettingsPage} />
        <Route exact path="/checkout" component={CheckoutPage} />
        <Route exact path="/my-products" component={MyProducts} />
        <Route exact path="/edit-product/:id" component={EditProduct} />
        <Route exact path="/admin/dashboard" component={AdminDashboard} />
        <Route exact path="/admin/products" component={AdminProducts} />
        <Route exact path="/admin/users" component={AdminUsers} />
        <Route exact path="/admin/categories" component={AdminCategory} />
        <Route exact path="/admin/orders" component={AdminOrders} />
        <Route exact path="/admin/activity-logs" component={AdminActivityLogs} />
        <Route exact path="/orders" component={UserOrdersPage} />
        <Route exact path="/seller/orders" component={SellerOrdersPage} />
        <Route exact path="/admin/sales-dashboard" component={(AdminSalesDashboard)} />
        <Route exact path="/sales" component={SellerSalesPage} />
        <Route exact path="/admin/backup" component={BackupRestore} />
        <Route exact path="/admin/settings" component={AdminSettings} />
        <Route exact path="/admin/reports" component={AdminReportsPage} />
        <Route exact path="/admin/banners" component={AdminBannersPage} />
        <Route exact path="/banner-request" component={BannerRequestPage} />
        <Route exact path="/edit-profile" component={EditProfile} />
        <Route exact path="/change-password" component={ChangePassword} />
        <Route exact path="/security" component={SecuritySettings} />
        <Route exact path="/privacy" component={PrivacySettings} />
        <Route exact path="/support" component={CustomerSupport} />
        <Route exact path="/feedback" component={FeedbackPage} />
        <Route exact path="/about" component={AboutPage} />
        <Route exact path="/settings" component={SettingsPage} />
        <Route exact path="/chatbot" component={ChatBotPage} />
        <Route exact path="/terms" component={TermsOfServicePage} />
        <Route exact path="/cookies" component={CookiesPolicyPage} />
        <Route exact path="/seller-profile/:id" component={SellerProfilePage} />
        <Route exact path="/payment-methods" component={PaymentMethodsPage} />
        <Route exact path="/admin/comments" component={AdminComments} />
      </IonRouterOutlet>

      {shouldShowTabs && (
        <IonTabBar slot="bottom" className="anchored-tab-bar">
          <IonTabButton tab="store" href="/store">
            <IonIcon icon={home} />
            <IonLabel>Inicio</IonLabel>
          </IonTabButton>

          <IonTabButton tab="notifications" href="/notifications">
            <IonIcon icon={notifications} />
            {unreadCount > 0 && <IonBadge color="danger">{unreadCount}</IonBadge>}
            <IonLabel>Notificaciones</IonLabel>
          </IonTabButton>

          <IonTabButton tab="cart" href="/cart">
            <IonIcon icon={cart} />
            <IonLabel>Carrito</IonLabel>
          </IonTabButton>

          <IonTabButton tab="favorites" href="/favorites">
            <IonIcon icon={heart} />
            <IonLabel>Favoritos</IonLabel>
          </IonTabButton>

          <IonTabButton tab="more" href="/more">
            <IonIcon icon={menu} />
            <IonLabel>Más</IonLabel>
          </IonTabButton>
        </IonTabBar>
      )}
    </IonTabs>
  );
};

const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Comprobar el tema inicial desde el localStorage
    const isAdminPath = location.pathname.startsWith('/admin');
    const adminTheme = localStorage.getItem('admin_theme');
    const appTheme = localStorage.getItem('app_theme');

    // Si estamos en el admin, SOLAMENTE usar admin_theme (por defecto dark)
    // Si no estamos en el admin, usar appTheme
    const themeToApply = isAdminPath ? (adminTheme || 'dark') : (appTheme || 'light');

    if (themeToApply === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [location.pathname]);

  return <>{children}</>;
};


const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('/login');

  // Inicialización global - se ejecuta una vez al montar el componente
  useEffect(() => {
    const initApp = async () => {
      // 1. Theme Logic
      const isAdminPath = window.location.pathname.includes('/admin');
      const theme = isAdminPath
        ? (localStorage.getItem('admin_theme') || 'dark')
        : (localStorage.getItem('app_theme') || 'light');

      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.body.classList.toggle('dark', theme === 'dark');

      // 2. Lógica de Onboarding (Comprobar preferencias de Capacitor)
      // Nota: Usamos importación dinámica para Preferences
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const { value: hasSeen } = await Preferences.get({ key: 'hasSeenOnboarding' });

        if (hasSeen === 'true') {
          setInitialRoute('/login');
        } else {
          setInitialRoute('/onboarding');
        }
      } catch (error) {
        console.error('Error comprobando el estado del onboarding:', error);
        setInitialRoute('/onboarding'); // Respaldo seguro
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--ion-background-color)' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <ThemeWrapper>
          <IonRouterOutlet>
            {/* Rutas sin tabs (acceso directo o auth) */}
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/verify-email/:token" component={VerifyEmailPage} />
            <Route exact path="/resend-verification" component={ResendVerificationPage} />
            <Route exact path="/forgot-password" component={ForgotPasswordPage} />
            <Route exact path="/forgot-password" component={ForgotPasswordPage} />
            <Route exact path="/reset-password/:token" component={ResetPasswordPage} />
            <Route exact path="/onboarding" component={OnboardingPage} />

            {/* El resto de la aplicación con estructura de tabs */}
            <Route exact path="/" render={() => <Redirect to={initialRoute} />} />
            <Route path="/:tab(store|category|categories|product|create-product|cart|favorites|more|profile|search|debuguser|admin|notifications|checkout|my-products|edit-product|orders|seller|sales|edit-profile|change-password|security|privacy|support|feedback|about|settings|chatbot|seller-profile|terms|reports|cookies|banner-request)" component={AppTabs} />
          </IonRouterOutlet>
        </ThemeWrapper>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
