import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, FileText, MessageSquare, Package, DollarSign, TrendingUp, RefreshCw, Activity, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { realApi } from '../../services/realApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeRFQs: 0,
    pendingQuotes: 0,
    activeOrders: 0,
    totalSpent: 0
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  const loadDashboard = async () => {
    try {
      const projects = await realApi.getProjects();
      setStats(prev => ({ ...prev, totalProjects: projects.length }));
      setRecentProjects(projects.slice(0, 5));

      const orders = await realApi.getPOs();
      setRecentOrders(orders.slice(0, 5));

      const dashboardData = await realApi.getDashboard();
      const statsData = dashboardData.stats || dashboardData;
      setStats(prev => ({
        ...prev,
        activeRFQs: statsData.activeRFQs || 0,
        pendingQuotes: statsData.pendingQuotes || 0,
        activeOrders: statsData.activeOrders || 0,
        totalSpent: statsData.totalSpent || 0
      }));

      if (dashboardData.chartData) {
        setMonthlyData(dashboardData.chartData.monthly || []);
        setStatusData(dashboardData.chartData.status || []);
      } else if (orders.length > 0) {
        // fallback: compute from orders
        const monthlyMap = new Map();
        orders.forEach((order: any) => {
          const date = new Date(order.created_at);
          const month = date.toLocaleString('default', { month: 'short' });
          const existing = monthlyMap.get(month) || { orders: 0, spend: 0 };
          existing.orders += 1;
          existing.spend += order.total_amount || 0;
          monthlyMap.set(month, existing);
        });
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const result = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const month = d.toLocaleString('default', { month: 'short' });
          result.push({ month, orders: monthlyMap.get(month)?.orders || 0, spend: monthlyMap.get(month)?.spend || 0 });
        }
        setMonthlyData(result);
        const statusMap = new Map();
        orders.forEach((order: any) => {
          const s = order.status || 'pending';
          statusMap.set(s, (statusMap.get(s) || 0) + 1);
        });
        const colors: Record<string, string> = { issued: '#3b82f6', accepted: '#10b981', production: '#f59e0b', shipped: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' };
        setStatusData(Array.from(statusMap.entries()).map(([name, value]: [string, number]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: colors[name] || '#6b7280' })));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) return <div className="animate-fadeIn" style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard...</div>;

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderOpen, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Active RFQs', value: stats.activeRFQs, icon: FileText, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Pending Quotes', value: stats.pendingQuotes, icon: MessageSquare, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Active Orders', value: stats.activeOrders, icon: Package, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: DollarSign, color: '#ef4444', bg: '#fef2f2' },
  ];

  return (
    <div className="animate-fadeInUp">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #1e293b 0%, #2d3561 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Welcome back, {user.name || 'User'}! Here's your manufacturing overview.</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '40px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: refreshing ? 'none' : '0 1px 2px rgba(0,0,0,0.05)' }} className="hover-lift">
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {statCards.map((card, idx) => (
          <div key={idx} className="hover-lift animate-scaleIn" style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #eef2f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={24} color={card.color} />
              </div>
              <TrendingUp size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>{card.value}</div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="hover-lift" style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BarChart3 size={20} color="#3b82f6" />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Monthly Orders</h3>
          </div>
          {monthlyData.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No order data</p> :
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          }
        </div>
        <div className="hover-lift" style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <PieChartIcon size={20} color="#8b5cf6" />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Order Status</h3>
          </div>
          {statusData.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No status data</p> :
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent||0)*100).toFixed(0)}%`}>
                  {statusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          }
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="hover-lift" style={{ background: 'white', borderRadius: '24px', padding: '24px', marginBottom: '32px', border: '1px solid #eef2f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Activity size={20} color="#10b981" />
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Revenue Trend (Monthly Spend)</h3>
        </div>
        {monthlyData.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No revenue data</p> :
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <defs><linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Area type="monotone" dataKey="spend" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpend)" />
            </AreaChart>
          </ResponsiveContainer>
        }
      </div>

      {/* Recent Projects & Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="hover-lift" style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Projects</h3>
            <button onClick={() => navigate('/buyer/projects')} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>View all →</button>
          </div>
          {recentProjects.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No projects yet</p> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentProjects.map((project: any) => (
                <div key={project.id} onClick={() => navigate(`/buyer/projects/${project.id}`)} style={{ padding: '12px', borderRadius: '16px', border: '1px solid #eef2f6', cursor: 'pointer', transition: 'all 0.2s', background: 'white' }} className="hover-lift">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontWeight: '600' }}>{project.name}</div><div style={{ fontSize: '12px', color: '#64748b' }}>{project.project_number}</div></div>
                    <div style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569' }}>{project.status}</div>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
        <div className="hover-lift" style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #eef2f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Orders</h3>
            <button onClick={() => navigate('/buyer/orders')} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>View all →</button>
          </div>
          {recentOrders.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No orders yet</p> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentOrders.map((order: any) => (
                <div key={order.id} onClick={() => navigate(`/buyer/orders/${order.id}`)} style={{ padding: '12px', borderRadius: '16px', border: '1px solid #eef2f6', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-lift">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontWeight: '600' }}>{order.po_number}</div><div style={{ fontSize: '12px', color: '#64748b' }}>{order.supplier_name}</div></div>
                    <div><div style={{ fontWeight: '600', color: '#2d3561' }}>{formatCurrency(order.total_amount, order.currency)}</div><div style={{ fontSize: '11px', color: '#64748b' }}>Due {formatDate(order.delivery_date)}</div></div>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
export default BuyerDashboard;
