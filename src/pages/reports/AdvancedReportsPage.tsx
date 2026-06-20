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
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
    IonSpinner,
    IonText,
    IonList,
    IonItem,
    IonLabel,
    IonBadge
} from '@ionic/react';
import {
    barChart, star, trendingUp, trendingDown,
    shieldCheckmark, download, refresh
} from 'ionicons/icons';
import axios from 'axios';
import { environment } from '../../environments/environment';
import { authService } from '../../services/authService';
import { pdfService } from '../../services/pdfService';
import './AdvancedReportsPage.css';

const AdvancedReportsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = authService.getToken();
            const response = await axios.get(`${environment.apiUrl}/stats/my-reports`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error: any) {
            console.error('Error fetching report data:', error);
            setError(error.response?.data?.message || error.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const downloadSalesReport = (type: 'daily' | 'weekly' | 'monthly') => {
        if (!data) return;
        const trends = data.salesTrends[type];
        const typeNames: { [key: string]: string } = {
            daily: 'Diarias',
            weekly: 'Semanales',
            monthly: 'Mensuales'
        };

        const columns = [
            type === 'daily' ? 'Fecha' : type === 'weekly' ? 'Semana' : 'Mes',
            'Total Ventas'
        ];

        const rows = trends.map((item: any) => [
            item.date || item.week || item.month,
            `US$ ${item.total}`
        ]);

        pdfService.generateTableReport(
            `Reporte de Ventas ${typeNames[type]}`,
            columns,
            rows,
            `reporte_ventas_${typeNames[type].toLowerCase()}`
        );
    };

    const downloadReviewsReport = () => {
        if (!data?.reviews) return;
        const columns = ['Producto', 'Calificación', 'Comentario', 'Fecha'];
        const rows = data.reviews.map((r: any) => [
            r.product_name,
            r.rating,
            r.content,
            new Date(r.created_at).toLocaleDateString()
        ]);
        pdfService.generateTableReport(
            'Reporte de Reseñas y Calificaciones',
            columns,
            rows,
            'reporte_resenas'
        );
    };

    const downloadPerformanceReport = (type: 'top' | 'bottom') => {
        if (!data?.performance) return;
        const isTop = type === 'top';
        const products = isTop ? data.performance.topProducts : data.performance.bottomProducts;
        const columns = ['Producto', 'Unidades Vendidas'];
        const rows = products.map((p: any) => [p.name, p.total_sold]);

        pdfService.generateTableReport(
            isTop ? 'Reporte de Productos Más Vendidos' : 'Reporte de Productos Menos Vendidos',
            columns,
            rows,
            isTop ? 'reporte_mas_vendidos' : 'reporte_menos_vendidos'
        );
    };

    const downloadSecurityReport = () => {
        if (!data?.security) return;
        const columns = ['Acción', 'Fecha y Hora', 'Dirección IP'];
        const rows = data.security.map((s: any) => [
            s.action || 'Actividad desconocida',
            s.created_at ? new Date(s.created_at).toLocaleString() : 'N/A',
            s.ip_address || 'Sistema'
        ]);

        pdfService.generateTableReport(
            'Reporte de Auditoría y Seguridad',
            columns,
            rows,
            'reporte_seguridad'
        );
    };

    return (
        <IonPage id="advanced-reports-page">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/more" text="" />
                    </IonButtons>
                    <IonTitle>Centro de Reportes</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={fetchReportData}>
                            <IonIcon icon={refresh} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding reports-content">
                {loading ? (
                    <div className="center-msg">
                        <IonSpinner name="crescent" color="primary" />
                        <p>Generando análisis estratégico...</p>
                    </div>
                ) : error ? (
                    <div className="center-msg">
                        <IonIcon icon={barChart} color="medium" size="large" />
                        <h3 style={{ color: 'var(--ion-color-danger)' }}>¡Ups! Algo salió mal</h3>
                        <p>{error}</p>
                        <IonButton fill="outline" onClick={fetchReportData} className="ion-margin-top">
                            Reintentar
                        </IonButton>
                    </div>
                ) : (
                    <IonGrid>
                        <IonRow>
                            {/* Ventas */}
                            <IonCol size="12" sizeMd="6">
                                <IonCard>
                                    <IonCardHeader>
                                        <IonCardTitle>
                                            <IonIcon icon={barChart} color="primary" /> Tendencias de Ventas
                                        </IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <IonButton expand="block" fill="outline" onClick={() => downloadSalesReport('daily')}>
                                            <IonIcon icon={download} slot="start" /> Ventas Diarias
                                        </IonButton>
                                        <IonButton expand="block" fill="outline" onClick={() => downloadSalesReport('weekly')}>
                                            <IonIcon icon={download} slot="start" /> Ventas Semanales
                                        </IonButton>
                                        <IonButton expand="block" fill="outline" onClick={() => downloadSalesReport('monthly')}>
                                            <IonIcon icon={download} slot="start" /> Ventas Mensuales
                                        </IonButton>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>

                            {/* Reviews */}
                            <IonCol size="12" sizeMd="6">
                                <IonCard>
                                    <IonCardHeader>
                                        <IonCardTitle>
                                            <IonIcon icon={star} color="warning" /> Reseñas y Calificaciones
                                        </IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <IonText color="medium">Total: {data?.reviews?.length || 0} reseñas</IonText>
                                        <IonButton expand="block" fill="solid" className="ion-margin-top" onClick={downloadReviewsReport}>
                                            <IonIcon icon={download} slot="start" /> Descargar Listado
                                        </IonButton>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>

                            {/* Performance */}
                            <IonCol size="12">
                                <IonCard>
                                    <IonCardHeader>
                                        <IonCardTitle>Rendimiento de Productos</IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <IonRow>
                                            <IonCol size="6">
                                                <IonText color="success">
                                                    <h6><IonIcon icon={trendingUp} /> Más Vendidos</h6>
                                                </IonText>
                                                {data?.performance?.topProducts?.map((p: any, i: number) => (
                                                    <div key={i}><small>{p.name} ({p.total_sold})</small></div>
                                                ))}
                                            </IonCol>
                                            <IonCol size="6">
                                                <IonText color="danger">
                                                    <h6><IonIcon icon={trendingDown} /> Menos Vendidos</h6>
                                                </IonText>
                                                {data?.performance?.bottomProducts?.map((p: any, i: number) => (
                                                    <div key={i}><small>{p.name} ({p.total_sold})</small></div>
                                                ))}
                                            </IonCol>
                                        </IonRow>
                                        <div className="ion-margin-top">
                                            <IonButton expand="block" fill="outline" onClick={() => downloadPerformanceReport('top')}>
                                                <IonIcon icon={download} slot="start" /> Reporte Top
                                            </IonButton>
                                            <IonButton expand="block" fill="outline" onClick={() => downloadPerformanceReport('bottom')}>
                                                <IonIcon icon={download} slot="start" /> Reporte Bottom
                                            </IonButton>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>

                            {/* Security */}
                            <IonCol size="12">
                                <IonCard>
                                    <IonCardHeader>
                                        <IonCardTitle>
                                            <IonIcon icon={shieldCheckmark} color="success" /> Auditoría y Seguridad
                                        </IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <IonList lines="none">
                                            {data?.security && data.security.length > 0 ? (
                                                data.security.map((s: any, i: number) => (
                                                    <IonItem key={i}>
                                                        <IonLabel>
                                                            <h3>{s.action || 'Actividad desconocida'}</h3>
                                                            <p>{s.created_at ? new Date(s.created_at).toLocaleString() : 'Fecha no disp.'}</p>
                                                        </IonLabel>
                                                        <IonBadge color={s.action?.includes('fail') ? 'danger' : 'success'} slot="end">
                                                            {s.ip_address || 'Sistema'}
                                                        </IonBadge>
                                                    </IonItem>
                                                ))
                                            ) : (
                                                <IonItem>No hay actividad sospechosa registrada</IonItem>
                                            )}
                                        </IonList>
                                        <IonButton expand="block" fill="outline" className="ion-margin-top" onClick={downloadSecurityReport}>
                                            <IonIcon icon={download} slot="start" /> Descargar Log de Seguridad
                                        </IonButton>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                )}
            </IonContent>
        </IonPage>
    );
};

export default AdvancedReportsPage;
