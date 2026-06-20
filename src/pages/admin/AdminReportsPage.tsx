import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonAlert,
  IonLoading,
  IonToast,
  IonCard,
  IonCardContent,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import {
  refresh,
  calendar,
  download,
  options,
  filter,
  trendingUp,
  cube,
  people,
  cart
} from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import { environment } from '../../environments/environment';
import { adminReportService, ReportFilters } from '../../services/adminReportService';
import SalesReport from './reports/SalesReport';
import ProductsReport from './reports/ProductsReport';
import CustomersReport from './reports/CustomersReport';
import CategoriesReport from './reports/CategoriesReport';
import './AdminReportsPage.css';

type ReportType = 'sales' | 'products' | 'customers' | 'categories' | 'inventory' | 'geolocation';

const AdminReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    group_by: 'day'
  });

  const [showAlert, setShowAlert] = useState<{ open: boolean; type: 'date' | 'group' | 'export' | 'report' }>({ open: false, type: 'report' });
  const [toast, setToast] = useState({ open: false, message: '' });

  useEffect(() => {
    loadKeyMetrics();
  }, [filters]);

  const loadKeyMetrics = async () => {
    try {
      setLoading(true);
      const data = await adminReportService.getKeyMetrics(filters);
      setMetrics(data.metrics);
    } catch (error: any) {
      setToast({ open: true, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadKeyMetrics();
    event.detail.complete();
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      setExporting(true);
      const res = await adminReportService.exportReport(activeReport, format, filters);

      if (res.success && res.downloadUrl) {
        // Construct full URL using environment apiUrl base
        const baseUrl = environment.apiUrl.replace('/api', '');
        const fullUrl = `${baseUrl}${res.downloadUrl}`;

        console.log('Opening download URL:', fullUrl);

        await Browser.open({ url: fullUrl });

        setToast({ open: true, message: `Reporte ${format.toUpperCase()} abierto en navegador` });
      }
    } catch (error: any) {
      console.error('Export error:', error);
      setToast({ open: true, message: 'Error exportando reporte' });
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  return (
    <IonPage className="admin-reports-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="glass-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin" />
          </IonButtons>
          <IonTitle>Reportes y Análisis</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => loadKeyMetrics()}>
              <IonIcon icon={refresh} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        <IonToolbar className="glass-toolbar-sub">
          <div className="filters-container">
            <IonButton fill="clear" size="small" className="glass-btn" onClick={() => setShowAlert({ open: true, type: 'report' })}>
              <IonIcon icon={filter} slot="start" /> {activeReport.toUpperCase()}
            </IonButton>
            <IonButton fill="clear" size="small" className="glass-btn" onClick={() => setShowAlert({ open: true, type: 'export' })}>
              <IonIcon icon={download} slot="start" /> Exportar
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen scrollEvents>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <div className="glass-content">
          {/* Top Metrics Row */}
          {metrics && (
            <IonGrid>
              <IonRow>
                <IonCol size="6" size-md="3">
                  <div className="premium-metric-card">
                    <IonIcon icon={trendingUp} color="success" />
                    <div className="value">{formatCurrency(metrics.total_revenue)}</div>
                    <div className="label">Ventas Totales</div>
                  </div>
                </IonCol>
                <IonCol size="6" size-md="3">
                  <div className="premium-metric-card">
                    <IonIcon icon={cart} color="primary" />
                    <div className="value">{metrics.total_orders}</div>
                    <div className="label">Órdenes</div>
                  </div>
                </IonCol>
                <IonCol size="6" size-md="3">
                  <div className="premium-metric-card">
                    <IonIcon icon={people} color="tertiary" />
                    <div className="value">{metrics.total_customers}</div>
                    <div className="label">Clientes</div>
                  </div>
                </IonCol>
                <IonCol size="6" size-md="3">
                  <div className="premium-metric-card">
                    <IonIcon icon={cube} color="warning" />
                    <div className="value">{metrics.delivered_count}</div>
                    <div className="label">Entregados</div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          )}

          {/* Active Report Rendering */}
          <div className="report-render-area">
            {activeReport === 'sales' && <SalesReport filters={filters} />}
            {activeReport === 'products' && <ProductsReport filters={filters} />}
            {activeReport === 'customers' && <CustomersReport filters={filters} />}
            {activeReport === 'categories' && <CategoriesReport filters={filters} />}
          </div>
        </div>

        {/* Global Selectors */}
        <IonAlert
          isOpen={showAlert.open && showAlert.type === 'report'}
          onDidDismiss={() => setShowAlert({ open: false, type: 'report' })}
          header="Seleccionar Reporte"
          inputs={[
            { type: 'radio', label: 'Ventas', value: 'sales', checked: activeReport === 'sales' },
            { type: 'radio', label: 'Productos', value: 'products', checked: activeReport === 'products' },
            { type: 'radio', label: 'Clientes', value: 'customers', checked: activeReport === 'customers' },
            { type: 'radio', label: 'Categorías', value: 'categories', checked: activeReport === 'categories' }
          ]}
          buttons={[{ text: 'Cancelar', role: 'cancel' }, { text: 'Ver', handler: (v) => setActiveReport(v) }]}
        />

        <IonAlert
          isOpen={showAlert.open && showAlert.type === 'export'}
          onDidDismiss={() => setShowAlert({ open: false, type: 'export' })}
          header="Exportar Reporte"
          message={`Exportar ${activeReport} como:`}
          buttons={[
            { text: 'Adobe PDF', handler: () => handleExport('pdf') },
            { text: 'CSV (Excel)', handler: () => handleExport('csv') },
            { text: 'Cancelar', role: 'cancel' }
          ]}
        />

        <IonLoading isOpen={loading || exporting} message={exporting ? "Generando documento..." : "Recopilando datos..."} />
        <IonToast isOpen={toast.open} message={toast.message} duration={2000} onDidDismiss={() => setToast({ open: false, message: '' })} />
      </IonContent>
    </IonPage>
  );
};

export default AdminReportsPage;