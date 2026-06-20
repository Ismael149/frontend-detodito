import React, { useState, useEffect } from 'react';
import { IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonNote, IonProgressBar } from '@ionic/react';
import { adminReportService, ReportFilters } from '../../../services/adminReportService';

interface Props { filters: ReportFilters; }

const CustomersReport: React.FC<Props> = ({ filters }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminReportService.getCustomerReport(filters);
      setData(res.report || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow>
        <IonCol size="12">
          <IonCard className="glass-card-premium">
            <IonCardHeader><IonCardTitle>Compradores Top</IonCardTitle></IonCardHeader>
            <IonCardContent>
              {loading && <IonProgressBar type="indeterminate" />}
              <IonList lines="none">
                {data.map((item, i) => (
                  <IonItem key={i}>
                    <IonLabel>
                      <h3>{item.full_name}</h3>
                      <p>@{item.username} | {item.total_orders} Órdenes</p>
                    </IonLabel>
                    <div slot="end" style={{ textAlign: 'right' }}>
                      <IonNote color="success"><strong>${parseFloat(item.total_spent).toFixed(2)}</strong></IonNote>
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
export default CustomersReport;