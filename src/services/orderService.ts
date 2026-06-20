import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const API_URL = `${environment.apiUrl}/orders`;

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  description: string;
  image_url: string;
  seller_id: number;
  seller_username: string;
  item_status: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancellation_reason?: string;
  refund_status?: string;
  refunded_at?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  shipping_agency: string;
  shipping_cost: number;
  tracking_number?: string;
  payment_status: string;
  billing_address?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  customer_username: string;
  customer_email: string;
  customer_phone: string;
}

export interface SellerOrder {
  order_item_id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  buyer_username: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_first_name?: string;
  buyer_last_name?: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  order_total: number;
  order_status: string;
  order_date: string;
  order_created_at?: string;
  item_created_at?: string;
  tracking_status: string;
  tracking_number?: string;
  shipping_agency?: string;
  shipping_cost?: number;
  image_url?: string;
  refund_status?: string;
  refunded_at?: string;
  cancellation_reason?: string;
}

export interface TrackingData {
  status: string;
  tracking_number: string;
  shipping_agency: string;
  shipping_cost: number;
  estimated_delivery?: string;
  seller_notes?: string;
  shipping_evidence?: {
    image_url: string;
    description: string;
  };
}

export interface Invoice {
  id: number;
  order_id: number;
  invoice_number: string;
  pdf_url: string;
  issued_at: string;
  created_at: string;
}

export const orderService = {
  // Obtener órdenes del usuario
  async getUserOrders(): Promise<Order[]> {
    try {
      const response = await axios.get(`${API_URL}/user`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting user orders:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener órdenes');
    }
  },

  // Obtener ventas del vendedor
  async getSellerOrders(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/seller`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Error getting seller orders:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener ventas');
    }
  },

  // Actualizar estado del item
  async updateItemStatus(itemId: number, statusData: any) {
    try {
      const response = await axios.patch(
        `${API_URL}/items/${itemId}/status`,
        statusData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating item status:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar estado');
    }
  },

  // Actualizar tracking (alias para updateItemStatus con datos de tracking)
  async updateTracking(itemId: number, trackingData: TrackingData) {
    return this.updateItemStatus(itemId, {
      status: trackingData.status,
      tracking_number: trackingData.tracking_number,
      shipping_evidence: trackingData.shipping_evidence,
      seller_notes: trackingData.seller_notes
    });
  },

  // Generar factura
  async generateInvoice(orderId: number) {
    try {
      const response = await axios.post(
        `${API_URL}/${orderId}/invoice`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error generating invoice:', error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Error al generar la factura');
    }
  },

  // Descargar factura de la orden (NATIVO PARA ANDROID/IOS)
  async downloadInvoice(orderId: number): Promise<void> {
    try {
      console.log('📄 Fetching invoice blob for order:', orderId);

      const response = await axios.get(
        `${environment.apiUrl}/orders/${orderId}/invoice/download`,
        {
          ...getAuthHeaders(),
          responseType: 'blob'
        }
      );

      const fileName = `factura-orden-${orderId}-${Date.now()}.pdf`;

      // Función para convertir Blob a Base64 (requerido por Capacitor Filesystem)
      const convertBlobToBase64 = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = reject;
          reader.onload = () => {
            const base64String = reader.result as string;
            // Remover el prefijo data:application/pdf;base64,
            resolve(base64String.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });

      const base64Data = await convertBlobToBase64(response.data);

      // 1. Guardar el archivo en la carpeta de Documentos
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents
      });

      console.log('✅ File saved to Documents:', savedFile.uri);

      // 2. Intentar compartir, pero no fallar si se cancela el diálogo
      try {
        await Share.share({
          title: 'Factura de Orden',
          text: `Factura de la orden #${orderId}`,
          url: savedFile.uri,
          dialogTitle: '¿Qué desea hacer con la factura?',
        });
        console.log('✅ Share dialog handled');
      } catch (shareError) {
        // El usuario probablemente cerró el diálogo sin compartir, no es un error de descarga
        console.warn('⚠️ Share dialog dismissed or failed:', shareError);
      }
    } catch (error: any) {
      console.error('❌ Error downloading/saving invoice:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar/guardar la factura');
    }
  }
};