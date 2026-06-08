export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: '#64748b',
    open: '#3b82f6',
    quoting: '#f59e0b',
    awarded: '#10b981',
    closed: '#6b7280',
    issued: '#3b82f6',
    accepted: '#10b981',
    in_progress: '#8b5cf6',
    completed: '#10b981',
    cancelled: '#ef4444',
    delayed: '#ef4444',
    pending: '#f59e0b',
    production: '#3b82f6',
    qc: '#8b5cf6',
    raw_materials: '#f59e0b',
    dispatched: '#10b981',
    delivered: '#6b7280'
  };
  return colors[status] || '#64748b';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Draft',
    open: 'Open',
    quoting: 'Quoting',
    awarded: 'Awarded',
    closed: 'Closed',
    issued: 'Issued',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    delayed: 'Delayed',
    pending: 'Pending',
    production: 'Production',
    qc: 'Quality Control',
    raw_materials: 'Raw Materials',
    dispatched: 'Dispatched',
    delivered: 'Delivered'
  };
  return labels[status] || status;
};

export const truncate = (str: string, length: number): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};
