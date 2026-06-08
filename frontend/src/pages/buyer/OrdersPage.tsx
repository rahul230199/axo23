import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Package, CheckCircle, Clock, AlertCircle, TrendingUp, Calendar, Download } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PurchaseOrder } from '../../types/real.types';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await realApi.getPOs();
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
    order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpend = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Purchase Orders</h1>
          <p style={{ color: '#666' }}>Track and manage all your purchase orders</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <TrendingUp size={16} />
          <span style={{ fontWeight: '600' }}>Total Spend: {formatCurrency(totalSpend)}</span>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 16px', maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search by PO number or supplier..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none' }} />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px solid #eef2f6' }}>
          <Package size={48} color="#94a3b8" />
          <h3 style={{ marginTop: '16px' }}>No purchase orders yet</h3>
          <p style={{ color: '#666' }}>When you accept quotes, purchase orders will appear here</p>
          <button onClick={() => navigate('/buyer/rfq')} style={{ marginTop: '20px', padding: '10px 20px', background: '#2d3561', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Browse RFQs</button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafbfc', borderBottom: '1px solid #eef2f6' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>PO Number</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Supplier</th>
                <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '12px', color: '#666' }}>Amount</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Delivery Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} onClick={() => navigate(`/buyer/orders/${order.id}`)} style={{ borderBottom: '1px solid #eef2f6', cursor: 'pointer' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '500', color: '#2d3561' }}>{order.poNumber}</td>
                  <td style={{ padding: '14px 20px' }}>{order.supplierName}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(order.totalAmount)}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: order.status === 'delivered' ? '#e8f5e9' : '#fff3e0', color: order.status === 'delivered' ? '#2e7d32' : '#e65100' }}>
                      {order.status?.toUpperCase()}
                    </span>
                  </td>
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

export default OrdersPage;
