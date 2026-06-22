export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'supplier' | 'admin';
  companyName?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  buyerId: string;
  buyerName?: string;
  title: string;
  description: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  unit: string;
  requiredBy: string;
  deliveryLocation: string;
  paymentTerms: string;
  ppapLevel: string;
  qualityRequirements?: string;
  specialInstructions?: string;
  status: 'draft' | 'published' | 'quoting' | 'awarded' | 'closed';
  quotesReceived: number;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierRating: number;
  totalPrice: number;
  unitPrice: number;
  currency: string;
  leadTimeDays: number;
  deliveryTerms: string;
  paymentTerms: string;
  qualityGuarantee: string;
  certifications: string[];
  validUntil: string;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
  submittedAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqId: string;
  quoteId: string;
  buyerId: string;
  buyerName: string;
  buyerAddress: string;
  supplierId: string;
  supplierName: string;
  supplierAddress: string;
  deliveryDate: string;
  shippingTerms: string;
  paymentTerms: string;
  currency: string;
  items: POItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  status: 'draft' | 'issued' | 'accepted' | 'production' | 'qc' | 'shipped' | 'delivered' | 'cancelled';
  milestones: Milestone[];
  messages: Message[];
  buyerSignature?: string;
  supplierSignature?: string;
  createdAt: string;
  updatedAt: string;
}

export interface POItem {
  id: string;
  partName: string;
  partNumber?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Milestone {
  id: string;
  poId: string;
  name: string;
  description: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  dueDate?: string;
  completedAt?: string;
  updatedBy: string;
  notes?: string;
}

export interface Message {
  id: string;
  po_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'buyer' | 'supplier';
  content: string;
  created_at: string;
  attachments?: string[];
}

export interface Document {
  id: string;
  entityId: string;
  entityType: 'rfq' | 'po' | 'quote';
  name: string;
  type: 'drawing' | 'certificate' | 'invoice' | 'other';
  url: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
}

export interface DashboardData {
  stats: {
    activeRFQs: number;
    pendingQuotes: number;
    activeOrders: number;
    totalSpent: number;
  };
  recentRFQs: RFQ[];
  recentOrders: PurchaseOrder[];
  chartData: {
    monthly: Array<{ month: string; orders: number; spend: number }>;
    status: Array<{ name: string; value: number; color: string }>;
  };
}

export interface SupplierDashboardData {
  stats: {
    availableRFQs: number;
    submittedQuotes: number;
    activeOrders: number;
    totalEarned: number;
    rating: number;
  };
  recentRFQs: RFQ[];
  activeOrders: PurchaseOrder[];
}
