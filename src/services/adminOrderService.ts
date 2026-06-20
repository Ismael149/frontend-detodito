import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const API_URL = `${environment.apiUrl}/admin`;

const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Interface base para Order
export interface Order {
  id: number;
  user_id: number;
  cart_id: number;
  total: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  payment_status: string;
  shipping_agency: string;
  shipping_cost: number;
  tracking_number?: string;
  billing_address?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  phone?: string;
  items: OrderItem[];
}

// Interface para detalles completos de orden
export interface OrderDetails extends Order {
  shipping_name: string;
  shipping_address: string;
  shipping_address2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_phone?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  item_status: string;
  seller_id: number;
  seller_username: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancellation_reason?: string;
  primary_image?: string;
}

export interface OrderItemDetails extends OrderItem {
  product_description?: string;
  product_image?: string;
  seller_email: string;
  evidence_image?: string;
  evidence_description?: string;
  evidence_created_at?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: {
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    total_revenue: number;
  };
}

// Interface para estadísticas del dashboard
export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  confirmed_revenue: number;
  total_customers: number;
  total_items_sold: number;
  last_30_days_orders: number;
  last_30_days_revenue: number;
}

export const adminOrderService = {
  // Obtener todas las órdenes
  async getAllOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
    try {
      console.log('🔄 Fetching all orders with filters:', filters);

      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${API_URL}/orders?${params.toString()}`,
        getAuthHeaders()
      );

      console.log('✅ Orders API response:', response.data);

      // Validar y normalizar la respuesta
      const data = response.data;

      if (!data) {
        throw new Error('Respuesta vacía del servidor');
      }

      // Asegurar que orders sea un array
      const orders = Array.isArray(data.orders) ? data.orders :
        Array.isArray(data) ? data : [];

      // Asegurar que pagination exista
      const pagination = data.pagination || {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: orders.length,
        totalPages: Math.ceil(orders.length / (filters.limit || 20))
      };

      // Asegurar que stats exista
      const stats = data.stats || {
        total_orders: orders.length,
        pending_orders: orders.filter((o: Order) => o.status === 'pending').length,
        processing_orders: orders.filter((o: Order) => o.status === 'processing').length,
        shipped_orders: orders.filter((o: Order) => o.status === 'shipped').length,
        delivered_orders: orders.filter((o: Order) => o.status === 'delivered').length,
        cancelled_orders: orders.filter((o: Order) => o.status === 'cancelled').length,
        total_revenue: orders.reduce((sum: number, o: Order) => sum + (o.total || 0), 0)
      };

      const result = {
        orders,
        pagination,
        stats
      };

      console.log('✅ Normalized orders data:', result);

      return result;
    } catch (error: any) {
      console.error('❌ Error getting all orders:', error);

      // Devolver estructura por defecto en caso de error
      const defaultResponse: OrdersResponse = {
        orders: [],
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total: 0,
          totalPages: 0
        },
        stats: {
          total_orders: 0,
          pending_orders: 0,
          processing_orders: 0,
          shipped_orders: 0,
          delivered_orders: 0,
          cancelled_orders: 0,
          total_revenue: 0
        }
      };

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Error al obtener las órdenes');
    }
  },

  // Obtener detalles de una orden
  async getOrderDetails(orderId: number): Promise<OrderDetails> {
    try {
      console.log('🔍 Fetching order details for ID:', orderId);

      const response = await axios.get(
        `${API_URL}/orders/${orderId}`,
        getAuthHeaders()
      );

      console.log('✅ Order details fetched successfully');

      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting order details:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener los detalles de la orden');
    }
  },

  // Actualizar estado de una orden
  async updateOrderStatus(orderId: number, status: string, adminNotes?: string) {
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status, admin_notes: adminNotes },
        getAuthHeaders()
      );

      console.log('✅ Order status updated successfully');

      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating order status:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el estado de la orden');
    }
  },

  // Obtener estadísticas del dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('📊 Fetching dashboard stats...');

      const response = await axios.get(
        `${API_URL}/stats/dashboard`,
        getAuthHeaders()
      );

      console.log('✅ Dashboard stats fetched successfully');

      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting dashboard stats:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Obtener órdenes recientes
  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    try {
      console.log('🕒 Fetching recent orders, limit:', limit);

      const response = await axios.get(
        `${API_URL}/orders/recent?limit=${limit}`,
        getAuthHeaders()
      );

      console.log('✅ Recent orders fetched successfully:', response.data.length);

      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('❌ Error getting recent orders:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener órdenes recientes');
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
