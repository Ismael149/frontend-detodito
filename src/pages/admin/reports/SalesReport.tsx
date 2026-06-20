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
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonProgressBar
} from '@ionic/react';
import { adminReportService, ReportFilters } from '../../../services/adminReportService';

interface Props {
  filters: ReportFilters;
}

const SalesReport: React.FC<Props> = ({ filters }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminReportService.getSalesReport(filters);
      setData(res.report || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  return (
    <IonGrid className="ion-no-padding">
      <IonRow>
        <IonCol size="12">
          <IonCard className="glass-card-premium">
            <IonCardHeader>
              <IonCardTitle>Desglose de Ventas</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {loading && <IonProgressBar type="indeterminate" />}
              <IonList lines="none">
                {data.map((item, i) => (
                  <IonItem key={i} className="glass-item">
                    <IonLabel>
                      <h3>{item.period}</h3>
                      <p>{item.order_count} Órdenes | {item.customer_count} Clientes</p>
                    </IonLabel>
                    <div slot="end" style={{ textAlign: 'right' }}>
                      <IonText color="dark"><strong>{formatCurrency(item.gross_revenue)}</strong></IonText>
                      <br />
                      <IonNote style={{ fontSize: '0.8rem' }}>Neto: {formatCurrency(item.net_revenue)}</IonNote>
                    </div>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default SalesReport;