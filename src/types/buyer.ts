export interface RFQ {
  id: string;
  rfqNumber: string;
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
  status: 'draft' | 'open' | 'quoting' | 'awarded' | 'closed';
  quotesReceived: number;
  createdAt: string;
  deadline: string;
  items: RFQItem[];
  attachments: Document[];
}

export interface RFQItem {
  id: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  unit: string;
  description: string;
  drawings: Document[];
}

export interface Quote {
  id: string;
  quoteNumber: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierLogo?: string;
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
  submittedAt: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqId: string;
  quoteId: string;
  supplierId: string;
  supplierName: string;
  supplierAddress: string;
  supplierContact: string;
  supplierTaxId?: string;
  buyerId: string;
  buyerName: string;
  buyerAddress: string;
  buyerContact: string;
  buyerTaxId?: string;
  poDate: string;
  deliveryDate: string;
  shippingTerms: string;
  paymentTerms: string;
  currency: string;
  items: POItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  status: 'draft' | 'issued' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  milestones: Milestone[];
  timeline: TimelineEvent[];
  signature: Signature;
  documents: Document[];
  messages: Message[];
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
  name: string;
  description: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  attachments?: Document[];
}

export interface TimelineEvent {
  id: string;
  type: 'milestone' | 'message' | 'document' | 'status_change';
  title: string;
  description: string;
  date: string;
  user: string;
  avatar?: string;
}

export interface Signature {
  buyerSignature: string;
  supplierSignature?: string;
  signedAt: string;
  buyerSignedAt?: string;
  supplierSignedAt?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'rfq' | 'drawing' | 'quote' | 'po' | 'invoice' | 'certificate' | 'other';
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'supplier';
  content: string;
  attachments?: Document[];
  readAt?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  logo?: string;
  rating: number;
  totalOrders: number;
  onTimeDelivery: number;
  qualityScore: number;
  certifications: string[];
  capabilities: string[];
  location: string;
  minOrderValue: number;
  leadTime: number;
}

export interface DashboardStats {
  activeRFQs: number;
  openQuotes: number;
  activeOrders: number;
  delayedOrders: number;
  monthlySpend: number;
  onTimeDeliveryRate: number;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface Activity {
  id: string;
  type: 'rfq' | 'quote' | 'order' | 'payment' | 'milestone';
  title: string;
  description: string;
  status: string;
  date: string;
  value?: number;
}