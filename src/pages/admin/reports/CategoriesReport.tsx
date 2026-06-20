import React, { useState, useEffect } from 'react';
import { IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonProgressBar } from '@ionic/react';
import { adminReportService, ReportFilters } from '../../../services/adminReportService';

interface Props { filters: ReportFilters; }

const CategoriesReport: React.FC<Props> = ({ filters }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminReportService.getCategoryReport(filters);
      setData(res.report || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <IonGrid className="ion-no-padding">
      <IonRow>
        <IonCol size="12">
          <IonCard className="glass-card-premium">
            <IonCardHeader><IonCardTitle>Rendimiento por Categoría</IonCardTitle></IonCardHeader>
            <IonCardContent>
              {loading && <IonProgressBar type="indeterminate" />}
              <IonList lines="none">
                {data.map((item, i) => (
                  <IonItem key={i}>
                    <IonLabel>
                      <h3>{item.category}</h3>
                      <p>{item.items_sold} artículos vendidos</p>
                    </IonLabel>
                    <div slot="end">
                      <strong>${parseFloat(item.revenue).toFixed(2)}</strong>
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
export default CategoriesReport;