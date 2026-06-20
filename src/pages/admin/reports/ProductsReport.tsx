import React, { useState, useEffect } from 'react';
import { IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonText, IonProgressBar } from '@ionic/react';
import { adminReportService, ReportFilters } from '../../../services/adminReportService';

interface Props { filters: ReportFilters; }

const ProductsReport: React.FC<Props> = ({ filters }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminReportService.getTopProductsReport(filters);
      setData(res.report || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow>
        <IonCol size="12">
          <IonCard className="glass-card-premium">
            <IonCardHeader><IonCardTitle>Top Productos</IonCardTitle></IonCardHeader>
            <IonCardContent>
              {loading && <IonProgressBar type="indeterminate" />}
              <IonList lines="none">
                {data.map((item, i) => (
                  <IonItem key={i}>
                    <IonLabel>
                      <h3>{item.name}</h3>
                      <p>{item.category} | {item.order_frequency} Pedidos</p>
                    </IonLabel>
                    <div slot="end" style={{ textAlign: 'right' }}>
                      <IonText color="primary"><strong>{item.units_sold} uds</strong></IonText>
                      <br />
                      <IonLabel style={{ fontSize: '0.8rem' }}>${parseFloat(item.revenue).toFixed(2)}</IonLabel>
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
export default ProductsReport;