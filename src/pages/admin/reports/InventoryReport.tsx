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
import { pricetag, warning, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { adminReportService, InventoryItem } from '../../../services/adminReportService';

const InventoryReport: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventoryReport();
  }, []);

  const loadInventoryReport = async () => {
    try {
      setLoading(true);
      const response = await adminReportService.getInventoryReport();
      setInventory(response.report || []);
    } catch (error) {
      console.error('Error loading inventory report:', error);
      setInventory([]);
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

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out_of_stock': return 'danger';
      case 'low_stock': return 'warning';
      case 'in_stock': return 'success';
      default: return 'medium';
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'out_of_stock': return closeCircle;
      case 'low_stock': return warning;
      case 'in_stock': return checkmarkCircle;
      default: return pricetag;
    }
  };

  if (loading) {
    return <IonLoading isOpen={true} message="Cargando reporte de inventario..." />;
  }

  const outOfStock = inventory.filter(item => item.stock_status === 'out_of_stock');
  const lowStock = inventory.filter(item => item.stock_status === 'low_stock');
  const inStock = inventory.filter(item => item.stock_status === 'in_stock');

  return (
    <IonGrid>
      {/* Resumen de inventario */}
      <IonRow>
        <IonCol size="12">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Resumen de Inventario</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="6" size-md="3">
                    <div className="inventory-summary-card total">
                      <IonText color="primary">
                        <h3>{formatNumber(inventory.length)}</h3>
                        <p>Total Productos</p>
                      </IonText>
                    </div>
                  </IonCol>
                  <IonCol size="6" size-md="3">
                    <div className="inventory-summary-card out-of-stock">
                      <IonText color="danger">
                        <h3>{formatNumber(outOfStock.length)}</h3>
                        <p>Sin Stock</p>
                      </IonText>
                    </div>
                  </IonCol>
                  <IonCol size="6" size-md="3">
                    <div className="inventory-summary-card low-stock">
                      <IonText color="warning">
                        <h3>{formatNumber(lowStock.length)}</h3>
                        <p>Stock Bajo</p>
                      </IonText>
                    </div>
                  </IonCol>
                  <IonCol size="6" size-md="3">
                    <div className="inventory-summary-card value">
                      <IonText color="success">
                        <h3>{formatCurrency(inventory.reduce((sum, item) => sum + item.stock_value, 0))}</h3>
                        <p>Valor Total</p>
                      </IonText>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>

      {/* Productos sin stock */}
      {outOfStock.length > 0 && (
        <IonRow>
          <IonCol size="12">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={closeCircle} color="danger" />
                  Productos Sin Stock ({outOfStock.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="inventory-list">
                  {outOfStock.map((item) => (
                    <IonItem key={item.id} className="inventory-item">
                      <IonLabel>
                        <h3>{item.name}</h3>
                        <p>
                          <IonBadge color="medium">{item.category_name}</IonBadge>
                          <IonBadge color="secondary">Vendedor: {item.seller_username}</IonBadge>
                          <IonBadge color="tertiary">{formatNumber(item.times_sold)} vendidos</IonBadge>
                        </p>
                      </IonLabel>
                      <div slot="end" className="inventory-stats">
                        <IonChip color="danger">
                          <IonIcon icon={closeCircle} />
                          Sin Stock
                        </IonChip>
                        <IonText color="primary">
                          <small>{formatCurrency(item.price)}</small>
                        </IonText>
                      </div>
                    </IonItem>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      )}

      {/* Productos con stock bajo */}
      {lowStock.length > 0 && (
        <IonRow>
          <IonCol size="12">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={warning} color="warning" />
                  Productos con Stock Bajo ({lowStock.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="inventory-list">
                  {lowStock.map((item) => (
                    <IonItem key={item.id} className="inventory-item">
                      <IonLabel>
                        <h3>{item.name}</h3>
                        <p>
                          <IonBadge color="medium">{item.category_name}</IonBadge>
                          <IonBadge color="secondary">Stock: {formatNumber(item.stock)}</IonBadge>
                          <IonBadge color="tertiary">{formatNumber(item.times_sold)} vendidos</IonBadge>
                        </p>
                      </IonLabel>
                      <div slot="end" className="inventory-stats">
                        <IonChip color="warning">
                          <IonIcon icon={warning} />
                          Stock Bajo
                        </IonChip>
                        <IonText color="primary">
                          <strong>{formatCurrency(item.stock_value)}</strong>
                        </IonText>
                      </div>
                    </IonItem>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      )}

      {/* Productos con stock normal */}
      <IonRow>
        <IonCol size="12">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={checkmarkCircle} color="success" />
                Productos con Stock Normal ({inStock.length})
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="inventory-list">
                {inStock.slice(0, 20).map((item) => (
                  <IonItem key={item.id} className="inventory-item">
                    <IonLabel>
                      <h3>{item.name}</h3>
                      <p>
                        <IonBadge color="medium">{item.category_name}</IonBadge>
                        <IonBadge color="secondary">Stock: {formatNumber(item.stock)}</IonBadge>
                        <IonBadge color="tertiary">{formatNumber(item.times_sold)} vendidos</IonBadge>
                      </p>
                    </IonLabel>
                    <div slot="end" className="inventory-stats">
                      <IonChip color="success">
                        <IonIcon icon={checkmarkCircle} />
                        En Stock
                      </IonChip>
                      <IonText color="primary">
                        <strong>{formatCurrency(item.stock_value)}</strong>
                      </IonText>
                    </div>
                  </IonItem>
                ))}
              </div>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default InventoryReport;