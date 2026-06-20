import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const pdfService = {
    /**
     * Genera un reporte PDF con una tabla
     */
    generateTableReport: (title: string, columns: string[], rows: any[][], fileName: string) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Configuración de colores (Marca DeTodito)
        const primaryColor = [245, 124, 0]; // Naranja DeTodito (#f57c00)
        const headerColor = [52, 58, 64];   // Gris oscuro (#343a40)
        const white = [255, 255, 255];

        // Header Rect
        doc.setFillColor(white[0], white[1], white[2]); // Fondo blanco para el logo
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Logo / Título
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('DeTodito', 14, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const reportDate = new Date();
        const formattedReportDate = isNaN(reportDate.getTime()) ? 'N/A' : reportDate.toLocaleString();
        doc.text('¡Tu mercado en confianza! - ' + formattedReportDate, 14, 33);

        // Línea divisora
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.5);
        doc.line(14, 38, pageWidth - 14, 38);

        // Título del reporte
        doc.setTextColor(33, 33, 33);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), 14, 55);

        // Generación de la tabla
        autoTable(doc, {
            startY: 65,
            head: [columns],
            body: rows,
            theme: 'grid',
            headStyles: {
                fillColor: headerColor as [number, number, number],
                textColor: 255,
                fontSize: 10,
                halign: 'left'
            },
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            alternateRowStyles: {
                fillColor: [248, 249, 250]
            },
            margin: { left: 14, right: 14 }
        });

        // Pie de página
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.text(
                'DeTodito - Marketplace Digital',
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 15,
                { align: 'center' }
            );

            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'normal');
            doc.text(
                `Página ${i} de ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Guardar el archivo
        const isNative = (window as any).Capacitor?.isNativePlatform();

        if (isNative) {
            // Lógica nativa: obtener base64 y guardar/compartir
            const pdfOutput = doc.output('datauristring');
            const base64Data = pdfOutput.split(',')[1];
            const fileNameWithExt = `${fileName}_${new Date().getTime()}.pdf`;

            import('@capacitor/filesystem').then(async ({ Filesystem, Directory }) => {
                try {
                    const result = await Filesystem.writeFile({
                        path: fileNameWithExt,
                        data: base64Data,
                        directory: Directory.Documents
                    });

                    import('@capacitor/share').then(({ Share }) => {
                        Share.share({
                            title: title,
                            url: result.uri,
                            dialogTitle: 'Guardar Reporte'
                        });
                    });
                } catch (e) {
                    console.error('Error saving PDF native:', e);
                    alert('Error al guardar el PDF');
                }
            });

        } else {
            // Web Logic
            doc.save(`${fileName}_${new Date().getTime()}.pdf`);
        }
    }
};
