import axios from 'axios';
import { environment } from '../environments/environment';
import { authService } from './authService';

const API_URL = `${environment.apiUrl}/admin/reports`;

const getHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${authService.getToken()}`,
    'Content-Type': 'application/json'
  }
});

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  group_by?: 'hour' | 'day' | 'week' | 'month' | 'year';
  limit?: number;
}

export interface GeolocationReport {
  state: string;
  city: string;
  order_count: number;
  customer_count: number;
  seller_count: number;
  total_revenue: number;
  avg_order_value: number;
}

export interface InventoryItem {
  id: number;
  name: string;
  category_name: string;
  stock: number;
  price: number;
  stock_status: 'out_of_stock' | 'low_stock' | 'in_stock';
  stock_value: number;
  times_sold: number;
  seller_username: string;
}

export interface SellerReport {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  product_count: number;
  items_sold: number;
  unique_customers: number;
  total_revenue: number;
  avg_product_price: number;
}

export const adminReportService = {
  async getSalesReport(filters: ReportFilters) {
    const res = await axios.get(`${API_URL}/sales`, { ...getHeaders(), params: filters });
    return res.data;
  },

  async getTopProductsReport(filters: ReportFilters) {
    const res = await axios.get(`${API_URL}/top-products`, { ...getHeaders(), params: filters });
    return res.data;
  },

  async getCategoryReport(filters: ReportFilters) {
    const res = await axios.get(`${API_URL}/categories`, { ...getHeaders(), params: filters });
    return res.data;
  },

  async getCustomerReport(filters: ReportFilters) {
    const res = await axios.get(`${API_URL}/customers`, { ...getHeaders(), params: filters });
    return res.data;
  },

  async getInventoryReport() {
    const res = await axios.get(`${API_URL}/inventory`, getHeaders());
    return res.data;
  },

  async getSellerReport(filters: ReportFilters) {
    const res = await axios.get(`${API_URL}/sellers`, { ...getHeaders(), params: filters });
    return res.data;
  },

  async getGeolocationReport() {
    const res = await axios.get(`${API_URL}/geolocation`, getHeaders());
    return res.data;
  },

  async getKeyMetrics(filters: ReportFilters) {
    const res = await axios.get(`${API_URL}/key-metrics`, { ...getHeaders(), params: filters });
    return res.data;
  },

  async exportReport(report_type: string, format: 'pdf' | 'csv', filters: ReportFilters) {
    const res = await axios.post(`${API_URL}/export`, { report_type, format, filters }, getHeaders());
    return res.data;
  }
};