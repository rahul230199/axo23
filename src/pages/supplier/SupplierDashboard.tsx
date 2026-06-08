import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, FileText, Package, DollarSign, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { realApi } from '../../services/realApi';
import { formatCurrency } from '../../utils/formatters';
import { RFQ, PurchaseOrder } from '../../types/real.types';

const SupplierDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    availableRFQs: 0,
    submittedQuotes: 0,
    activeOrders: 0,
    totalEarned: 0,
    rating: 0
  });
  const [recentRFQs, setRecentRFQs] = useState<RFQ[]>([]);
  const [activeOrders, setActiveOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardData, rfqsData, ordersData] = await Promise.all([
        realApi.getSupplierDashboard(),
        realApi.getAvailableRFQs(),
        realApi.getSupplierPOs()
      ]);
      
      setStats(dashboardData.stats);
      setRecentRFQs(rfqsData.slice(0, 5));
      setActiveOrders(ordersData.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>Supplier Dashboard</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Welcome back, {user.name || 'Supplier'}! Track your performance and manage orders.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}><FileText size={20} color="#2d3561" /></div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.availableRFQs}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Available RFQs</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3e5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}><TrendingUp size={20} color="#7b1fa2" /></div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.submittedQuotes}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Quotes Submitted</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}><Package size={20} color="#2e7d32" /></div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.activeOrders}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Active Orders</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}><DollarSign size={20} color="#e65100" /></div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(stats.totalEarned)}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Total Earned</div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eef2f6' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}><Star size={20} color="#f59e0b" /></div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.rating}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Rating</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eef2f6' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Performance Metrics</h3>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>On-Time Delivery</span><span style={{ fontWeight: '600' }}>--%</span></div>
            <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '8px' }}><div style={{ width: '0%', background: '#10b981', borderRadius: '10px', height: '8px' }} /></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Quality Score</span><span style={{ fontWeight: '600' }}>--%</span></div>
            <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '8px' }}><div style={{ width: '0%', background: '#3b82f6', borderRadius: '10px', height: '8px' }} /></div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #eef2f6' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Quote Win Rate</h3>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', fontWeight: '700', color: '#2d3561' }}>--%</div>
            <p style={{ color: '#666', marginTop: '8px' }}>Coming soon with more data</p>
          </div>
        </div>
      </div>

      {/* Recent RFQs */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eef2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Available RFQs</h3>
          <button onClick={() => navigate('/supplier/rfq')} style={{ color: '#2d3561', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
        </div>
        {recentRFQs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No RFQs available at the moment.</div>
        ) : (
          recentRFQs.map(rfq => (
            <div key={rfq.id} onClick={() => navigate(`/supplier/rfq/${rfq.id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #eef2f6', cursor: 'pointer' }}>
              <div>
                <p style={{ fontWeight: '500' }}>{rfq.title}</p>
                <p style={{ fontSize: '13px', color: '#666' }}>Qty: {rfq.quantity} | Due: {rfq.requiredBy}</p>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: '#e8f0fe', color: '#2d3561' }}>View Details</span>
            </div>
          ))
        )}
      </div>

      {/* Active Orders */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eef2f6', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eef2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Active Orders</h3>
          <button onClick={() => navigate('/supplier/orders')} style={{ color: '#2d3561', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
        </div>
        {activeOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No active orders at the moment.</div>
        ) : (
          activeOrders.map(order => (
            <div key={order.id} onClick={() => navigate(`/supplier/orders/${order.id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #eef2f6', cursor: 'pointer' }}>
              <div>
                <p style={{ fontWeight: '500' }}>{order.poNumber} - {order.buyerName}</p>
                <p style={{ fontSize: '13px', color: '#666' }}>Due: {order.deliveryDate}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: '#e8f5e9', color: '#2e7d32' }}>{order.status?.toUpperCase()}</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SupplierDashboard;
