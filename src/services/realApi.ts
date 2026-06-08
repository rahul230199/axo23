import { 
  RFQ, Quote, PurchaseOrder, Document, 
  DashboardData, SupplierDashboardData, Message, User, Milestone
} from '../types/real.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API call failed');
  }

  return response.json();
}

export const realApi = {
  // Buyer Dashboard
  getDashboardData: (): Promise<DashboardData> => apiCall('/buyer/dashboard'),
  
  // RFQs
  getRFQs: (params?: { status?: string }): Promise<RFQ[]> => 
    apiCall(`/buyer/rfqs${params?.status ? `?status=${params.status}` : ''}`),
  
  getRFQById: (id: string): Promise<RFQ> => apiCall(`/buyer/rfqs/${id}`),
  
  createRFQ: (data: FormData): Promise<RFQ> => 
    fetch(`${API_URL}/buyer/rfqs`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: data,
    }).then(res => res.json()),
  
  publishRFQ: (id: string): Promise<RFQ> => 
    apiCall(`/buyer/rfqs/${id}/publish`, { method: 'POST' }),
  
  deleteRFQ: (id: string): Promise<{ success: boolean }> => 
    apiCall(`/buyer/rfqs/${id}`, { method: 'DELETE' }),
  
  // Quotes
  getQuotesForRFQ: (rfqId: string): Promise<Quote[]> => 
    apiCall(`/buyer/rfqs/${rfqId}/quotes`),
  
  acceptQuote: (quoteId: string): Promise<PurchaseOrder> => 
    apiCall(`/buyer/quotes/${quoteId}/accept`, { method: 'POST' }),
  
  rejectQuote: (quoteId: string, reason?: string): Promise<{ success: boolean }> => 
    apiCall(`/buyer/quotes/${quoteId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  
  // Purchase Orders (Buyer)
  getPOs: (params?: { status?: string }): Promise<PurchaseOrder[]> => 
    apiCall(`/buyer/pos${params?.status ? `?status=${params.status}` : ''}`),
  
  getPOById: (id: string): Promise<PurchaseOrder> => apiCall(`/buyer/pos/${id}`),
  
  // Supplier APIs
  getSupplierDashboard: (): Promise<SupplierDashboardData> => apiCall('/supplier/dashboard'),
  
  getAvailableRFQs: (): Promise<RFQ[]> => apiCall('/supplier/rfqs'),
  
  getSupplierRFQById: (id: string): Promise<RFQ> => apiCall(`/supplier/rfqs/${id}`),
  
  submitQuote: (rfqId: string, data: any): Promise<Quote> => 
    apiCall(`/supplier/rfqs/${rfqId}/quote`, { method: 'POST', body: JSON.stringify(data) }),
  
  getSupplierQuotes: (): Promise<Quote[]> => apiCall('/supplier/quotes'),
  
  getSupplierPOs: (): Promise<PurchaseOrder[]> => apiCall('/supplier/pos'),
  
  getSupplierPOById: (id: string): Promise<PurchaseOrder> => apiCall(`/supplier/pos/${id}`),
  
  updateMilestone: (poId: string, milestoneId: string, status: string, notes?: string): Promise<Milestone> => 
    apiCall(`/supplier/pos/${poId}/milestones/${milestoneId}`, { 
      method: 'PUT', 
      body: JSON.stringify({ status, notes }) 
    }),
  
  // Messages
  getMessages: (poId: string): Promise<Message[]> => apiCall(`/messages/${poId}`),
  
  sendMessage: (poId: string, content: string, attachments?: File[]): Promise<Message> => {
    const formData = new FormData();
    formData.append('content', content);
    attachments?.forEach(file => formData.append('attachments', file));
    
    return fetch(`${API_URL}/messages/${poId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData,
    }).then(res => res.json());
  },
  
  // Documents
  getDocuments: (entityId?: string, entityType?: string): Promise<Document[]> => 
    apiCall(`/documents${entityId ? `?entityId=${entityId}&entityType=${entityType}` : ''}`),
  
  uploadDocument: (entityId: string, entityType: string, file: File, type: string): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('entityId', entityId);
    formData.append('entityType', entityType);
    
    return fetch(`${API_URL}/documents`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData,
    }).then(res => res.json());
  },
  
  // Suppliers
  getSuppliers: (params?: { search?: string }): Promise<any[]> => 
    apiCall(`/suppliers${params?.search ? `?search=${params.search}` : ''}`),
  
  // Profile
  getProfile: (): Promise<User> => apiCall('/profile'),
  
  updateProfile: (data: any): Promise<User> => 
    apiCall('/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

export default realApi;
