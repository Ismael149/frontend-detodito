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
import { location, map, people, cash } from 'ionicons/icons';
import { adminReportService, GeolocationReport as GeolocationReportType } from '../../../services/adminReportService';

const GeolocationReport: React.FC = () => {
  const [geolocation, setGeolocation] = useState<GeolocationReportType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGeolocationReport();
  }, []);

  const loadGeolocationReport = async () => {
    try {
      setLoading(true);
      const response = await adminReportService.getGeolocationReport();
      setGeolocation(response.report || []);
    } catch (error) {
      console.error('Error loading geolocation report:', error);
      setGeolocation([]);
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
    return <IonLoading isOpen={true} message="Cargando reporte de ubicación..." />;
  }

  return (
    <IonGrid>
      <IonRow>
        <IonCol size="12">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Ventas por Ubicación Geográfica</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {geolocation.length === 0 ? (
                <IonText color="medium">
                  <p>No hay datos de ubicación geográfica disponibles</p>
                </IonText>
              ) : (
                <div className="geolocation-list">
                  {geolocation.map((loc, index) => (
                    <IonItem key={`${loc.state}-${loc.city}`} className="geolocation-item">
                      <IonLabel>
                        <h3>
                          {loc.city}, {loc.state}
                        </h3>
                        <p>
                          <IonBadge color="primary">{formatNumber(loc.order_count)} órdenes</IonBadge>
                          <IonBadge color="secondary">{formatNumber(loc.customer_count)} clientes</IonBadge>
                          <IonBadge color="success">{formatNumber(loc.seller_count)} vendedores</IonBadge>
                        </p>
                      </IonLabel>
                      <div slot="end" className="geolocation-stats">
                        <IonText color="primary">
                          <strong>{formatCurrency(loc.total_revenue)}</strong>
                        </IonText>
                        <IonText color="medium">
                          <small>{formatCurrency(loc.avg_order_value)} promedio</small>
                        </IonText>
                        <IonChip color={index < 3 ? 'warning' : 'tertiary'}>
                          <IonIcon icon={location} />
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

      {/* Resumen geográfico */}
      {geolocation.length > 0 && (
        <IonRow>
          <IonCol size="12">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Resumen Geográfico</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="6" size-md="3">
                      <div className="geolocation-metric">
                        <IonText color="primary">
                          <h3>{formatNumber(geolocation.length)}</h3>
                          <p>Ubicaciones</p>
                        </IonText>
                      </div>
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <div className="geolocation-metric">
                        <IonText color="secondary">
                          <h3>{formatCurrency(geolocation.reduce((sum, loc) => sum + loc.total_revenue, 0))}</h3>
                          <p>Ingresos Totales</p>
                        </IonText>
                      </div>
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <div className="geolocation-metric">
                        <IonText color="tertiary">
                          <h3>{formatNumber(geolocation.reduce((sum, loc) => sum + loc.order_count, 0))}</h3>
                          <p>Total Órdenes</p>
                        </IonText>
                      </div>
                    </IonCol>
                    <IonCol size="6" size-md="3">
                      <div className="geolocation-metric">
                        <IonText color="success">
                          <h3>{formatNumber(geolocation.reduce((sum, loc) => sum + loc.customer_count, 0))}</h3>
                          <p>Clientes Totales</p>
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

      {/* Top ubicaciones */}
      {geolocation.length > 0 && (
        <IonRow>
          <IonCol size="12" size-md="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Top 5 Ubicaciones por Ingresos</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="top-locations">
                  {geolocation.slice(0, 5).map((loc, index) => (
                    <div key={`top-${loc.state}-${loc.city}`} className="top-location-item">
                      <IonText>
                        <h4>
                          <IonBadge color={index === 0 ? 'warning' : index === 1 ? 'medium' : 'tertiary'}>
                            #{index + 1}
                          </IonBadge>
                          {loc.city}, {loc.state}
                        </h4>
                        <p>
                          {formatCurrency(loc.total_revenue)} • {formatNumber(loc.order_count)} órdenes
                        </p>
                      </IonText>
                    </div>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="12" size-md="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Top 5 Ubicaciones por Clientes</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="top-locations">
                  {[...geolocation]
                    .sort((a, b) => b.customer_count - a.customer_count)
                    .slice(0, 5)
                    .map((loc, index) => (
                      <div key={`top-customers-${loc.state}-${loc.city}`} className="top-location-item">
                        <IonText>
                          <h4>
                            <IonBadge color={index === 0 ? 'warning' : index === 1 ? 'medium' : 'tertiary'}>
                              #{index + 1}
                            </IonBadge>
                            {loc.city}, {loc.state}
                          </h4>
                          <p>
                            {formatNumber(loc.customer_count)} clientes • {formatNumber(loc.order_count)} órdenes
                          </p>
                        </IonText>
                      </div>
                    ))}
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      )}
    </IonGrid>
  );
};

export default GeolocationReport;