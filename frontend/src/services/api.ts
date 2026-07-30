import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DashboardKPI {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  total_profit: number;
  profit_margin: number;
}

export interface MonthlySales {
  year: number;
  month: number;
  month_name: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface RegionalSales {
  region: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  category: string;
  quantity_sold: number;
  revenue: number;
  profit: number;
}

export interface SampleDatasetMetadata {
  name: string;
  customers: number;
  products: number;
  orders: number;
  description?: string;
}

export interface UploadedFileInfo {
  originalName: string;
  savedAs: string;
  size: number;
}

export interface UploadResponse {
  success: boolean;
  uploadedFiles: UploadedFileInfo[];
}

export interface ETLLogEntry {
  timestamp: string;
  level: string;
  message: string;
  stage?: string;
}

export interface ETLStatus {
  status: string;
  current_stage?: string;
  progress?: number;
  records_processed?: number;
  total_records?: number;
  error_message?: string;
}

export interface ETLLogsResponse {
  logs: ETLLogEntry[];
}

export interface ETLRunRequest {
  dataset_source: string;
  import_mode: string;
  files?: Array<{ saved_as: string; original_name: string }>;
}

export interface ETLRunResponse {
  success: boolean;
  message: string;
  mode: string;
  operation?: string;
  execution_time?: number;
  customers_inserted?: number;
  customers_skipped?: number;
  products_inserted?: number;
  products_skipped?: number;
  orders_inserted?: number;
  orders_skipped?: number;
  total_records_processed?: number;
}

export interface ETLState {
  dataset_source: string;
  import_mode: string;
  uploaded_files?: string[];
  upload_timestamp?: string;
  pipeline_status: string;
  last_execution?: {
    operation?: string;
    execution_time?: number;
    customers_imported?: number;
    products_imported?: number;
    orders_imported?: number;
    records_skipped?: number;
    completed_at?: string;
  };
  last_successful_import_timestamp?: string;
}

export interface DashboardResponse {
  kpis: DashboardKPI;
  monthly_sales: MonthlySales[];
  category_sales: CategorySales[];
  regional_sales: RegionalSales[];
  top_products: TopProduct[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  created_at?: string;
  updated_at?: string;
}

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
  },

  exportCustomers: async (): Promise<void> => {
    const response = await api.get('/customers/export', { responseType: 'blob' });
    
    const blob = new Blob([response.data], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'customers.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_amount: number;
  order_date: string;
  status: string;
  region?: string;
  created_at: string;
  updated_at: string;
}

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  exportOrders: async (): Promise<void> => {
    const response = await api.get('/orders/export', { responseType: 'blob' });
    
    const blob = new Blob([response.data], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'orders.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export const analyticsApi = {
  getDashboard: async (params?: { start_date?: string; end_date?: string; category?: string; region?: string }): Promise<DashboardResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.region) queryParams.append('region', params.region);
    
    const url = queryParams.toString() ? `/analytics/dashboard?${queryParams.toString()}` : '/analytics/dashboard';
    const response = await api.get(url);
    return response.data;
  },

  getMonthlySales: async (params?: { start_date?: string; end_date?: string; category?: string; region?: string }): Promise<MonthlySales[]> => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.region) queryParams.append('region', params.region);
    
    const url = queryParams.toString() ? `/analytics/sales/monthly?${queryParams.toString()}` : '/analytics/sales/monthly';
    const response = await api.get(url);
    return response.data;
  },

  getCategorySales: async (params?: { start_date?: string; end_date?: string; region?: string }): Promise<CategorySales[]> => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.region) queryParams.append('region', params.region);
    
    const url = queryParams.toString() ? `/analytics/sales/category?${queryParams.toString()}` : '/analytics/sales/category';
    const response = await api.get(url);
    return response.data;
  },

  getRegionalSales: async (params?: { start_date?: string; end_date?: string; category?: string }): Promise<RegionalSales[]> => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.category) queryParams.append('category', params.category);
    
    const url = queryParams.toString() ? `/analytics/sales/region?${queryParams.toString()}` : '/analytics/sales/region';
    const response = await api.get(url);
    return response.data;
  },

  getTopProducts: async (limit: number = 10, params?: { start_date?: string; end_date?: string; category?: string; region?: string }): Promise<TopProduct[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.region) queryParams.append('region', params.region);
    
    const url = `/analytics/products/top?${queryParams.toString()}`;
    const response = await api.get(url);
    return response.data;
  },

  exportDashboard: async (params?: { start_date?: string; end_date?: string; category?: string; region?: string }): Promise<void> => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.region) queryParams.append('region', params.region);
    
    const url = queryParams.toString() ? `/analytics/export/dashboard?${queryParams.toString()}` : '/analytics/export/dashboard';
    const response = await api.get(url, { responseType: 'blob' });
    
    const blob = new Blob([response.data], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dashboard_summary.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export const pipelineApi = {
  getSampleDatasetMetadata: async (): Promise<SampleDatasetMetadata> => {
    const response = await api.get('/pipeline/sample-dataset');
    return response.data;
  },
};

export const etlApi = {
  uploadFiles: async (files: File[]): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await api.post('/etl/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  runPipeline: async (request: ETLRunRequest): Promise<ETLRunResponse> => {
    const response = await api.post('/etl/run', request);
    return response.data;
  },

  getStatus: async (): Promise<ETLStatus> => {
    const response = await api.get('/etl/status');
    return response.data;
  },

  getLogs: async (): Promise<ETLLogsResponse> => {
    const response = await api.get('/etl/logs');
    return response.data;
  },

  getETLState: async (): Promise<ETLState> => {
    const response = await api.get('/etl/state');
    return response.data;
  },
};

export default api;
