import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, MessageSquare, Package, DollarSign, TrendingUp, RefreshCw, 
  BarChart3, PieChart as PieChartIcon, CheckCircle, Clock, Truck 
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { realApi } from '../../services/realApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

const SupplierDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingQuotes: 0,
    activeOrders: 0,
    totalEarned: 0,
    totalQuotes: 0,
    deliveredOrders: 0
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const loadDashboard = async () => {
    try {
      const data = await realApi.getDashboard();
      setStats(data.stats);
      setMonthlyData(data.chartData?.monthlyEarnings || []);
      setStatusData(data.chartData?.orderStatus || []);
      setRecentQuotes(data.recentQuotes || []);
      setRecentOrders(data.recentOrders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);
  const handleRefresh = () => { setRefreshing(true); loadDashboard(); };

  if (loading) return <div className="animate-fadeIn" style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard...</div>;

  const statCards = [
    { label: 'Pending Quotes', value: stats.pendingQuotes, icon: MessageSquare, color: '#f59e0b', bg: '#fffbeb', trend: '+12%' },
    { label: 'Active Orders', value: stats.activeOrders, icon: Package, color: '#3b82f6', bg: '#eff6ff', trend: '+5%' },
    { label: 'Total Earned', value: formatCurrency(stats.totalEarned), icon: DollarSign, color: '#10b981', bg: '#ecfdf5', trend: '+18%' },
    { label: 'Total Quotes', value: stats.totalQuotes, icon: FileText, color: '#8b5cf6', bg: '#f5f3ff', trend: '+8%' },
    { label: 'Delivered Orders', value: stats.deliveredOrders, icon: CheckCircle, color: '#06b6d4', bg: '#ecfeff', trend: '+22%' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #1e293b 0%, #2d3561 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Supplier Dashboard
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Welcome back, {user.name || 'Supplier'}! Track your quotes, orders, and earnings.
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '40px', cursor: 'pointer' }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {statCards.map((card, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eef2f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={24} color={card.color} />
              </div>
              <TrendingUp size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>{card.value}</div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>{card.label}</div>
            <div style={{ fontSize: '11px', color: '#10b981' }}>{card.trend} from last month</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Monthly Earnings Chart */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BarChart3 size={20} color="#10b981" />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Monthly Earnings</h3>
          </div>
          {monthlyData.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No earnings data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Area type="monotone" dataKey="earnings" stroke="#10b981" fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status Distribution */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <PieChartIcon size={20} color="#8b5cf6" />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Order Status</h3>
          </div>
          {statusData.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No order data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent||0)*100).toFixed(0)}%`}>
                  {statusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Quotes & Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Recent Quotes */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Quotes</h3>
            <button onClick={() => navigate('/supplier/quotes')} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>View all →</button>
          </div>
          {recentQuotes.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No quotes yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentQuotes.map((quote: any) => (
                <div key={quote.id} style={{ padding: '12px', borderRadius: '16px', border: '1px solid #eef2f6', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div><strong>{quote.rfq_title}</strong></div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#2d3561' }}>{formatCurrency(quote.total_price, quote.currency)}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {quote.status} • Lead {quote.lead_time_days} days • {formatDate(quote.submitted_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Orders</h3>
            <button onClick={() => navigate('/supplier/orders')} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>View all →</button>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No orders yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentOrders.map((order: any) => (
                <div key={order.id} onClick={() => navigate(`/supplier/orders/${order.id}`)} style={{ padding: '12px', borderRadius: '16px', border: '1px solid #eef2f6', cursor: 'pointer', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><strong>{order.po_number}</strong><div style={{ fontSize: '12px', color: '#64748b' }}>{order.buyer_name}</div></div>
                    <div><div style={{ fontWeight: '600', color: '#2d3561' }}>{formatCurrency(order.total_amount, order.currency)}</div><div style={{ fontSize: '11px', color: '#64748b' }}>{order.status}</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default SupplierDashboard;
