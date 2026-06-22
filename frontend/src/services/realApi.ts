import axios from 'axios';

const API_BASE = '/api';

const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export const realApi = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    if (res.data.token) localStorage.setItem('token', res.data.token);
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data;
  },

  register: async (data: any) => {
    const res = await axios.post(`${API_BASE}/auth/register`, data);
    return res.data;
  },

  getProfile: async () => {
    const res = await axios.get(`${API_BASE}/auth/me`, { headers: getAuthHeader() });
    return res.data;
  },

  // Dashboard
  getDashboard: async () => {
    const res = await axios.get(`${API_BASE}/dashboard`, { headers: getAuthHeader() });
    return res.data;
  },

  // Projects
  getProjects: async () => {
    const res = await axios.get(`${API_BASE}/projects`, { headers: getAuthHeader() });
    return res.data;
  },
  getProjectById: async (id: string) => {
    const res = await axios.get(`${API_BASE}/projects/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
  createProject: async (data: any) => {
    const res = await axios.post(`${API_BASE}/projects`, data, { headers: getAuthHeader() });
    return res.data;
  },

  // RFQs
  getRFQs: async () => {
    const res = await axios.get(`${API_BASE}/rfqs`, { headers: getAuthHeader() });
    return res.data;
  },
  getRFQById: async (id: string) => {
    const res = await axios.get(`${API_BASE}/rfqs/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
  createRFQ: async (data: any) => {
    const res = await axios.post(`${API_BASE}/rfqs`, data, { headers: getAuthHeader() });
    return res.data;
  },
  publishRFQ: async (rfqId: string) => {
    const res = await axios.put(`${API_BASE}/rfqs/${rfqId}/publish`, {}, { headers: getAuthHeader() });
    return res.data;
  },

  // Supplier RFQs
  getSupplierRFQs: async () => {
    const res = await axios.get(`${API_BASE}/supplier/rfqs`, { headers: getAuthHeader() });
    return res.data;
  },
  getSupplierRFQById: async (id: string) => {
    const res = await axios.get(`${API_BASE}/supplier/rfqs/${id}`, { headers: getAuthHeader() });
    return res.data;
  },

  // Quotes
  getQuoteById: async (id: string) => {
    const res = await axios.get(`${API_BASE}/quotes/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
  submitQuote: async (rfqId: string, data: any) => {
    const res = await axios.post(`${API_BASE}/supplier/rfqs/${rfqId}/quote`, data, { headers: getAuthHeader() });
    return res.data;
  },
  getSupplierQuotes: async () => {
    const res = await axios.get(`${API_BASE}/supplier/quotes`, { headers: getAuthHeader() });
    return res.data;
  },

  // Purchase Orders
  getPOs: async () => {
    const res = await axios.get(`${API_BASE}/pos`, { headers: getAuthHeader() });
    return res.data;
  },
  getPOById: async (id: string) => {
    const res = await axios.get(`${API_BASE}/pos/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
  getSupplierPOs: async () => {
    const res = await axios.get(`${API_BASE}/pos`, { headers: getAuthHeader() });
    return res.data;
  },
  getSupplierPOById: async (id: string) => {
    const res = await axios.get(`${API_BASE}/pos/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
  acceptQuote: async (quoteId: string) => {
    const res = await axios.post(`${API_BASE}/quotes/${quoteId}/accept`, {}, { headers: getAuthHeader() });
    return res.data;
  },
  createManualPO: async (data: any) => {
    const res = await axios.post(`${API_BASE}/pos/manual`, data, { headers: getAuthHeader() });
    return res.data;
  },
  updatePOStatus: async (poId: string, status: string, notes?: string) => {
    const res = await axios.put(`${API_BASE}/pos/${poId}/status`, { status, notes }, { headers: getAuthHeader() });
    return res.data;
  },
  updatePO: async (poId: string, data: any) => {
    const res = await axios.put(`${API_BASE}/pos/${poId}`, data, { headers: getAuthHeader() });
    return res.data;
  },

  // Messages
  getMessages: async (poId: string) => {
    const res = await axios.get(`${API_BASE}/pos/${poId}/messages`, { headers: getAuthHeader() });
    return res.data;
  },
  sendMessage: async (poId: string, content: string) => {
    const res = await axios.post(`${API_BASE}/pos/${poId}/messages`, { content }, { headers: getAuthHeader() });
    return res.data;
  },
  sendProjectMessage: async (projectId: string, content: string) => {
    const res = await axios.post(`${API_BASE}/projects/${projectId}/messages`, { content }, { headers: getAuthHeader() });
    return res.data;
  },

  // Signatures (updated with name & date)
  signPO: async (poId: string, signatureData: string, role: string, name?: string, signedDate?: string) => {
    const res = await axios.post(
      `${API_BASE}/pos/${poId}/sign`,
      { signatureData, role, name, signedDate },
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Timeline
  getTimeline: async (poId: string) => {
    const res = await axios.get(`${API_BASE}/pos/${poId}/timeline`, { headers: getAuthHeader() });
    return res.data;
  },

  // Documents
  getDocuments: async (params: { entityId?: string; entityType?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await axios.get(`${API_BASE}/documents?${query}`, { headers: getAuthHeader() });
    return res.data;
  },
  uploadDocument: async (file: File, entityId: string, entityType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityId', entityId);
    formData.append('entityType', entityType);
    const res = await axios.post(`${API_BASE}/documents/upload`, formData, {
      headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  deleteDocument: async (docId: string) => {
    const res = await axios.delete(`${API_BASE}/documents/${docId}`, { headers: getAuthHeader() });
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await axios.get(`${API_BASE}/notifications`, { headers: getAuthHeader() });
    return res.data;
  },
  markNotificationRead: async (notificationId: string) => {
    const res = await axios.put(`${API_BASE}/notifications/${notificationId}/read`, {}, { headers: getAuthHeader() });
    return res.data;
  },

  // Supplier Networks
  getSuppliers: async () => {
    const res = await axios.get(`${API_BASE}/suppliers`, { headers: getAuthHeader() });
    return res.data;
  },

  // Health
  health: async () => {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  }
};
