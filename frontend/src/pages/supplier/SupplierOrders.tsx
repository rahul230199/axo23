import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PurchaseOrder } from '../../types/real.types';

const SupplierOrders: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await realApi.getSupplierPOs();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</div>;

  const filteredOrders = orders.filter(order =>
    order.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.buyerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: orders.length,
    inProgress: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
    completed: orders.filter(o => o.status === 'delivered').length,
    totalValue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'delivered': return <CheckCircle size={14} color="#10b981" />;
      case 'shipped': return <Truck size={14} color="#3b82f6" />;
      case 'production': return <Package size={14} color="#f59e0b" />;
      default: return <Clock size={14} color="#94a3b8" />;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>My Orders</h1>
        <p style={{ color: '#666' }}>Manage and track all your customer orders</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}><div style={{ fontSize: '28px', fontWeight: '700' }}>{stats.total}</div><div style={{ fontSize: '13px', color: '#666' }}>Total Orders</div></div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}><div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{stats.inProgress}</div><div style={{ fontSize: '13px', color: '#666' }}>In Progress</div></div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}><div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{stats.completed}</div><div style={{ fontSize: '13px', color: '#666' }}>Completed</div></div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}><div style={{ fontSize: '28px', fontWeight: '700' }}>{formatCurrency(stats.totalValue)}</div><div style={{ fontSize: '13px', color: '#666' }}>Total Value</div></div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 16px', maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search by PO number or customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none' }} />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px solid #eef2f6' }}>
          <Package size={48} color="#94a3b8" />
          <h3 style={{ marginTop: '16px' }}>No orders yet</h3>
          <p style={{ color: '#666' }}>When your quotes are accepted, orders will appear here</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafbfc', borderBottom: '1px solid #eef2f6' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>PO Number</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Customer</th>
                <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12px', color: '#666' }}>Amount</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Delivery Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} onClick={() => navigate(`/supplier/orders/${order.id}`)} style={{ borderBottom: '1px solid #eef2f6', cursor: 'pointer' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '500', color: '#2d3561' }}>{order.poNumber}</td>
                  <td style={{ padding: '14px 20px' }}>{order.buyerName}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(order.totalAmount)}</td>
                  <td style={{ padding: '14px 20px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: '#e8f5e9', color: '#2e7d32' }}>{getStatusIcon(order.status)} {order.status?.toUpperCase()}</span></td>
                  <td style={{ padding: '14px 20px', color: '#666' }}>{formatDate(order.deliveryDate)}</td>
                  <td style={{ padding: '14px 20px' }}><Eye size={16} color="#666" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupplierOrders;
