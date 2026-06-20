import React, { useState, useEffect } from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonLoading,
  IonItem,
  IonLabel,
  IonChip,
  IonBadge,
  IonIcon
} from '@ionic/react';
import { cart, star, cash, people } from 'ionicons/icons';
import { adminReportService, SellerReport, ReportFilters } from '../../../services/adminReportService';

interface SellersReportProps {
  filters: ReportFilters;
}

const SellersReport: React.FC<SellersReportProps> = ({ filters }) => {
  const [sellers, setSellers] = useState<SellerReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSellersReport();
  }, [filters]);

  const loadSellersReport = async () => {
    try {
      setLoading(true);
      const response = await adminReportService.getSellerReport(filters);
      setSellers(response.report || []);
    } catch (error) {
      console.error('Error loading sellers report:', error);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE').format(num || 0);
  };

  if (loading) {
    return <IonLoading isOpen={true} message="Cargando reporte de vendedores..." />;
  }

  return (
    <IonGrid>
      <IonRow>
        <IonCol size="12">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Vendedores Más Exitosos</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {sellers.length === 0 ? (
                <IonText color="medium">
                  <p>No hay datos de vendedores para el período seleccionado</p>
                </IonText>
              ) : (
                <div className="sellers-list">
                  {sellers.map((seller, index) => (
                    <IonItem key={seller.id} className="seller-item">
                      <IonLabel>
                        <h3>
                          {seller.first_name} {seller.last_name} ({seller.username})
                        </h3>
                        <p>{seller.email}</p>
                        <p>
                          <IonBadge color="primary">{formatNumber(seller.product_count)} productos</IonBadge>
                          <IonBadge color="secondary">{formatNumber(seller.items_sold)} items vendidos</IonBadge>
                          <IonBadge color="success">{formatNumber(seller.unique_customers)} clientes</IonBadge>
                        </p>
                      </IonLabel>
                      <div slot="end" className="seller-stats">
                        <IonText color="primary">
                          <strong>{formatCurrency(seller.total_revenue)}</strong>
                        </IonText>
                        <IonText color="medium">
                          <small>{formatCurrency(seller.avg_product_price)} promedio</small>
                        </IonText>
                        <IonChip color={index < 3 ? 'warning' : 'tertiary'}>
                          <IonIcon icon={star} />
                          #{index + 1}
                        </IonChip>
                      </div>
                    </IonItem>
                  ))}
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>

      {/* Métricas de vendedores */}
      {sellers.length > 0 && (
        <IonRow>
          <IonCol size="12">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Resumen de Vendedores</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="6" size-md="3">
                      <div className="seller-metric">
                        <IonText color="primary">
                          <h3>{formatNumber(sellers.length)}</h3>
                          <p>Vendedores Activos</p>
                        </IonText>
                      </div>
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <div className="seller-metric">
                        <IonText color="secondary">
                          <h3>{formatCurrency(sellers.reduce((sum, s) => sum + s.total_revenue, 0))}</h3>
                          <p>Ingresos Totales</p>
                        </IonText>
                      </div>
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <div className="seller-metric">
                        <IonText color="tertiary">
                          <h3>{formatNumber(sellers.reduce((sum, s) => sum + s.items_sold, 0))}</h3>
                          <p>Items Vendidos</p>
                        </IonText>
                      </div>
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <div className="seller-metric">
                        <IonText color="success">
                          <h3>{formatNumber(sellers.reduce((sum, s) => sum + s.product_count, 0))}</h3>
                          <p>Productos Totales</p>
                        </IonText>
                      </div>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      )}
    </IonGrid>
  );
};

export default SellersReport;