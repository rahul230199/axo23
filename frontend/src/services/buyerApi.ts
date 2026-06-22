const API_URL = process.env.REACT_APP_API_URL || '/api';

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

// In-memory storage for POs (temporary)
let createdPOs: any[] = [];

export const buyerApi = {
  // Dashboard
  getStats: async () => ({
    activeRFQs: 12,
    openQuotes: 8,
    activeOrders: 24,
    delayedOrders: 3,
    monthlySpend: 48200,
    onTimeDeliveryRate: 94,
  }),

  getChartData: async () => ({
    orderStatus: [
      { name: 'Production', value: 45, color: '#3b82f6' },
      { name: 'QC', value: 25, color: '#8b5cf6' },
      { name: 'Dispatch', value: 15, color: '#10b981' },
      { name: 'Delivered', value: 15, color: '#6b7280' },
    ],
    monthlyTrend: [
      { month: 'Sep', orders: 12, spend: 25000 },
      { month: 'Oct', orders: 18, spend: 38000 },
      { month: 'Nov', orders: 22, spend: 45000 },
      { month: 'Dec', orders: 28, spend: 52000 },
      { month: 'Jan', orders: 32, spend: 68000 },
      { month: 'Feb', orders: 35, spend: 72000 },
    ],
    supplierPerformance: [
      { name: 'Precision Parts', onTime: 96, quality: 98, communication: 92 },
      { name: 'Metal Works', onTime: 92, quality: 94, communication: 88 },
      { name: 'MoldTech', onTime: 94, quality: 96, communication: 90 },
    ],
    bottlenecks: [
      { name: 'Delayed Milestones', description: '4 orders affected', severity: 'high', icon: '⚠️' },
      { name: 'Raw Material Shortages', description: '2 suppliers impacted', severity: 'medium', icon: '📦' },
      { name: 'QC Hold', description: '1 order awaiting', severity: 'low', icon: '🔍' },
    ],
    topSuppliers: [
      { id: '1', name: 'Precision Parts Co', rating: 4.9, totalOrders: 156, onTimeDelivery: 96 },
      { id: '2', name: 'Metal Works Inc', rating: 4.7, totalOrders: 89, onTimeDelivery: 92 },
      { id: '3', name: 'MoldTech Solutions', rating: 4.8, totalOrders: 124, onTimeDelivery: 94 },
    ],
  }),

  getRecentActivity: async () => [
    { id: '1', type: 'quote', title: 'New Quote Received', description: 'Precision Parts Co submitted quote', icon: '📄', time: '2 hours ago', amount: 2500 },
    { id: '2', type: 'milestone', title: 'Milestone Updated', description: 'Production started for PO-001', icon: '✅', time: '5 hours ago' },
    { id: '3', type: 'order', title: 'Order Shipped', description: 'PO-002 has been dispatched', icon: '🚚', time: '1 day ago' },
  ],

  // RFQs
  getRFQs: async () => [
    { id: '1', rfqNumber: 'RFQ-001', title: 'CNC Aluminum Brackets', partName: 'Aluminum Bracket', quantity: 500, unit: 'pcs', status: 'open', quotesReceived: 3, deadline: '2024-02-15', createdAt: '2024-01-10' },
    { id: '2', rfqNumber: 'RFQ-002', title: 'Injection Molded Housing', partName: 'Plastic Housing', quantity: 10000, unit: 'pcs', status: 'quoting', quotesReceived: 5, deadline: '2024-01-20', createdAt: '2024-01-05' },
  ],

  getRFQById: async (id: string) => ({
    id: id,
    rfqNumber: 'RFQ-001',
    title: 'CNC Aluminum Brackets',
    description: 'Need precision CNC machined aluminum brackets with anodized finish',
    partName: 'Aluminum Bracket',
    quantity: 500,
    unit: 'pcs',
    requiredBy: '2024-02-15',
    deliveryLocation: 'Detroit, MI',
    paymentTerms: 'Net 30',
    ppapLevel: 'Level 3',
    qualityRequirements: 'ISO 9001 certified, CMM inspection report required',
    status: 'open',
    quotesReceived: 3,
    createdAt: '2024-01-10',
    deadline: '2024-01-25',
  }),

  createRFQ: async (data: FormData) => ({ success: true, id: Date.now().toString() }),
  publishRFQ: async (id: string) => ({ success: true }),

  // Quotes
  getQuotesForRFQ: async (rfqId: string) => [
    {
      id: '1',
      quoteNumber: 'QT-001',
      rfqId: rfqId,
      supplierId: 's1',
      supplierName: 'Precision Parts Co',
      supplierRating: 4.8,
      totalPrice: 2500,
      unitPrice: 5.00,
      currency: 'USD',
      leadTimeDays: 15,
      deliveryTerms: 'FOB Destination',
      paymentTerms: 'Net 30',
      qualityGuarantee: 'ISO 9001:2024 certified',
      certifications: ['ISO 9001', 'AS9100D'],
      validUntil: '2024-02-15',
      status: 'pending',
      submittedAt: '2024-01-12',
    },
    {
      id: '2',
      quoteNumber: 'QT-002',
      rfqId: rfqId,
      supplierId: 's2',
      supplierName: 'Metal Works Inc',
      supplierRating: 4.5,
      totalPrice: 2350,
      unitPrice: 4.70,
      currency: 'USD',
      leadTimeDays: 20,
      deliveryTerms: 'EXW',
      paymentTerms: '50% Advance',
      qualityGuarantee: 'ISO certified',
      certifications: ['ISO 9001'],
      validUntil: '2024-02-10',
      status: 'pending',
      submittedAt: '2024-01-11',
    },
  ],

  rejectQuote: async (quoteId: string, reason?: string) => ({ success: true }),

  // Create PO manually
  createPO: async (poData: any) => {
    const newPO = {
      id: `po_${Date.now()}`,
      poNumber: poData.poNumber,
      poDate: new Date().toISOString().split('T')[0],
      buyerName: 'AXO Manufacturing',
      buyerAddress: '123 Business Park, Chicago, IL 60601',
      buyerContact: 'John Doe',
      supplierName: poData.supplierName,
      supplierAddress: '123 Industrial Ave, Detroit, MI 48201',
      supplierContact: 'Jane Smith',
      deliveryDate: poData.deliveryDate,
      shippingTerms: poData.shippingTerms,
      paymentTerms: poData.paymentTerms,
      status: 'issued',
      items: poData.items || [],
      subtotal: poData.totalAmount || 0,
      tax: Math.round((poData.totalAmount || 0) * 0.1),
      shippingCost: 100,
      totalAmount: (poData.totalAmount || 0) + Math.round((poData.totalAmount || 0) * 0.1) + 100,
      milestones: [
        { id: 'm1', name: 'PO Accepted', description: 'Supplier accepts PO', status: 'pending' },
        { id: 'm2', name: 'Raw Material Ordered', description: 'Materials ordered', status: 'pending' },
        { id: 'm3', name: 'Production Started', description: 'Manufacturing begins', status: 'pending' },
        { id: 'm4', name: 'Quality Control', description: 'Inspection', status: 'pending' },
        { id: 'm5', name: 'Dispatch', description: 'Order shipped', status: 'pending' },
        { id: 'm6', name: 'Delivered', description: 'Order received', status: 'pending' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    createdPOs.push(newPO);
    return newPO;
  },

  // Purchase Orders
  getPOs: async () => createdPOs,

  getPOById: async (id: string) => {
    return createdPOs.find(po => po.id === id) || null;
  },

  updatePOStatus: async (id: string, status: string) => {
    const po = createdPOs.find(p => p.id === id);
    if (po) po.status = status;
    return { success: true };
  },
  
  generatePDF: async (id: string) => new Blob(['PDF content'], { type: 'application/pdf' }),

  // Messages
  getMessages: async (poId: string) => [],
  sendMessage: async (poId: string, content: string, attachments?: File[]) => ({ success: true }),

  // Documents
  getDocuments: async (poId: string) => [],
  uploadDocument: async (poId: string, file: File, type: string) => ({ success: true }),

  // Suppliers
  getSuppliers: async () => [
    { id: 's1', name: 'Precision Parts Co', rating: 4.8, totalOrders: 156, onTimeDelivery: 96, qualityScore: 98, certifications: ['ISO 9001'], capabilities: ['CNC Machining'], location: 'Detroit, MI' },
    { id: 's2', name: 'Metal Works Inc', rating: 4.5, totalOrders: 89, onTimeDelivery: 92, qualityScore: 94, certifications: ['ISO 9001'], capabilities: ['Metal Casting'], location: 'Chicago, IL' },
  ],

  // Profile
  getProfile: async () => ({
    companyName: 'AXO Manufacturing',
    email: 'company@axo.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Park, Chicago, IL 60601',
    taxId: 'XX-1234567',
  }),

  updateProfile: async (data: any) => ({ success: true }),
};
